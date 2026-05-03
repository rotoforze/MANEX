import mysql from 'mysql2';
import bbdd from "../../ENV/bbdd.mjs";

/**
 * Devuelve una lista paginada de empleados
 * @author Covadonga Blanco Álvarez
 * @param {Request} req 
 * @param {Response} res 
 */
export function listaEmpleados(req, res) {

    const pool = mysql.createPool({
        host: bbdd.HOSTNAME,
        user: bbdd.USERNAME,
        password: bbdd.PASSWORD,
        database: bbdd.DATABASE,
        port: bbdd.PORT
    });

    let { cantidadAMostrar, pagina } = req.query;

    // valores por defecto
    cantidadAMostrar = parseInt(cantidadAMostrar) || 10;
    pagina = parseInt(pagina) || 0;

    // validaciones
    if (cantidadAMostrar < 1) cantidadAMostrar = 1;
    if (cantidadAMostrar > 15) cantidadAMostrar = 15;
    if (pagina < 0) pagina = 0;

    const offset = pagina * cantidadAMostrar;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).send({
                status: 500,
                message: "Error de base de datos"
            });
        }

        connection.query(
            `SELECT * FROM empleado LIMIT ? OFFSET ?`,
            [cantidadAMostrar, offset],
            (error, result) => {

                connection.release();

                if (error) {
                    console.error(error);
                    return res.status(500).send({
                        status: 500,
                        message: "Error en la consulta"
                    });
                }

                return res.status(200).send({
                    status: 200,
                    pagina: pagina,
                    cantidad: cantidadAMostrar,
                    resultados: result.length,
                    data: result
                });
            }
        );
    });
}
