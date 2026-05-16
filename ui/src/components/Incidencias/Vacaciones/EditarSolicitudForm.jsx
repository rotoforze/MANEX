import React, { useState } from 'react';
import { useMensaje } from "../../../hooks/useMensaje.js";
import { useUsers } from "../../../context/UserContext.jsx";
import { apiFetch } from "../../../utils/apiFetch.jsx";
import "../../../../public/styles/tablaPermisos.css";

const ESTADOS_SOLICITUD = [
    'En revisión',
    'Concedido',
    'Rechazado',
];

function obtenerValor(solicitud, claves, valorPorDefecto = '') {
    const valor = claves
        .map((clave) => solicitud?.[clave])
        .find((dato) => dato !== undefined && dato !== null && dato !== '');

    return valor ?? valorPorDefecto;
}

function formatearFechaInput(fecha) {
    return fecha
        ? new Date(fecha).toISOString().split('T')[0]
        : '';
}

export function EditarSolicitudForm({ solicitud, funcionDeCierreDeFormulario, handleSolicitudActualizada }) {

    const { user } = useUsers();
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useMensaje();
    const [form, setForm] = useState({
        id_incidencia: obtenerValor(solicitud, ['id_incidencia', 'ID_INCIDENCIA', 'ID']),
        tipo: obtenerValor(solicitud, ['tipo', 'Tipo']),
        fecha_inicio: formatearFechaInput(obtenerValor(solicitud, ['fecha_inicio', 'Fecha_inicio'], null)),
        fecha_fin: formatearFechaInput(obtenerValor(solicitud, ['fecha_fin', 'Fecha_fin'], null)),
        estado: obtenerValor(solicitud, ['estado', 'Estado'], 'En revisión'),
    });

    function handleChange(event) {
        const { name, value } = event.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setEnviando(true);
        setMensaje(null);

        try {
            const urlSolicitudes = import.meta.env.VITE_BACKEND_SOLICITUDES
                || import.meta.env.VITE_BACKEND_SOLICITUD
                || `${import.meta.env.VITE_BACKEND}/vacaciones`;

            const response = await apiFetch(
                urlSolicitudes,
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

            if (!response.ok) {
                setMensaje({ tipo: 'danger', texto: data?.message || 'No se pudo actualizar la solicitud.' });
                return;
            }

            setMensaje({ tipo: 'success', texto: data?.message || 'Solicitud actualizada correctamente.' });
            setTimeout(() => {
                handleSolicitudActualizada?.();
            }, 700);
        } catch (error) {
            console.error(error);
            setMensaje({ tipo: 'danger', texto: 'Error al actualizar la solicitud.' });
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="superponer">
            <div className="card confirmacion" style={{width: '90dvw', maxWidth: '600px', maxHeight: '90dvh', overflowY: 'auto'}}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Incidencia #{form.id_incidencia}</span>
                    <button
                        type="button"
                        className="bi-x bi btn btn-outline-danger"
                        onClick={funcionDeCierreDeFormulario}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Editar solicitud</h2>

                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} py-1 px-2 small mb-2`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <h4 className="mb-2 mt-1 border-bottom pb-1" style={{fontSize: '0.9rem'}}>
                            Información de la solicitud
                        </h4>

                        <div className="row g-2">
                            <div className="col-md-6 mb-2">
                                <label htmlFor="tipo-editar" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Tipo
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    id="tipo-editar"
                                    value={form.tipo}
                                    readOnly
                                />
                            </div>

                            <div className="col-md-6 mb-2">
                                <label htmlFor="estado-editar" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Estado <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select form-select-sm"
                                    id="estado-editar"
                                    name="estado"
                                    value={form.estado}
                                    onChange={handleChange}
                                    required
                                >
                                    {ESTADOS_SOLICITUD.map((estado) => (
                                        <option key={estado} value={estado}>
                                            {estado}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 mb-2">
                                <label htmlFor="fecha-inicio-editar" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Fecha inicio
                                </label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    id="fecha-inicio-editar"
                                    value={form.fecha_inicio}
                                    readOnly
                                />
                            </div>

                            <div className="col-md-6 mb-2">
                                <label htmlFor="fecha-fin-editar" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Fecha fin
                                </label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    id="fecha-fin-editar"
                                    value={form.fecha_fin}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <button className="btn btn-secondary btn-sm" type="button" onClick={funcionDeCierreDeFormulario}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary btn-sm" type="submit" disabled={enviando}>
                                {enviando ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
