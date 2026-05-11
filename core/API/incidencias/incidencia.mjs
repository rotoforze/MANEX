import mysql from 'mysql2';
import dotenv from 'dotenv';


dotenv.config();

/**
 * Devuelve la información de la incidencia recibida.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0
 * @param {Request} req
 * @param {Response} res
 */
function getIncidencia(req, res) {

    const id = req.query.id;

    if (isNaN(id) || !id || id < 0) {
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
             FROM incidencia
             WHERE ID = ?
             ORDER BY username LIMIT 1`,
            [id],
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
                    message: "No se ha encontrado la incidencia."
                });

            }
        );
    });
}

export default getIncidencia