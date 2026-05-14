import {
    obtenerPermisos,
    guardarPermisos,
    esRutaProtegida
} from "../permisions.mjs";

const guardar = (req, res) => {

    const { ruta, metodo, permisos } = req?.body;
    console.log(ruta, metodo, permisos);

    if (!ruta || !metodo) {
        return res.status(400).json({ message: 'Datos inválidos' });
    }

    if (esRutaProtegida(ruta)) {
        return res.status(403).json({ message: 'Ruta protegida' });
    }

    const metodosPermitidos = ["GET", "POST", "DELETE"];
    if (!metodosPermitidos.includes(metodo)) {
        return res.status(400).json({ message: 'Método no permitido' });
    }

    // const roles = typeof permisos === 'string' ? JSON.parse(permisos) : permisos;
    //
    // if (!Array.isArray(roles) || roles.length === 0) {
    //     return res.status(400).json({ message: 'Permisos inválidos' });
    // }

    const permisosActuales = obtenerPermisos();

    if (!permisosActuales[ruta]) {
        permisosActuales[ruta] = { protected: false };
    }

    permisosActuales[ruta][metodo] = permisos || [];

    guardarPermisos(res, permisosActuales[ruta], ruta);
}
export default guardar;