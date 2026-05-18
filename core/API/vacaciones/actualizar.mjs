import mysql from "mysql2/promise";

/**
 * Actualiza una solicitud de vacaciones en la BBDD.
 *
 * @author Covadonga Blanco Alvarez
 * @version 1.1.0
 * @param req
 * @param res
 */
async function actualizarSolicitudVacaciones(req, res) {

    const { id_incidencia, fecha_inicio, fecha_fin, tipo, estado } = req.body;

    if (!id_incidencia || isNaN(id_incidencia) || id_incidencia < 1) {
        return res.status(400).send({ status: 400, message: 'El ID de la incidencia es obligatorio.' });
    }

    if (!estado) {
        return res.status(400).send({ status: 400, message: 'El estado es obligatorio.' });
    }

    const estadosValidos = ['Concedido', 'Rechazado', 'En revisión'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).send({ status: 400, message: `Estado no valido. Valores permitidos: ${estadosValidos.join(', ')}` });
    }

    const estadoIncidencia = (estado === 'Concedido' || estado === 'Rechazado')
        ? 'Cerrada'
        : 'Abierta';

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

        const [resultado] = await connection.query(
            `UPDATE solicitud_vacaciones
             SET fecha_inicio = ?,
                 fecha_fin    = ?,
                 tipo         = ?,
                 estado       = ?
             WHERE ID_INCIDENCIA = ?`,
            [
                fecha_inicio || null,
                fecha_fin    || null,
                tipo         || 'Solicitud de semana de vacaciones',
                estado,
                id_incidencia,
            ]
        );

        if (resultado.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).send({ status: 404, message: 'No se encontro ninguna solicitud con ese ID.' });
        }

        await connection.query(
            `UPDATE incidencia
             SET estado = ?
             WHERE ID = ?`,
            [estadoIncidencia, id_incidencia]
        );

        await connection.commit();
        return res.status(200).send({ status: 200, message: 'Solicitud actualizada correctamente.' });

    } catch (error) {
        await connection.rollback();
        console.error('[actualizarSolicitudVacaciones]', error);
        return res.status(500).send({
            status: 500,
            message: 'Error al actualizar la solicitud.',
            detail: error.message
        });
    } finally {
        await connection.end();
    }
}

export default actualizarSolicitudVacaciones;
