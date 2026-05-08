import mysql from "mysql2/promise";
import dotenv from 'dotenv';
import verificadorDatos from "./verificadorDatos.mjs";
import {hashContrasenia} from "./hashDeContrasenias.mjs";

//Cargamos las variables del archivo .env a process.env
dotenv.config();

/**
 * Registra un usuario en la BBDD, después registra al empleado.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @param req
 * @param res
 */
async function registrar(req, res) {

        await verificadorDatos(req, res)
    if (res.headersSent) return;

    const { nombre, apellidos, fecha_nacimiento,
        telefono, ID_contrato, ID_departamento,
        usuario, email, contrasenia} = req.body;

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
        var contraseniaHasheada = await hashContrasenia(contrasenia);

        const resultadoUsuario = await connection.query(
            'INSERT INTO usuario (USERNAME, PASSWORD, EMAIL) VALUES (?, ?, ?)',
            [usuario, contraseniaHasheada, email]);

        const resultadoEmpleado = await connection.query(
            'INSERT INTO empleado (Nombre, Apellidos, fecha_nacimiento, telefono, ID_CONTRATO, ID_DEPARTAMENTO, USERNAME) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellidos, fecha_nacimiento, telefono, ID_contrato, ID_departamento, usuario]);

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

export default registrar;