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
        ID_Empleado,fecha_entrada,
        fecha_Salida,tipo
    } = req.body;

    // validaciones
    if (!ID_Empleado) {
        if (!fecha_entrada || !fecha_Salida ||!tipo) {
            return res.status(400).send({status: 400, message: 'Faltan datos.'})
        }
    }

    if ( (ID_Empleado && ID_Empleado < 0)) {
        return res.status(400).send({status: 400, message: 'Datos inválidos.'})
    }
}

export default verificadorDatos;