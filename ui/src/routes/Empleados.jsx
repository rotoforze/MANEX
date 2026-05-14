import React, { useState } from 'react';
import { SignInForm } from "../components/Empleados/SignInForm.jsx";
import { TablaEmpleados } from "../components/Empleados/TablaEmpleados.jsx";
import '../../public/styles/mainPages.css';
import {useUsers} from "../context/UserContext.jsx";

/**
 *
 * Muestra
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.2.0
 * @constructor
 */
export function Empleados() {

    const [registroVisible, setRegistroVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const {user, tengoPermiso} = useUsers();

    function handleNuevoRegistro() {
        setRefreshKey(prevKey => prevKey + 1);
        setRegistroVisible(false);
    }

    return (
        <div className="d-flex flex-column card w-100 h-100 empleados-container">
            <div className={"d-flex flex-column align-items-start justify-content-center gap-2 w-100 p-4"}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 mb-4 gap-3">

                    <div>
                        <h2 className="fw-bold mb-1">
                            Gestión de empleados
                        </h2>

                        <p className="text-muted mb-0">
                            Administrar y revisar la información de los empleados.
                        </p>
                    </div>

                </div>
                <div className={"d-flex gap-2 align-items-start justify-content-start top-empleados"}>

                    <button className={"btn " + (registroVisible ? 'btn-danger' : 'btn-primary')} onClick={() => {
                        // muestra el componente de registro
                        setRegistroVisible(!registroVisible);
                    }} disabled={!tengoPermiso('/empleados', 'POST')}> {registroVisible ? 'Cerrar formulario' : 'Nuevo registro'}</button>

                    <button className="btn btn-primary" onClick={() => {
                        setRefreshKey(prevKey => prevKey + 1);
                    }}>Refrescar panel</button>
                </div>
                {registroVisible ? <SignInForm funcionDeCierreDeFormulario={setRegistroVisible} handleNuevoRegistro={handleNuevoRegistro} /> : <b></b>}
            </div>
            <hr />
            <div className={"d-flex flex-column gap-2 w-100 p-4 justify-content-center overflow-scroll"}>
                <TablaEmpleados key={refreshKey} />
            </div>
        </div>
    )
}