document.addEventListener('DOMContentLoaded', () => {
    document.body.hidden = false;
    document.querySelector('.inicio-sesion').addEventListener('submit', (e) => {
        e.preventDefault();
        inciarSesion(document.querySelector('#user').value, document.querySelector('#pass').value)
    })
});


/**
 * 
 * Recibe un usuario y una contraseña, intenta iniciar sesión.
 * Si el inicio ha sido correcto, devuelve true.
 * Si el inicio ha sido incorrecto, devuelve false.
 * 
 * @param {*} usuario 
 * @param {*} password 
 * @author Alex Bernardos Gil
 * @returns Boolean
 */
function inciarSesion(usuario, password) {
    
    if (!usuario || !password) return;
    // creamos una petición XMLHTTP
    var peticion = new XMLHttpRequest();
    // llamada post al php encargado de hacer la petición
    peticion.open("POST", './scripts/php/AuthUser.php', true);

    peticion.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    peticion.onreadystatechange = () => {
        if (peticion.readyState == 4 && peticion.status == 200) {

            try {
                const respuesta = JSON.parse(peticion.responseText);
                if (respuesta.status === 'success') {
                    // lógica Login correcto 

                    window.alert(respuesta.message);
                    return true;
                } else {
                    // lógica Login incorrecto

                    window.alert('ERROR ' + respuesta.message);
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
    peticion.send(`user=${encodeURIComponent(usuario)}&pass=${encodeURIComponent(password)}`);

};