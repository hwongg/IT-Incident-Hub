
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

const editableFields = [
  "title",
  "description",
  "category",
  "reporter",
  "priority",
  "status",
  "technician"
];

const fieldLimits = {
  title: 160,
  category: 60,
  reporter: 120,
  technician: 120
};

const fieldLabels = {
  title: "Titulo",
  description: "Descripcion",
  category: "Categoria",
  reporter: "Reportado por",
  priority: "Prioridad",
  status: "Estado",
  technician: "Tecnico"
};

function validId(id) {
  return /^\d+$/.test(id) && BigInt(id) > 0n &&
    BigInt(id) <= 9223372036854775807n;
}

function validateChanges(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Datos invalidos" };
  }

  const fields = Object.keys(body).filter((field) =>
    editableFields.includes(field)
  );

  if (!fields.length) {
    return { error: "No se enviaron campos para actualizar" };
  }

  for (const field of fields) {
    const value = body[field];

    if (field === "technician" && value === null) {
      continue;
    }

    if (typeof value !== "string") {
      return { error: `${field} debe ser texto` };
    }

    if (field !== "technician" && !value.trim()) {
      return { error: `${field} es obligatorio` };
    }

    if (fieldLimits[field] && value.trim().length > fieldLimits[field]) {
      return { error: `${field} supera el limite permitido` };
    }

    if (field === "status" && !statuses.includes(value)) {
      return { error: "Estado no valido" };
    }

    if (field === "priority" && !priorities.includes(value)) {
      return { error: "Prioridad no valida" };
    }
  }

  if (body.author !== undefined &&
      (typeof body.author !== "string" || body.author.length > 120)) {
    return { error: "Autor no valido" };
  }

  return { fields };
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      database: "connected"
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "unavailable"
    });
  }
});

app.get("/api/meta", (_req, res) => {
  res.json({ statuses, priorities });
});

app.get("/api/incidents", async (req, res, next) => {
  try {
    const { status, priority, category, technician, q } = req.query;

    const pagination = getPagination(req.query);

    if (pagination.error) {
      return res.status(400).json({
        error: pagination.error
      });
    }

    const { limit, offset } = pagination;

    const conditions = [];
    const values = [];

    const add = (column, value) => {
      if (typeof value === "string" && value.trim()) {
        values.push(value.trim());
        conditions.push(`${column} = $${values.length}`);
      }
    };

    add("status", status);
    add("priority", priority);
    add("category", category);
    add("technician", technician);

    if (typeof q === "string" && q.trim()) {
      values.push(`%${q.trim()}%`);
      conditions.push(
        `(title ILIKE $${values.length} OR description ILIKE $${values.length})`
      );
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    values.push(limit, offset);

    const result = await pool.query(
      `SELECT i.*,
        (
          SELECT COUNT(*)::int
          FROM incident_comments c
          WHERE c.incident_id = i.id
        ) AS comment_count
       FROM incidents i
       ${where}
       ORDER BY i.created_at DESC, i.id DESC
       LIMIT $${values.length - 1}
       OFFSET $${values.length}`,
      values
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/incidents/:id", async (req, res, next) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      error: "ID de incidente no valido"
    });
  }

  try {
    const incident = await pool.query(
      "SELECT * FROM incidents WHERE id = $1",
      [req.params.id]
    );

    if (!incident.rowCount) {
      return res.status(404).json({
        error: "Incidente no encontrado"
      });
    }

    const comments = await pool.query(
      `SELECT id, author, comment, created_at
       FROM incident_comments
       WHERE incident_id = $1
       ORDER BY created_at ASC, id ASC`,
      [req.params.id]
    );

    res.json({
      ...incident.rows[0],
      comments: comments.rows
    });
  } catch (error) {
    next(error);
  }
});


app.post("/api/incidents", async (req, res, next) => {
  const errors = validateIncident(req.body);

  if (errors.length) {
    return res.status(400).json({
      error: "Datos invalidos",
      details: errors
    });
  }

  const { title, description, category, priority, reporter, technician } = req.body;

  if (technician !== undefined &&
      technician !== null &&
      (typeof technician !== "string" || technician.trim().length > 120)) {
    return res.status(400).json({
      error: "Tecnico no valido"
    });
  }

  const assignedTechnician =
    typeof technician === "string" && technician.trim()
      ? technician.trim()
      : null;

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO incidents
       (title, description, category, priority, reporter, technician, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title.trim(),
        description.trim(),
        category.trim(),
        priority,
        reporter.trim(),
        assignedTechnician,
        assignedTechnician ? "ASIGNADO" : "NUEVO"
      ]
    );

    await client.query(
      `INSERT INTO incident_comments
       (incident_id, author, comment)
       VALUES ($1, $2, $3)`,
      [
        result.rows[0].id,
        reporter.trim(),
        assignedTechnician
          ? `Incidente registrado y asignado a ${assignedTechnician}.`
          : "Incidente registrado sin tecnico asignado."
      ]
    );

    await client.query("COMMIT");

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    next(error);
  } finally {
    if (client) {
      client.release();
    }
  }
});


