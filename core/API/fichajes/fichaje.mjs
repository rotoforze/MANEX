import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

/**
 * Devuelve la información del empleado recibido.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0
 * @param {Request} req
 * @param {Response} res
 */
function getFichaje(req, res) {

    const username = req.query.username;

    if (!username) {
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
            `SELECT e.nombre,e.apellidos, f.id, f.fecha_entrada,f.fecha_salida,f.tipo
             FROM empleado e
             JOIN fichajes f ON e.id = f.id_empleado where e.USERNAME = ?
             ORDER BY f.fecha_entrada DESC`,
            [username],
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
                    message: "No se ha encontrado fichajes de este empleado."
                });

            }
        );
    });
}

export default getFichaje