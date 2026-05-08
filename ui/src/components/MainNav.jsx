import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useUsers } from '../context/UserContext.jsx'
import {Empleados} from "../routes/Empleados.jsx";

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
 * @version 1.1.2 06/05/2026
 * @constructor
 */
export const MainNav = () => {
    const {user} = useUsers()
    const username = user?.username || 'Usuario'
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    
    const navLinkClass = ({isActive}) =>
        `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

  return (
    <aside className={`main-nav d-flex flex-column flex-shrink-0 p-3 text-white bg-dark fixed-left ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="d-flex align-items-center justify-content-between mb-3 mobile-menu-header">
        <NavLink
          className="d-flex align-items-center text-white text-decoration-none"
          to="/dashboard"
          onClick={closeMenu}
        >
          <span className="fs-4 fw-bold">MANEX</span>
        </NavLink>
        <button
          className="btn btn-link text-white p-0 menu-toggle-btn"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <i className={`bi ${isMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" />
        </button>
      </div>

      <hr/>

      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <NavLink className={navLinkClass} to="/dashboard" end onClick={closeMenu}>
            <i className="bi bi-house-door me-2" aria-hidden="true" />
            Inicio
          </NavLink>
          <NavLink className={navLinkClass} to="/Empleados" end onClick={closeMenu}>
            <i className="bi bi-person me-2" aria-hidden="true" />
            Empleados
          </NavLink>
        </li>
      </ul>

            <hr/>

      <div id="desplegableUsuario" className="dropup">
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
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow " aria-labelledby="dropdownUser1">
          <li>
            <NavLink className="dropdown-item" to="/configuration" onClick={closeMenu}>
              Configuración
            </NavLink>
          </li>

          <li>
            <NavLink className="dropdown-item" to="/profile" onClick={closeMenu}>
              Perfil
            </NavLink>
          </li>

          <li>
            <hr className="dropdown-divider" />
          </li>

          <li>
            <NavLink className="dropdown-item" to="/logout" onClick={closeMenu}>
              Cerrar sesión
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  )
}