app.patch("/api/incidents/:id", async (req, res, next) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      error: "ID de incidente no valido"
    });
  }

  const validation = validateChanges(req.body);

  if (validation.error) {
    return res.status(400).json({
      error: validation.error
    });
  }

  const { fields } = validation;
  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const current = await client.query(
      "SELECT * FROM incidents WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );

    if (!current.rowCount) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Incidente no encontrado"
      });
    }

    const previous = current.rows[0];
    const changes = [];
    const values = [];
    const assignments = [];

    for (const field of fields) {
      const raw = req.body[field];

      const value = field === "technician"
        ? (raw === null ? null : raw.trim() || null)
        : raw.trim();

      if (previous[field] !== value) {
        values.push(value);
        assignments.push(`${field} = $${values.length}`);

        changes.push(
          `${fieldLabels[field]}: ${previous[field] ?? "Sin asignar"} -> ${value ?? "Sin asignar"}`
        );
      }
    }

    if (!changes.length) {
      await client.query("COMMIT");
      return res.json(previous);
    }

    values.push(req.params.id);

    const result = await client.query(
      `UPDATE incidents
       SET ${assignments.join(", ")},
           updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    const author = typeof req.body.author === "string"
      ? req.body.author.trim() || "Sistema"
      : "Sistema";

    await client.query(
      `INSERT INTO incident_comments
       (incident_id, author, comment)
       VALUES ($1, $2, $3)`,
      [
        req.params.id,
        author,
        changes.join(". ")
      ]
    );

    await client.query("COMMIT");

    res.json(result.rows[0]);
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    next(error);
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.delete("/api/incidents/:id", async (req, res, next) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      error: "ID de incidente no valido"
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM incidents
       WHERE id = $1
       RETURNING id, title`,
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: "Incidente no encontrado"
      });
    }

    res.json({
      message: "Incidente eliminado correctamente",
      incident: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/incidents/:id/comments", async (req, res, next) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      error: "ID de incidente no valido"
    });
  }

  const { author, comment } = req.body || {};

  if (typeof author !== "string" ||
      !author.trim() ||
      typeof comment !== "string" ||
      !comment.trim()) {
    return res.status(400).json({
      error: "Autor y comentario son obligatorios"
    });
  }

  if (author.length > 120 || comment.length > 3000) {
    return res.status(400).json({
      error: "Comentario demasiado largo"
    });
  }

  try {
    const exists = await pool.query(
      "SELECT id FROM incidents WHERE id = $1",
      [req.params.id]
    );

    if (!exists.rowCount) {
      return res.status(404).json({
        error: "Incidente no encontrado"
      });
    }

    const result = await pool.query(
      `INSERT INTO incident_comments
       (incident_id, author, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        req.params.id,
        author.trim(),
        comment.trim()
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.get("/api/dashboard", async (_req, res, next) => {
  try {
    const totals = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (
          WHERE status NOT IN ('RESUELTO', 'CERRADO')
        )::int AS open,
        COUNT(*) FILTER (
          WHERE status IN ('RESUELTO', 'CERRADO')
        )::int AS closed,
        COUNT(*) FILTER (
          WHERE priority = 'CRITICA'
          AND status NOT IN ('RESUELTO', 'CERRADO')
        )::int AS critical
      FROM incidents
    `);

    const categories = await pool.query(
      `SELECT category AS name,
              COUNT(*)::int AS total
       FROM incidents
       GROUP BY category
       ORDER BY total DESC`
    );

    const technicians = await pool.query(
      `SELECT
         COALESCE(technician, 'Sin asignar') AS name,
         COUNT(*)::int AS total
       FROM incidents
       GROUP BY technician
       ORDER BY total DESC`
    );

    res.json({
      ...totals.rows[0],
      categories: categories.rows,
      technicians: technicians.rows
    });
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada"
  });
});

app.use((error, _req, res, _next) => {
  console.error(error.message);

  res.status(500).json({
    error: "Error interno del servidor"
  });
});

module.exports = app;
