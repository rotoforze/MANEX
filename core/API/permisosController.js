import mysql from 'mysql2/promise';

import {
    obtenerPermisos,
    guardarPermisos,
    esRutaProtegida
} from './permisions.mjs';

/**
 * Comprueba si el usuario es administrador.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param token
 * @returns {Promise<boolean>}
 */
async function esAdministrador(token) {

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    const [resultado] = await pool.query(
        `SELECT e.ID_DEPARTAMENTO
         FROM auth_token a
                  JOIN empleado e
                       ON a.USERNAME = e.USERNAME
         WHERE a.TOKEN = ?
           AND a.EXPIRES_AT > NOW()`,
        [token]
    );

    if (resultado.length <= 0) {

        return false;
    }

    return resultado[0].ID_DEPARTAMENTO === 9;
}

/**
 * Devuelve todos los permisos del sistema.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
export async function obtenerTodosLosPermisos(req, res) {

    const token = req?.headers?.token;

    // como comprobamos si no desde el front si un usuario tiene permisos para ver un componente?
    // if (!await esAdministrador(token)) {
    //
    //     return res.status(403).send({
    //         status: 403,
    //         message: 'No tienes permisos.'
    //     });
    // }

    return res.status(200).send({
        status: 200,
        permisos: obtenerPermisos()
    });
}

/**
 * Crea o modifica un permiso.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
export async function crearOModificarPermiso(req, res) {

    const token = req?.headers?.token;

    if (!await esAdministrador(token)) {

        return res.status(403).send({
            status: 403,
            message: 'No tienes permisos.'
        });
    }

    const {
        ruta,
        metodo,
        permisos
    } = req.body;

    if (!ruta || !metodo || !Array.isArray(permisos)) {

        return res.status(400).send({
            status: 400,
            message: 'Datos inválidos.'
        });
    }

    if (esRutaProtegida(ruta)) {

        return res.status(403).send({
            status: 403,
            message: 'La ruta está protegida.'
        });
    }

    const permisosActuales = obtenerPermisos();

    if (!permisosActuales[ruta]) {

        permisosActuales[ruta] = {};
    }

    permisosActuales[ruta][metodo] = permisos;

    guardarPermisos(permisosActuales);

    return res.status(200).send({
        status: 200,
        message: 'Permisos guardados correctamente.'
    });
}

/**
 * Elimina un permiso.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
export async function eliminarPermiso(req, res) {

    const token = req?.headers?.token;

    if (!await esAdministrador(token)) {

        return res.status(403).send({
            status: 403,
            message: 'No tienes permisos.'
        });
    }

    const {
        ruta,
        metodo
    } = req.body;

    if (!ruta || !metodo) {

        return res.status(400).send({
            status: 400,
            message: 'Datos inválidos.'
        });
    }

    if (esRutaProtegida(ruta)) {

        return res.status(403).send({
            status: 403,
            message: 'La ruta está protegida.'
        });
    }

    const permisosActuales = obtenerPermisos();

    if (
        permisosActuales[ruta] &&
        permisosActuales[ruta][metodo]
    ) {

        delete permisosActuales[ruta][metodo];

        guardarPermisos(permisosActuales);
    }

    return res.status(200).send({
        status: 200,
        message: 'Permiso eliminado correctamente.'
    });
}