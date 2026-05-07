import mysql from 'mysql2/promise';
import permisions from "./permisions.mjs";


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

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    })

    pool.on('enqueue', function () {
        console.log('Esperando por la conexión con la bbdd.');
    });

    pool.on('acquire', function (connection) {
        console.log('Se ha establecido la conexión %d con la bbdd.', connection.threadId)
    });

    pool.on('release', function (connection) {
        console.log('Conexión %d liberada', connection.threadId);
    });

    // si es login o la raíz, dejamos pasar
    if (req.path == '/login' || req.path == '/') return next();
    // si no se recibe un token, no se permite el acceso
    if (!req?.headers?.token) {
        return res.status(401).json({
            message: 'No se ha enviado un token'
        });
    }
    // comprobamos si el token es valido (si existe en la bbdd)
    const nivelAcceso = await getNivelAcceso(req?.headers?.token, pool);
    if (!nivelAcceso || nivelAcceso === -1) {
        return res.status(401).json({message: 'Token caducado o inexistente'});
    }

    // Validación de permisos
    const rutaRecortada = req.path.slice(0, req.path.indexOf('/', 1));
    // comprobamos si la ruta tiene permisos
    const metodosRuta = permisions[rutaRecortada];
    let permisoAprobado = false;
    if (metodosRuta && metodosRuta[req.method]) {

        const permiso = metodosRuta[req.method];

        // si tiene * como valor, pasamos
        if (permiso.includes('*')) permisoAprobado = true;

        try {
            const [nada, accesoMin] = permiso[0].split('>');
            // si tiene un valor mayor que el nivel de permiso, pasamos
            if (accesoMin) {
                if (nivelAcceso >= parseInt(accesoMin)) {
                    permisoAprobado = true;
                }
            }

        } catch (e) {
            console.log(e);
        }

        if (!metodosRuta[req.method].includes(nivelAcceso) && !permisoAprobado) {
            return res.status(403).json({message: 'No tienes permiso para esta acción'});
        }
    }

    // lo guardo en la request por si acaso
    // req.userLevel = nivelAcceso;
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
async function getNivelAcceso(token, pool) {
    try {
        const [rows] = await pool.query(
            'SELECT e.ID_DEPARTAMENTO FROM auth_token a JOIN EMPLEADO e ON a.USERNAME = e.USERNAME WHERE a.token = ? AND a.EXPIRES_AT > NOW();',
            [token]
        );

        if (rows.length > 0) {
            return rows[0].ID_DEPARTAMENTO;
        }

        return -1;
    } catch (err) {
        console.error("Error en DB:", err);
        throw err;
    }
}

export default auth;