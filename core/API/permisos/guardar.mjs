import {
    obtenerPermisos,
    guardarPermisos,
    esRutaProtegida
} from "../permisions.mjs";

const guardar = (req, res) => {

    const {
        ruta,
        metodo,
        permisos
    } = req?.body;

    if (!ruta || !metodo || !permisos) {

        return res.status(400).json({
            message: 'Datos inválidos'
        });
    }

    if (esRutaProtegida(ruta)) {

        return res.status(403).json({
            message: 'Ruta protegida'
        });
    }

    const permisosActuales = obtenerPermisos();

    if (!permisosActuales[ruta]) {

        permisosActuales[ruta] = {};
    }

    permisosActuales[ruta][metodo] = permisos;

    guardarPermisos(res,permisosActuales);

    return res.status(200).json({
        message: 'Permisos guardados'
    });
}

export default guardar;