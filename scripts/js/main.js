document.addEventListener('DOMContentLoaded', () => {
    document.body.hidden = false;
    document.querySelector('#iniciarSesion').addEventListener('click', (e) => {
        e.preventDefault();
        inciarSesion(document.querySelector('#user').value, document.querySelector('#pass').value)
    })
});

function inciarSesion(usuario, password) {
    console.log(usuario, password);
    if (!usuario || !password) return;
    // creamos una petición XMLHTTP
    var peticion = new XMLHttpRequest();
    peticion.open("POST", './scripts/php/getBBDD.php', true);
    peticion.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    peticion.onreadystatechange = () => {
        if (peticion.readyState == 4 && peticion.status == 200) {
            try {
                const respuesta = JSON.parse(peticion.responseText);
                if (respuesta.status === 'success') {
                    window.alert(respuesta.message);
                } else {
                    window.alert('ERROR '+respuesta.message)
                }
            } catch (error) {
                console.error('ERROR AL INICIAR SESIÓN: ', error);
                console.log('Respuesta del servidor no es JSON válido:', peticion.responseText);
            }
        };
    };
    peticion.send(`u=${encodeURIComponent(usuario)}&p=${encodeURIComponent(password)}`);
    
};