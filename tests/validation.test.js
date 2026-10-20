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

test("rechaza titulos que superan 160 caracteres", () => {
  const errors = validateIncident({
    title: "A".repeat(161),
    description: "Descripcion del incidente",
    category: "Hardware",
    priority: "ALTA",
    reporter: "Ana"
  });

  assert.ok(errors.includes("title no puede superar 160 caracteres"));
});

test("rechaza estados no permitidos", () => {
  const errors = validateIncident({
    title: "Error de conexion",
    description: "No hay acceso a la red",
    category: "Redes",
    priority: "MEDIA",
    reporter: "Ana",
    status: "PENDIENTE"
  });

  assert.ok(errors.includes("status no es válido"));
});

test("rechaza campos obligatorios con espacios en blanco", () => {
  const errors = validateIncident({
    title: "   ",
    description: "   ",
    category: "   ",
    priority: "   ",
    reporter: "   "
  });

  for (const field of ["title", "description", "category", "priority", "reporter"]) {
    assert.ok(errors.includes(`${field} es obligatorio`));
  }
});