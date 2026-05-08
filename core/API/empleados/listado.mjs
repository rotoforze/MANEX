import mysql from 'mysql2';
import dotenv from 'dotenv';
import Paginacion from "../paginacion.mjs";

//Cargamos las variables del archivo .env a process.env
dotenv.config();

/**
 * Devuelve una lista paginada de empleados
 * @author Covadonga Blanco Álvarez
 * @version 1.0.1
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

    let {cantidad, pagina} = req.query;

    // valores por defecto

    cantidad = cantidad !== undefined ? parseInt(cantidad) : Paginacion.DEFAULT_CANTIDAD_PAGINACION;
    pagina = pagina !== undefined ? parseInt(pagina) : Paginacion.DEFAULT_PAGINA;


    if (isNaN(cantidad) || isNaN(pagina)) {
        return res.status(400).send({
            status: 400,
            message: "Parámetros inválidos"
        });
    }

    if (cantidad < Paginacion.MIN_PAGINACION || cantidad > Paginacion.MAX_PAGINACION_EMPLEADOS) {
        return res.status(400).send({
            status: 400,
            message: `cantidad debe estar entre ${Paginacion.MIN_PAGINACION} y ${Paginacion.MAX_PAGINACION_EMPLEADOS}`
        });
    }

    if (pagina < Paginacion.MIN_PAGINACION) {
        return res.status(400).send({
            status: 400,
            message: "La página no puede ser negativa"
        });
    }

    const offset = pagina * cantidad;

    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send({
                status: 500,
                message: "Error de base de datos"
            });
        }
        let totalResultados = 0;
        connection.query(`SELECT COUNT(*) as total FROM empleado e 
                    WHERE e.esVisible = 1;`, (error, result) => {
            totalResultados = result[0].total;
        })
        connection.query(
            `SELECT e.*, u.email
             FROM empleado e
                      JOIN usuario u ON e.USERNAME = u.USERNAME
             WHERE e.esVisible = 1
             ORDER BY e.id DESC LIMIT ?
             OFFSET ?`,
            [cantidad, offset],
            (error, result) => {

                connection.release();

                if (error) {
                    return res.status(500).send({
                        status: 500,
                        message: "Error en la consulta"
                    });
                }

                return res.status(200).send({
                    status: 200,
                    meta: {
                        pagina,
                        cantidad,
                        totalPaginas: Math.ceil(totalResultados / cantidad),
                        resultados: result.length
                    },
                    data: result
                });
            }
        );
    });
}