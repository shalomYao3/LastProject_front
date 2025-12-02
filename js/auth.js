// auth.js
// usage in HTML: <script type="module" src="js/auth.js"></script>

import { apiFetch, setToken, getToken } from './api.js';

// Login form handler (expects ids: login-form, username, password)
export function initAuthForms() {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      try {
        const data = await apiFetch('/auth/login', {
          method: "POST",
          body: { username, password }
        });
        // backend returns {"response": token}
        const token = data.response;
        if (!token) throw new Error("No token returned");
        setToken(token);
        window.location.href = "dashboard.html";
      } catch (err) {
        alert("Échec de connexion : " + (err.message || err));
      }
    });
  }

  // Register form (ids: register-form, reg-username, reg-password)
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("reg-username").value.trim();
      const password = document.getElementById("reg-password").value;
      try {
        const data = await apiFetch('/auth/register', {
          method: "POST",
          body: { username, password }
        });
        alert("Inscription réussie. Vous pouvez vous connecter.");
        window.location.href = "login.html";
      } catch (err) {
        alert("Erreur inscription : " + err.message);
      }
    });
  }
}

// helper: récupère /auth/me
export async function getCurrentUser() {
  return await apiFetch('/auth/me');
}

// démarre automatiquement si la page contient au moins un des formulaires
document.addEventListener("DOMContentLoaded", () => {
  initAuthForms();
});
