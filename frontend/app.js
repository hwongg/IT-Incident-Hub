const $ = (selector) => document.querySelector(selector);
const statuses = ["NUEVO", "ASIGNADO", "EN_PROCESO", "RESUELTO", "CERRADO"];
let activeIncidentId = null;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function dateText(value) {
  return new Date(value).toLocaleString("es-GT", { dateStyle: "short", timeStyle: "short" });
}
async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.details ? data.details.join(", ") : data.error || "Ocurrió un error");
  return data;
}
async function loadMeta() {
  const meta = await api("/api/meta");
  $("#filter-status").innerHTML = '<option value="">Todos los estados</option>' +
    meta.statuses.map((status) => `<option value="${status}">${status.replaceAll("_", " ")}</option>`).join("");
}
function currentFilters() {
  const params = new URLSearchParams();
  [["status", "#filter-status"], ["priority", "#filter-priority"], ["category", "#filter-category"],
    ["technician", "#filter-technician"], ["q", "#search"]].forEach(([key, selector]) => {
    const value = $(selector).value.trim();
    if (value) params.set(key, value);
  });
  return params.toString();
}
async function loadIncidents() {
  try {
    const incidents = await api(`/api/incidents?${currentFilters()}`);
    $("#incident-rows").innerHTML = incidents.length ? incidents.map((item) => `
      <tr>
        <td>${escapeHtml(item.title)}<small>#${item.id} · ${escapeHtml(item.reporter)}</small></td>
        <td>${escapeHtml(item.category)}</td>
        <td><span class="pill p-${escapeHtml(item.priority)}">${escapeHtml(item.priority)}</span></td>
        <td><select class="row-status" data-id="${item.id}" aria-label="Estado de ${escapeHtml(item.title)}">${statuses.map(s => `<option ${s === item.status ? "selected" : ""} value="${s}">${s.replaceAll("_", " ")}</option>`).join("")}</select></td>
        <td><input class="row-tech" data-id="${item.id}" aria-label="Técnico de ${escapeHtml(item.title)}" value="${escapeHtml(item.technician || "")}" placeholder="Sin asignar" style="width:125px;padding:7px;border:1px solid #dce3ee;border-radius:6px"></td>
        <td>${dateText(item.created_at)}</td>
        <td><button class="action detail-button" data-id="${item.id}">Detalle</button><button class="action save-button" data-id="${item.id}">Guardar</button></td>
      </tr>`).join("") : '<tr><td colspan="7" class="empty">No se encontraron incidentes.</td></tr>';
    $("#list-message").textContent = `${incidents.length} incidente(s) mostrado(s).`;
  } catch (error) {
    $("#list-message").textContent = error.message;
  }
}
async function loadDashboard() {
  try {
    const data = await api("/api/dashboard");
    $("#metric-open").textContent = data.open;
    $("#metric-closed").textContent = data.closed;
    $("#metric-critical").textContent = data.critical;
    $("#metric-total").textContent = data.total;
    renderStats("#category-stats", data.categories);
    renderStats("#technician-stats", data.technicians);
  } catch (error) {
    $("#list-message").textContent = error.message;
  }
}
function renderStats(selector, items) {
  const max = Math.max(1, ...items.map(item => item.total));
  $(selector).innerHTML = items.length ? items.map(item => `
    <div class="stat-row"><span>${escapeHtml(item.name)}</span><div class="bar"><span style="width:${item.total / max * 100}%"></span></div><strong>${item.total}</strong></div>`).join("") : '<p class="muted">Sin datos todavía.</p>';
}
async function refreshAll() {
  await Promise.all([loadIncidents(), loadDashboard()]);
}
$("#show-form").addEventListener("click", () => $("#form-panel").classList.remove("hidden"));
$("#hide-form").addEventListener("click", () => $("#form-panel").classList.add("hidden"));
$("#refresh").addEventListener("click", refreshAll);
["#search", "#filter-status", "#filter-priority", "#filter-category", "#filter-technician"].forEach(selector => {
  $(selector).addEventListener("input", loadIncidents);
  $(selector).addEventListener("change", loadIncidents);
});
$("#incident-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = Object.fromEntries(form.entries());
  $("#form-message").textContent = "Guardando...";
  try {
    await api("/api/incidents", { method: "POST", body: JSON.stringify(body) });
    event.target.reset();
    $("#form-message").textContent = "Incidente registrado correctamente.";
    await refreshAll();
  } catch (error) {
    $("#form-message").textContent = error.message;
  }
});
$("#incident-rows").addEventListener("click", async (event) => {
  const detail = event.target.closest(".detail-button");
  const save = event.target.closest(".save-button");
  if (detail) await showDetails(detail.dataset.id);
  if (save) {
    const id = save.dataset.id;
    const status = document.querySelector(`.row-status[data-id="${id}"]`).value;
    const technician = document.querySelector(`.row-tech[data-id="${id}"]`).value;
    try {
      await api(`/api/incidents/${id}`, { method: "PATCH", body: JSON.stringify({ status, technician }) });
      $("#list-message").textContent = "Cambios guardados y añadidos a la bitácora.";
      await refreshAll();
    } catch (error) {
      $("#list-message").textContent = error.message;
    }
  }
});
async function showDetails(id) {
  try {
    const item = await api(`/api/incidents/${id}`);
    activeIncidentId = id;
    $("#detail-title").textContent = `#${item.id} · ${item.title}`;
    $("#detail-subtitle").textContent = `${item.category} · ${item.priority} · ${item.status.replaceAll("_", " ")}`;
    $("#detail-content").innerHTML = `
      <p>${escapeHtml(item.description)}</p>
      <p><strong>Reportado por:</strong> ${escapeHtml(item.reporter)} · <strong>Técnico:</strong> ${escapeHtml(item.technician || "Sin asignar")}</p>
      <h4>Bitácora / comentarios</h4>
      ${(item.comments || []).map(c => `<div class="comment-item"><strong>${escapeHtml(c.author)}</strong><small>${dateText(c.created_at)}</small><div>${escapeHtml(c.comment)}</div></div>`).join("") || '<p class="muted">Todavía no hay comentarios.</p>'}`;
    $("#detail-dialog").showModal();
  } catch (error) {
    $("#list-message").textContent = error.message;
  }
}
$("#close-detail").addEventListener("click", () => $("#detail-dialog").close());
$("#comment-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeIncidentId) return;
  const form = Object.fromEntries(new FormData(event.currentTarget).entries());
  try {
    await api(`/api/incidents/${activeIncidentId}/comments`, { method: "POST", body: JSON.stringify(form) });
    event.target.reset();
    await showDetails(activeIncidentId);
  } catch (error) {
    alert(error.message);
  }
});
(async function init() {
  try {
    await loadMeta();
    await refreshAll();
  } catch (error) {
    $("#list-message").textContent = `No se pudo iniciar: ${error.message}`;
  }
})();
