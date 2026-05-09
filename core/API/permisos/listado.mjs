import { obtenerPermisos } from "../permisions.mjs";

const listadoPermisos = (req, res) => {
    const permisos = obtenerPermisos(req?.body?.ruta);

    return res.status(200).json(permisos);
}

export default listadoPermisos;