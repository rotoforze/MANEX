import mysql from "mysql2/promise";

/**
 * Actualiza una incidencia en la BBDD.
 *
 * @author Covadonga Blanco Alvarez
 * @version 1.2.0
 * @param req
 * @param res
 */
async function actualizarIncidencia(req, res) {

    const { id, id_empleado, fecha_creacion, estado, observaciones, comentario } = req.body;

    if (!id || isNaN(id) || id < 1) {
        return res.status(400).send({ status: 400, message: 'El ID de la incidencia es obligatorio.' });
    }

    if (!estado) {
        return res.status(400).send({ status: 400, message: 'El estado es obligatorio.' });
    }


    const estadosValidos = ['Abierta', 'Cerrada'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).send({ status: 400, message: `Estado no valido. Valores permitidos: ${estadosValidos.join(', ')}` });
    }


    const estadoSolicitud = estado === 'Cerrada' ? 'Rechazado' : 'En revisión';

    const config = {
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port:     process.env.DB_PORT
    };

    const connection = await mysql.createConnection(config);
    if (!connection) {
        return res.status(500).send({ status: 500, message: 'Error al conectar a la base de datos.' });
    }

    try {
        await connection.beginTransaction();

        // Actualizar la incidencia
        const [resultado] = await connection.query(
            `UPDATE incidencia
             SET estado         = ?,
                 Observaciones  = ?,
                 Comentario     = ?,
                 ID_empleado    = ?,
                 fecha_creacion = ?
             WHERE ID = ?`,
            [
                estado,
                observaciones  || null,
                comentario     || null,
                id_empleado    || null,
                fecha_creacion || null,
                id,
            ]
        );

        if (resultado.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).send({ status: 404, message: 'No se encontro ninguna incidencia con ese ID.' });
        }

        // Si tiene solicitud_vacaciones asociada, sincronizar su estado
        await connection.query(
            `UPDATE solicitud_vacaciones
             SET estado = ?
             WHERE ID_INCIDENCIA = ?`,
            [estadoSolicitud, id]
        );

        await connection.commit();
        return res.status(200).send({ status: 200, message: 'Incidencia actualizada correctamente.' });

    } catch (error) {
        await connection.rollback();
        console.error('[actualizarIncidencia]', error);
        return res.status(500).send({
            status: 500,
            message: 'Error al actualizar la incidencia.',
            detail: error.message
        });
    } finally {
        await connection.end();
    }
}

export default actualizarIncidencia;