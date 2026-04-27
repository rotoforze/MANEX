import express from "express";
import bbdd from "../ENV/bbdd.mjs"
import mysql from 'mysql2';
import crypto from "crypto";

/**
 * Intenta iniciar sesión, usando un usuario, una password y si se ha recibido,
 * crea un token y lo devuelve para mantener la sesión iniciada.
 *
 * @author Alex Bernardos Gil
 * @version 1.3.0
 * @param {Request} req
 * @param {Response} res
 * @returns {Response}
 */
export function login(req, res) {

    const pool = mysql.createPool({
        host: bbdd.HOSTNAME,
        user: bbdd.USERNAME,
        password: bbdd.PASSWORD,
        database: bbdd.DATABASE,
        port: bbdd.PORT
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

    if (!req?.body) return res.status(401).send({status: 401})
    const {usuario, pass, keepSession, token} = req.body;

    // comprueba si no se han recibido credenciales ni token
    if ((!usuario || !pass) && !token) {
        return res.status(401).send(
            {status: 401}
        );
    }

    // comprobamos credenciales
    pool.getConnection((err, connection) => {
        // Error al obtener conexión del pool
        if (err) {
            console.error("Error obteniendo conexión:", err);
            return res.status(500).send(
                {status: 500, message: "Error de base de datos"}
            );
        }
        // si hemos recibido token y es valido
        if (token && token !== undefined) {
            connection.query(
                // TODO HACER QUE PILLE EL DEPT TAMBIEN
                'SELECT USERNAME, TOKEN FROM auth_token WHERE TOKEN = ? AND EXPIRES_AT > NOW()',
                [token],
                (err, result) => {
                    // como filtramos por token, solo recibiremos el que coincida, ademas que no haya expirado
                    if (result.length > 0) {
                        return res.status(200).send({
                            status: 201,
                            auth: {
                                authorized: result.length > 0,
                                username: result[0].USERNAME,
                                token: token,
                                department: 0 // TODO PONER EL NUMERO DEL DEPT QUE CORRESPONDE
                            }
                        });
                    } else {
                        return res.status(404).send(
                            {status: 404, message: "Token incorrecto o inválido"}
                        );
                    }
                });
        } else {
            // TODO HACER QUE PILLE EL DEPT TAMBIEN
            connection.query('SELECT PASSWORD FROM usuario WHERE USERNAME = ?', [usuario], (error, result) => {
                // envia la consulta
                connection.release();

                if (error) {
                    console.error("Error en la consulta:", error);
                    return res.status(500).send(
                        {status: 500, message: "Error en el servidor"}
                    );
                }

                // al estar buscando el nombre, si recibimos una fila, es porque existe el usuario
                // si no tiene longitud es porque no existe.
                if (result.length > 0) {
                    // al coinicdir las contraseñas, podemos iniciar sesión
                    if (result[0].PASSWORD == pass) {
                        // como hemos recibido en true, generamos un token para asignarlo al usuario
                        if (keepSession) {
                            var newToken = generarToken();
                            // 24 horas
                            var nuevaFechaExpiracion = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

                            try {
                                // insertamos el nuevo token y si existe actualizamos
                                connection.query(
                                    'INSERT INTO auth_token (username, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)',
                                    [usuario, newToken, nuevaFechaExpiracion],
                                    (error, result) => {
                                        if (error) {
                                            console.error("Error en la consulta:", error);
                                        }
                                    });
                            } catch (e) {
                                console.error("Error en la consulta:", e);
                            }
                        }

                        // como resuelve, enviamos status code 200.
                        return res.status(200).send({
                            status: 201,
                            auth: {
                                authorized: true,
                                username: usuario,
                                token: newToken,
                                department: 0 // TODO PONER EL DEDPT
                            }
                        })
                    }
                } else {
                    res.status(404).send(
                        {status: 404, message: "Credenciales incorrectas"}
                    );
                }
            });
        }


    });
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