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
        if (ruta) {
            return JSON.parse(contenidoArchivo)[ruta];
        }
        else {

            return JSON.parse(contenidoArchivo);
        }

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

export function guardarPermisos(res, permisos, ruta = undefined) {

    try {

        const contenidoArchivo = fs.readFileSync(rutaArchivoPermisos, 'utf8');
        const contenedorParseado = JSON.parse(contenidoArchivo);

        const permisoValido = comprobarPermisos(permisos);

        if (!permisoValido) {
            return res.status(400).json({
                message: 'Bad Request'
            });
        }

        // Sobrescribe o crea la ruta
        contenedorParseado[ruta] = permisoValido;

        // Guardar cambios
        fs.writeFileSync(
            rutaArchivoPermisos,
            JSON.stringify(contenedorParseado, null, 4)
        );

        return res.status(200).json({
            message: 'Permisos guardados correctamente'
        });

    } catch (e) {

        console.error(e);

        console.error(e);

        return {};
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

    const permitidos = {
        "protected": "boolean",
        "metodosPermitidos": ["GET", "POST", "DELETE"]
    }

    const permisoValido = [];

    //Compruebo si el permiso tieene protected
    if (!("protected" in permisos)) {
        return res.status(400).json({
            message: 'Bad Request'
        });
    }

    for (const permiso of permisos) {

        if (permitidos.metodosPermitidos.includes(permiso) || permiso == "protected")
            permisoValido.push(permiso);
        else {
            return res.status(400).json({
                message: 'Bad Request'
            });
        }
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