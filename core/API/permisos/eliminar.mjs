import {
    obtenerPermisos,
    guardarPermisos,
    esRutaProtegida
} from "../permisions.mjs";

const eliminar = (req, res) => {

    const {
        ruta,
        metodo
    } = req.body;

    if (!ruta) {

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

    if (
        permisosActuales[ruta]
    ) {

        delete (metodo && permisosActuales[ruta][metodo] ? permisosActuales[ruta][metodo] : permisosActuales[ruta]);

        if (
            Object.keys(permisosActuales[ruta]).length === 0
        ) {

            delete permisosActuales[ruta];
        }

        guardarPermisos(res, permisosActuales, ruta, true);
        if (res.headersSent) return;
    }
    return res.status(404).json({
        message: 'Permiso no encontrado'
    });
}

export default eliminar;