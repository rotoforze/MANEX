import React, { useState } from 'react';
import { useUsers } from "../../context/UserContext.jsx";

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
            const response = await fetch(import.meta.env.VITE_BACKEND + '/fichajes', {
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
        <section className="w-100 mt-3">

            <div className="card shadow-sm w-100">

                {mensaje && (
                    <div className={`alert alert-${mensaje.tipo} mb-0`}>
                        {mensaje.texto}
                    </div>
                )}
                <div className="card-body p-4">

                    <h2 className="text-center mb-4">
                        Nuevo fichaje
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            type="hidden"
                            name="username"
                            defaultValue={user?.username}
                        />

                        <h4 className="mb-4 border-bottom pb-2 text-center">
                            Informacion del fichaje
                        </h4>

                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label htmlFor="fecha_entrada" className="form-label">
                                    Fecha de entrada <span className="text-danger">*</span>
                                </label>

                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    id="fecha_entrada"
                                    name="fecha_entrada"
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="tipo" className="form-label">
                                    Tipo <span className="text-danger">*</span>
                                </label>

                                <select
                                    className="form-select"
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

                        <button
                            className="btn btn-primary w-100"
                            type="submit"
                            disabled={seEstaEnviando}
                        >
                            {seEstaEnviando ? 'Registrando fichaje...' : 'Registrar fichaje'}
                        </button>

                    </form>

                </div>
            </div>

        </section>
    );
}
