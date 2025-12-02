// tasks.js — manage tasks (tasks.html)
import { apiFetch } from './api.js';

async function initTasksPage() {
  const form = document.getElementById("task-form");
  const list = document.getElementById("task-list");
  if (!form || !list) return;

  // form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titre = document.getElementById("title").value.trim();
    const deadlineRaw = document.getElementById("deadline")?.value || null;

    // owner id: fetch /auth/me
    const me = await apiFetch('/auth/me');

    const payload = {
      titre,
      deadline: deadlineRaw ? new Date(deadlineRaw).toISOString() : null,
      owner_id: me.id
    };

    try {
      await apiFetch('/tasks/', { method: "POST", body: payload });
      form.reset();
      await loadTasks();
    } catch (err) {
      alert("Erreur création tâche: " + err.message);
    }
  });

  await loadTasks();
}

export async function loadTasks() {
  try {
    const tasks = await apiFetch('/tasks/');
    const list = document.getElementById("task-list");
    list.innerHTML = "";
    (tasks || []).forEach(t => {
      const li = document.createElement("li");
      const deadline = t.deadline ? new Date(t.deadline).toLocaleString() : "—";
      li.innerHTML = `
        <strong> (${t.id}) ${t.titre}</strong> — ${deadline} — ${t.status ? "✓" : "✗"}
        <div class="task-actions">
          <button class="btn edit" data-id="${t.id}">Modifier</button>
          <button class="btn danger delete" data-id="${t.id}">Supprimer</button>
        </div>
      `;
      list.appendChild(li);
    });

    // attach events (delegation)
    list.querySelectorAll('button.delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm("Supprimer ?")) return;
        await apiFetch(`/tasks/${id}`, { method: "DELETE" });
        await loadTasks();
      });
    });

    // edit handlers left as exercise (use PUT /tasks/ with TaskUpdate)
  } catch (err) {
    console.error(err);
    alert("Erreur chargement tâches");
  }

}

document.addEventListener("DOMContentLoaded", initTasksPage);
