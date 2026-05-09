import verificadorDatos from "./verificadorDatos.mjs";
import mysql from "mysql2/promise";

/**
 * Actualiza el fichaje en la BBDD.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param req
 * @param res
 */
async function actualizarFichaje(req, res) {

    const { ID_Empleado,fecha_entrada,
        fecha_Salida,tipo} = req.body;

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

        const resultadoFichaje = await connection.query(
            'UPDATE fichages SET fecha_entrada = ?, fecha_salida = ?, tipo = ? WHERE id_empleado = ?',
            [fecha_entrada,fecha_Salida,tipo,ID_Empleado]);

        await connection.commit();

        return res.status(201).send({status: 201, message: 'Fichaje registrado.'});

    } catch (error) {

        await connection.rollback();

        console.error('Error al registar el fichaje:', error);

        return res.status(500).send({status: 500, message: 'Error al registar el fichaje.'});

    } finally {
        await connection.end();
    }

}

export default actualizarFichaje;