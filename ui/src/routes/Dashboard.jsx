import React from 'react';
import { InfoDashboard } from "../components/Dashboard/InfoDashboard.jsx";
import '../../public/styles/mainPages.css';

/**
 * Contenedor principal del Dashboard.
 * Muestra un resumen general del estado del sistema.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.1.0
 * @constructor
 */
export function Dashboard() {
    return (
        <div className="d-flex flex-column card w-100 h-100 empleados-container">
            <div className="d-flex flex-column align-items-start justify-content-center gap-2 w-100 p-4 pb-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 gap-3">
                    <div>
                        <h2 className="fw-bold mb-1">Dashboard</h2>
                        <p className="text-muted mb-0">
                            Resumen general del estado del sistema.
                        </p>
                    </div>
                </div>
            </div>
            <hr className="mb-0" />
            <div className="flex-grow-1 w-100 p-4" style={{ overflowY: 'auto' }}>
                <InfoDashboard />
            </div>
        </div>
    );
}
