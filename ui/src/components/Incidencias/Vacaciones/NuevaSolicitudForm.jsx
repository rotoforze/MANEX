import React from 'react';
import { useUsers } from "../../../context/UserContext.jsx";

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

    function handleSubmit(event) {
        event.preventDefault();
        handleNuevaSolicitud();
    }

    return (
        <section className="w-100 mt-3">

            <div className="card shadow-sm w-100">
                <div className="card-body p-4">

                    <h2 className="text-center mb-4">
                        Nueva solicitud
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            type="hidden"
                            name="token"
                            defaultValue={user?.token}
                        />

                        <h4 className="mb-4 border-bottom pb-2 text-center">
                        Informacion de la solicitud
                    </h4>

                        <div className="row">

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

                                    <option value="Vacaciones">
                                        Vacaciones
                                    </option>

                                    <option value="Permiso">
                                        Permiso
                                    </option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="fecha" className="form-label">
                                    Fecha <span className="text-danger">*</span>
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    id="fecha"
                                    name="fecha"
                                    required
                                />
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
                            Registrar solicitud
                        </button>

                    </form>

                </div>
            </div>

        </section>
    );
}
