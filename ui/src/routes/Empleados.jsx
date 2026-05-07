import React, {useState} from 'react';
import {SignInForm} from "../components/SignInForm.jsx";

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
        <div className="d-flex flex-column vw-100 vh-100 m-5 card">
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
            <div className={"d-flex flex-column align-items-center justify-content-center gap-2 w-100 p-4"}>
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Apellido</th>
                        <th scope="col">Email</th>
                        <th scope="col">Teléfono</th>
                        <th scope="col">Fecha de nacimiento</th>
                        <th scope="col">Fecha de alta</th>
                        <th scope="col">Departamento</th>
                        <th scope="col">Contrato</th>
                        <th scope="col">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">1</th>
                            <td>Ejemplo</td>
                            <td>Test</td>
                            <td>ejemplo@test.com</td>
                            <td>634490743</td>
                            <td>24-01-2003</td>
                            <td>03-08-2023</td>
                            <td>Administrador</td>
                            <td>1</td>
                            <td className={"d-flex gap-2"}>
                                <button className="btn btn-primary">E</button>
                                <button className="btn btn-danger">X</button>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>
    )
}