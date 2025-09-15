// Servicio de cuentas (registro de usuario)
// Encapsula la llamada a la API para crear usuarios.

import { API_BASE_URL } from "../config.js";

/**
 * Registra un nuevo usuario.
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.password
 * @param {string | undefined} params.token Token opcional (ej: admin ya autenticado)
 * @returns {Promise<{ ok: boolean; error?: string; created?: boolean }>} Resultado del registro
 */
export async function registerUser({ name, email, password, token }) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    // NOTA: Ajustar endpoint si decides tener /register público.
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, email, password }),
    });

    let data = null;
    try {
      data = await res.json();
    } catch (_) {}

    if (!res.ok) {
      const errorMsg =
        (data && (data.error || data.message)) || `Error ${res.status}`;
      return { ok: false, error: errorMsg };
    }

    return { ok: true, created: true };
  } catch (err) {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
}
