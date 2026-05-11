/**
 * Verifica que los datos enviados en el body del request sean correctos.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function verificadorDatos(req, res) {
    const {
        id,id_empleado, fecha_creacion,observaciones,estado
    } = req.body;

    // validaciones
    if (!id) {
        if (!estado || !fecha_creacion ) {
            return res.status(400).send({status: 400, message: 'Faltan datos.'})
        }
    }

    if (estado.length > 10 || (observaciones && observaciones?.length > 60)|| (id_empleado && id_empleado < 0) || (id && id < 0)) {
        return res.status(400).send({status: 400, message: 'Datos inválidos.'})
    }
}

export default verificadorDatos;