import mysql from 'mysql2';
import bbdd from "../ENV/bbdd.mjs";

const PAGINACION = {
    MinCantidad: 1,
    MaxCantidad: 15,
    CantidadPorDefecto: 10,
    PaginaPorDefecto: 0,
    MinPagina: 0
};

/**
 * Devuelve una lista paginada de empleados
 * @author Covadonga Blanco Álvarez
 * @version 1.0.1
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

    let {cantidad, pagina } = req.query;

    // valores por defecto
    cantidad = cantidad !== undefined ? parseInt(cantidad) : PAGINACION.CantidadPorDefecto;
    pagina = pagina !== undefined ? parseInt(pagina) : PAGINACION.PaginaPorDefecto;

    
    if (isNaN(cantidad) || isNaN(pagina)) {
        return res.status(400).send({
            status: 400,
            message: "Parámetros inválidos"
        });
    }

    if (cantidad < PAGINACION.MinCantidad || cantidad > PAGINACION.MaxCantidad) {
        return res.status(400).send({
            status: 400,
            message: `cantidad debe estar entre ${PAGINACION.MinCantidad} y ${PAGINACION.MaxCantidad}`
        });
    }

    if (pagina < PAGINACION.MinPagina) {
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

        connection.query(
            `SELECT * FROM empleado 
             WHERE esVisible = 1 
             ORDER BY username 
             LIMIT ? OFFSET ?`,
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
                    pagina,
                    cantidad,
                    resultados: result.length,
                    data: result
                });
            }
        );
    });
}
