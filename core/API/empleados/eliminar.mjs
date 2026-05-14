import mysql from "mysql2/promise";
import verificadorDatos from "./verificadorDatos.mjs";

/**
 * Elimina un empleado de la base de datos.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @param req
 * @param res
 */
async function delEmpleado(req, res) {

    const {id, usuario} = req.body;

    console.log(usuario);

    if ((id && id < 0) || !usuario) {
        return res.status(400).send({status: 400, message: 'El ID del empleado no puede ser negativo.'});
    }

    // comenzamos la transaccion
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
        // el usuario NO SE PUEDE CAMBIAR
        const resultadoEmpleado = await connection.query(
            'DELETE FROM empleado WHERE username = ?',
            [usuario]);
        const resultadoUsuario = await connection.query(
            'DELETE FROM usuario WHERE username = ?',
            [usuario]);


        await connection.commit();

        return res.status(201).send({status: 201, message: 'Empleado eliminado correctamente.'});

    } catch (error) {

        await connection.rollback();

        console.error('Error al eliminado el empleado:', error);

        return res.status(500).send({status: 500, message: 'Error al eliminado el empleado.'});

    } finally {
        await connection.end();
    }

}

export default delEmpleado;