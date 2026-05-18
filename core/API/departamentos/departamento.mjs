import pool from '../db.mjs';
import mysql from 'mysql2';
import dotenv from 'dotenv';

//Cargamos las variables del archivo .env a process.env
dotenv.config();

/**
 * Devuelve la información del departamento recibido.
 *
 * @author Alex Bernardos Gil
 * @version 1.0
 * @param {Request} req
 * @param {Response} res
 */
function getDepartamento(req, res) {

    const idDepartamento = req.body.id;

    if (isNaN(idDepartamento) || !idDepartamento || idDepartamento < 0) {
        return res.status(400).send({
            status: 400,
            message: "Parámetros inválidos o nulos"
        });
    }



    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send({
                status: 500,
                message: "Error de base de datos"
            });
        }

        connection.query(
            `SELECT *
             FROM departamento WHERE ID = ?
             ORDER BY ID LIMIT 1`,
            [idDepartamento],
            (error, result) => {

                connection.release();

                if (error) {
                    return res.status(500).send({
                        status: 500,
                        message: "Error en la consulta"
                    });
                }

                if (result.length > 0) {
                    return res.status(200).send({
                        status: 200,
                        usuario: result
                    });
                }

                return res.status(404).send({
                    status: 404,
                    message: "No se ha encontrado el departamento."
                });

            }
        );
    });
}

export default getDepartamento;