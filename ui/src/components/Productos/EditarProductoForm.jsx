import React, { useState } from 'react';
import { useMensaje } from "../../hooks/useMensaje.js";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";

const ESTADOS_VALIDOS = [
    'En proceso de envio',
    'Disponible',
    'No disponible',
    'En mantenimiento'
];

/**
 * Formulario de edición de un producto existente.
 * Envía POST a VITE_BACKEND_PRODUCTO con idAModificar en el body → nuevo.mjs hace UPDATE.
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @contributor Alex Bernardos Gil
 * @version 1.2
 * @param {Object}   producto                   - Fila del producto tal como llega del listado
 * @param {Function} funcionDeCierreDeFormulario - Cierra el formulario sin guardar
 * @param {Function} handleProductoActualizado   - Callback tras actualización exitosa
 */
export function EditarProductoForm({ producto, funcionDeCierreDeFormulario, handleProductoActualizado }) {

    const { user } = useUsers();

    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useMensaje();

    const [form, setForm] = useState({
        idAModificar: producto?.ID ?? '',
        nombre: producto?.Nombre ?? '',
        descripcion: producto?.Descripcion ?? '',
        estado: producto?.Estado ?? ESTADOS_VALIDOS[0],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensaje(null);

        try {
            const response = await apiFetch(
                import.meta.env.VITE_BACKEND_PRODUCTO,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'token': user?.token,
                    },
                    body: new URLSearchParams(form).toString(),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMensaje({ tipo: 'success', texto: data?.message ?? 'Producto actualizado correctamente.' });
                setTimeout(() => {
                    handleProductoActualizado?.();
                }, 1000);
            } else {
                setMensaje({ tipo: 'danger', texto: data?.message ?? 'Error al actualizar el producto.' });
            }
        } catch (err) {
            console.error(err);
            setMensaje({ tipo: 'danger', texto: 'Error de conexión con el servidor.' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="superponer">
            <div
                className="card confirmacion"
                style={{ width: 'min(95dvw, 800px)', overflowY: 'auto' }}
            >
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span className="small text-muted">ID: {producto?.ID}</span>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={funcionDeCierreDeFormulario}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Editar producto</h2>

                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} py-1 px-2 small mb-2`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <h4 className="mb-2 mt-1 border-bottom pb-1 small fw-semibold">Información del producto</h4>

                        <div className="mb-2">
                            <label htmlFor="nombre" className="form-label small mb-1">
                                Nombre <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                id="nombre"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-2">
                            <label htmlFor="descripcion" className="form-label small mb-1">Descripción</label>
                            <textarea
                                className="form-control form-control-sm"
                                id="descripcion"
                                name="descripcion"
                                value={form.descripcion}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className="mb-2">
                            <label htmlFor="estado" className="form-label small mb-1">
                                Estado <span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select form-select-sm"
                                id="estado"
                                name="estado"
                                value={form.estado}
                                onChange={handleChange}
                                required
                            >
                                {ESTADOS_VALIDOS.map(e => (
                                    <option key={e} value={e}>{e}</option>
                                ))}
                            </select>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={funcionDeCierreDeFormulario}
                                disabled={enviando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                disabled={enviando}
                            >
                                {enviando ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
