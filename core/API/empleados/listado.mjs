import mysql from 'mysql2';
import dotenv from 'dotenv';
import Paginacion from "../paginacion.mjs";

dotenv.config();

/**
 * Devuelve una lista paginada de empleados con filtros opcionales.
 * @author Covadonga Blanco Álvarez
 * @contributor Eneas de la Rosa Menéndez Pedrosa
 * @version 1.1.0
 * @param {Request} req
 * @param {Response} res
 */
export function listaEmpleados(req, res) {

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    let { cantidad, pagina, nombre, apellidos, email, telefono, departamento, contrato } = req.query;

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

    const conditions = ['e.esVisible = 1'];
    const values = [];

    if (nombre)      { conditions.push('e.Nombre LIKE ?');          values.push(`%${nombre}%`); }
    if (apellidos)   { conditions.push('e.Apellidos LIKE ?');        values.push(`%${apellidos}%`); }
    if (email)       { conditions.push('u.email LIKE ?');            values.push(`%${email}%`); }
    if (telefono)    { conditions.push('e.telefono LIKE ?');         values.push(`%${telefono}%`); }
    if (departamento){ conditions.push('e.ID_DEPARTAMENTO LIKE ?');  values.push(`%${departamento}%`); }
    if (contrato)    { conditions.push('e.ID_CONTRATO LIKE ?');      values.push(`%${contrato}%`); }

    const where = conditions.join(' AND ');
    const offset = pagina * cantidad;

    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send({ status: 500, message: "Error de base de datos" });
        }

        connection.query(
            `SELECT COUNT(*) as total FROM empleado e JOIN usuario u ON e.USERNAME = u.USERNAME WHERE ${where}`,
            values,
            (error, result) => {
                if (error) {
                    connection.release();
                    return res.status(500).send({ status: 500, message: "Error en la consulta" });
                }
                const totalResultados = result[0].total;

                connection.query(
                    `SELECT e.*, u.email
                     FROM empleado e
                     JOIN usuario u ON e.USERNAME = u.USERNAME
                     WHERE ${where}
                     ORDER BY e.id DESC
                     LIMIT ? OFFSET ?`,
                    [...values, cantidad, offset],
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
                                totalPaginas: Math.ceil(totalResultados / cantidad),
                                resultados: totalResultados,
                            },
                            data: result
                        });
                    }
                );
            }
        );
    });
}
