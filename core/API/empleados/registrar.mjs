import mysql from "mysql2/promise";
import dotenv from 'dotenv';

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

    if (!req?.body) return res.status(401).send({status: 401})
    const {nombre, apellidos, fecha_nacimiento,
            telefono, ID_contrato, ID_departamento,
                usuario, email, contrasenia} = req.body;

    // validaciones
    if (!nombre || !fecha_nacimiento ||
        !telefono || !ID_contrato ||
        !ID_departamento || !usuario || !contrasenia) {
        return res.status(400).send({status: 400, message: 'Faltan datos.'})
    }

    if (nombre.length > 30 || (apellidos && apellidos?.length > 60) ||
        telefono.length > 12 || usuario.length > 16 ||
        ID_contrato.length > 12 || ID_departamento < 0 ||
        ID_contrato < 0 || (email && email?.length >  90)) {
        return res.status(400).send({status: 400, message: 'Datos inválidos.'})
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
        const resultadoUsuario = await connection.query(
            'INSERT INTO usuario (USERNAME, PASSWORD, EMAIL) VALUES (?, ?, ?)',
            [usuario, contrasenia, email]);

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