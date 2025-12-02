// group-details.js — used in group.html
import { apiFetch, logout } from './api.js';

async function getGroupIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function initGroupPage() {
  const groupId = await getGroupIdFromUrl();
  if (!groupId) {
    alert("Aucun ID de groupe fourni");
    window.location.href = "groups.html";
    return;
  }

  // dom elements
  const groupName = document.getElementById("group-name");
  const membersList = document.getElementById("members");
  const ownerActions = document.getElementById("owner-actions");
  const memberActions = document.getElementById("member-actions");
  const inviteLinkEl = document.getElementById("invite-link");
  const deleteBtn = document.getElementById("delete-group-btn");
  const leaveBtn = document.getElementById("leave-group-btn");
  const generateBtn = document.getElementById("generate-link-btn");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskNameInput = document.getElementById("task-name");

  const me = await apiFetch('/auth/me');
  const myId = me.id;

  try {
    const group = await apiFetch(`/groups/${groupId}`);
    groupName.textContent = group.nom || group.name;
    const isOwner = (group.creator_id ?? group.creator) == myId;

    if (isOwner) ownerActions.style.display = "block";
    memberActions.style.display = "block";

    const membersRes = await apiFetch(`/groups/users/${groupId}`);
    membersList.innerHTML = "";
    (membersRes.members || []).forEach(m => {
      const li = document.createElement("li");
      li.textContent = `${m.nom} (${m.id})`;
      membersList.appendChild(li);
    });

    // 👉 Génération locale du lien et copie dans le presse‑papiers
    if (generateBtn) {
      generateBtn.addEventListener("click", async () => {
        const inviteLink = `${window.location.origin}/invite.html?group=${groupId}`;
        inviteLinkEl.textContent = inviteLink;
        try {
          await navigator.clipboard.writeText(inviteLink);
          alert("Lien d'invitation copié dans le presse‑papiers !");
        } catch (err) {
          alert("Impossible de copier le lien : " + err.message);
        }
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (!confirm("Supprimer le groupe ?")) return;
        try {
          await apiFetch(`/groups/${groupId}`, { method: "DELETE", body: { group_id: parseInt(groupId), user_id: me.id }});
          alert("Groupe supprimé");
          window.location.href = "groups.html";
        } catch (err) {
          alert("Erreur suppression : " + err.message);
        }
      });
    }

    if (leaveBtn) {
      leaveBtn.addEventListener("click", async () => {
        if (!confirm("Quitter le groupe ?")) return;
        try {
          const me = await apiFetch('/auth/me');
          await apiFetch('/groups/users', { method: "DELETE", body: { group_id: parseInt(groupId), user_id: me.id }});
          alert("Vous avez quitté le groupe");
          window.location.href = "groups.html";
        } catch (err) {
          alert("Erreur lors du départ : " + err.message);
        }
      });
    }

  } catch (err) {
    console.error(err);
    alert("Impossible de charger le groupe : " + err.message);
    window.location.href = "groups.html";
  }

  const tasksRes = await apiFetch(`/groups/${groupId}/tasks`);
  const taskList = document.getElementById("group-task-list");
  taskList.innerHTML = "";
  
  (tasksRes || []).forEach(t => {
    const li = document.createElement("li");
    li.textContent = ` (${t.id}) ${t.titre} — ${t.deadline} — ${t.status ? "✓" : "✗"}`;
    taskList.appendChild(li);
  });

  if (addTaskBtn) {
  addTaskBtn.addEventListener("click", async () => {
    const taskName = taskNameInput.value;
    if (!taskName) {
      alert("Veuillez entrer un nom de tâche");
      return;
    }
    try {
      // Appel API pour créer/associer la tâche au groupe
      const newTask = await apiFetch(`/groups/tasks`, {
        method: "POST",
        body: { group_id: parseInt(groupId), task_id: parseInt(taskName) }
      });

      // Ajout visuel dans la liste
      const li = document.createElement("li");
      li.textContent = newTask.name || taskName;
      document.getElementById("group-task-list").appendChild(li);

      taskNameInput.value = "";
      alert("Tâche ajoutée au groupe !");
    } catch (err) {
      alert("Erreur lors de l’ajout de la tâche : " + err.message);
    }
  });
}
}

document.addEventListener("DOMContentLoaded", initGroupPage);
