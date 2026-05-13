import React from 'react';
import { useUsers } from "../../context/UserContext.jsx";
import "../../../public/styles/tablaPermisos.css";

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
        <div className="superponer">
            <div className="card confirmacion" style={{width: '90dvw', maxWidth: '600px', maxHeight: '90dvh', overflowY: 'auto'}}>
                <div className="card-header d-flex justify-content-end">
                    <button className={"bi-x bi btn btn-outline-danger"} onClick={() => {
                        funcionDeCierreDeFormulario();
                    }}></button>
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Nueva incidencia</h2>

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

                        <h4 className="mb-2 mt-1 border-bottom pb-1" style={{fontSize: '0.9rem'}}>
                            Información de la incidencia
                        </h4>

                        <div className="row g-2">

                            <div className="col-md-6 mb-2">
                                <label htmlFor="titulo" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Titulo <span className="text-danger">*</span>
                                </label>

                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    id="titulo"
                                    name="titulo"
                                    required
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label htmlFor="estado" className="form-label mb-1" style={{fontSize: '0.85rem'}}>
                                    Estado <span className="text-danger">*</span>
                                </label>

                                <select
                                    className="form-select form-select-sm"
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
