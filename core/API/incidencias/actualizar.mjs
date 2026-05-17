import verificadorDatos from "./verificadorDatos.mjs";
import mysql from "mysql2/promise";


/**
 * Actualiza el usuario en la BBDD.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param req
 * @param res
 */
async function actualizarIncidencia(req, res) {

    const {id_empleado,fecha_creacion, observaciones,estado,comentario, id } = req.body;

    await verificadorDatos(req, res);

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

        await connection.beginTransaction();

        const resultadoEmpleado = await connection.query(
            'UPDATE incidencia SET ID_empleado = ?,fecha_creacion = ?, estado = ?, Observaciones = ?, Comentario = ? WHERE ID = ?',
            [id_empleado,fecha_creacion, estado || 'Abierta', observaciones, comentario, id]);

        await connection.commit();

        return res.status(200).send({status: 200, message: 'Incidencia actualizada correctamente.'});

    } catch (error) {

        await connection.rollback();

        console.error('Error al actualizar la incidencia:', error);

        return res.status(500).send({status: 500, message: 'Error al actualizar la incidencia.'});

    } finally {
        await connection.end();
    }

}

export default actualizarIncidencia;