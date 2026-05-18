import pool from '../db.mjs';
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

    const { id, id_empleado, estado, fecha_inicio, fecha_fin } = req.query;

    if (id && (isNaN(id) || id < 0)) {
        return res.status(400).send({ status: 400, message: "El parámetro 'id' no es válido" });
    }

    if (id_empleado && (isNaN(id_empleado) || id_empleado < 0)) {
        return res.status(400).send({ status: 400, message: "El parámetro 'id_empleado' no es válido" });
    }

    if ((fecha_inicio && !fecha_fin) || (!fecha_inicio && fecha_fin)) {
        return res.status(400).send({ status: 400, message: "Debes indicar tanto 'fecha_inicio' como 'fecha_fin'" });
    }



    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send({
                status: 500,
                message: "Error de base de datos"
            });
        }


        let query = `SELECT * FROM incidencia`;

        const condiciones = [];
        const params = [];

        // Filtro por ID de incidencia
        if (id) {
            condiciones.push(`ID = ?`);
            params.push(id);
        }

        // Filtro por ID de empleado
        if (id_empleado) {
            condiciones.push(`ID_empleado = ?`);
            params.push(id_empleado);
        }

        // Filtro por estado
        if (estado) {
            condiciones.push(`estado = ?`);
            params.push(estado);
        }

        // Filtro por rango de fechas
        if (fecha_inicio && fecha_fin) {
            condiciones.push(`fecha_creacion BETWEEN ? AND ?`);
            params.push(fecha_inicio, fecha_fin);
        }

        if (condiciones.length > 0) {
            query += ` WHERE ` + condiciones.join(' AND ');
        }

        query += ` ORDER BY estado DESC`;

        connection.query(query, params, (error, result) => {
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