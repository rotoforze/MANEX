import {apiFetch} from "./apiFetch.jsx";

/**
 * Recoge los valores del form y los manda a la BBDD usando enviarUsuario
 *
 * @see {enviarUsuario}
 * @author Alex Bernardos Gil
 * @version 1.0
 * @param param0
 * @param param0.request
 * @returns {Promise<undefined|boolean>}
 */
export async function registrarUsuario({request}) {
    const formData = await request.formData();
    const postData = Object.fromEntries(formData);
    const token = postData?.token;
    const id = postData?.id || ''; // vacío para nuevos usuarios
    const nombre = postData?.nombre;
    const apellidos = postData?.apellidos || '';
    const fecha_nacimiento = postData?.fecha_nacimiento;
    const telefono = postData?.telefono;
    const ID_contrato = postData?.id_contrato;
    const ID_departamento = postData?.id_departamento;
    const usuario = postData?.username;
    const email = postData?.email;
    const contrasenia = postData?.password;
    const contrasenia_confirmacion = postData?.confirmPassword;

    if (contrasenia !== contrasenia_confirmacion) return [-1, 'Las contraseñas no coinciden'];

    return enviarUsuario(token, id, nombre, apellidos, fecha_nacimiento, telefono, ID_contrato, ID_departamento, usuario, email, contrasenia)
}

/**
 * Envia los datos del usuario a la BBDD
 *
 * @author Alex Bernardos Gil
 * @version 1.0
 * @param id
 * @param nombre
 * @param apellidos
 * @param fecha_nacimiento
 * @param ID_contrato
 * @param ID_departamento
 * @param usuario
 * @param email
 * @param contrasenia
 * @returns {Promise<boolean>}
 */
export async function enviarUsuario(token, id, nombre, apellidos, fecha_nacimiento, telefono, ID_contrato, ID_departamento, usuario, email, contrasenia) {
    const url = import.meta.env.VITE_BACKEND_SIGNIN;
    const params = new URLSearchParams();
    params.append('id', id);
    params.append('nombre', nombre);
    params.append('apellidos', apellidos);
    params.append('fecha_nacimiento', fecha_nacimiento);
    params.append('telefono', telefono);
    params.append('ID_contrato', ID_contrato);
    params.append('ID_departamento', ID_departamento);
    params.append('usuario', usuario);
    params.append('email', email);
    params.append('contrasenia', contrasenia);

    try {
        const response = await apiFetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'token': token || ''
            },
            body: params
        });

        const respuesta = await response.json();

        if (response.ok && respuesta.status === 201) {
            return [true, 'Empleado registrado correctamente'];
        } else {
            console.log('ERROR: ' + respuesta.message);
            return [false, respuesta.message ?? 'Error al registrar el empleado.'];
        }

    } catch (error) {
        console.error('ERROR AL INICIAR SESIÓN: ', error);
        return [false. error.message];
    }
}