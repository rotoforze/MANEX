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
async function actualizarSolicitudVacaciones(req, res) {

    const {fecha_inicio,fecha_fin,tipo,estado,id_incidencia } = req.body;

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


        const resultadoEmpleado = await connection.query(
            'UPDATE solicitud_vacaciones SET fecha_inicio = ?, fecha_fin = ?,tipo = ?, estado = ? WHERE id_incidencia = ?',
            [fecha_inicio, fecha_fin, tipo ||"Solicitud de semana de vacaciones",estado || "En revisión", id_incidencia]);

        await connection.commit();

        return res.status(201).send({status: 201, message: 'Solicitud actualizada correctamente.'});

    } catch (error) {

        await connection.rollback();

        console.error('Error al registrar la solicitud:', error);

        return res.status(500).send({status: 500, message: 'Error al actualizar la solicitud.'});

    } finally {
        await connection.end();
    }

}

export default actualizarSolicitudVacaciones;
