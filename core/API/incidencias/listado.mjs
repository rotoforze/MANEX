import mysql from 'mysql2';
import dotenv from 'dotenv';
import Paginacion from "../paginacion.mjs";

dotenv.config();

/**
 * Devuelve una lista paginada de incidencias con filtros opcionales.
 * @author Covadonga Blanco Álvarez
 * @version 1.1.0
 * @param {Request} req
 * @param {Response} res
 */
export function listaIncidencias(req, res) {

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    let { cantidad, pagina, id_empleado, estado, observaciones, comentario } = req.query;

    cantidad = cantidad !== undefined ? parseInt(cantidad) : Paginacion.DEFAULT_CANTIDAD_PAGINACION;
    pagina   = pagina   !== undefined ? parseInt(pagina)   : Paginacion.DEFAULT_PAGINA;

    if (isNaN(cantidad) || isNaN(pagina)) {
        return res.status(400).send({ status: 400, message: "Parámetros inválidos" });
    }

    if (cantidad < Paginacion.MIN_PAGINACION || cantidad > Paginacion.MAX_PAGINACION_EMPLEADOS) {
        return res.status(400).send({
            status: 400,
            message: `cantidad debe estar entre ${Paginacion.MIN_PAGINACION} y ${Paginacion.MAX_PAGINACION_EMPLEADOS}`
        });
    }

    if (pagina < Paginacion.MIN_PAGINACION) {
        return res.status(400).send({ status: 400, message: "La página no puede ser negativa" });
    }

    const offset = pagina * cantidad;

    const condiciones = [];
    const params = [];

    if (id_empleado) {
        condiciones.push('i.ID_EMPLEADO = ?');
        params.push(id_empleado);
    }
    if (estado) {
        condiciones.push('i.estado = ?');
        params.push(estado);
    }
    if (observaciones) {
        condiciones.push('i.Observaciones LIKE ?');
        params.push(`%${observaciones}%`);
    }
    if (comentario) {
        condiciones.push('i.Comentario LIKE ?');
        params.push(`%${comentario}%`);
    }

    const whereClause = condiciones.length > 0 ? ' WHERE ' + condiciones.join(' AND ') : '';

    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send({ status: 500, message: "Error de base de datos" });
        }

        connection.query(
            `SELECT COUNT(*) as total FROM incidencia i${whereClause}`,
            params,
            (errCount, countResult) => {
                if (errCount) {
                    connection.release();
                    return res.status(500).send({ status: 500, message: "Error en la consulta" });
                }

                const totalResultados = countResult[0].total;

                connection.query(
                    `SELECT i.* FROM incidencia i${whereClause} ORDER BY i.estado DESC LIMIT ? OFFSET ?`,
                    [...params, cantidad, offset],
                    (error, result) => {
                        connection.release();

                        if (error) {
                            return res.status(500).send({ status: 500, message: "Error en la consulta" });
                        }

                        return res.status(200).send({
                            status: 200,
                            meta: {
                                pagina,
                                cantidad,
                                totalPaginas: Math.ceil(totalResultados / cantidad) || 1,
                                resultados: totalResultados
                            },
                            data: result
                        });
                    }
                );
            }
        );
    });
}
