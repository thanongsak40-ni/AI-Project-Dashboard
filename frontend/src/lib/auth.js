const API_BASE = import.meta.env.VITE_API_BASE || '';
const KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getToken() {
  return localStorage.getItem(KEY);
}

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
}

export async function login(username, password) {
  const r = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'login failed');
  localStorage.setItem(KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
}
