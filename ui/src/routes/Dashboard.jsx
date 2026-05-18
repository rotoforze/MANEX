import { InfoDashboard } from "../components/Dashboard/InfoDashboard.jsx";
import '../../public/styles/mainPages.css';
import {useEffect} from "react";

/**
 * Contenedor del Dashboard.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @contributor Eneas de la Rosa Menéndez Pedrosa
 * @version 3.0.0
 * @constructor
 */
export function Dashboard() {
    return (
        <div className="d-flex flex-column card w-100 h-100 empleados-container" style={{ overflowY: 'auto' }}>
            <InfoDashboard />
        </div>
    );
}
