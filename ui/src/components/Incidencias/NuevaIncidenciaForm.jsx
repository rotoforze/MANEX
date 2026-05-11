import React from 'react';
import { useUsers } from "../../context/UserContext.jsx";

/**
 *
 * Nueva incidencia
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.0.0
 * @returns {React.JSX.Element}
 * @constructor
 */


export function NuevaIncidenciaForm({ funcionDeCierreDeFormulario, handleNuevaIncidencia, tipoIncidencia }) {

    const { user } = useUsers();

    function handleSubmit(event) {
        event.preventDefault();
        handleNuevaIncidencia();
    }

    return (
        <section className="w-100 mt-3">

            <div className="card shadow-sm w-100">
                <div className="card-body p-4">

                    <h2 className="text-center mb-4">
                        Nueva incidencia
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            type="hidden"
                            name="token"
                            defaultValue={user?.token}
                        />

                        <input
                            type="hidden"
                            name="tipo"
                            defaultValue={tipoIncidencia}
                        />

                        <h4 className="mb-4 border-bottom pb-2 text-center">
                            Informacion de la incidencia
                        </h4>

                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label htmlFor="titulo" className="form-label">
                                    Titulo <span className="text-danger">*</span>
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    id="titulo"
                                    name="titulo"
                                    required
                                />
                            </div>

                            <div className="col-md-3 mb-3">
                                <label htmlFor="prioridad" className="form-label">
                                    Prioridad <span className="text-danger">*</span>
                                </label>

                                <select
                                    className="form-select"
                                    id="prioridad"
                                    name="prioridad"
                                    required
                                >
                                    <option value="">
                                        Selecciona
                                    </option>

                                    <option value="Baja">
                                        Baja
                                    </option>

                                    <option value="Media">
                                        Media
                                    </option>

                                    <option value="Alta">
                                        Alta
                                    </option>
                                </select>
                            </div>

                            <div className="col-md-3 mb-3">
                                <label htmlFor="estado" className="form-label">
                                    Estado <span className="text-danger">*</span>
                                </label>

                                <select
                                    className="form-select"
                                    id="estado"
                                    name="estado"
                                    defaultValue="Pendiente"
                                    required
                                >
                                    <option value="Pendiente">
                                        Pendiente
                                    </option>

                                    <option value="En proceso">
                                        En proceso
                                    </option>

                                    <option value="Resuelta">
                                        Resuelta
                                    </option>
                                </select>
                            </div>

                        </div>

                        <div className="mb-3">
                            <label htmlFor="descripcion" className="form-label">
                                Descripcion <span className="text-danger">*</span>
                            </label>

                            <textarea
                                className="form-control w-100 p-2"
                                id="descripcion"
                                name="descripcion"
                                rows="5"
                                maxLength="512"
                                required
                            ></textarea>
                        </div>

                        <button className="btn btn-primary w-100" type="submit">
                            Registrar incidencia
                        </button>

                    </form>

                </div>
            </div>

        </section>
    );
}
