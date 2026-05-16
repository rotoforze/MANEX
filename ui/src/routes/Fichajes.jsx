import React, {useEffect, useState} from 'react';
import { NuevoFichajeForm } from "../components/Fichajes/NuevoFichajeform.jsx";
import { TablaFichajes } from "../components/Fichajes/TablaFichajes.jsx";
import '../../public/styles/mainPages.css';

/**
 *
 * Dashboard principal para el control de incidencias.
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.0.0
 * @constructor
 */
export function Fichajes() {

    const [registroVisible, setRegistroVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [fichajeActivo, setFichajeActivo] = useState(false);

    function handleNuevoFichaje() {
        setRefreshKey(prev => prev + 1);
        setRegistroVisible(false);
    }

    return (
        <div className="d-flex flex-column card w-100 h-100 empleados-container">

            <div className="d-flex flex-column align-items-start justify-content-center gap-2 w-100 p-4">

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 mb-4 gap-3">

                    <div>
                        <h2 className="fw-bold mb-1">Gestión de fichajes</h2>
                        <p className="text-muted mb-0">
                            Control de entradas y salidas del personal.
                        </p>
                    </div>

                </div>

                <div className="d-flex gap-2 align-items-start justify-content-start top-accion">
                    <button
                        className={"btn top-accion-btn " + (registroVisible || fichajeActivo > 0 ? 'btn-danger' : 'btn-primary')}
                        onClick={fichajeActivo > 0 ? undefined : () => setRegistroVisible(!registroVisible)}
                    >
                        {fichajeActivo > 0 ? 'Finalizar turno' : 'Nuevo fichaje'}
                    </button>
                    <button
                        className="btn btn-primary top-accion-btn"
                        onClick={() => setRefreshKey(prev => prev + 1)}
                    >
                        Refrescar panel
                    </button>
                </div>

                {registroVisible && (
                    <NuevoFichajeForm
                        funcionDeCierreDeFormulario={() => setRegistroVisible(false)}
                        handleNuevoFichaje={handleNuevoFichaje}
                    />
                )}

            </div>

            <hr />

            <div className="d-flex flex-column gap-2 w-100 p-4 justify-content-center overflow-scroll">
                <TablaFichajes key={refreshKey} setFichajeActivo={setFichajeActivo} />
            </div>

        </div>
    );
}
