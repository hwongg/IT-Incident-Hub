const $ = (selector) => document.querySelector(selector);
const statuses = ["NUEVO", "ASIGNADO", "EN_PROCESO", "RESUELTO", "CERRADO"];
const limit = 20;
let offset = 0;
let activeIncidentId = null;
let editingId = null;
let requestSequence = 0;
let searchTimer;

function escapeHtml(value = "") {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function dateText(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("es-GT", { dateStyle: "short", timeStyle: "short" });
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(Array.isArray(data.details) ? data.details.join(", ") : data.error || `Error HTTP ${response.status}`);
  }
  return data;
}

function currentFilters() {
  const params = new URLSearchParams();
  for (const [key, selector] of [["status", "#filter-status"], ["priority", "#filter-priority"], ["category", "#filter-category"], ["technician", "#filter-technician"], ["q", "#search"]]) {
    const value = $(selector).value.trim();
    if (value) params.set(key, value);
  }
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return params.toString();
}

async function loadMeta() {
  const meta = await api("/api/meta");
  $("#filter-status").innerHTML = '<option value="">Todos los estados</option>' +
    meta.statuses.map((status) => `<option value="${escapeHtml(status)}">${escapeHtml(status.replaceAll("_", " "))}</option>`).join("");
  $("#form-status").innerHTML = meta.statuses.map((status) =>
    `<option value="${escapeHtml(status)}">${escapeHtml(status.replaceAll("_", " "))}</option>`).join("");
}

async function loadIncidents() {
  const sequence = ++requestSequence;
  try {
    const incidents = await api(`/api/incidents?${currentFilters()}`);
    if (sequence !== requestSequence) return;
    $("#incident-rows").innerHTML = incidents.length ? incidents.map((item) => `
      <tr>
        <td><strong>${escapeHtml(item.title)}</strong><small>#${escapeHtml(item.id)} · ${escapeHtml(item.reporter)}</small></td>
        <td>${escapeHtml(item.category)}</td>
        <td><span class="pill priority-${escapeHtml(item.priority)}">${escapeHtml(item.priority)}</span></td>
        <td><span class="pill status-${escapeHtml(item.status)}">${escapeHtml(item.status.replaceAll("_", " "))}</span></td>
        <td>${escapeHtml(item.technician || "Sin asignar")}</td>
        <td>${dateText(item.created_at)}</td>
        <td class="actions"><button class="action" data-action="detail" data-id="${escapeHtml(item.id)}">Ver</button><button class="action" data-action="edit" data-id="${escapeHtml(item.id)}">Editar</button><button class="action danger" data-action="delete" data-id="${escapeHtml(item.id)}">Eliminar</button></td>
      </tr>`).join("") : '<tr><td colspan="7" class="empty">No se encontraron incidentes.</td></tr>';
    $("#list-message").textContent = `${incidents.length} incidente(s) en esta página`;
    $("#result-count").textContent = `${incidents.length} mostrados`;
    $("#page-info").textContent = `Página ${Math.floor(offset / limit) + 1}`;
    $("#page-prev").disabled = offset === 0;
    $("#page-next").disabled = incidents.length < limit;
  } catch (error) {
    if (sequence !== requestSequence) return;
    $("#list-message").textContent = error.message;
    $("#page-next").disabled = true;
  }
}

function renderStats(selector, items) {
  const max = Math.max(1, ...items.map((item) => item.total));
  $(selector).innerHTML = items.length ? items.map((item) => `
    <div class="stat-row"><span>${escapeHtml(item.name)}</span><div class="bar"><span style="width:${Math.max(0, Math.min(100, Number(item.total) / max * 100))}%"></span></div><strong>${Number(item.total)}</strong></div>`).join("") : '<p class="muted">Todavía no hay datos.</p>';
}

async function loadDashboard() {
  try {
    const data = await api("/api/dashboard");
    $("#metric-total").textContent = data.total;
    $("#metric-open").textContent = data.open;
    $("#metric-closed").textContent = data.closed;
    $("#metric-critical").textContent = data.critical;
    renderStats("#category-stats", data.categories);
    renderStats("#technician-stats", data.technicians);
  } catch (error) {
    $("#list-message").textContent = error.message;
  }
}

async function refreshAll() {
  await Promise.all([loadIncidents(), loadDashboard()]);
}

function openCreateForm() {
  editingId = null;
  $("#incident-form").reset();
  $("#form-title").textContent = "Nuevo incidente";
  $("#form-subtitle").textContent = "Completá los datos del caso.";
  $("#submit-form").textContent = "Registrar incidente";
  $("#form-message").textContent = "";
  $("#form-dialog").classList.remove("editing");
  $("#form-dialog").showModal();
}

