import React from 'react'
import {NavLink} from 'react-router-dom'
import {useUsers} from '../context/UserContext.jsx'

/**
 *
 * Menu lateral de navegacion.
 *
 * La visibilidad de las opciones depende del nivel de permisos
 * del usuario que haya iniciado sesion.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @contributor Eneas de la Rosa Menéndez Pedrosa
 * @version 1.1.1 06/05/2026
 * @constructor
 */
export const MainNav = () => {
    const {user} = useUsers()
    const username = user?.username || 'Usuario'
    const navLinkClass = ({isActive}) =>
        `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`

    return (
        <aside className="main-nav sticky-top d-flex flex-column flex-shrink-0 p-3 text-white bg-dark">
            <NavLink
                className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
                to="/dashboard"
            >
                <i className="bi bi-box-seam fs-2 me-2" aria-hidden="true"/>
                <span className="fs-4">MANEX</span>
            </NavLink>

            <hr/>

            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <NavLink className={navLinkClass} to="/dashboard" end>
                        <i className="bi bi-house-door me-2" aria-hidden="true"/>
                        Inicio
                    </NavLink>
                </li>
            </ul>

            <hr/>

            <div className="dropup">
                <button
                    className="btn btn-link d-flex align-items-center text-white text-decoration-none dropdown-toggle p-0"
                    id="dropdownUser1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
          <span className="main-nav-avatar rounded-circle me-2 d-inline-flex align-items-center justify-content-center">
            {username.charAt(0).toUpperCase()}
          </span>
                    <strong>{username}</strong>
                </button>
                <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                    <li>
                        <NavLink className="dropdown-item" to="/profile">
                            Perfil
                        </NavLink>
                    </li>
                </ul>
            </div>
        </aside>
    )
}