import pool from '../db.mjs';

/**
 * Devuelve toda la informacion de perfil de un empleado
 *
 * @author Covadonga Blanco Alvarez
 * @version 1.3
 * @param {Request} req
 * @param {Response} res
 */
function getPerfilEmpleado(req, res) {

    const idEmpleado = req.query.id;

    if (!idEmpleado || isNaN(idEmpleado) || idEmpleado < 1) {
        return res.status(400).send({
            status: 400,
            message: "El parametro 'id' es obligatorio y debe ser un numero valido."
        });
    }

    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send({
                status: 500,
                message: "Error de base de datos"
            });
        }

        // Datos personales, departamentoal que pertenece y horas_anuales del contrato
        const queryEmpleado = `
            SELECT
                e.ID,
                e.Nombre,
                e.Apellidos,
                e.USERNAME,
                e.telefono,
                e.fecha_nacimiento,
                e.fecha_alta,
                e.ID_DEPARTAMENTO,
                e.ID_CONTRATO,
                d.Nombre        AS nombre_departamento,
                u.EMAIL         AS email,
                c.Horas_anuales AS horas_anuales
            FROM empleado e
            LEFT JOIN departamento d ON e.ID_DEPARTAMENTO = d.ID
            LEFT JOIN usuario u      ON e.USERNAME = u.USERNAME
            LEFT JOIN contrato c     ON e.ID_CONTRATO = c.ID
            WHERE e.esVisible = 1
              AND e.ID = ?
            LIMIT 1
        `;

        // Fichajes del mes actual 
        const queryFichajes = `
            SELECT
                f.ID            AS id,
                f.FECHA_ENTRADA AS fecha_entrada,
                f.FECHA_SALIDA  AS fecha_salida,
                f.TIPO          AS tipo
            FROM fichajes f
            WHERE f.ID_EMPLEADO = ?
            ORDER BY f.FECHA_ENTRADA DESC
            LIMIT 50
        `;

        // Obtengo el total de minutos trabajados este mes a partir de los fichajes completos
        const queryMinutosMes = `
            SELECT
                COALESCE(
                    SUM(
                        TIMESTAMPDIFF(MINUTE, f.FECHA_ENTRADA, f.FECHA_SALIDA)
                    ), 0
                ) AS minutos_trabajados
            FROM fichajes f
            WHERE f.ID_EMPLEADO = ?
              AND f.FECHA_SALIDA IS NOT NULL
              AND MONTH(f.FECHA_ENTRADA) = MONTH(CURDATE())
              AND YEAR(f.FECHA_ENTRADA)  = YEAR(CURDATE())
        `;

        // Incidencias
        const queryIncidencias = `
            SELECT
                i.ID,
                i.estado,
                i.fecha_creacion,
                i.Observaciones,
                i.Comentario
            FROM incidencia i
            WHERE i.ID_empleado = ?
            ORDER BY i.fecha_creacion DESC
        `;

        // Solicitudes de vacaciones
        const querySolicitudes = `
            SELECT
                sv.ID_INCIDENCIA,
                sv.fecha_inicio,
                sv.fecha_fin,
                sv.tipo,
                sv.estado
            FROM solicitud_vacaciones sv
            JOIN incidencia i ON sv.ID_INCIDENCIA = i.ID
            WHERE i.ID_empleado = ?
            ORDER BY sv.fecha_inicio DESC
        `;

        Promise.all([
            new Promise((resolve, reject) =>
                connection.query(queryEmpleado,    [idEmpleado], (e, r) => e ? reject(e) : resolve(r))
            ),
            new Promise((resolve, reject) =>
                connection.query(queryFichajes,    [idEmpleado], (e, r) => e ? reject(e) : resolve(r))
            ),
            new Promise((resolve, reject) =>
                connection.query(queryMinutosMes,  [idEmpleado], (e, r) => e ? reject(e) : resolve(r))
            ),
            new Promise((resolve, reject) =>
                connection.query(queryIncidencias, [idEmpleado], (e, r) => e ? reject(e) : resolve(r))
            ),
            new Promise((resolve, reject) =>
                connection.query(querySolicitudes, [idEmpleado], (e, r) => e ? reject(e) : resolve(r))
            ),
        ])
        .then(([empleado, fichajes, minutosMes, incidencias, solicitudes]) => {
            connection.release();

            if (!empleado.length) {
                return res.status(404).send({
                    status: 404,
                    message: "No se ha encontrado el empleado."
                });
            }

            const emp = empleado[0];

            // Convierto las horas anuales del contrato a horas mensuales
            const horasAnuales  = parseFloat(emp.horas_anuales) || 0;
            const horasMensuales = horasAnuales / 12;

            // Minutos trabajados este mes 
            const minutosTrabajados = parseInt(minutosMes[0]?.minutos_trabajados) || 0;
            const horasTrabajadas   = Math.floor(minutosTrabajados / 60);
            const minResto          = minutosTrabajados % 60;

            //Obtengo la diferencia entre las horas que se deberian trabajar y las que se trabajaron en verdad
            const minutosDiferencia = minutosTrabajados - Math.round(horasMensuales * 60);

            return res.status(200).send({
                status: 200,
                data: {
                    empleado: emp,
                    horas_mes: {
                        trabajadas_h:   horasTrabajadas,
                        trabajadas_min: minResto,
                        mensuales_h:    Math.floor(horasMensuales),
                        mensuales_min:  Math.round((horasMensuales % 1) * 60),
                        diferencia_min: minutosDiferencia,  
                    },
                    fichajes,
                    incidencias,
                    solicitudes,
                }
            });
        })
        .catch(error => {
            connection.release();
            console.error('[getPerfilEmpleado]', error);
            return res.status(500).send({
                status: 500,
                message: "Error en la consulta",
                detail: error.message
            });
        });
    });
}

export default getPerfilEmpleado;
