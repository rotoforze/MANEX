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
         fecha_inicio, fecha_fin, estado, id_incidencia
    } = req.body;

    // validaciones
    if (!id) {
        if (!estado || !fecha_inicio || !fecha_fin) {
            return res.status(400).send({ status: 400, message: 'Faltan datos.' })
        }
    }

    if (estado.length > 40 || (id_incidencia && id_incidencia < 0)) {
        return res.status(400).send({ status: 400, message: 'Datos inválidos.' })
    }
}

export default verificadorDatos;