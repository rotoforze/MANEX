import mysql from 'mysql2/promise';
import {obtenerPermisos} from "./permisions.mjs";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

/**
 * Comprueba si quién hace la petición, tiene acceso a la API.
 *
 * @param req
 * @param res
 * @param next
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @returns {*}
 */
const auth = async (req, res, next) => {

    // rutas que no requieren autenticación
    const rutasPublicas = ['/login', '/', '/permisos', '/recuperar', '/reset'];
    if (rutasPublicas.includes(req.path)) return next();
    // si no se recibe un token, no se permite el acceso
    if (!req?.headers?.token) {
        return res.status(401).json({
            message: 'No se ha enviado un token'
        });
    }
    // comprobamos si el token es valido (si existe en la bbdd)
    const {nivel: nivelAcceso, username: authUsername} = await getNivelAcceso(req?.headers?.token, pool);

    if (nivelAcceso == -1) {
        return res.status(444).json({
            message: 'El token ha caducado o no es válido'
        });
    }
    // Validación de permisos
    const rutaRecortada = req.path;
    // comprobamos si la ruta tiene permisos
    const permisos = obtenerPermisos();

    const metodosRuta = permisos[rutaRecortada];
    let permisoAprobado = false;
    if (metodosRuta && metodosRuta[req.method]) {

        const permiso = metodosRuta[req.method];

        if (permiso.includes('*')) {
            permisoAprobado = true;
        } else if (permiso.includes(String(nivelAcceso))) {
            permisoAprobado = true;
        } else {
            const primero = permiso[0];
            if (primero?.startsWith('>')) {
                const minimo = parseInt(primero.slice(1), 10);
                if (nivelAcceso >= minimo) permisoAprobado = true;
            }
        }

        if (!permisoAprobado) {
            return res.status(403).json({message: 'No tienes permiso para esta acción'});
        }
    } else {
        return res.status(403).json({message: 'No tienes permiso para esta acción'});
    }

    req.nivelAcceso = nivelAcceso;
    req.authUsername = authUsername;
    return next();
}

/**
 * Comprueba si el token existe en la bbdd. Devuelve el nivel de acceso del usuario.
 * Devuelve -1 si el token no existe.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @param token
 * @returns {number}
 */
export async function getNivelAcceso(token, pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})) {
    try {
        const [rows] = await pool.query(
            'SELECT e.ID_DEPARTAMENTO, a.USERNAME FROM auth_token a JOIN EMPLEADO e ON a.USERNAME = e.USERNAME WHERE a.token = ? AND a.EXPIRES_AT > NOW();',
            [token]
        );
        if (rows.length > 0) {
            return {nivel: rows[0].ID_DEPARTAMENTO, username: rows[0].USERNAME};
        }

        return {nivel: -1, username: null};
    } catch (err) {
        console.error("Error en DB:", err);
        throw err;
    }
}

export default auth;