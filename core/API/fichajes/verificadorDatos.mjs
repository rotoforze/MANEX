/**
 * Verifica que los datos enviados en el body del request sean correctos.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function verificadorDatos(req, res, updating = false) {
    const {
        username, id, tipo
    } = req.body;

    // validaciones
    if (!username || !tipo) {
        return res.status(400).send({status: 400, message: 'Faltan datos.'})
    }

    if ((id && id < 0)) {
        return res.status(400).send({status: 400, message: 'Datos inválidos.'})
    }
}

export default verificadorDatos;
