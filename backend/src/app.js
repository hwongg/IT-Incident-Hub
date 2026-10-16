const express = require("express");
const helmet = require("helmet");
const path = require("path");
const pool = require("./db");
const { statuses, priorities, validateIncident } = require("./validation");
const { getPagination } = require("./pagination");

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "../../frontend")));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.get("/api/meta", (req, res) => res.json({ statuses, priorities }));


app.get("/api/incidents", async (req, res, next) => {
  try {
    const { status, priority, category, technician, q } = req.query;

    const validNumber = (value) =>
      typeof value === "string" && /^\d+$/.test(value) &&
      Number.isSafeInteger(Number(value));

    if (req.query.limit !== undefined && !validNumber(req.query.limit)) {
      return res.status(400).json({ error: "Limit debe ser un entero valido" });
    }

    if (req.query.offset !== undefined && !validNumber(req.query.offset)) {
      return res.status(400).json({ error: "Offset debe ser un entero valido" });
    }

    const pagination = getPagination(req.query);

    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }

    const { limit, offset } = pagination;

  
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: "Limit debe estar entre 1 y 100" });
    }

    if (offset < 0) {
      return res.status(400).json({ error: "Offset no puede ser negativo" });
    }

    const conditions = [];
    const values = [];

    const add = (column, value) => {
      if (value) {
        values.push(value);
        conditions.push(`${column} = $${values.length}`);
      }
    };

    add("status", status);
    add("priority", priority);
    add("category", category);
    add("technician", technician);

    if (q) {
      values.push(`%${q}%`);
      conditions.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    values.push(limit, offset);

    const result = await pool.query(
      `SELECT i.*,
        (SELECT COUNT(*) FROM incident_comments c WHERE c.incident_id = i.id)::int AS comment_count
       FROM incidents i
       ${where}
       ORDER BY i.created_at DESC, i.id DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});


app.get("/api/incidents/:id", async (req, res, next) => {
  try {
    const incident = await pool.query("SELECT * FROM incidents WHERE id = $1", [req.params.id]);
    if (!incident.rowCount) return res.status(404).json({ error: "Incidente no encontrado" });
    const comments = await pool.query(
      "SELECT id, author, comment, created_at FROM incident_comments WHERE incident_id = $1 ORDER BY created_at",
      [req.params.id]
    );
    res.json({ ...incident.rows[0], comments: comments.rows });
  } catch (error) {
    next(error);
  }
});

app.post("/api/incidents", async (req, res, next) => {
  const errors = validateIncident(req.body);
  if (errors.length) return res.status(400).json({ error: "Datos inválidos", details: errors });
  try {
    const { title, description, category, priority, reporter } = req.body;
    const result = await pool.query(
      `INSERT INTO incidents (title, description, category, priority, reporter)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title.trim(), description.trim(), category.trim(), priority, reporter.trim()]
    );
    await pool.query(
      "INSERT INTO incident_comments (incident_id, author, comment) VALUES ($1, $2, $3)",
      [result.rows[0].id, reporter.trim(), "Incidente registrado."]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/incidents/:id", async (req, res, next) => {
  const { status, technician, priority } = req.body;
  if (status !== undefined && !statuses.includes(status)) return res.status(400).json({ error: "Estado no válido" });
  if (priority !== undefined && !priorities.includes(priority)) return res.status(400).json({ error: "Prioridad no válida" });
  if (technician !== undefined && (typeof technician !== "string" || technician.length > 120)) {
    return res.status(400).json({ error: "Técnico no válido" });
  }
  try {
    const current = await pool.query("SELECT * FROM incidents WHERE id = $1", [req.params.id]);
    if (!current.rowCount) return res.status(404).json({ error: "Incidente no encontrado" });
    const next = {
      status: status === undefined ? current.rows[0].status : status,
      technician: technician === undefined ? current.rows[0].technician : (technician.trim() || null),
      priority: priority === undefined ? current.rows[0].priority : priority
    };
    const result = await pool.query(
      `UPDATE incidents SET status = $1, technician = $2, priority = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [next.status, next.technician, next.priority, req.params.id]
    );
    const author = req.body.author || "Sistema";
    const changes = [];
    if (status !== undefined) changes.push(`Estado cambiado a ${status}`);
    if (technician !== undefined) changes.push(`Técnico asignado: ${technician || "sin asignar"}`);
    if (priority !== undefined) changes.push(`Prioridad cambiada a ${priority}`);
    if (changes.length) {
      await pool.query(
        "INSERT INTO incident_comments (incident_id, author, comment) VALUES ($1, $2, $3)",
        [req.params.id, String(author).slice(0, 120), changes.join(". ")]
      );
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.post("/api/incidents/:id/comments", async (req, res, next) => {
  const { author, comment } = req.body;
  if (typeof author !== "string" || !author.trim() || typeof comment !== "string" || !comment.trim()) {
    return res.status(400).json({ error: "Autor y comentario son obligatorios" });
  }
  if (author.length > 120 || comment.length > 3000) return res.status(400).json({ error: "Comentario demasiado largo" });
  try {
    const exists = await pool.query("SELECT id FROM incidents WHERE id = $1", [req.params.id]);
    if (!exists.rowCount) return res.status(404).json({ error: "Incidente no encontrado" });
    const result = await pool.query(
      "INSERT INTO incident_comments (incident_id, author, comment) VALUES ($1, $2, $3) RETURNING *",
      [req.params.id, author.trim(), comment.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.get("/api/dashboard", async (req, res, next) => {
  try {
    const totals = await pool.query(`
      SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status NOT IN ('RESUELTO', 'CERRADO'))::int AS open,
        COUNT(*) FILTER (WHERE status IN ('RESUELTO', 'CERRADO'))::int AS closed,
        COUNT(*) FILTER (WHERE priority = 'CRITICA' AND status NOT IN ('RESUELTO', 'CERRADO'))::int AS critical
      FROM incidents`);
    const categories = await pool.query("SELECT category AS name, COUNT(*)::int AS total FROM incidents GROUP BY category ORDER BY total DESC");
    const technicians = await pool.query("SELECT COALESCE(technician, 'Sin asignar') AS name, COUNT(*)::int AS total FROM incidents GROUP BY technician ORDER BY total DESC");
    res.json({ ...totals.rows[0], categories: categories.rows, technicians: technicians.rows });
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use((error, _req, res, _next) => {
  console.error(error.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;
