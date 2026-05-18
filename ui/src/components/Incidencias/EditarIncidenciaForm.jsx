import React, { useState } from 'react';
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { useMensaje } from "../../hooks/useMensaje.js";

/**
 * Formulario de edición de una incidencia existente.
 *
 * @author Covadonga Blanco Alvarez
 * @version 1.0
 * @param {Object}   incidencia                 - Fila de la incidencia tal como llega del listado
 * @param {Function} funcionDeCierreDeFormulario - Cierra el formulario sin guardar
 * @param {Function} handleIncidenciaActualizada - Callback tras actualizacion exitosa
 */
export function EditarIncidenciaForm({incidencia, funcionDeCierreDeFormulario, handleIncidenciaActualizada}) {

    const {user, tengoPermiso} = useUsers();
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useMensaje();

    const BASE = import.meta.env.VITE_BACKEND;

    const fechaISO = (fecha) =>
        fecha ? new Date(fecha).toISOString().split('T')[0] : '';

    const [form, setForm] = useState({
       
        id:  incidencia?.ID               ?? '',
        id_empleado:    incidencia?.ID_empleado
                        ?? incidencia?.id_empleado   ?? '',
        fecha_creacion: fechaISO(incidencia?.fecha_creacion),
        estado:         incidencia?.estado            ?? 'Abierta',
        observaciones:  incidencia?.Observaciones
                        ?? incidencia?.observaciones  ?? '',
        comentario:     incidencia?.Comentario
                        ?? incidencia?.comentario     ?? '',
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
                `${BASE}/incidencias`,
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
                setMensaje({ tipo: 'success', texto: 'Incidencia actualizada correctamente.' });
                setTimeout(() => {
                    handleIncidenciaActualizada?.();
                }, 1000);
            } else {
                setMensaje({tipo: 'danger', texto: data?.message ?? 'Error al actualizar la incidencia.'});
            }
        } catch (err) {
            console.error(err);
            setMensaje({tipo: 'danger', texto: 'Error de conexion con el servidor.'});
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="superponer">
            <div
                className="card confirmacion">
                <div className="card-header d-flex justify-content-end align-items-center">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={funcionDeCierreDeFormulario}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-3">
                    <h2 className="text-center mb-3" style={{fontSize: '1.2rem'}}>Editar incidencia</h2>

                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} py-1 px-2 small mb-2`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* Estado */}
                        {
                            tengoPermiso('/incidencias', 'POST') && tengoPermiso('/incidencias', 'DELETE') &&
                        (<div className="mb-2">
                            <label htmlFor="estado" className="form-label small mb-1">
                                Estado <span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select form-select-sm"
                                id="estado"
                                name="estado"
                                defaultValue={form.estado}
                                onChange={handleChange}
                                required
                            >
                                <option value="Abierta">Abierta</option>
                                <option value="Cerrada">Cerrada</option>

                            </select>
                        </div>)
                        }

                        {/* Observaciones */}
                        <div className="mb-2">
                            <label htmlFor="comentarios" className="form-label small mb-1">
                                Descripción
                            </label>
                            <textarea
                                className="form-control form-control-sm"
                                id="comentarios"
                                name="comentarios"
                                defaultValue={form.comentario}
                                onChange={handleChange}
                                rows={3} disabled={tengoPermiso('/incidencias', 'POST') && tengoPermiso('/incidencias', 'DELETE')}
                                placeholder="Descripcion de la incidencia..."
                            />
                        </div>

                        {/* Comentario */}
                        {
                            tengoPermiso('/incidencias', 'POST') && tengoPermiso('/incidencias', 'DELETE') &&
                            (<div className="mb-2">
                                <label htmlFor="observaciones" className="form-label small mb-1">
                                    Observaciones
                                </label>
                                <textarea
                                    className="form-control form-control-sm"
                                    id="observaciones"
                                    name="observaciones"
                                    defaultValue={form.observaciones}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Comentario interno..."
                                />
                            </div>)
                        }

                        {/* Fecha creacion*/}
                        <div className="mb-3">
                            <label htmlFor="fecha_creacion" className="form-label small mb-1">
                                Fecha de creacion
                            </label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                id="fecha_creacion"
                                name="fecha_creacion"
                                defaultValue={form.fecha_creacion}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2">
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
