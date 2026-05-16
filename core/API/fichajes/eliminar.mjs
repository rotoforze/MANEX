import mysql from "mysql2/promise";
import verificadorDatos from "./verificadorDatos.mjs";

/**
 * Elimina un empleado de la base de datos.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param req
 * @param res
 */
async function delFichaje(req, res) {

    const {id} = req.body;

    if (!id) {
        return res.status(400).send({status: 400, message: 'El ID del fichaje es obligatorio.'});
    }

    if (id < 0) {
        return res.status(400).send({status: 400, message: 'El ID del fichaje no puede ser negativo.'});
    }
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
            'DELETE FROM fichajes WHERE id = ?',
            [id]);


        await connection.commit();

        return res.status(201).send({status: 201, message: 'Fichaje eliminado correctamente.'});

    } catch (error) {

        await connection.rollback();

        console.error('Error al eliminar el fichaje:', error);

        return res.status(500).send({status: 500, message: 'Error al eliminar el fichaje.'});

    } finally {
        await connection.end();
    }

}

export default delFichaje;