import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Paginacion from "../paginacion.mjs";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

/**
 * Devuelve una lista paginada de fichajes con filtros opcionales.
 * @author Alex Bernardos Gil
 * @version 1.1.0
 * @param {Request} req
 * @param {Response} res
 */
export async function listaFichajes(req, res) {
    let { cantidad, pagina, username, nombre, apellidos, tipo } = req.query;

    cantidad = cantidad !== undefined ? parseInt(cantidad) : Paginacion.DEFAULT_CANTIDAD_PAGINACION;
    pagina   = pagina   !== undefined ? parseInt(pagina)   : Paginacion.DEFAULT_PAGINA;

    if (isNaN(cantidad) || isNaN(pagina))
        return res.status(400).send({ status: 400, message: "Parámetros inválidos" });

    if (cantidad < Paginacion.MIN_PAGINACION || cantidad > Paginacion.MAX_PAGINACION_EMPLEADOS)
        return res.status(400).send({
            status: 400,
            message: `cantidad debe estar entre ${Paginacion.MIN_PAGINACION} y ${Paginacion.MAX_PAGINACION_EMPLEADOS}`
        });

    if (pagina < Paginacion.MIN_PAGINACION)
        return res.status(400).send({ status: 400, message: "La página no puede ser negativa" });

    const offset = pagina * cantidad;

    const condiciones = [];
    const params = [];

    if (username) {
        condiciones.push('e.username = ?');
        params.push(username);
    }
    if (nombre) {
        condiciones.push('e.nombre LIKE ?');
        params.push(`%${nombre}%`);
    }
    if (apellidos) {
        condiciones.push('e.apellidos LIKE ?');
        params.push(`%${apellidos}%`);
    }
    if (tipo) {
        condiciones.push('f.tipo = ?');
        params.push(tipo);
    }

    const whereClause = condiciones.length > 0 ? 'WHERE ' + condiciones.join(' AND ') : '';

    try {
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) as total FROM empleado e JOIN fichajes f ON e.id = f.id_empleado ${whereClause}`,
            params
        );

        const [tieneFichajeActivo] = username
            ? await pool.query(
                `SELECT COUNT(*) as tieneFichajeActivo FROM fichajes f
                 JOIN empleado e ON e.id = f.id_empleado
                 WHERE e.username = ? AND f.fecha_entrada IS NOT NULL AND f.fecha_salida IS NULL`,
                [username]
            )
            : [[{ tieneFichajeActivo: 0 }]];

        const [result] = await pool.query(
            `SELECT f.id, f.id_empleado, e.username, e.nombre, e.apellidos,
                    f.fecha_entrada, f.fecha_salida, f.tipo
             FROM empleado e
             JOIN fichajes f ON e.id = f.id_empleado
             ${whereClause}
             ORDER BY f.fecha_entrada DESC, f.id DESC
             LIMIT ? OFFSET ?`,
            [...params, cantidad, offset]
        );

        return res.status(200).send({
            status: 200,
            meta: {
                pagina,
                cantidad,
                totalPaginas: Math.ceil(total / cantidad) || 1,
                resultados: result.length,
                fichajeActivo: tieneFichajeActivo[0].tieneFichajeActivo
            },
            data: result
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ status: 500, message: "Error de base de datos" });
    }
}
