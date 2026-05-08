import React, {useState} from 'react';
import {SignInForm} from "../components/SignInForm.jsx";
import {TablaEmpleados} from "../components/TablaEmpleados.jsx";

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
        <div className="d-flex flex-column w-100 flex-grow-1 card" style={{ overflowY: 'auto' }}>
            <div className={"d-flex flex-column align-items-center justify-content-center gap-2 w-100 p-4"}>
                <h4>Acciones</h4>
                <div className={"d-flex gap-2"}>

                    <button className={"btn " + (registroVisible ? 'btn-danger' : 'btn-primary')} onClick={ () => {
                        // muestra el componente de registro
                            setRegistroVisible(!registroVisible);
                    } }> {registroVisible ? 'Cerrar formulario' : 'Nuevo registro' }</button>

                    <button className="btn btn-primary">Refrescar panel</button>
                </div>
                { registroVisible ? <SignInForm /> : ''}
            </div>
            <hr />
            <div className={"d-flex flex-column align-items-center w-100 p-4 flex-grow-1"} style={{ overflowY: 'auto' }}>
                <TablaEmpleados />
            </div>
        </div>
    )
}