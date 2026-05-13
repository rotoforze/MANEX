import React from 'react';
import { useUsers } from "../../../context/UserContext.jsx";
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

    function handleSubmit(event) {
        event.preventDefault();
        handleNuevaSolicitud();
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
                    <h2 className="text-center mb-2">Nueva solicitud</h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            type="hidden"
                            name="token"
                            defaultValue={user?.token}
                        />

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
                                       
                                    </option>

                                    <option value="Vacaciones">
                                        Vacaciones
                                    </option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-2">
                                <label htmlFor="fecha" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Fecha <span className="text-danger">*</span>
                                </label>

                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    id="fecha"
                                    name="fecha"
                                    required
                                />
                            </div>

                        </div>

                        <div className="mb-2">
                            <label htmlFor="descripcion" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                Descripción <span className="text-danger">*</span>
                            </label>

                            <textarea
                                className="form-control form-control-sm"
                                id="descripcion"
                                name="descripcion"
                                rows="3"
                                maxLength="512"
                                required
                            ></textarea>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">

                            <button className="btn btn-primary btn-sm" type="submit">
                                Registrar
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    );
}
