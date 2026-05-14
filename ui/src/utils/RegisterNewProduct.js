import {apiFetch} from "./apiFetch.jsx";

/**
 * Recoge los valores del form y los manda a la BBDD usando enviarProducto
 *
 * @see {enviarProducto}
 * @author Alex Bernardos Gil
 * @version 1.0
 * @param param0
 * @param param0.request
 * @returns {Promise<undefined|boolean>}
 */
export async function registrarProducto({request}) {
    const formData = await request.formData();
    const postData = Object.fromEntries(formData);
    const token = postData?.token;
    const nombre = postData?.nombre;
    const estado = postData?.estado;
    const descripcion = postData?.descripcion;

    return enviarProducto(token, nombre, estado, descripcion)
}

/**
 * Envia los datos del producto a la BBDD
 *
 * @author Alex Bernardos Gil
 * @version 1.0
 * @param token
 * @param nombre
 * @param estado
 * @param descripcion
 * @returns {Promise<(boolean|string)[]|(boolean|*)[]|*[]>}
 */
export async function enviarProducto(token, nombre, estado, descripcion) {
    const url = import.meta.env.VITE_BACKEND_PRODUCTO;
    const params = new URLSearchParams();
    params.append('nombre', nombre);
    params.append('estado', estado);
    params.append('descripcion', descripcion);

    try {
        const response = await apiFetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'token': token || ''
            },
            body: params
        });

        if (!response.ok) {
            console.error('Error en la red o servidor');
            return [false, 'Error en la red o servidor'];
        }

        const respuesta = await response.json();

        if (respuesta.status === 200) {
            // Lógica registro correcto
            return [true, 'Producto registrado correctamente'];
        } else {
            console.log('ERROR: ' + respuesta.message);
            return [false, respuesta.message];
        }

    } catch (error) {
        console.error('ERROR AL INICIAR SESIÓN: ', error);
        return [false. error.message];
    }
}