
function getPagination(query) {
  const validNumber = (value) =>
    typeof value === "string" &&
    /^\d+$/.test(value) &&
    Number.isSafeInteger(Number(value));

  if (query.limit !== undefined && !validNumber(query.limit)) {
    return { error: "Limit debe ser un entero valido" };
  }

  if (query.offset !== undefined && !validNumber(query.offset)) {
    return { error: "Offset debe ser un entero valido" };
  }

  const limit = query.limit === undefined ? 20 : Number(query.limit);
  const offset = query.offset === undefined ? 0 : Number(query.offset);

  if (limit < 1 || limit > 100) {
    return { error: "Limit debe estar entre 1 y 100" };
  }

  if (offset < 0) {
    return { error: "Offset no puede ser negativo" };
  }

  return { limit, offset };
}

module.exports = { getPagination };
