import React, { useState } from 'react';
import { TablaContratos } from "../components/Contratos/TablaContratos.jsx";
import { NuevoContratoForm } from "../components/Contratos/NuevoContratoForm.jsx";
import '../../public/styles/mainPages.css';
import { useUsers } from "../context/UserContext.jsx";

/**
 * Página de gestión de contratos.
 * Muestra la tabla de contratos y permite crear nuevos.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function Contratos() {
    const [registroVisible, setRegistroVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { tengoPermiso } = useUsers();

    function handleNuevoContrato() {
        setRefreshKey(prevKey => prevKey + 1);
        setRegistroVisible(false);
    }

    return (
        <div className="d-flex flex-column card w-100 h-100 empleados-container">
            <div className="d-flex flex-column align-items-start justify-content-center gap-2 w-100 p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 mb-4 gap-3">
                    <div>
                        <h2 className="fw-bold mb-1">Gestión de contratos</h2>
                        <p className="text-muted mb-0">
                            Administrar los contratos disponibles en la empresa.
                        </p>
                    </div>
                </div>

                <div className="d-flex gap-2 align-items-start justify-content-start top-accion">
                    <button
                        className={"btn top-accion-btn " + (registroVisible ? 'btn-danger' : 'btn-primary')}
                        onClick={() => setRegistroVisible(!registroVisible)}
                        disabled={!tengoPermiso('/contratos', 'POST')}
                    >
                        {registroVisible ? 'Cerrar formulario' : 'Nuevo contrato'}
                    </button>
                    <button
                        className="btn btn-primary top-accion-btn"
                        onClick={() => setRefreshKey(prevKey => prevKey + 1)}
                    >
                        Refrescar panel
                    </button>
                </div>

                {registroVisible && (
                    <NuevoContratoForm
                        funcionDeCierreDeFormulario={() => setRegistroVisible(false)}
                        handleNuevoContrato={handleNuevoContrato}
                    />
                )}
            </div>

            <hr />

            <div className="d-flex flex-column gap-2 w-100 p-4 justify-content-center">
                <TablaContratos key={refreshKey} />
            </div>
        </div>
    );
}