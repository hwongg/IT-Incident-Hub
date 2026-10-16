const test = require("node:test");
const assert = require("node:assert/strict");
const { validateIncident, statuses, priorities } = require("../backend/src/validation");

test("rechaza un incidente sin campos obligatorios", () => {
  assert.equal(validateIncident({}).length, 5);
});

test("acepta un incidente válido", () => {
  const errors = validateIncident({
    title: "Equipo no enciende",
    description: "No inicia desde esta mañana",
    category: "Hardware",
    priority: "ALTA",
    reporter: "Ana"
  });
  assert.deepEqual(errors, []);
});

test("rechaza prioridad no permitida", () => {
  const errors = validateIncident({
    title: "Error", description: "Detalle", category: "Software",
    priority: "URGENTE", reporter: "Ana"
  });
  assert.ok(errors.includes("priority no es válida"));
});

test("contiene los cinco estados definidos en el proyecto", () => {
  assert.deepEqual(statuses, ["NUEVO", "ASIGNADO", "EN_PROCESO", "RESUELTO", "CERRADO"]);
});

test("contiene las cuatro prioridades admitidas", () => {
  assert.deepEqual(priorities, ["BAJA", "MEDIA", "ALTA", "CRITICA"]);
});
