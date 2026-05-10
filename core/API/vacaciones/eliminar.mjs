import mysql from "mysql2/promise";
import verificadorDatos from "./verificadorDatos.mjs";

/**
 * Elimina un empleado de la base de datos.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param req
 * @param res
 */
async function delVacaciones(req, res) {

    const {id_incidencia} = req.body;

    if ((id_incidencia && id_incidencia < 0) ) {
        return res.status(400).send({status: 400, message: 'El ID de la solicitud no puede ser negativo.'});
    }

    // comenzamos la transaccion
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    };

    const connection = await mysql.createConnection(config);
    if (!connection) return res.status(500).send({status: 500, message: 'Error al conectar a la base de datos.'});

    try {

        const resultadoIncidencia = await connection.query(
            'DELETE FROM solicitud_vacaciones WHERE id_incidencia = ?',
            [id_incidencia]);


        await connection.commit();

        return res.status(201).send({status: 201, message: 'Solicitud eliminada correctamente.'});

    } catch (error) {

        await connection.rollback();

        console.error('Error al eliminar la solicitud:', error);

        return res.status(500).send({status: 500, message: 'Error al eliminar la solicitud.'});

    } finally {
        await connection.end();
    }

}

export default delVacaciones;