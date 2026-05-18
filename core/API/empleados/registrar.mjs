import mysql from "mysql2/promise";
import dotenv from 'dotenv';
import verificadorDatos from "./verificadorDatos.mjs";
import {hashContrasenia} from "./hashDeContrasenias.mjs";
import {getNivelAcceso} from "../middlewareAutenticación.mjs";

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
    const deptSuperior = getNivelAcceso(req?.headers?.token);
    if (deptSuperior < ID_departamento) return res.status(500).send({status: 500, message: 'No se pueden crear usuarios con un nivel de acceso superior.'});
    if (!connection) return res.status(500).send({status: 500, message: 'Error al conectar a la base de datos.'});
    await connection.beginTransaction();

    try {
        // hash de la contraseña
        var contraseniaHasheada = await hashContrasenia(contrasenia);

        const resultadoUsuario = await connection.query(
            'INSERT INTO usuario (USERNAME, PASSWORD, EMAIL) VALUES (?, ?, ?)',
            [usuario, contraseniaHasheada, email]);

        const [[{ nextId }]] = await connection.query(
            'SELECT COALESCE(MAX(ID), 0) + 1 AS nextId FROM empleado FOR UPDATE'
        );

        const resultadoEmpleado = await connection.query(
            'INSERT INTO empleado (ID, Nombre, Apellidos, fecha_nacimiento, telefono, ID_CONTRATO, ID_DEPARTAMENTO, USERNAME) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nextId, nombre, apellidos, fecha_nacimiento, telefono, ID_contrato, ID_departamento, usuario]);

        await connection.commit();

        return res.status(201).send({status: 201, message: 'Empleado registrado correctamente.'});

    } catch (error) {

        await connection.rollback();

        console.error('Error al registrar el empleado:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            const esUsername = error.sql?.includes('INSERT INTO usuario');
            const mensaje = esUsername
                ? 'El nombre de usuario ya está en uso.'
                : 'Ya existe un empleado con esos datos.';
            return res.status(409).send({status: 409, message: mensaje});
        }

        return res.status(500).send({status: 500, message: 'Error al registrar el empleado.'});

    } finally {
        await connection.end();
    }

}

export default registrar;