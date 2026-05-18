import React, { useState } from 'react';
import { useMensaje } from "../../hooks/useMensaje.js";
import { useUsers } from "../../context/UserContext.jsx";
import { enviarFichaje } from "../../utils/RegisterNewFichaje.js";
import "../../../public/styles/tablaPermisos.css";

/**
 *
 * Nuevo fichaje
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.0.0
 * @constructor
 */


export function NuevoFichajeForm({ funcionDeCierreDeFormulario, handleNuevoFichaje }) {

    const { user } = useUsers();
    const [seEstaEnviando, setSeEstaEnviando] = useState(false);
    const [mensaje, setMensaje] = useMensaje();

    async function handleSubmit(event) {
        event.preventDefault();
        setSeEstaEnviando(true);
        setMensaje(null);

        const form = event.currentTarget;
        const formData = new FormData(form);
        const [ok, texto] = await enviarFichaje(user?.token, user?.username, formData.get('tipo') || '');
        if (ok) {
            form.reset();
            handleNuevoFichaje();
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
                    <h2 className="text-center mb-2">Nuevo fichaje</h2>

                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} alert-sm`} style={{padding: '0.25rem 0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem'}}>
                            {mensaje.texto}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <h4 className="mb-2 mt-1 border-bottom pb-1" style={{fontSize: '0.9rem'}}>
                            Información del fichaje
                        </h4>

                        <div className="row g-2">

                            <div className="col-12 mb-2">
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

                                    <option value="Presencial">
                                        Presencial
                                    </option>

                                    <option value="Remoto">
                                        Remoto
                                    </option>
                                </select>
                            </div>

                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <button
                                className="btn btn-secondary btn-sm"
                                type="button"
                                onClick={funcionDeCierreDeFormulario}
                                disabled={seEstaEnviando}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                type="submit"
                                disabled={seEstaEnviando}
                            >
                                {seEstaEnviando ? 'Registrando...' : 'Registrar'}
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    );
}
