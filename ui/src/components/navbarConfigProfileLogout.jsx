import React, {useEffect} from 'react'
import {useUsers} from "../context/UserContext.jsx";
import {NavLink} from "react-router-dom";

/**
 *
 * Barra de navegación del apartado de configuración y perfil. Además, de cerrar sesión.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @constructor
 */
export const navbarConfigProfileLogout = ( {children} ) => {
    return (
        <div className={"container-fluid justify-content-center mt-4"}>
            <div className="card text-center">
                <div className="card-header">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/profile">
                                Perfil
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/configuration">
                                Configuración
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link text-danger" to="/logout">
                                Cerrar sesión
                            </NavLink>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    { children }
                </div>
            </div>
        </div>)
}
