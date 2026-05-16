import { apiFetch } from "./apiFetch.jsx";

export async function registrarContrato({ request }) {
    const formData = await request.formData();
    const postData = Object.fromEntries(formData);
    return enviarContrato(
        postData?.token,
        postData?.salarioAnual,
        postData?.horasAnuales,
        postData?.idAModificar || '',
    );
}

export async function enviarContrato(token, salarioAnual, horasAnuales, idAModificar = '') {
    const url = import.meta.env.VITE_BACKEND_CONTRATOS;
    const params = new URLSearchParams();
    params.append('salarioAnual', salarioAnual);
    params.append('horasAnuales', horasAnuales);
    if (idAModificar) params.append('idAModificar', idAModificar);

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
        if (response.ok) return [true, idAModificar ? 'Contrato actualizado correctamente.' : 'Contrato creado correctamente.'];
        return [false, data?.message ?? 'Error al procesar el contrato.'];
    } catch (error) {
        return [false, error.message];
    }
}

export async function eliminarContrato(token, id) {
    const url = import.meta.env.VITE_BACKEND_CONTRATOS;
    const params = new URLSearchParams();
    params.append('id', id);

    try {
        const response = await apiFetch(url, {
            method: 'DELETE',
            headers: { token: token || '' },
            body: params,
        });
        const data = await response.json();
        if (data?.status === 200) return [true, 'Contrato eliminado correctamente.'];
        return [false, data?.message ?? 'Error al eliminar el contrato.'];
    } catch (error) {
        return [false, error.message];
    }
}