async function openEditForm(id) {
  try {
    const item = await api(`/api/incidents/${id}`);
    editingId = id;
    const form = $("#incident-form");
    for (const field of ["title", "reporter", "category", "priority", "description", "status", "technician"]) {
      form.elements.namedItem(field).value = item[field] || "";
    }
    $("#form-title").textContent = `Editar incidente #${item.id}`;
    $("#form-subtitle").textContent = "Actualizá la información y guardá los cambios.";
    $("#submit-form").textContent = "Guardar cambios";
    $("#form-message").textContent = "";
    $("#form-dialog").classList.add("editing");
    $("#form-dialog").showModal();
  } catch (error) {
    $("#list-message").textContent = error.message;
  }
}

async function showDetails(id) {
  try {
    const item = await api(`/api/incidents/${id}`);
    activeIncidentId = id;
    $("#detail-title").textContent = `#${item.id} · ${item.title}`;
    $("#detail-subtitle").textContent = `${item.category} · ${item.priority} · ${item.status.replaceAll("_", " ")}`;
    $("#detail-content").innerHTML = `
      <div class="detail-box"><strong>Descripción</strong><p>${escapeHtml(item.description)}</p></div>
      <div class="detail-grid"><p><strong>Reportado por</strong><span>${escapeHtml(item.reporter)}</span></p><p><strong>Técnico asignado</strong><span>${escapeHtml(item.technician || "Sin asignar")}</span></p><p><strong>Creado</strong><span>${dateText(item.created_at)}</span></p><p><strong>Actualizado</strong><span>${dateText(item.updated_at)}</span></p></div>
      <h4>Bitácora y comentarios</h4>
      ${(item.comments || []).map((comment) => `<div class="comment-item"><strong>${escapeHtml(comment.author)}</strong><small>${dateText(comment.created_at)}</small><p>${escapeHtml(comment.comment)}</p></div>`).join("") || '<p class="muted">Sin comentarios.</p>'}`;
    $("#comment-message").textContent = "";
    if (!$("#detail-dialog").open) $("#detail-dialog").showModal();
  } catch (error) {
    $("#list-message").textContent = error.message;
  }
}

$("#show-form").addEventListener("click", openCreateForm);
$("#hide-form").addEventListener("click", () => $("#form-dialog").close());
$("#cancel-form").addEventListener("click", () => $("#form-dialog").close());
$("#close-detail").addEventListener("click", () => $("#detail-dialog").close());
$("#refresh").addEventListener("click", refreshAll);

for (const selector of ["#search", "#filter-status", "#filter-priority", "#filter-category", "#filter-technician"]) {
  $(selector).addEventListener("input", () => {
    clearTimeout(searchTimer);
    offset = 0;
    searchTimer = setTimeout(loadIncidents, 250);
  });
}

$("#page-prev").addEventListener("click", () => {
  offset = Math.max(0, offset - limit);
  loadIncidents();
});
$("#page-next").addEventListener("click", () => {
  offset += limit;
  loadIncidents();
});

$("#incident-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = $("#submit-form");
  const form = Object.fromEntries(new FormData(event.currentTarget).entries());
  if (!editingId) {
    delete form.status;
    form.technician = form.technician.trim();
  }
  button.disabled = true;
  $("#form-message").textContent = "Guardando...";
  try {
    await api(editingId ? `/api/incidents/${editingId}` : "/api/incidents", {
      method: editingId ? "PATCH" : "POST",
      body: JSON.stringify(form)
    });
    $("#form-dialog").close();
    offset = 0;
    await refreshAll();
    $("#list-message").textContent = "Incidente guardado correctamente.";
  } catch (error) {
    $("#form-message").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

$("#incident-rows").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "detail") return showDetails(id);
  if (action === "edit") return openEditForm(id);
  if (action === "delete") {
    const title = button.closest("tr").querySelector("td strong").textContent;
    if (!window.confirm(`¿Eliminar permanentemente el incidente #${id}: ${title}?\nTambién se eliminarán sus comentarios.`)) return;
    button.disabled = true;
    try {
      await api(`/api/incidents/${id}`, { method: "DELETE" });
      offset = 0;
      await refreshAll();
      $("#list-message").textContent = `Incidente #${id} eliminado correctamente.`;
    } catch (error) {
      $("#list-message").textContent = error.message;
      button.disabled = false;
    }
  }
});

$("#comment-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeIncidentId) return;
  const commentForm = event.currentTarget;
  const button = commentForm.querySelector('button[type="submit"], button:not([type])');
  button.disabled = true;
  try {
    const form = Object.fromEntries(new FormData(commentForm).entries());
    await api(`/api/incidents/${activeIncidentId}/comments`, {
      method: "POST", body: JSON.stringify(form)
    });
    commentForm.reset();
    await showDetails(activeIncidentId);
    await refreshAll();
  } catch (error) {
    $("#comment-message").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

(async () => {
  try {
    await loadMeta();
    await refreshAll();
  } catch (error) {
    $("#list-message").textContent = `No se pudo iniciar: ${error.message}`;
  }
})();
