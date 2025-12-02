// api.js — helper pour toutes les requêtes
// usage : import { apiFetch, getToken, setToken, logout } from './js/api.js'

export const API_URL = "https://lastproject-kt0f.onrender.com";

export function getToken() {
  return localStorage.getItem("access_token");
}

export function setToken(token) {
  localStorage.setItem("access_token", token);
}

export function logout() {
  localStorage.removeItem("access_token");
  window.location.href = "login.html";
}

// helper centralisé qui gère JSON, headers, erreurs 401 -> redirection
export async function apiFetch(path, opts = {}) {
  const url = `${API_URL}${path}`;
  const headers = opts.headers ? {...opts.headers} : {};

  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  if (!headers["Content-Type"] && opts.body && typeof opts.body === "object") {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, {...opts, headers});

  if (res.status === 401) {
    // token invalide ou non connecté
    logout();
    throw new Error("Unauthorized");
  }

  // pour 204 No Content
  if (res.status === 204) return null;

  // essais de parser JSON, sinon texte
  const text = await res.text();
  try {
    return JSON.parse(text || "{}");
  } catch {
    return text;
  }
}
