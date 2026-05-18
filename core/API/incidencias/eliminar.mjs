import mysql from "mysql2/promise";

/**
 * Elimina una incidencia de la base de datos.
 *
 * @author Covadonga Blanco Alvarez
 * @version 1.2.0
 * @param req
 * @param res
 */
async function delIncidencia(req, res) {

    const { id } = req.body;

    if (!id || isNaN(id) || id < 1) {
        return res.status(400).send({
            status: 400,
            message: 'El ID de la incidencia es obligatorio y debe ser un numero valido.'
        });
    }

    const config = {
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port:     process.env.DB_PORT
    };

    const connection = await mysql.createConnection(config);

    try {
        await connection.beginTransaction();

        // Borrar registros de incidencia_it 
        await connection.query(
            'DELETE FROM incidencia_it WHERE ID_INCIDENCIA = ?',
            [id]
        );

        //Borrar solicitud de vacaciones asociada 
        await connection.query(
            'DELETE FROM solicitud_vacaciones WHERE ID_INCIDENCIA = ?',
            [id]
        );

        // Borrar la incidencia
        const [resultado] = await connection.query(
            'DELETE FROM incidencia WHERE ID = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).send({
                status: 404,
                message: 'No se encontro ninguna incidencia con ese ID.'
            });
        }

        await connection.commit();

        return res.status(200).send({
            status: 200,
            message: 'Incidencia eliminada correctamente.'
        });

    } catch (error) {
        await connection.rollback();
        console.error('[delIncidencia]', error);
        return res.status(500).send({
            status: 500,
            message: 'Error al eliminar la incidencia.',
            detail: error.message
        });
    } finally {
        await connection.end();
    }
}

export default delIncidencia;
