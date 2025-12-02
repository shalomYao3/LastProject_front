import { apiFetch } from './api.js';

const params = new URLSearchParams(window.location.search);
const groupId = params.get("group");

const inviteMessage = document.getElementById("invite-message");
const acceptBtn = document.getElementById("accept-btn");
const rejectBtn = document.getElementById("reject-btn");

async function loadGroup() {
  try {
    const group = await apiFetch(`/groups/${groupId}`);
    inviteMessage.textContent = `Vous avez été invité à rejoindre le groupe "${group.nom || group.name}"`;
  } catch (err) {
    inviteMessage.textContent = "Invitation invalide ou groupe introuvable.";
    acceptBtn.style.display = "none";
    rejectBtn.textContent = "Retour";
  }
}

// Accepter l’invitation
acceptBtn.addEventListener("click", async () => {
  try {
    const me = await apiFetch('/auth/me');
    await apiFetch('/groups/users', {
      method: "POST",
      body: { group_id: parseInt(groupId), user_id: me.id }
    });
    alert("Vous avez rejoint le groupe !");
    window.location.href = "groups.html";
  } catch (err) {
    alert("Erreur lors de l’acceptation : " + err.message);
  }
});

// Refuser l’invitation
rejectBtn.addEventListener("click", () => {
  alert("Invitation refusée.");
  window.location.href = "groups.html";
});

loadGroup();
