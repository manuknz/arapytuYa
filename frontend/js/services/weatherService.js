// Servicio de clima
// Interactúa con el backend para obtener datos de clima.
import { API_BASE_URL } from "../config.js";
import { authHeaders } from "./_utils.js";

/**
 * Obtiene el clima para una ciudad.
 * Backend espera { ciudad } en el body (POST/GET?). Actualmente ruta GET /clima usa req.body.ciudad.
 * Aunque es inusual enviar body en GET, seguiremos la implementación o podríamos cambiar a POST.
 * Aquí usaremos POST para mayor compatibilidad y menor ambigüedad.
 * @param {string} city Nombre de la ciudad.
 * @returns {Promise<{ ok:boolean; data?:any; error?:string }>} Resultado.
 */
export async function fetchWeather(city) {
  try {
    const res = await fetch(`${API_BASE_URL}/clima`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ ciudad: city }),
    });
    let json = null;
    try {
      json = await res.json();
    } catch (_) {}
    if (!res.ok) {
      return {
        ok: false,
        error: (json && (json.message || json.error)) || `Error ${res.status}`,
      };
    }
    // La respuesta esperada: { status:'success', data: {...} }
    if (!json || json.status !== "success") {
      return {
        ok: false,
        error: json?.message || "Respuesta inesperada del servidor.",
      };
    }
    return { ok: true, data: json.data };
  } catch (e) {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
}
