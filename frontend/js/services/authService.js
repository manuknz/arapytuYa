// Servicio de autenticación
// Responsabilidad: manejar las llamadas HTTP relacionadas a auth.
// Devuelve objetos estructurados para que la capa de UI no tenga que conocer detalles del fetch.

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Realiza login contra la API.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ ok: boolean; token?: string; userId?: string; error?: string }>} Resultado del login
 */
export async function loginRequest(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Intentamos parsear JSON siempre que sea posible
    let data = null;
    try {
      data = await res.json();
    } catch (_) {
      // Ignoramos error de parseo, puede ser texto plano
    }

    if (!res.ok) {
      // Buscamos un mensaje de error amistoso
      const errorMessage =
        (data && (data.error || data.message)) || `Error ${res.status}`;
      return { ok: false, error: errorMessage };
    }

    if (!data || !data.token) {
      return { ok: false, error: "Respuesta inválida del servidor." };
    }

    return { ok: true, token: data.token, userId: data.userId };
  } catch (err) {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
}
