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
async function registrarFichaje(req, res) {

    await verificadorDatos(req, res)
    if (res.headersSent) return;

    const { username, tipo } = req.body;

    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    };

    const connection = await mysql.createConnection(config);
    if (!connection) return res.status(500).send({ status: 500, message: 'Error al conectar a la base de datos.' });

    try {
        const id_empleado = await connection.query('SELECT id FROM empleado WHERE username = ?', [username]);
        await connection.query(
            'INSERT INTO fichajes (id_empleado,tipo) VALUES (?, ?)',
            [id_empleado[0][0].id, tipo || 'Presencial']);

        await connection.commit();

        return res.status(201).send({ status: 201, message: 'Fichaje registrado correctamente.' });

    } catch (error) {

        await connection.rollback();

        console.error('Error al registrar el fichaje:', error);

        return res.status(500).send({ status: 500, message: 'Error al registrar el fichaje.' });

    } finally {
        await connection.end();
    }

}

export default registrarFichaje;
