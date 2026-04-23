import express from "express";
import bbdd from "../ENV/bbdd.mjs"
import mysql from 'mysql2';
import crypto from "crypto";

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
    console.log("token: ", token)
    // como recibimos credenciales o token, primero vamos a comprobar el token
    if (token && token !== undefined) {
        // logica del token
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error obteniendo conexión:", err);
                return res.status(500).send(
                    {status: 500, message: "Error de base de datos"}
                );
            }
            connection.query(
                'SELECT USERNAME, TOKEN FROM auth_token WHERE TOKEN = ? AND EXPIRES_AT > NOW()',
                [token],
                (err, result) => {
                    if (result.length > 0) {
                        return res.status(200).send({
                            status: 201,
                            token: [true, token, result[0].USERNAME]
                        })
                    } else {
                        return res.status(404).send(
                            {status: 404, message: "Token incorrecto o inválido"}
                        );
                    }
                });

        })
        return;
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

        connection.query('SELECT PASSWORD FROM usuario WHERE USERNAME = ?', [usuario], (error, result) => {
            // envia la consulta
            connection.release();

            if (error) {
                console.error("Error en la consulta:", error);
                return res.status(500).send(
                    {status: 500, message: "Error en el servidor"}
                );
            }

            //
            if (result.length > 0) {
                if (result[0].PASSWORD == pass) {

                    if (keepSession) {
                        var newToken = generarToken();
                        var nuevaFechaExpiracion = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

                        try {
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
                        token: [keepSession, newToken]
                    })
                }
            } else {
                res.status(404).send(
                    {status: 404, message: "Credenciales incorrectas"}
                );
            }
        });
    });
}

function generarToken() {
    return crypto.randomBytes(32).toString('hex');
}