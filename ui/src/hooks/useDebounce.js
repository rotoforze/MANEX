import { useState, useEffect } from 'react';

/**
 * Retrasa la actualización de un valor hasta que el usuario deja de cambiarlo.
 * Útil para evitar llamadas al backend en cada pulsación de tecla.
 *
 * @param {*} value  Valor a debouncear
 * @param {number} delay  Milisegundos de espera (por defecto 350)
 * @returns El valor estabilizado
 */
export function useDebounce(value, delay = 350) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
