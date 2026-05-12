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

    const { fecha_inicio,fecha_fin, tipo,estado,id_incidencia} = req.body;

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

        const resultadoSolicitudVacaciones = await connection.query(
            'INSERT INTO solicitud_vacaciones (fecha_inicio,fecha_fin,tipo,estado,id_incidencia) VALUES (?, ?, ?, ?, ?)',
            [fecha_inicio, fecha_fin, tipo ||"Solicitud de semana de vacaciones",estado || "En revision",id_incidencia]);

        await connection.commit();

        return res.status(201).send({status: 201, message: 'Solicitud Vacaciones registrada correctamente.'});

    } catch (error) {

        await connection.rollback();

        console.error('Error al registrar la solicitud de vacaciones:', error);

        return res.status(500).send({status: 500, message: 'Error al registrar la solicitud de vacaciones.'});

    } finally {
        await connection.end();
    }

}

export default registrarSolicitudVacaciones;