import { useState } from 'react';
import { InfoDashboard } from "../components/Dashboard/InfoDashboard.jsx";
import { InfoDashboardEmpleado } from "../components/Dashboard/InfoDashboardEmpleado.jsx";
import '../../public/styles/mainPages.css';

/**
 * Contenedor principal del Dashboard.
 * Permite alternar entre la vista de administrador y la vista personal del empleado.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @contributor Eneas de la Rosa Menéndez Pedrosa
 * @version 1.2.0
 * @constructor
 */
export function Dashboard() {
    const [vistaEmpleado, setVistaEmpleado] = useState(false);

    return (
        <div className="d-flex flex-column card w-100 h-100 empleados-container">
            <div className="d-flex flex-column align-items-start justify-content-center gap-2 w-100 p-4 pb-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 gap-3">
                    <div>
                        <h2 className="fw-bold mb-1">Dashboard</h2>
                        <p className="text-muted mb-0">
                            {vistaEmpleado ? 'Tu resumen personal.' : 'Resumen general del estado del sistema.'}
                        </p>
                    </div>
                    <button
                        className={`btn top-accion-btn ${vistaEmpleado ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setVistaEmpleado(v => !v)}
                    >
                        <i className={`bi bi-${vistaEmpleado ? 'bar-chart-fill' : 'person-fill'} me-2`} aria-hidden="true"></i>
                        {vistaEmpleado ? 'Vista administrador' : 'Vista empleado'}
                    </button>
                </div>
            </div>
            <hr className="mb-0" />
            <div className="flex-grow-1 w-100 p-4" style={{ overflowY: 'auto' }}>
                {vistaEmpleado ? <InfoDashboardEmpleado /> : <InfoDashboard />}
            </div>
        </div>
    );
}
