import pool from '../db.mjs';
import mysql from 'mysql2';
import dotenv from 'dotenv';

//Cargamos las variables del archivo .env a process.env
dotenv.config();

/**
 * Crea o modifica el departamento recibido. Si se recibe un idAModificar pero no existe ese ID, se crea un nuevo departamento con los datos recibidos.
 *
 * @author Alex Bernardos Gil
 * @version 1.0
 * @param {Request} req
 * @param {Response} res
 */
function newDepartamento(req, res) {
    if (!req?.body) return res.status(401).send({
        status: 401,
        message: "Cuerpo vacío."
    })

    const {nombre, idAModificar} = req.body;

    if (!nombre || (idAModificar && isNaN(idAModificar))) {
        return res.status(400).send({
            status: 400,
            message: "Parámetros inválidos o nulos"
        });
    }



    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send({
                status: 500,
                message: "Error de base de datos"
            });
        }
        connection.query(idAModificar ? `UPDATE departamento
                                         SET Nombre = ?
                                         WHERE id = ?` :
                `INSERT INTO departamento (Nombre)
                 VALUES (?)`,
            [nombre, idAModificar],
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
                    idDepartamento: result.insertId || idAModificar,
                    message: `Departamento ${!result.insertId > 0 ? 'editado' : 'creado'} correctamente.`
                });

            }
        );
    });
}

export default newDepartamento;