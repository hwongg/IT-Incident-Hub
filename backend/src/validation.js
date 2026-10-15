const statuses = ["NUEVO", "ASIGNADO", "EN_PROCESO", "RESUELTO", "CERRADO"];
const priorities = ["BAJA", "MEDIA", "ALTA", "CRITICA"];

function validateIncident(body) {
  const errors = [];
  const required = ["title", "description", "category", "priority", "reporter"];
  for (const field of required) {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      errors.push(`${field} es obligatorio`);
    }
  }
  if (body.title && body.title.length > 160) errors.push("title no puede superar 160 caracteres");
  if (body.priority && !priorities.includes(body.priority)) errors.push("priority no es válida");
  if (body.status && !statuses.includes(body.status)) errors.push("status no es válido");
  return errors;
}

module.exports = { statuses, priorities, validateIncident };
