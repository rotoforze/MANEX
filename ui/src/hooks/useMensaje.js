import { useState, useEffect } from 'react';

/**
 * Gestiona un mensaje temporal que se limpia automáticamente.
 *
 * @param {number} duracion - Milisegundos hasta que el mensaje desaparece (por defecto 3000)
 * @returns {[any, Function]} [mensaje, setMensaje]
 */
export function useMensaje(duracion = 3000) {
    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        if (!mensaje) return;
        const t = setTimeout(() => setMensaje(null), duracion);
        return () => clearTimeout(t);
    }, [mensaje, duracion]);

    return [mensaje, setMensaje];
}
