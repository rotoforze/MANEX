import mysql from "mysql2/promise";
import dotenv from 'dotenv';
import verificadorDatos from "./verificadorDatos.mjs";

//Cargamos las variables del archivo .env a process.env
dotenv.config();

/**
 * Registra un usuario en la BBDD, después registra al empleado.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param req
 * @param res
 */
async function registrarSolicitudVacaciones(req, res) {

    await verificadorDatos(req, res)
    if (res.headersSent) return;
    console.log(req.body);

    const {fecha_inicio, fecha_fin, tipo, estado, id_incidencia, id_empleado, observaciones, comentario} = req.body;

    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    };

    const connection = await mysql.createConnection(config);
    if (!connection) {
        connection.end();
        return res.status(500).send({status: 500, message: 'Error al conectar a la base de datos.'});
    }

    try {
        await connection.beginTransaction();

        let idIncidenciaSolicitud = id_incidencia;

        if (!idIncidenciaSolicitud) {
            if (!id_empleado) {
                await connection.rollback();
                connection.end();
                return res.status(400).send({status: 400, message: 'Falta el empleado de la solicitud.'});
            }

            const [resultadoIncidencia] = await connection.query(
                'INSERT INTO incidencia (ID_empleado,fecha_creacion,estado,Comentario,Observaciones) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?)',
                [
                    id_empleado,
                    'Abierta',
                    comentario || '',
                    observaciones || '',
                ]
            );

            idIncidenciaSolicitud = resultadoIncidencia.insertId;
        }

        await connection.query(
            'INSERT INTO solicitud_vacaciones (fecha_inicio,fecha_fin,tipo,estado,id_incidencia) VALUES (?, ?, ?, ?, ?)',
            [fecha_inicio, fecha_fin, tipo || "Solicitud de semana de vacaciones", estado || "En revisión", idIncidenciaSolicitud]);

        await connection.commit();
        connection.end();

        return res.status(201).send({status: 201, message: 'Solicitud Vacaciones registrada correctamente.'});

    } catch (error) {

        await connection.rollback();
        connection.end();

        console.error('Error al registrar la solicitud de vacaciones:', error);

        return res.status(500).send({status: 500, message: 'Error al registrar la solicitud de vacaciones.'});

    }

}

export default registrarSolicitudVacaciones;
