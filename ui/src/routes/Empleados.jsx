import React, {useState} from 'react';
import {SignInForm} from "../components/SignInForm.jsx";
import {TablaEmpleados} from "../components/TablaEmpleados.jsx";
import '../../public/styles/empleados.css';

/**
 *
 * Muestra
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.2.0
 * @constructor
 */
export function Empleados () {

    const [registroVisible, setRegistroVisible] = useState(false);

    return (
        <div className="d-flex flex-column card w-100 h-100 empleados-container">
            <div className={"d-flex flex-column align-items-center justify-content-center gap-2 w-100 p-4"}>
                <h4>Acciones</h4>
                <div className={"d-flex gap-2 align-items-start justify-content-start top-empleados"}>

                    <button className={"btn " + (registroVisible ? 'btn-danger' : 'btn-primary')} onClick={ () => {
                        // muestra el componente de registro
                            setRegistroVisible(!registroVisible);
                    } }> {registroVisible ? 'Cerrar formulario' : 'Nuevo registro' }</button>

                    <button className="btn btn-primary">Refrescar panel</button>
                </div>
                { registroVisible ? <SignInForm funcionDeCierreDeFormulario={setRegistroVisible} /> : <b></b>}
            </div>
            <hr />
            <div className={"d-flex flex-column gap-2 w-100 p-4 justify-content-center overflow-scroll"}>
                <TablaEmpleados />
            </div>
        </div>
    )
}