import React, {useEffect} from 'react'
import {useUsers} from "../context/UserContext.jsx";
import {NavbarConfigProfileLogout} from "../components/NavbarConfigProfileLogout.jsx";

/**
 *
 * Permite ver y modificar la configuración del usuario dentro de la aplicación.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @constructor
 */
export const Configuration = () => {
    const {user} = useUsers();
    useEffect(() => {
        // buscamos el id del usuario
    }, [])

    return (
        <NavbarConfigProfileLogout>
            <div className="card-body">
                <h5 className="card-title">Ajustes</h5>
            </div>
        </NavbarConfigProfileLogout>
        )
}
