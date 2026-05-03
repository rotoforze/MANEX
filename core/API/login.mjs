import bbdd from "../ENV/bbdd.mjs"
import mysql from 'mysql2/promise';
import crypto from "crypto";

const pool = mysql.createPool({
    host: bbdd.HOSTNAME,
    user: bbdd.USERNAME,
    password: bbdd.PASSWORD,
    database: bbdd.DATABASE,
    port: bbdd.PORT,
    waitForConnections: true,
    connectionLimit: 10,
});

/**
 * Intenta iniciar sesion, usando un usuario, una password y si se ha recibido,
 * crea un token y lo devuelve para mantener la sesion iniciada.
 *
 * @author Alex Bernardos Gil
 * @version 1.3.1
 * @editor Covadonga Blanco Alvarez 14/04/2026
 * @param {Request} req
 * @param {Response} res
 * @returns {Response}
 */
export async function login(req, res) {
    if (!req?.body) return res.status(401).send({status: 401})
    const {usuario, pass, keepSession, token} = req.body;

    // comprueba si no se han recibido credenciales ni token
    if ((!usuario || !pass) && !token) {
        return res.status(401).send(
            {status: 401}
        );
    }

    try {
        // si hemos recibido token y es valido
        if (token && token !== undefined) {
            const [result] = await pool.execute(
                `SELECT
                    a.USERNAME AS username,
                    a.TOKEN AS token,
                    e.ID_DEPARTAMENTO AS department
                FROM auth_token a
                JOIN empleado e ON a.USERNAME = e.USERNAME
                WHERE a.TOKEN = ? AND a.EXPIRES_AT > NOW();`,
                [token]
            );

            // como filtramos por token, solo recibiremos el que coincida, ademas que no haya expirado
            if (result.length > 0) {
                return res.status(200).send({
                    status: 201,
                    auth: {
                        authorized: true,
                        username: result[0].username,
                        token: result[0].token,
                        department: result[0].department
                    }
                });
            }

            return res.status(404).send(
                {status: 404, message: "Token incorrecto o invalido"}
            );
        }

        const [result] = await pool.execute(
            `SELECT
                u.PASSWORD AS password,
                e.ID_DEPARTAMENTO AS department
            FROM usuario u
            JOIN empleado e ON u.USERNAME = e.USERNAME
            WHERE u.USERNAME = ?`,
            [usuario]
        );

        // al estar buscando el nombre, si recibimos una fila, es porque existe el usuario
        // si no tiene longitud es porque no existe.
        if (result.length === 0 || result[0].password != pass) {
            return res.status(404).send(
                {status: 404, message: "Credenciales incorrectas"}
            );
        }

        let newToken = null;

        // como hemos recibido en true, generamos un token para asignarlo al usuario
        if (keepSession) {
            newToken = generarToken();
            // 24 horas
            const nuevaFechaExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

            // insertamos el nuevo token y si existe actualizamos
            await pool.execute(
                `INSERT INTO auth_token (USERNAME, TOKEN, EXPIRES_AT)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    TOKEN = VALUES(TOKEN),
                    EXPIRES_AT = VALUES(EXPIRES_AT)`,
                [usuario, newToken, nuevaFechaExpiracion]
            );
        }

        // como resuelve, enviamos status code 200.
        return res.status(200).send({
            status: 201,
            auth: {
                authorized: true,
                username: usuario,
                token: newToken,
                department: result[0].department
            }
        })
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).send(
            {
                status: 500,
                message: "Error en el servidor",
                error: error.code || error.message
            }
        );
    }
}

/**
 * Genera un codigo de 32 de longitud aleatorio.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @returns {string}
 */
function generarToken() {
    return crypto.randomBytes(32).toString('hex');
}
