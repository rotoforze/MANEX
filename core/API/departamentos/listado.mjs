import mysql from 'mysql2';
import dotenv from 'dotenv';
import Paginacion from "../paginacion.mjs";

dotenv.config();

/**
 * Devuelve una lista paginada de departamentos con filtro opcional por nombre.
 * @author Alex Bernardos Gil
 * @version 1.1.0
 * @param {Request} req
 * @param {Response} res
 */
export function listaDepartamentos(req, res) {

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    let { cantidad, pagina, nombre } = req.query;

    cantidad = cantidad !== undefined ? parseInt(cantidad) : Paginacion.DEFAULT_CANTIDAD_PAGINACION;
    pagina   = pagina   !== undefined ? parseInt(pagina)   : Paginacion.DEFAULT_PAGINA;

    if (isNaN(cantidad) || isNaN(pagina)) {
        return res.status(400).send({ status: 400, message: "Parámetros inválidos" });
    }

    if (cantidad < Paginacion.MIN_PAGINACION || cantidad > Paginacion.MAX_PAGINACION_DEPARTAMENTOS) {
        return res.status(400).send({
            status: 400,
            message: `cantidad debe estar entre ${Paginacion.MIN_PAGINACION} y ${Paginacion.MAX_PAGINACION_DEPARTAMENTOS}`
        });
    }

    if (pagina < Paginacion.MIN_PAGINACION) {
        return res.status(400).send({ status: 400, message: "La página no puede ser negativa" });
    }

    const offset = pagina * cantidad;

    const condiciones = [];
    const params = [];

    if (nombre) {
        condiciones.push('Nombre LIKE ?');
        params.push(`%${nombre}%`);
    }

    const whereClause = condiciones.length > 0 ? ' WHERE ' + condiciones.join(' AND ') : '';

    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send({ status: 500, message: "Error de base de datos" });
        }

        connection.query(
            `SELECT COUNT(*) as total FROM departamento${whereClause}`,
            params,
            (errCount, countResult) => {
                if (errCount) {
                    connection.release();
                    return res.status(500).send({ status: 500, message: "Error en la consulta" });
                }

                const totalResultados = countResult[0].total;

                connection.query(
                    `SELECT * FROM departamento${whereClause} ORDER BY ID DESC LIMIT ? OFFSET ?`,
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
