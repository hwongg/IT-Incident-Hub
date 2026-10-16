
const test = require("node:test");
const assert = require("node:assert/strict");
const { getPagination } = require("../backend/src/pagination");

test("utiliza paginacion predeterminada", () => {
  assert.deepEqual(getPagination({}), { limit: 20, offset: 0 });
});

test("acepta limit y offset validos", () => {
  assert.deepEqual(getPagination({ limit: "5", offset: "10" }), {
    limit: 5,
    offset: 10
  });
});

test("rechaza limit superior a 100", () => {
  assert.ok(getPagination({ limit: "200" }).error);
});

test("rechaza limit igual a cero", () => {
  assert.ok(getPagination({ limit: "0" }).error);
});

test("rechaza valores no numericos", () => {
  assert.ok(getPagination({ limit: "abc" }).error);
});

test("rechaza offset negativo", () => {
  assert.ok(getPagination({ offset: "-1" }).error);
});

test("rechaza valores decimales", () => {
  assert.ok(getPagination({ limit: "2.5" }).error);
});

test("rechaza valores numericos demasiado grandes", () => {
  assert.ok(getPagination({ offset: "99999999999999999999" }).error);
});
