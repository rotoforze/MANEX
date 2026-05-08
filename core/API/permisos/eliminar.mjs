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

    if (!ruta || !metodo) {

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
        &&
        permisosActuales[ruta][metodo]
    ) {

        delete permisosActuales[ruta][metodo];

        if (
            Object.keys(permisosActuales[ruta]).length === 0
        ) {

            delete permisosActuales[ruta];
        }

        guardarPermisos(permisosActuales);

        return res.status(200).json({
            message: 'Permiso eliminado'
        });
    }

    return res.status(404).json({
        message: 'Permiso no encontrado'
    });
}

export default eliminar;