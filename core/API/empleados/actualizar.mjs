import verificadorDatos from "./verificadorDatos.mjs";
import mysql from "mysql2/promise";
import {hashContrasenia} from "./hashDeContrasenias.mjs";

/**
 * Actualiza el usuario en la BBDD.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @param req
 * @param res
 */
async function actualizar(req, res) {

    const { nombre, apellidos, fecha_nacimiento,
        telefono, ID_contrato, ID_departamento,
        usuario, email, contrasenia, id } = req.body;

    await verificadorDatos(req, res);

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

        // hash de la contraseña
        const contraseniaHasheada = await hashContrasenia(contrasenia);

        // el usuario NO SE PUEDE CAMBIAR
        const resultadoUsuario = await connection.query(
            'UPDATE usuario SET password = ?, email = ? WHERE username = ?',
            [contraseniaHasheada, email, usuario]);

        const resultadoEmpleado = await connection.query(
            'UPDATE empleado SET nombre = ?, apellidos = ?, fecha_nacimiento = ?, telefono = ?, ID_contrato = ?, ID_departamento = ? WHERE id = ?',
            [nombre, apellidos, fecha_nacimiento, telefono, ID_contrato, ID_departamento, id]);

        await connection.commit();

        return res.status(201).send({status: 201, message: 'Empleado registrado correctamente.'});

    } catch (error) {

        await connection.rollback();

        console.error('Error al registrar el empleado:', error);

        return res.status(500).send({status: 500, message: 'Error al registrar el empleado.'});

    } finally {
        await connection.end();
    }

}

export default actualizar;