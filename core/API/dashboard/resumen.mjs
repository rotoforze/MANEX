import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port:     process.env.DB_PORT,
});

/**
 * Devuelve un resumen agregado de todos los módulos para el dashboard.
 * Modo admin (sin username): KPIs globales + últimos registros de cada módulo.
 * Modo empleado (con username): datos personales del empleado autenticado.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @param {Request} req
 * @param {Response} res
 */
export async function resumenDashboard(req, res) {
    const { username } = req.query;

    try {
        if (username) {
            return await resumenEmpleado(username, res);
        }
        return await resumenAdmin(res);
    } catch (err) {
        console.error('Error en /dashboard:', err);
        return res.status(500).send({ status: 500, message: 'Error al obtener el resumen del dashboard.' });
    }
}

async function resumenAdmin(res) {
    const [
        [[{ empleados }]],
        [[{ fichajes }]],
        [[{ departamentos }]],
        [[{ contratos }]],
        [incidenciasPorEstado],
        [inventarioPorEstado],
        [vacacionesPorEstado],
    ] = await Promise.all([
        pool.query(`SELECT COUNT(*) AS empleados FROM empleado WHERE esVisible = 1`),
        pool.query(`SELECT COUNT(*) AS fichajes FROM fichajes`),
        pool.query(`SELECT COUNT(*) AS departamentos FROM departamento`),
        pool.query(`SELECT COUNT(*) AS contratos FROM contrato`),
        pool.query(`SELECT estado, COUNT(*) AS total FROM incidencia GROUP BY estado`),
        pool.query(`SELECT Estado, COUNT(*) AS total FROM inventario GROUP BY Estado`),
        pool.query(`SELECT estado, COUNT(*) AS total FROM solicitud_vacaciones GROUP BY estado`),
    ]);

    return res.status(200).send({
        status: 200,
        kpis: {
            empleados,
            fichajes,
            departamentos,
            contratos,
            incidencias: agrupar(incidenciasPorEstado, 'estado'),
            inventario:  agrupar(inventarioPorEstado,  'Estado'),
            vacaciones:  agrupar(vacacionesPorEstado,  'estado'),
        },
    });
}

async function resumenEmpleado(username, res) {
    const [empleadoRows] = await pool.query(
        `SELECT e.*, u.email FROM empleado e JOIN usuario u ON e.USERNAME = u.USERNAME WHERE e.USERNAME = ? AND e.esVisible = 1`,
        [username]
    );

    if (!empleadoRows.length) {
        return res.status(404).send({ status: 404, message: 'Empleado no encontrado.' });
    }

    const perfil = empleadoRows[0];
    const idEmpleado = perfil.id ?? perfil.ID;

    const [
        [fichajes],
        [incidencias],
        [vacaciones],
        [[incKpis]],
        [[vacKpis]],
    ] = await Promise.all([
        pool.query(
            `SELECT id, fecha_entrada, fecha_salida, tipo FROM fichajes WHERE id_empleado = ? ORDER BY fecha_entrada DESC LIMIT 10`,
            [idEmpleado]
        ),
        pool.query(
            `SELECT ID, estado, Observaciones, fecha_creacion FROM incidencia WHERE ID_EMPLEADO = ? ORDER BY ID DESC LIMIT 5`,
            [idEmpleado]
        ),
        pool.query(
            `SELECT sv.id_incidencia, sv.tipo, sv.fecha_inicio, sv.fecha_fin, sv.estado
             FROM solicitud_vacaciones sv
             JOIN incidencia i ON sv.ID_INCIDENCIA = i.ID
             WHERE i.ID_EMPLEADO = ? ORDER BY sv.id_incidencia DESC LIMIT 5`,
            [idEmpleado]
        ),
        pool.query(
            `SELECT COUNT(*) AS total, SUM(estado IN ('Abierta','Pendiente')) AS abiertas FROM incidencia WHERE ID_EMPLEADO = ?`,
            [idEmpleado]
        ),
        pool.query(
            `SELECT COUNT(*) AS total, SUM(sv.estado IN ('En revisión','En revision','Pendiente')) AS pendientes
             FROM solicitud_vacaciones sv
             JOIN incidencia i ON sv.ID_INCIDENCIA = i.ID
             WHERE i.ID_EMPLEADO = ?`,
            [idEmpleado]
        ),
    ]);

    return res.status(200).send({
        status: 200,
        perfil,
        fichajes,
        incidencias,
        vacaciones,
        kpis: {
            incidencias: { total: incKpis.total, abiertas: incKpis.abiertas ?? 0 },
            vacaciones:  { total: vacKpis.total, pendientes: vacKpis.pendientes ?? 0 },
        },
    });
}

/** Convierte filas GROUP BY en { total, [estado]: count, ... } */
function agrupar(filas, campoEstado) {
    const total = filas.reduce((s, f) => s + f.total, 0);
    const porEstado = Object.fromEntries(filas.map(f => [f[campoEstado], f.total]));
    return { total, ...porEstado };
}
