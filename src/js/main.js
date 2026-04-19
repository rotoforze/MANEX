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
function inciarSesion(usuario, password, wantsToKeepSession = '', sessionToken = '') {
    if (!usuario || !password) return;
    // creamos una petición XMLHTTP
    var peticion = new XMLHttpRequest();
    // llamada post al php encargado de hacer la petición
    peticion.open("POST", './src/php/AuthUser.php', true);

    peticion.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    peticion.onreadystatechange = () => {
        if (peticion.readyState == 4 && peticion.status == 200) {

            try {
                const respuesta = JSON.parse(peticion.responseText);
                if (respuesta.status === 'success') {
                    // lógica Login correcto 
                    if (respuesta.token[0] && respuesta.token[1]) {
                        cookieStore.set('token', respuesta.token[1]);
                        // cargar dashboard
                    } 
                    return true;
                } else {
                    // lógica Login incorrecto

                    console.log('ERROR ' + respuesta.message);
                    return false;
                }
            } catch (error) {
                // lógica error
                console.error('ERROR AL INICIAR SESIÓN: ', error);
                console.log('Respuesta del servidor no es JSON válido:', peticion.responseText);
                return false;
            }
        };
    };

    // envía la petición con los parámetros codificados
    peticion.send(`&usuario=${encodeURIComponent(usuario)}&pass=${encodeURIComponent(password)}${wantsToKeepSession ? '&keepSession=' + encodeURIComponent(wantsToKeepSession) : ''}${sessionToken ? '&token=' + encodeURIComponent(sessionToken) : ''}`);

};

/**
 * Carga las funciones de la página de login.
 * 
 * @author Alex Bernardos Gil
 */
async function loadLoginPageFunctions() {
        document.body.hidden = false;

        let token = await cookieStore.get('token');
        token = token?.value ? token?.value : token;

        if (token) inciarSesion('auto', 'login', true, token);

        document.querySelector('.inicio-sesion').addEventListener('submit', async (e) => {
            e.preventDefault();
            inciarSesion(e.target.user.value, e.target.pass.value, e.target.keepSession.checked, token);
        });
}


document.addEventListener('DOMContentLoaded', () => loadLoginPageFunctions());
