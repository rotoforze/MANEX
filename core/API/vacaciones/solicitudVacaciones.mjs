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

    const { id_empleado, fecha_inicio, fecha_fin } = req.query;

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

        let query = `
        SELECT sv.*
        FROM solicitud_vacaciones sv
        JOIN incidencia i ON sv.ID_INCIDENCIA = i.ID
    `;

        const condiciones = [];
        const params = [];

        // Filtro por empleado
        if (id_empleado) {
            condiciones.push(`i.ID_empleado = ?`);
            params.push(id_empleado);
        }

        // Filtro entre dos fechas
        if (fecha_inicio && fecha_fin) {
            condiciones.push("sv.fecha_inicio <= ? AND sv.fecha_fin >= ?");
            params.push(fecha_fin, fecha_inicio);
          }

        // Compruebo si hay condiciones, si las hay añado el Where
        if (condiciones.length > 0) {
            query += ` WHERE ` + condiciones.join(' AND ');
        }

        query += ` ORDER BY sv.fecha_inicio DESC`;

        connection.query(query, params,
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
