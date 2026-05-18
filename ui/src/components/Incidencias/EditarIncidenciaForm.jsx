import { useState } from 'react';
import { useMensaje } from "../../hooks/useMensaje.js";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";

const ESTADOS_VALIDOS = ['Abierta', 'Cerrada'];

/**
 * Formulario de edición de una incidencia existente.
 * Envía POST a VITE_BACKEND_INCIDENCIAS con id en el body → actualizar.mjs hace UPDATE.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 * @param {Object}   incidencia                    - Fila de la incidencia tal como llega del listado
 * @param {Function} funcionDeCierreDeFormulario    - Cierra el formulario sin guardar
 * @param {Function} handleIncidenciaActualizada    - Callback tras actualización exitosa
 */
export function EditarIncidenciaForm({ incidencia, funcionDeCierreDeFormulario, handleIncidenciaActualizada }) {

    const { user } = useUsers();

    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useMensaje();

    const [form, setForm] = useState({
        id:             incidencia?.ID             ?? '',
        id_empleado:    incidencia?.ID_empleado    ?? incidencia?.ID_EMPLEADO ?? '',
        fecha_creacion: incidencia?.fecha_creacion
            ? new Date(incidencia.fecha_creacion).toISOString().split('T')[0]
            : '',
        estado:         incidencia?.estado         ?? ESTADOS_VALIDOS[0],
        observaciones:  incidencia?.Observaciones  ?? '',
        comentario:     incidencia?.Comentario     ?? '',
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
                import.meta.env.VITE_BACKEND_INCIDENCIAS || `${import.meta.env.VITE_BACKEND}/incidencias`,
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
                setMensaje({ tipo: 'success', texto: data?.message ?? 'Incidencia actualizada correctamente.' });
                setTimeout(() => {
                    handleIncidenciaActualizada?.();
                }, 1000);
            } else {
                setMensaje({ tipo: 'danger', texto: data?.message ?? 'Error al actualizar la incidencia.' });
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
                    <span className="small text-muted">ID: {incidencia?.ID}</span>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={funcionDeCierreDeFormulario}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Editar incidencia</h2>

                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} py-1 px-2 small mb-2`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <h4 className="mb-2 mt-1 border-bottom pb-1 small fw-semibold">Información de la incidencia</h4>

                        <div className="mb-2">
                            <label htmlFor="fecha_creacion" className="form-label small mb-1">
                                Fecha de creación <span className="text-danger">*</span>
                            </label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                id="fecha_creacion"
                                name="fecha_creacion"
                                value={form.fecha_creacion}
                                onChange={handleChange}
                                required
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

                        <div className="mb-2">
                            <label htmlFor="observaciones" className="form-label small mb-1">
                                Observaciones <span className="text-danger">*</span>
                            </label>
                            <textarea
                                className="form-control form-control-sm"
                                id="observaciones"
                                name="observaciones"
                                value={form.observaciones}
                                onChange={handleChange}
                                rows={3}
                                maxLength={60}
                                required
                            />
                        </div>

                        <div className="mb-2">
                            <label htmlFor="comentario" className="form-label small mb-1">Comentario</label>
                            <textarea
                                className="form-control form-control-sm"
                                id="comentario"
                                name="comentario"
                                value={form.comentario}
                                onChange={handleChange}
                                rows={3}
                                maxLength={60}
                            />
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
