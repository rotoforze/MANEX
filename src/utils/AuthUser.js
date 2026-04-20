import { redirect, useNavigate } from "react-router";

/**
 * 
 * Recibe un usuario y una contraseña, intenta iniciar sesión.
 * Si el inicio ha sido correcto, devuelve true.
 * Si el inicio ha sido incorrecto, devuelve false.
 * 
 * @param {String} usuario 
 * @param {String} password 
 * @param {String} wantsToKeepSession
 * @param {String} sessionToken
 * @author Alex Bernardos Gil
 * @returns Boolean
 */
export async function inciarSesion({ request }) {
    const formData = await request.formData();
    const postData = Object.fromEntries(formData);
    const usuario = postData?.user;
    const password = postData?.password;
    const wantsToKeepSession = postData?.keepSession ? true : false;
    const sessionToken = postData?.token;
    
    if (!sessionToken && (!usuario || !password)) return;
    return authUser(usuario, password, wantsToKeepSession, sessionToken);

};

const authUser = async (usuario, password, wantsToKeepSession, sessionToken) => {
    const url = 'http://localhost/MANEX/src/php/AuthUser.php';

    const params = new URLSearchParams();
    params.append('usuario', usuario);
    params.append('pass', password);
    if (wantsToKeepSession) params.append('keepSession', wantsToKeepSession);
    if (sessionToken) params.append('token', sessionToken);
    

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });

        if (!response.ok) throw new Error('Error en la red o servidor');

        const respuesta = await response.json();

        if (respuesta.status === 'success') {
            // Lógica Login correcto
            if (respuesta.token && respuesta.token[0] && respuesta.token[1]) {
                await cookieStore.delete('token');

                const unDiaEnMilisegundos = 24 * 60 * 60 * 1000;
                const fechaExpiracion = Date.now() + unDiaEnMilisegundos;

                await cookieStore.set({
                    name: 'token',
                    value: respuesta.token[1],
                    expires: fechaExpiracion,
                    path: '/',
                    sameSite: 'lax'
                });
            }
            return true;
        } else {
            console.log('ERROR: ' + respuesta.message);
            await cookieStore.delete('token');
            return false;
        }

    } catch (error) {
        console.error('ERROR AL INICIAR SESIÓN: ', error);
        await cookieStore.delete('token');
        return false;
    }
};