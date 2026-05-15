import mysql from 'mysql2/promise'; // <-- promise
import dotenv from 'dotenv';
import Paginacion from "../paginacion.mjs";

dotenv.config();

// Pool fuera de la función
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

export async function listaFichajes(req, res) {
    let {cantidad, pagina, username} = req.query;

    cantidad = cantidad !== undefined ? parseInt(cantidad) : Paginacion.DEFAULT_CANTIDAD_PAGINACION;
    pagina   = pagina   !== undefined ? parseInt(pagina)   : Paginacion.DEFAULT_PAGINA;

    if (isNaN(cantidad) || isNaN(pagina))
        return res.status(400).send({ status: 400, message: "Parámetros inválidos" });

    if (cantidad < Paginacion.MIN_PAGINACION || cantidad > Paginacion.MAX_PAGINACION_EMPLEADOS)
        return res.status(400).send({ status: 400, message: `cantidad debe estar entre ${Paginacion.MIN_PAGINACION} y ${Paginacion.MAX_PAGINACION_EMPLEADOS}` });

    if (pagina < Paginacion.MIN_PAGINACION)
        return res.status(400).send({ status: 400, message: "La página no puede ser negativa" });

    const offset = pagina * cantidad;

    try {
        let idUsuario = undefined;
        if (username) {
            const [rows] = await pool.query(`SELECT id FROM empleado WHERE USERNAME = ?`, [username]);
            idUsuario = rows[0]?.id;
        }

        const hayUsuario = idUsuario !== undefined;
        const whereClause = hayUsuario ? 'WHERE ID_EMPLEADO = ?' : '';
        const params = hayUsuario ? [idUsuario] : [];

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) as total FROM fichajes ${whereClause}`,
            params
        );

        const [tieneFichajeActivo] = await pool.query(
            `SELECT COUNT(*) as tieneFichajeActivo FROM fichajes WHERE ID_EMPLEADO = ? AND (fecha_entrada IS NOT NULL AND fecha_salida IS NULL);`,
            [idUsuario]
        );

        const [result] = await pool.query(
            `SELECT f.id, f.id_empleado, e.username, e.nombre, e.apellidos,
                    f.fecha_entrada, f.fecha_salida, f.tipo
             FROM empleado e
             JOIN fichajes f ON e.id = f.id_empleado ${whereClause}
             ORDER BY f.fecha_entrada DESC, f.id DESC
             LIMIT ? OFFSET ?`,
            [...params, cantidad, offset]
        );

        return res.status(200).send({
            status: 200,
            meta: {
                pagina,
                cantidad,
                totalPaginas: Math.ceil(total / cantidad),
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