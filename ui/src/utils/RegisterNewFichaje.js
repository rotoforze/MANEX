import { apiFetch } from "./apiFetch.jsx";

export async function registrarFichaje({ request }) {
    const formData = await request.formData();
    const postData = Object.fromEntries(formData);
    return enviarFichaje(postData?.token, postData?.username, postData?.tipo);
}

export async function enviarFichaje(token, username, tipo) {
    const url = import.meta.env.VITE_BACKEND_FICHAJES || `${import.meta.env.VITE_BACKEND}/fichajes`;
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('tipo', tipo);

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
        if (response.ok) return [true, 'Fichaje registrado correctamente.'];
        return [false, data?.message ?? 'No se pudo registrar el fichaje.'];
    } catch (error) {
        return [false, error.message];
    }
}
