import mysql from 'mysql2';
import dotenv from 'dotenv';

//Cargamos las variables del archivo .env a process.env
dotenv.config();

/**
 * Elimina el departamento recibido.
 *
 * @author Alex Bernardos Gil
 * @version 1.0
 * @param {Request} req
 * @param {Response} res
 */
function delDepartamento(req, res) {
    const idDepartamento = parseInt(req.params.id, 10);

    if (isNaN(idDepartamento) || !idDepartamento || idDepartamento < 0) {
        return res.status(400).send({
            status: 400,
            message: "Parámetros inválidos o nulos"
        });
    }

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT
    });

    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send({
                status: 500,
                message: "Error de base de datos"
            });
        }
        connection.query(
            `DELETE
             FROM departamento
             WHERE ID = ?`,
            [idDepartamento],
            (error, result) => {

                connection.release();

                if (error) {
                    if (error.toString().includes('foreign key constraint fails')) {
                        return res.status(500).send({
                            status: 500,
                            message: "Hay empleados que dependen de este Departamento. No se puede eliminar."
                        });
                    } else {
                        return res.status(500).send({
                            status: 500,
                            message: "Error en la consulta"
                        });
                    }
                }

                if (result.affectedRows == 1) {
                    return res.status(200).send({
                        status: 200,
                        message: "Departamento eliminado correctamente"
                    });
                } else {
                    return res.status(400).send({
                        status: 400,
                        message: "Departamento no encontrado"
                    });
                }
            }
        );
    });
}

export default delDepartamento;