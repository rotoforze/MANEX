import React, { useState } from 'react';
import { useMensaje } from "../../../hooks/useMensaje.js";
import { useUsers } from "../../../context/UserContext.jsx";
import { enviarSolicitud } from "../../../utils/RegisterNewSolicitud.js";
import "../../../../public/styles/tablaPermisos.css";

/**
 *
 * Nueva solicitud
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.0.0
 * @returns {React.JSX.Element}
 * @constructor
 */


export function NuevaSolicitudForm({ funcionDeCierreDeFormulario, handleNuevaSolicitud }) {

    const { user } = useUsers();
    const [seEstaEnviando, setSeEstaEnviando] = useState(false);
    const [mensaje, setMensaje] = useMensaje();
    const hoy = new Date().toISOString().split('T')[0];

    async function handleSubmit(event) {
        event.preventDefault();
        setSeEstaEnviando(true);
        setMensaje(null);

        const form = event.currentTarget;
        const formData = new FormData(form);
        const fechaInicio = formData.get('fecha_inicio');
        const fechaFin = formData.get('fecha_fin');

        if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
            setMensaje({ tipo: 'danger', texto: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
            setSeEstaEnviando(false);
            return;
        }

        const [ok, texto] = await enviarSolicitud(user?.token, {
            id_empleado: user?.id,
            tipo: formData.get('tipo'),
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            comentario: formData.get('comentario'),
            estado: 'En revisión',
        });
        if (ok) {
            form.reset();
            handleNuevaSolicitud();
        } else {
            setMensaje({ tipo: 'danger', texto });
        }
        setSeEstaEnviando(false);
    }

    return (
        <div className="superponer">
            <div className="card confirmacion" style={{width: '90dvw', maxWidth: '600px', maxHeight: '90dvh', overflowY: 'auto'}}>
                <div className="card-header d-flex justify-content-end">
                    <button
                        type="button"
                        className="bi-x bi btn btn-outline-danger"
                        onClick={funcionDeCierreDeFormulario}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Nueva solicitud</h2>

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
                                <label htmlFor="tipo" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Tipo <span className="text-danger">*</span>
                                </label>

                                <select
                                    className="form-select form-select-sm"
                                    id="tipo"
                                    name="tipo"
                                    required
                                >
                                    <option value="">
                                        Selecciona un tipo
                                    </option>

                                    <option value="Permiso de días">
                                        Permiso de días
                                    </option>

                                    <option value="Solicitud de semana de vacaciones">
                                        Solicitud de semana de vacaciones
                                    </option>

                                    <option value="Permiso familiar">
                                        Permiso familiar
                                    </option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-2">
                                <label htmlFor="fecha_inicio" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Fecha inicio <span className="text-danger">*</span>
                                </label>

                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    id="fecha_inicio"
                                    name="fecha_inicio"
                                    min={hoy}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-2">
                                <label htmlFor="fecha_fin" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Fecha fin <span className="text-danger">*</span>
                                </label>

                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    id="fecha_fin"
                                    name="fecha_fin"
                                    min={hoy}
                                    required
                                />
                            </div>

                        </div>

                        <div className="mb-2">
                            <label htmlFor="comentario" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                Descripción <span className="text-danger">*</span>
                            </label>

                            <textarea
                                className="form-control form-control-sm"
                                id="comentario"
                                name="comentario"
                                rows="3"
                                maxLength="60"
                                required
                            ></textarea>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <button className="btn btn-secondary btn-sm" type="button" onClick={funcionDeCierreDeFormulario} disabled={seEstaEnviando}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary btn-sm" type="submit" disabled={seEstaEnviando}>
                                {seEstaEnviando ? 'Registrando...' : 'Registrar'}
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    );
}
