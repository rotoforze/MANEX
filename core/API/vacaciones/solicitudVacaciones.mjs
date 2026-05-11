import mysql from 'mysql2';
import dotenv from 'dotenv';

//Cargamos las variables del archivo .env a process.env
dotenv.config();

/**
 * Devuelve la información de la solictud recibido.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0
 * @param {Request} req
 * @param {Response} res
 */
function getSolicitudVacaciones(req, res) {

    const id_incidencia = req.body.id;

    if (isNaN(id_incidencia) || !id_incidencia || id_incidencia < 0) {
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
             FROM solicitud_vacaciones
             WHERE ID = ?
             ORDER BY estado LIMIT 1`,
            [id_incidencia],
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
                    message: "No se ha encontrado la solicitud."
                });

            }
        );
    });
}

export default getSolicitudVacaciones
