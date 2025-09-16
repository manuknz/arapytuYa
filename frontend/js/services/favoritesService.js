// Servicio de ciudades favoritas
import { API_BASE_URL } from "../config.js";
import { authHeaders } from "./_utils.js";

/**
 * Lista ciudades favoritas del usuario.
 * @param {number|string} userId
 */
export async function listFavorites(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/favorite-cities/user/${userId}`, {
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });
    if (!res.ok) {
      let j = null;
      try {
        j = await res.json();
      } catch (_) {}
      return {
        ok: false,
        error: j?.message || j?.error || `Error ${res.status}`,
      };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
}

/**
 * Agrega una ciudad favorita.
 * @param {{ name:string; countryCode?:string; lat?:number; lon?:number; notes?:string; userId:number|string }} payload
 */
export async function addFavorite(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/favorite-city`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    let j = null;
    try {
      j = await res.json();
    } catch (_) {}
    if (!res.ok) {
      return {
        ok: false,
        error: j?.message || j?.error || `Error ${res.status}`,
      };
    }
    return { ok: true, data: j };
  } catch (e) {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
}

/**
 * Elimina una ciudad favorita por id.
 * @param {number|string} id
 */
export async function removeFavorite(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/favorite-city/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    if (!res.ok) {
      let j = null;
      try {
        j = await res.json();
      } catch (_) {}
      return {
        ok: false,
        error: j?.message || j?.error || `Error ${res.status}`,
      };
    }
    let j = null;
    try {
      j = await res.json();
    } catch (_) {}
    return { ok: true, data: j };
  } catch (e) {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
}
