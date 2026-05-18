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

    const {
        id, username, fecha_entrada,
        fecha_Salida, tipo
    } = req.body;

    await verificadorDatos(req, res, true);
    if (res.headersSent) return;

    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    };

    const connection = await mysql.createConnection(config);
    if (!connection) return res.status(500).send({status: 500, message: 'Error al conectar a la base de datos.'});

    await connection.beginTransaction();

    try {

        let new_id_empleado, new_tipo, new_fecha_salida, new_fecha_entrada;

        if (username) {
            const [rows] = await connection.query('SELECT id FROM empleado WHERE username = ?', [username]);
            new_id_empleado = rows[0].id;
        } else return res.status(400).send({status: 400, message: 'El usuario no existe.'});

        if (!tipo) {
            const [rows] = await connection.query('SELECT tipo FROM fichajes WHERE ID_EMPLEADO = ? AND id = ?', [new_id_empleado, id]);
            new_tipo = rows[0].tipo;
        }

        if (!fecha_Salida) {
            const [rows] = await connection.query('SELECT fecha_salida FROM fichajes WHERE id = ?', [id]);
            new_fecha_salida = rows[0].fecha_salida ?? new Date();
        }

        if (!fecha_entrada) {
            const [rows] = await connection.query('SELECT fecha_entrada FROM fichajes WHERE id = ?', [id]);
            new_fecha_entrada = rows[0].fecha_entrada;
        }

        await connection.query(
            'UPDATE fichajes SET tipo = ?, fecha_entrada = ?, fecha_salida = ? WHERE id = ?',
            [tipo || new_tipo,
                fecha_entrada || new_fecha_entrada,
                fecha_Salida || new_fecha_salida,
                id]);

        await connection.commit();

        return res.status(200).send({status: 200, message: 'Fichaje actualizado correctamente.'});

    } catch (error) {

        await connection.rollback();

        console.error('Error al registar el fichaje:', error);

        return res.status(500).send({status: 500, message: 'Error al registar el fichaje.'});

    } finally {
        await connection.end();
    }

}

export default actualizarFichaje;