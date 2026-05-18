import mysql from "mysql2/promise";

async function actualizarIncidencia(req, res) {
    const { id, id_empleado, fecha_creacion, estado, observaciones, comentario } = req.body;

    if (!id || isNaN(id) || id < 1) {
        return res.status(400).send({ status: 400, message: 'El ID de la incidencia es obligatorio.' });
    }

    if (!estado) {
        return res.status(400).send({ status: 400, message: 'El estado es obligatorio.' });
    }

    const config = {
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port:     process.env.DB_PORT
    };

    const connection = await mysql.createConnection(config);
    if (!connection) {
        return res.status(500).send({ status: 500, message: 'Error al conectar a la base de datos.' });
    }

    try {
        const campos = [];
        const valores = [];

        if (estado !== undefined) { campos.push('estado = ?'); valores.push(estado); }
        if (observaciones !== undefined) { campos.push('observaciones = ?'); valores.push(observaciones); }
        if (comentario !== undefined) { campos.push('comentario = ?'); valores.push(comentario); }
        if (id_empleado !== undefined) { campos.push('id_empleado = ?'); valores.push(id_empleado); }
        if (fecha_creacion !== undefined) { campos.push('fecha_creacion = ?'); valores.push(fecha_creacion); }

        if (campos.length === 0) {
            return res.status(400).send({ status: 400, message: 'No hay campos válidos para actualizar.' });
        }

        valores.push(id);

        const sql = `UPDATE incidencia SET ${campos.join(', ')} WHERE ID = ?`;

        const [resultado] = await connection.query(sql, valores);

        if (resultado.affectedRows === 0) {
            return res.status(404).send({ status: 404, message: 'No se encontro ninguna incidencia con ese ID.' });
        }

        return res.status(200).send({ status: 200, message: 'Incidencia actualizada correctamente.' });

    } catch (error) {
        console.error('[actualizarIncidencia]', error);
        return res.status(500).send({
            status: 500,
            message: 'Error al actualizar la incidencia.',
            detail: error.message
        });
    } finally {
        await connection.end();
    }
}

export default actualizarIncidencia;