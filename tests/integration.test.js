
const { test, after } = require("node:test");
const assert = require("node:assert/strict");
/* global fetch */

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ||
  "postgres://incident_user:change_me_local@localhost:5432/incident_hub_test";

if (!process.env.DATABASE_URL.endsWith("/incident_hub_test")) {
  throw new Error("Las pruebas requieren la base de datos incident_hub_test");
}

const app = require("../backend/src/app");
const pool = require("../backend/src/db");

let server;
let baseUrl;

async function iniciarServidor() {
  if (!server) {
    server = app.listen(0);
    await new Promise((resolve) => {
      if (server.listening) resolve();
      else server.once("listening", resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  }
}

async function peticion(ruta, opciones = {}) {
  await iniciarServidor();
  const respuesta = await fetch(`${baseUrl}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...opciones.headers
    }
  });
  return {
    status: respuesta.status,
    body: await respuesta.json()
  };
}

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
  await pool.end();
});

test("conexion real con PostgreSQL", async () => {
  const resultado = await pool.query("SELECT 1 AS valor");
  assert.equal(resultado.rows[0].valor, 1);
});

test("API health verifica PostgreSQL", async () => {
  const respuesta = await peticion("/api/health");
  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.database, "connected");
});

test("registrar, consultar y actualizar incidente en PostgreSQL", async () => {
  let id;

  try {
    const registro = await peticion("/api/incidents", {
      method: "POST",
      body: JSON.stringify({
        title: "Prueba de integracion AB32",
        description: "Verificacion real de PostgreSQL",
        category: "Hardware",
        priority: "ALTA",
        reporter: "Pruebas automatizadas"
      })
    });

    assert.equal(registro.status, 201);
    assert.equal(registro.body.status, "NUEVO");

    id = registro.body.id;

    const consulta = await peticion(`/api/incidents/${id}`);
    assert.equal(consulta.status, 200);
    assert.equal(consulta.body.title, "Prueba de integracion AB32");
    assert.ok(consulta.body.comments.length >= 1);

    const actualizacion = await peticion(`/api/incidents/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "ASIGNADO",
        technician: "Tecnico de pruebas"
      })
    });

    assert.equal(actualizacion.status, 200);
    assert.equal(actualizacion.body.status, "ASIGNADO");
    assert.equal(actualizacion.body.technician, "Tecnico de pruebas");

    const verificacion = await pool.query(
      "SELECT status, technician FROM incidents WHERE id = $1",
      [id]
    );

    assert.equal(verificacion.rows[0].status, "ASIGNADO");
    assert.equal(verificacion.rows[0].technician, "Tecnico de pruebas");
  } finally {
    if (id) {
      await pool.query("DELETE FROM incidents WHERE id = $1", [id]);
    }
  }
});

test("rechazar incidente con datos invalidos", async () => {
  const respuesta = await peticion("/api/incidents", {
    method: "POST",
    body: JSON.stringify({
      title: "",
      description: "",
      category: "",
      priority: "INVALIDA",
      reporter: ""
    })
  });

  assert.equal(respuesta.status, 400);
});

test("validar paginacion contra PostgreSQL", async () => {
  const respuesta = await peticion("/api/incidents?limit=5&offset=0");

  assert.equal(respuesta.status, 200);
  assert.ok(Array.isArray(respuesta.body));
  assert.ok(respuesta.body.length <= 5);
});


test("crear y eliminar incidente con sus comentarios", async () => {
  const registro = await peticion("/api/incidents", {
    method: "POST",
    body: JSON.stringify({
      title: "Prueba de eliminacion AB33",
      description: "Verificar eliminacion en PostgreSQL",
      category: "Software",
      priority: "MEDIA",
      reporter: "Pruebas automatizadas"
    })
  });

  assert.equal(registro.status, 201);

  const id = registro.body.id;

  try {
    const eliminacion = await peticion(`/api/incidents/${id}`, {
      method: "DELETE"
    });

    assert.equal(eliminacion.status, 200);
    assert.equal(eliminacion.body.incident.id, id);

    const consulta = await peticion(`/api/incidents/${id}`);
    assert.equal(consulta.status, 404);

    const comentarios = await pool.query(
      "SELECT id FROM incident_comments WHERE incident_id = $1",
      [id]
    );

    assert.equal(comentarios.rowCount, 0);
  } finally {
    await pool.query("DELETE FROM incidents WHERE id = $1", [id]);
  }
});


test("editar todos los campos de un incidente", async () => {
  const registro = await peticion("/api/incidents", {
    method: "POST",
    body: JSON.stringify({
      title: "Incidente original",
      description: "Descripcion original",
      category: "Hardware",
      priority: "BAJA",
      reporter: "Usuario original"
    })
  });

  assert.equal(registro.status, 201);

  const id = registro.body.id;

  try {
    const respuesta = await peticion(`/api/incidents/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: "Incidente actualizado",
        description: "Descripcion actualizada",
        category: "Software",
        priority: "CRITICA",
        reporter: "Usuario actualizado",
        technician: "Tecnico asignado",
        status: "EN_PROCESO",
        author: "Administrador"
      })
    });

    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.title, "Incidente actualizado");
    assert.equal(respuesta.body.description, "Descripcion actualizada");
    assert.equal(respuesta.body.category, "Software");
    assert.equal(respuesta.body.priority, "CRITICA");
    assert.equal(respuesta.body.reporter, "Usuario actualizado");
    assert.equal(respuesta.body.technician, "Tecnico asignado");
    assert.equal(respuesta.body.status, "EN_PROCESO");

    const detalle = await peticion(`/api/incidents/${id}`);

    assert.equal(detalle.status, 200);
    assert.ok(
      detalle.body.comments.some(
        (comment) => comment.author === "Administrador"
      )
    );
  } finally {
    await pool.query(
      "DELETE FROM incidents WHERE id = $1",
      [id]
    );
  }
});
