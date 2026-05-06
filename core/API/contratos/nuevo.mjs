import mysql from 'mysql2';
import dotenv from 'dotenv';
import getContrato from "./contrato.mjs";

//Cargamos las variables del archivo .env a process.env
dotenv.config();

/**
 * Crea o modifica el contrato recibido. Si se recibe un idAModificar pero no existe ese ID, se crea un nuevo contrato con los datos recibidos.
 *
 * @author Alex Bernardos Gil
 * @version 1.0
 * @param {Request} req
 * @param {Response} res
 */
function newContrato(req, res) {
    if (!req?.body) return res.status(401).send({
        status: 401,
        message: "Cuerpo vacío."
    })

    const {salarioAnual, horasAnuales, idAModificar} = req.body;

    if (isNaN(salarioAnual) || isNaN(horasAnuales) || salarioAnual < 0 || horasAnuales < 0 || (idAModificar && isNaN(idAModificar))) {
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
        connection.query(idAModificar ? `UPDATE contrato
                                         SET Salario_anual = ?,
                                             Horas_anuales = ?
                                         WHERE id = ?` :
                `INSERT INTO contrato (Salario_anual, Horas_anuales)
                 VALUES (?, ?)`,
            [salarioAnual, horasAnuales, idAModificar],
            (error, result) => {

                connection.release();

                if (error) {
                    return res.status(500).send({
                        status: 500,
                        message: "Error en la consulta"
                    });
                }

                return res.status(200).send({
                    status: 200,
                    idContrato: result.insertId || idAModificar,
                    message: `Contrato ${result.insertId ? 'Editado' : 'Creado'} correctamente.`
                });

            }
        );
    });
}

export default newContrato;