import { apiFetch } from "./apiFetch.jsx";

export async function registrarIncidencia({ request }) {
    const formData = await request.formData();
    const postData = Object.fromEntries(formData);
    return enviarIncidencia(
        postData?.token,
        postData?.id_empleado,
        postData?.tipo,
        postData?.observaciones,
        postData?.comentario || '',
    );
}

export async function enviarIncidencia(token, id_empleado, tipo, observaciones, comentario = '') {
    const url = import.meta.env.VITE_BACKEND_INCIDENCIAS || `${import.meta.env.VITE_BACKEND}/incidencias`;
    const params = new URLSearchParams();
    params.append('id_empleado', id_empleado);
    params.append('tipo', tipo);
    params.append('observaciones', observaciones);
    if (comentario) params.append('comentario', comentario);

    try {
        const response = await apiFetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'token': token || '',
            },
            body: params,
        });
        const data = await response.json();
        if (response.ok) return [true, 'Incidencia registrada correctamente.'];
        return [false, data?.message ?? 'No se pudo registrar la incidencia.'];
    } catch (error) {
        return [false, error.message];
    }
}
