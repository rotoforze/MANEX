import React, { useState } from 'react';
import { useMensaje } from "../../hooks/useMensaje.js";
import { useUsers } from "../../context/UserContext.jsx";
import { enviarIncidencia } from "../../utils/RegisterNewIncidencia.js";
import "../../../public/styles/tablaPermisos.css";

/**
 *
 * Nueva incidencia
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.0.0
 * @constructor
 */
export function NuevaIncidenciaForm({ funcionDeCierreDeFormulario, handleNuevaIncidencia, tipoIncidencia }) {

    const { user } = useUsers();
    const [seEstaEnviando, setSeEstaEnviando] = useState(false);
    const [mensaje, setMensaje] = useMensaje();

    async function handleSubmit(event) {
        event.preventDefault();
        setSeEstaEnviando(true);
        setMensaje(null);

        const formData = new FormData(event.currentTarget);
        const [ok, texto] = await enviarIncidencia(
            user?.token,
            user?.id,
            tipoIncidencia,
            formData.get('observaciones'),
            formData.get('comentario') || '',
        );
        if (ok) {
            handleNuevaIncidencia();
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
                        onClick={() => funcionDeCierreDeFormulario()}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Nueva incidencia</h2>

                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} py-1 px-2 small mb-2`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <h4 className="mb-2 mt-1 border-bottom pb-1" style={{fontSize: '0.9rem'}}>
                            Informacion de la incidencia
                        </h4>

                        <div className="row g-2">
                            <div className="col-12 mb-2">
                                <label htmlFor="observaciones" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Observaciones <span className="text-danger">*</span>
                                </label>

                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    id="observaciones"
                                    name="observaciones"
                                    maxLength="60"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-2">
                            <label htmlFor="comentario" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                Comentario
                            </label>

                            <textarea
                                className="form-control form-control-sm"
                                id="comentario"
                                name="comentario"
                                rows="3"
                                maxLength="60"
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
