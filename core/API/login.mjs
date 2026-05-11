import mysql from 'mysql2';
import crypto from "crypto";
import dotenv from 'dotenv';
import verificadorDatos from "./empleados/verificadorDatos.mjs";
import { verificarContrasenia } from "./empleados/hashDeContrasenias.mjs";

//Cargamos las variables del archivo .env a process.env
dotenv.config();

/**
 * Intenta iniciar sesión, usando un usuario, una password y si se ha recibido,
 * crea un token y lo devuelve para mantener la sesión iniciada.
 *
 * @author Alex Bernardos Gil
 * @version 1.3.1
 * @editor Covadonga Blanco Álvarez 14/04/2026
 * @param {Request} req
 * @param {Response} res
 * @returns {Response}
 */
export function login(req, res) {

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

    if (!req?.body) return res.status(401).send({ status: 401 })
    const { usuario, pass, keepSession, token } = req.body;

    // comprueba si no se han recibido credenciales ni token
    if ((!usuario || !pass) && !token) {
        return res.status(401).send({
            status: 401,
            message: "Credenciales no proporcionadas"
        });
    }

    // comprobamos credenciales
    pool.getConnection((err, connection) => {
        // Error al obtener conexión del pool
        if (err) {
            console.error("Error obteniendo conexión:", err);
            return res.status(500).send(
                { status: 500, message: "Error de base de datos" }
            );
        }
        // si hemos recibido token y es valido
        if (token) {
            connection.query(
                'SELECT a.USERNAME, a.TOKEN, a.EXPIRES_AT, e.id, e.id_departamento FROM auth_token a JOIN empleado e ON a.username = e.username WHERE a.TOKEN = ? AND a.EXPIRES_AT > NOW();',
                [token],
                (err, result) => {
                    connection.release();
                    // como filtramos por token, solo recibiremos el que coincida, ademas que no haya expirado
                    if (result.length > 0) {
                        // si el token está a punto de caducar, lo vamos a actualizar creando uno nuevo.
                        const fechaExpiracionActual = result[0].EXPIRES_AT;
                        // si es menor a la fecha actual + media hora
                        if (fechaExpiracionActual < new Date(new Date().getTime() + 30 * 60 * 1000)) {
                            var newToken = generarToken();
                            var hasToken = crearToken(pool, result[0].USERNAME, newToken, keepSession);
                        }
                        if (!hasToken) {
                            newToken = '';
                        }

                        return res.status(200).send({
                            status: 201,
                            auth: {
                                authorized: result.length > 0,
                                username: result[0].USERNAME,
                                id: result[0].id,
                                token: newToken || token,
                                department: result[0].id_departamento
                            }
                        });
                    } else {
                        return res.status(404).send(
                            { status: 404, message: "Token incorrecto o inválido" }
                        );
                    }
                });
        } else {
            connection.query('SELECT u.password, e.id, e.id_departamento FROM usuario u JOIN empleado e ON u.username = e.username WHERE u.username = ?',
                [usuario], async (error, result) => {
                    // envia la consulta
                    connection.release();

                    if (error) {
                        console.error("Error en la consulta:", error);
                        return res.status(500).send(
                            { status: 500, message: "Error en el servidor" }
                        );
                    }

                    // al estar buscando el nombre, si recibimos una fila, es porque existe el usuario
                    // si no tiene longitud es porque no existe.
                    if (result.length > 0) {
                        // al coinicdir las contraseñas, podemos iniciar sesión
                        console.log(pass, result[0].password)
                        if (await verificarContrasenia(pass, result[0].password)) {
                            // como hemos recibido en true, generamos un token para asignarlo al usuario
                            var newToken = generarToken();

                            var hasToken = crearToken(pool, usuario, newToken, !!keepSession);

                            console.log(newToken, hasToken, !!keepSession)
                            if (!hasToken) {
                                newToken = '';
                            }
                            // como resuelve, enviamos status code 200.
                            return res.status(200).send({
                                status: 201,
                                auth: {
                                    authorized: true,
                                    username: usuario,
                                    id: result[0].id,
                                    token: newToken,
                                    department: result[0].id_departamento
                                }
                            })
                        } else {
                            return res.status(404).send(
                                { status: 404, message: "No se ha podido verificar la contraseña" }
                            );
                        }
                    } else {
                        return res.status(404).send(
                            { status: 404, message: "Credenciales incorrectas" }
                        );
                    }
                });
        }


    });
    if (res.headerSent) {
        return res.status(404).send(
            { status: 404, message: "salida invalida" }
        );;
    }
}

/**
 * Genera un código de 32 de longitud aleatorio.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @returns {string}
 */
function generarToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Crea o actualiza un registro en la BBDD con el token recibido y su date a NOW + 24h (true) o 1h (false)
 *
 * @author Alex Bernardos Gil
 * @version 1.2
 * @param pool
 * @param usuario
 * @param token
 * @returns {boolean}
 */
async function crearToken(pool, usuario = '', token = '', timepoLargo = false) {

    if (!pool || !usuario || !token) return false;

    const nuevaFechaExpiracion = timepoLargo ?
        new Date(new Date().getTime() + 24 * 60 * 60 * 1000) :  // 24 horas porque tiempoLargo == true
        new Date(new Date().getTime() + 60 * 60 * 1000); // una hora porque tiempoLargo == false

    try {
        // insertamos el nuevo token y si existe actualizamos
        await pool.getConnection((err, connection) => {
            // Error al obtener conexión del pool
            if (err) {
                console.error("Error obteniendo conexión:", err);
                return false;
            }
            connection.query(
                'INSERT INTO auth_token (username, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)',
                [usuario, token, nuevaFechaExpiracion],
                (error, result) => {
                    connection.release();
                    console.log(result)
                    if (error) {
                        console.error("Error en la consulta:", error);
                    }
                    return true;

                });
        });

    } catch (e) {
        console.error("Error en la consulta:", e);
    }
    return false;
}