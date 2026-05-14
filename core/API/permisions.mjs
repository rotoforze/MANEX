import fs from 'fs';
import path from 'path';

const rutaArchivoPermisos = path.resolve('./API/permisos.json');

const rutasProtegidas = ['/', '/login'];

/**
 * Devuelve todos los permisos del sistema.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @returns {Object}
 */
export function obtenerPermisos(ruta = undefined) {

    try {
        const contenidoArchivo = fs.readFileSync(rutaArchivoPermisos, 'utf8');
        // simplificación del ifelse
        return ruta ? JSON.parse(contenidoArchivo)[ruta] : JSON.parse(contenidoArchivo);

    } catch (e) {

        console.error(e);

        return {};
    }
}

/**
 * Guarda los permisos recibidos en el archivo.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param permisos
 */

export function guardarPermisos(res, permisos, ruta = undefined, bypass = false) {

    try {
        const contenidoArchivo = fs.readFileSync(rutaArchivoPermisos, 'utf8');
        const contenedorParseado = JSON.parse(contenidoArchivo);
        const permisoValido = comprobarPermisos(permisos);

        if (!permisoValido && !bypass) {
            return res.status(400).json({ message: 'Bad Request' });
        }

        contenedorParseado[ruta] = permisoValido;

        fs.writeFileSync(
            rutaArchivoPermisos,
            JSON.stringify(contenedorParseado, null, 4)
        );

        return res.status(200).json({ message: 'Permisos guardados correctamente' });

    } catch (e) {
        console.error(e);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
}


/**
 * Comprueba si los permisos que recibe son validos o no
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param permisos
 */
function comprobarPermisos(permisos) {
    const metodosPermitidos = ["GET", "POST", "DELETE"];

    if (!("protected" in permisos)) return null;

    const permisoValido = { protected: permisos.protected };

    for (const clave of Object.keys(permisos)) {
        if (clave === "protected") continue;
        if (!metodosPermitidos.includes(clave)) return null;
        permisoValido[clave] = permisos[clave];
    }

    return permisoValido;
}


/**
 * Comprueba si la ruta recibida es protegida.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param ruta
 * @returns {boolean}
 */
export function esRutaProtegida(ruta) {

    return rutasProtegidas.includes(ruta);
}