/**
 * Verifica que los datos enviados en el body del request sean correctos.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function verificadorDatos(req, res) {
    const {
        id, nombre, apellidos, fecha_nacimiento,
        telefono, ID_contrato, ID_departamento,
        usuario, email, contrasenia
    } = req.body;

    // validaciones
    if (!id) {
        if (!nombre || !fecha_nacimiento ||
            !telefono || !ID_contrato ||
            !ID_departamento || !usuario || !contrasenia) {
            return res.status(400).send({status: 400, message: 'Faltan datos.'})
        }
    }

    if ((nombre && nombre.length > 30) ||
        (apellidos && apellidos.length > 60) ||
        (telefono && telefono.length > 12) ||
        (usuario && usuario.length > 16) ||
        (email && email.length > 90) ||
        (id && id < 0) ||
        (ID_departamento !== undefined && ID_departamento < 0) ||
        (ID_contrato !== undefined && ID_contrato < 0)) {
        return res.status(400).send({status: 400, message: 'Datos inválidos.'})
    }
}

export default verificadorDatos;