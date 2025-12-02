// groups.js — gestion de groups.html
import { apiFetch, getToken } from './api.js';

export function initGroupsPage() {
  if (!document.getElementById("group-list")) return;

  // load on page
  loadGroups();

  // create group handler (ids: create-group-form, group-name)
  const createForm = document.getElementById("create-group-form");
  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("group-name").value.trim();
      if (!name) return alert("Nom requis");
      try {
        await apiFetch('/groups/', { method: "POST", body: { nom: name, creator_id: (await getMyId()) }});
        createForm.reset();
        await loadGroups();
      } catch (err) {
        alert("Erreur création groupe: " + err.message);
      }
    });
  }

  // join by id (form ids: join-group-form, group-id)
  const joinForm = document.getElementById("join-group-form");
  if (joinForm) {
    joinForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const groupId = parseInt(document.getElementById("group-id").value, 10);
      if (!groupId) return alert("ID invalide");
      try {
        const me = await getMyId();
        await apiFetch('/groups/users', { method: "POST", body: { group_id: groupId, user_id: me }});
        alert("Vous avez rejoint le groupe.");
        await loadGroups();
      } catch (err) {
        alert("Impossible de rejoindre: " + err.message);
      }
    });
  }
}

// helper: id du current user via /auth/me
async function getMyId() {
  const me = await apiFetch('/auth/me');
  // la route /auth/me renvoie l'objet user (SQLAlchemy model retourné)
  // depending on backend, id field name may be 'id' or similar
  return me.id ?? me.user_id ?? null;
}

export async function loadGroups() {
  try {
    const groups = await apiFetch('/groups');
    const list = document.getElementById("group-list");
    list.innerHTML = "";
    groups.forEach(g => {
      const li = document.createElement("li");
      li.innerHTML = `<a class="group-link" href="group.html?id=${g.id}">${escapeHtml(g.nom || g.name || g.nom)}</a>`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    alert("Erreur chargement groupes");
  }
}

// small helper escape
function escapeHtml(s){ return (s||"").toString().replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// auto-init
document.addEventListener("DOMContentLoaded", () => {
  initGroupsPage();
});
