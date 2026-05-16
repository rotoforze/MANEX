import { apiFetch } from "./apiFetch.jsx";

export async function registrarSolicitud({ request }) {
    const formData = await request.formData();
    const postData = Object.fromEntries(formData);
    return enviarSolicitud(postData?.token, {
        id_empleado: postData?.id_empleado || '',
        id_incidencia: postData?.id_incidencia || '',
        tipo: postData?.tipo,
        fecha_inicio: postData?.fecha_inicio,
        fecha_fin: postData?.fecha_fin,
        observaciones: postData?.observaciones || '',
        estado: postData?.estado || 'En revisión',
    });
}

export async function enviarSolicitud(token, { id_empleado, id_incidencia, tipo, fecha_inicio, fecha_fin, observaciones, estado }) {
    const url = import.meta.env.VITE_BACKEND_SOLICITUDES
        || import.meta.env.VITE_BACKEND_SOLICITUD
        || `${import.meta.env.VITE_BACKEND}/vacaciones`;

    const params = new URLSearchParams();
    if (id_empleado) params.append('id_empleado', id_empleado);
    if (id_incidencia) params.append('id_incidencia', id_incidencia);
    params.append('tipo', tipo);
    params.append('fecha_inicio', fecha_inicio);
    params.append('fecha_fin', fecha_fin);
    if (observaciones) params.append('observaciones', observaciones);
    params.append('estado', estado);

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
        if (response.ok) return [true, data?.message || (id_incidencia ? 'Solicitud actualizada correctamente.' : 'Solicitud registrada correctamente.')];
        return [false, data?.message ?? 'No se pudo procesar la solicitud.'];
    } catch (error) {
        return [false, error.message];
    }
}
