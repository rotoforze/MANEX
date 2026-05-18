//Cargamos las variables del archivo .env a process.env

/**
 *
 * Recibe un usuario y una contraseña, intenta iniciar sesión.
 * Si el inicio ha sido correcto, devuelve true.
 * Si el inicio ha sido incorrecto, devuelve false.
 *
 * @param {Object} request
 * @author Alex Bernardos Gil
 * @version 1.0
 * @returns Boolean
 */
export async function inciarSesion({request}) {
    const formData = await request.formData();
    const postData = Object.fromEntries(formData);
    const usuario = postData?.user;
    const password = postData?.password;
    const wantsToKeepSession = !!postData?.keepSession;
    const sessionToken = postData?.token;

    return authUser(usuario, password, wantsToKeepSession, sessionToken);

}


/**
 * Hace una petición fetch al backend PHP que verifica si las
 * credenciales son correctas.
 *
 * @param {String} usuario
 * @param {String} password
 * @param {Boolean} wantsToKeepSession
 * @param {String} sessionToken
 * @author Alex Bernardos Gil
 * @version 1.0
 * @returns Boolean
 */
export const authUser = async (usuario, password, wantsToKeepSession, sessionToken) => {

    const url = import.meta.env.VITE_BACKEND_LOGIN;
    const params = new URLSearchParams();
    params.append('usuario', usuario);
    params.append('pass', password);
    if (wantsToKeepSession) params.append('keepSession', '' + wantsToKeepSession);
    if (sessionToken) params.append('token', sessionToken);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });

        if (!response.ok) {
            console.error('Error en la red o servidor');
            return response;
        }

        const respuesta = await response.json();

        if (respuesta.status === 201) {
            // Lógica Login correcto
            if (respuesta.auth) {

                await createTokenCookie(respuesta.auth.token, !!wantsToKeepSession);

            }
            return {
                success: respuesta.auth.authorized,
                token: respuesta.auth.token,
                id: respuesta.auth.id,
                username: respuesta.auth.username,
                department: respuesta.auth.department
            };
        } else {
            console.log('ERROR: ' + respuesta.message);
            await deleteTokenCookie();
            return respuesta.message;
        }

    } catch (error) {
        console.error('ERROR AL INICIAR SESIÓN: ', error);
        await deleteTokenCookie();
        return false;
    }
};

/**
 * Crea la cookie con nombre 'token' y valor del parámetro recibido.
 *
 * @param {String} token
 * @param {Boolean} tiempoLargo
 * @author Alex Bernardos Gil
 * @version 2.0
 * @returns {boolean}
 */
function createTokenCookie(token, tiempoLargo) {
    if (!token) return false;
    deleteTokenCookie();

    const tiempo = tiempoLargo ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    const fechaExpiracion = new Date(Date.now() + tiempo);

    document.cookie = [
        `token=${encodeURIComponent(token)}`,
        `expires=${fechaExpiracion.toUTCString()}`,
        `path=/`,
        `SameSite=Lax`
    ].join('; ');

    return document.cookie.split(';').some(c => c.trim().startsWith('token='));
}

/**
 * Elimina la cookie con nombre 'token'.
 *
 * @author Alex Bernardos Gil
 * @version 2.0
 * @returns {boolean}
 */
export function deleteTokenCookie() {
    const existed = document.cookie.split(';').some(c => c.trim().startsWith('token='));

    // Overwrite with an already-expired date to delete it
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';

    return existed;
}