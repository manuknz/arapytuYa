// Servicio de usuarios
import { API_BASE_URL } from "../config.js";
import { authHeaders } from "./_utils.js";

/**
 * Obtiene la lista completa de usuarios (solo si backend lo permite con token y rol apropiado).
 */
export async function listUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/users`, {
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
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
}

/**
 * Obtiene un usuario por id realizando un filtrado sobre listUsers.
 * (Backend no expone /users/:id en las rutas actuales.)
 * @param {number|string} userId
 */
export async function getUserById(userId) {
  const user = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: { ...authHeaders() },
  });
  if (!user.ok) return user;
  const data = await user.json();
  return { ok: true, data };
}

/**
 * Crea un usuario (registro público) - útil si deseas exponer esto desde UI admin.
 */
// export async function createUser(payload) {
//   try {
//     const res = await fetch(`${API_BASE_URL}/users`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//     let j = null;
//     try {
//       j = await res.json();
//     } catch (_) {}
//     if (!res.ok) {
//       return {
//         ok: false,
//         error: j?.message || j?.error || `Error ${res.status}`,
//       };
//     }
//     return { ok: true, data: j };
//   } catch (e) {
//     return { ok: false, error: "No se pudo conectar con el servidor." };
//   }
// }

/**
 * Actualiza un usuario.
 */
export async function updateUser(id, payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
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
 * Elimina un usuario.
 */
export async function deleteUser(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
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
