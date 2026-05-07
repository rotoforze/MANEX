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

    const idProducto = req.body.id;

    if (isNaN(idProducto) || !idProducto || idProducto < 0) {
        return res.status(400).send({
            status: 400,
            message: "Parámetros inválidos o nulos"
        });
    }

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT
    });

    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send({
                status: 500,
                message: "Error de base de datos"
            });
        }

        connection.query(
            `SELECT *
             FROM inventario
             WHERE ID = ?
             ORDER BY nombre LIMIT 1`,
            [idProducto],
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