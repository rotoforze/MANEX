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

    if (!sessionToken && (!usuario || !password)) return;
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
const authUser = async (usuario, password, wantsToKeepSession, sessionToken) => {
    const url = 'http://localhost/login';

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
            return;
        }

        const respuesta = await response.json();

        if (respuesta.status === 'success') {
            // Lógica Login correcto
            if (respuesta.token && respuesta.token[0] && respuesta.token[1]) {
                await createTokenCookie(respuesta.token[1]);

            }
            return true;
        } else {
            console.log('ERROR: ' + respuesta.message);
            await deleteTokenCookie();
            return false;
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
 * @author Alex Bernardos Gil
 * @version 1.0
 * @returns {Promise<boolean>}
 */
async function createTokenCookie(token) {
    if (!token) return false;
    // borra si existe la cookie del token para restablecer el tiempo de uso
    await deleteTokenCookie();
    const unDiaEnMilisegundos = 24 * 60 * 60 * 1000;
    const fechaExpiracion = Date.now() + unDiaEnMilisegundos;

    return !!await cookieStore.set({
        name: 'token',
        value: token,
        expires: fechaExpiracion,
        path: '/',
        sameSite: 'lax'
    });
}

/**
 *
 * Elimina la cookie con nombre 'token'.
 *
 * @author Alex Bernardos Gil
 * @version 1.0
 * @returns {Promise<boolean>}
 */
async function deleteTokenCookie() {
    return !!await cookieStore.delete('token');
}