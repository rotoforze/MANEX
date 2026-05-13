import React, { useState } from 'react';
import { useUsers } from "../../context/UserContext.jsx";
import {apiFetch} from "../../utils/apiFetch.jsx";
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
    const [mensaje, setMensaje] = useState(null);

    async function handleSubmit(event) {
        event.preventDefault();
        setSeEstaEnviando(true);
        setMensaje(null);

        const formData = new FormData(event.currentTarget);
        const datos = new URLSearchParams(formData);

        try {
            const response = await apiFetch(import.meta.env.VITE_BACKEND + '/fichajes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'token': user?.token
                },
                body: datos
            });

            const data = await response.json();

            if (!response.ok) {
                setMensaje({ tipo: 'danger', texto: data?.message || 'No se pudo registrar el fichaje.' });
                return;
            }

            handleNuevoFichaje();
        } catch (error) {
            console.error(error);
            setMensaje({ tipo: 'danger', texto: 'Error al registrar el fichaje.' });
        } finally {
            setSeEstaEnviando(false);
        }
    }

    return (
        <div className="superponer">
            <div className="card confirmacion" style={{width: '90dvw', maxWidth: '600px', maxHeight: '90dvh', overflowY: 'auto'}}>
                <div className="card-header d-flex justify-content-end">
                    <button className={"bi-x bi btn btn-outline-danger"} onClick={() => {
                        funcionDeCierreDeFormulario();
                    }}></button>
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Nuevo fichaje</h2>

                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} alert-sm`} style={{padding: '0.25rem 0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem'}}>
                            {mensaje.texto}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <input
                            type="hidden"
                            name="username"
                            defaultValue={user?.username}
                        />

                        <h4 className="mb-2 mt-1 border-bottom pb-1" style={{fontSize: '0.9rem'}}>
                            Información del fichaje
                        </h4>

                        <div className="row g-2">

                            <div className="col-md-6 mb-2">
                                <label htmlFor="fecha_entrada" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Fecha de entrada <span className="text-danger">*</span>
                                </label>

                                <input
                                    type="datetime-local"
                                    className="form-control form-control-sm"
                                    id="fecha_entrada"
                                    name="fecha_entrada"
                                    required
                                />
                            </div>

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

                                    <option value="Presencial">
                                        Presencial
                                    </option>

                                    <option value="Teletrabajo">
                                        Telematico
                                    </option>
                                </select>
                            </div>

                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">
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
