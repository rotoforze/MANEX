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
            <div className="flex-grow-1 w-100 p-4" style={{ overflowY: 'auto' }}>
                {vistaEmpleado ? <InfoDashboardEmpleado /> : <InfoDashboard />}
            </div>
        </div>
    );
}
