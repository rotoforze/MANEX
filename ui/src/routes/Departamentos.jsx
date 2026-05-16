import React, { useState } from 'react';
import { TablaDepartamentos } from "../components/Departamentos/TablaDepartamentos.jsx";
import { NuevoDepartamentoForm } from "../components/Departamentos/NuevoDepartamentoForm.jsx";
import { useUsers } from "../context/UserContext.jsx";
import '../../public/styles/mainPages.css';

/**
 * Página de gestión de departamentos.
 * Muestra la tabla de departamentos y permite crear nuevos.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @returns {React.JSX.Element}
 */
export function Departamentos() {
    const [registroVisible, setRegistroVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { tengoPermiso } = useUsers();

    function handleNuevoDepartamento() {
        setRefreshKey(prevKey => prevKey + 1);
        setRegistroVisible(false);
    }

    return (
        <div className="d-flex flex-column card w-100 h-100 empleados-container">
            <div className="d-flex flex-column align-items-start justify-content-center gap-2 w-100 p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 mb-4 gap-3">
                    <div>
                        <h2 className="fw-bold mb-1">Gestión de departamentos</h2>
                        <p className="text-muted mb-0">
                            Administrar los departamentos disponibles en la empresa.
                        </p>
                    </div>
                </div>

                <div className="d-flex gap-2 align-items-start justify-content-start top-accion">
                    <button
                        className={"btn top-accion-btn " + (registroVisible ? 'btn-danger' : 'btn-primary')}
                        onClick={() => setRegistroVisible(!registroVisible)}
                        disabled={!tengoPermiso('/departamentos', 'POST')}
                    >
                        {registroVisible ? 'Cerrar formulario' : 'Nuevo departamento'}
                    </button>
                    <button
                        className="btn btn-primary top-accion-btn"
                        onClick={() => setRefreshKey(prevKey => prevKey + 1)}
                    >
                        Refrescar panel
                    </button>
                </div>

                {registroVisible && (
                    <NuevoDepartamentoForm
                        funcionDeCierreDeFormulario={() => setRegistroVisible(false)}
                        handleNuevoDepartamento={handleNuevoDepartamento}
                    />
                )}
            </div>

            <hr />

            <div className="d-flex flex-column gap-2 w-100 p-4 justify-content-center">
                <TablaDepartamentos key={refreshKey} />
            </div>
        </div>
    );
}
