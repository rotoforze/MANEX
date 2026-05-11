import {deleteTokenCookie} from "./AuthUser.js";

/**
 * Permite hacer peticiones a la API.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @param url
 * @param options
 * @returns {Promise<Response>}
 */
export async function apiFetch(url, options) {
    const erroresQueIndicanLogout = [444];

    try {
        const respuesta = await fetch(url, options);

        if (erroresQueIndicanLogout.includes(respuesta.status)) {
            console.log("Sesión expirada o no autorizada");
            deleteTokenCookie();
            window.location.href = '/logout';
        }

        return respuesta;
    } catch (error) {
        console.error("Error de red:", error);
        throw error;
    }
}