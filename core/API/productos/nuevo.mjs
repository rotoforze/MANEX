import pool from '../db.mjs';
import mysql from 'mysql2';
import dotenv from 'dotenv';

// Cargamos las variables del archivo .env
dotenv.config();

/**
 * Crea o modifica un producto del inventario.
 * Si se recibe idAModificar y existe, se actualiza.
 * Si no existe, se crea uno nuevo.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0
 * @param {Request} req
 * @param {Response} res
 */
function nuevoProducto(req, res) {

    if (!req?.body) {
        return res.status(401).send({
            status: 401,
            message: "Cuerpo vacío."
        });
    }

    const {
        nombre,
        descripcion,
        estado,
        idAModificar
    } = req.body;

    const estadosValidos = [
        'En proceso de envio',
        'Disponible',
        'No disponible',
        'En mantenimiento'
    ];

    // Validaciones
    if (
        !nombre ||
        typeof nombre !== "string" ||
        nombre.trim().length <= 0 ||
        !estado ||
        !estadosValidos.includes(estado) ||
        (idAModificar && isNaN(idAModificar))
    ) {
        return res.status(400).send({
            status: 400,
            message: "Parámetros inválidos o nulos."
        });
    }



    pool.getConnection((err, connection) => {

        if (err) {
            return res.status(500).send({
                status: 500,
                message: "Error de base de datos."
            });
        }

        const query = idAModificar
            ? `
                UPDATE inventario
                SET
                    Nombre = ?,
                    Descripcion = ?,
                    Estado = ?
                WHERE ID = ?
            `
            : `
                INSERT INTO inventario (
                    Nombre,
                    Descripcion,
                    Estado
                )
                VALUES (?, ?, ?)
            `;

        const values = idAModificar
            ? [
                nombre,
                descripcion || null,
                estado,
                idAModificar
            ]
            : [
                nombre,
                descripcion || null,
                estado
            ];

        connection.query(query, values, (error, result) => {

            connection.release();

            if (error) {
                return res.status(500).send({
                    status: 500,
                    message: "Error en la consulta.",
                    error
                });
            }

            return res.status(200).send({
                status: 200,
                idProducto: result.insertId || idAModificar,
                message: `Producto ${result.insertId
                        ? 'creado'
                        : 'modificado'
                    } correctamente.`
            });

        });

    });

}

export default nuevoProducto;