import { apiFetch } from "./apiFetch.jsx";

export async function registrarDepartamento({ request }) {
    const formData = await request.formData();
    const postData = Object.fromEntries(formData);
    return enviarDepartamento(
        postData?.token,
        postData?.nombre,
        postData?.idAModificar || '',
    );
}

export async function enviarDepartamento(token, nombre, idAModificar = '') {
    const url = import.meta.env.VITE_BACKEND_DEPARTAMENTOS;
    const params = new URLSearchParams();
    params.append('nombre', nombre);
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
        if (response.ok) return [true, idAModificar ? 'Departamento actualizado correctamente.' : 'Departamento creado correctamente.'];
        return [false, data?.message ?? 'Error al procesar el departamento.'];
    } catch (error) {
        return [false, error.message];
    }
}

export async function eliminarDepartamento(token, id) {
    const url = import.meta.env.VITE_BACKEND_DEPARTAMENTOS;
    const params = new URLSearchParams();
    params.append('id', id);

    try {
        const response = await apiFetch(url, {
            method: 'DELETE',
            headers: { token: token || '' },
            body: params,
        });
        const data = await response.json();
        if (data?.status === 200) return [true, 'Departamento eliminado correctamente.'];
        return [false, data?.message ?? 'Error al eliminar el departamento.'];
    } catch (error) {
        return [false, error.message];
    }
}
