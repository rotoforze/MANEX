import verificadorDatos from "./verificadorDatos.mjs";
import mysql from "mysql2/promise";
import {hashContrasenia} from "./hashDeContrasenias.mjs";
import {getNivelAcceso} from "../middlewareAutenticación.mjs";

/**
 * Actualiza el empleado en la BBDD.
 * - La contraseña solo se actualiza si se proporciona.
 * - El username se actualiza en usuario, empleado y auth_token si cambia.
 *
 * @author Alex Bernardos Gil
 * @contributor Eneas de la Rosa Menéndez Pedrosa
 * @version 2.0.0
 * @param req
 * @param res
 */
async function actualizar(req, res) {

    const { nombre, apellidos, fecha_nacimiento,
        telefono, ID_contrato, ID_departamento,
        usuario, email, contrasenia, id } = req.body;

    await verificadorDatos(req, res);
    if (res.headersSent) return;

    const deptSuperior = getNivelAcceso(req?.headers?.token);
    if (deptSuperior < ID_departamento) return res.status(500).send({status: 500, message: 'No se pueden crear usuarios con un nivel de acceso superior.'});

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
        // Obtener username actual por ID de empleado
        const [empRows] = await connection.query('SELECT USERNAME FROM empleado WHERE id = ?', [id]);
        if (!empRows.length) {
            await connection.rollback();
            return res.status(404).send({status: 404, message: 'Empleado no encontrado.'});
        }
        const currentUsername = empRows[0].USERNAME;
        const targetUsername   = usuario || currentUsername;
        const usernameChanged  = targetUsername !== currentUsername;

        // Actualizar tabla usuario (password opcional, username opcional)
        if (usernameChanged) {
            await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        }

        if (contrasenia) {
            const hash = await hashContrasenia(contrasenia);
            await connection.query(
                'UPDATE usuario SET username = ?, password = ?, email = ? WHERE username = ?',
                [targetUsername, hash, email, currentUsername]);
        } else {
            await connection.query(
                'UPDATE usuario SET username = ?, email = ? WHERE username = ?',
                [targetUsername, email, currentUsername]);
        }

        // Si el username cambió, actualizar auth_token
        if (usernameChanged) {
            await connection.query(
                'UPDATE auth_token SET USERNAME = ? WHERE USERNAME = ?',
                [targetUsername, currentUsername]);
        }

        // Actualizar tabla empleado
        // COALESCE conserva el valor existente si llega null (campos NOT NULL o sin permiso de edición)
        const idContrato     = ID_contrato     ? parseInt(ID_contrato)     : null;
        const idDepartamento = ID_departamento ? parseInt(ID_departamento) : null;
        const fechaNac       = fecha_nacimiento || null;
        await connection.query(
            `UPDATE empleado
             SET nombre = ?, apellidos = ?, fecha_nacimiento = COALESCE(?, fecha_nacimiento),
                 telefono = ?, ID_contrato = COALESCE(?, ID_contrato),
                 ID_departamento = COALESCE(?, ID_departamento), USERNAME = ?
             WHERE id = ?`,
            [nombre, apellidos, fechaNac, telefono, idContrato, idDepartamento, targetUsername, id]);

        if (usernameChanged) {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        }

        await connection.commit();

        return res.status(200).send({
            status: 200,
            message: 'Empleado actualizado correctamente.',
            usernameChanged,
            newUsername: usernameChanged ? targetUsername : undefined,
        });

    } catch (error) {

        await connection.rollback();
        await connection.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});

        console.error('Error al actualizar el empleado:', error);

        return res.status(500).send({status: 500, message: 'Error al actualizar el empleado.'});

    } finally {
        await connection.end();
    }

}

export default actualizar;
