import pool from '../db.mjs';
import mysql from 'mysql2';
import dotenv from 'dotenv';

//Cargamos las variables del archivo .env a process.env
dotenv.config();

/**
 * Devuelve la información del producto recibido.
 *
 * @author Covadonga Blanco Alvarez
 * @version 1.0
 * @param {Request} req
 * @param {Response} res
 */
function getProducto(req, res) {

    const { id, estado } = req.query;

    if (id && (isNaN(id) || id < 0)) {
        return res.status(400).send({ status: 400, message: "El parámetro 'id' no es válido" });
    }



    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send({
                status: 500,
                message: "Error de base de datos"
            });
        }

        const condiciones = [];
        const params = [];

        if (id) {
            condiciones.push(`ID = ?`);
            params.push(id);
        }

        if (estado) {
            condiciones.push(`estado = ?`);
            params.push(estado);
        }

        const whereClause = condiciones.length > 0 ? ` WHERE ` + condiciones.join(' AND ') : '';

        connection.query(
            `SELECT * FROM inventario${whereClause} ORDER BY nombre`,
            params,
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
                        producto: result
                    });
                }

                return res.status(404).send({
                    status: 404,
                    message: "No se ha encontrado el producto."
                });

            }
        );
    });
}

export default getProducto