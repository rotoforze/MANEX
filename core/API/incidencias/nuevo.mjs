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
async function registrarIncidencias(req, res) {

    let {id_empleado, observaciones, comentario} = req.body;

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
        if (!id_empleado && req?.headers?.token) {
            const [empleados] = await connection.query(
                'SELECT e.id FROM auth_token a JOIN empleado e ON a.username = e.username WHERE a.token = ? AND a.expires_at > NOW()',
                [req.headers.token]
            );

            id_empleado = empleados[0]?.id;
            req.body.id_empleado = id_empleado;
        }

        await verificadorDatos(req, res)
        if (res.headersSent) return;

        await connection.query(
            'INSERT INTO incidencia (ID_empleado,estado,Observaciones,Comentario) VALUES (?, ?, ?, ?)',
            [id_empleado, 'Abierta', observaciones,comentario]);

        await connection.commit();

        return res.status(201).send({status: 201, message: 'Incidencia registrado correctamente.'});

    } catch (error) {

        await connection.rollback();

        console.error('Error al registrar la incidencia:', error);

        return res.status(500).send({status: 500, message: 'Error al registrar la incidencia.'});

    } finally {
        await connection.end();
    }

}

export default registrarIncidencias;
