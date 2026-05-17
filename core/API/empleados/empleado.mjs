import pool from '../db.mjs';

/**
 * Devuelve la información del empleado recibido.
 *
 * @author Alex Bernardos Gil
 * @version 1.0
 * @param {Request} req
 * @param {Response} res
 */
function getEmpleado(req, res) {

    const idEmpleado = req.query.id;

    if (isNaN(idEmpleado) || !idEmpleado || idEmpleado < 0) {
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
            `SELECT *
             FROM empleado
             WHERE esVisible = 1
               AND ID = ?
             ORDER BY username LIMIT 1`,
            [idEmpleado],
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
                    message: "No se ha encontrado el usuario."
                });

            }
        );
    });
}

export default getEmpleado