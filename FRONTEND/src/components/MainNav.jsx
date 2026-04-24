import React from 'react'
import { NavLink } from 'react-router'
import '../../public/styles/Navigation.css'

/**
 *
 * Barra de navegación.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @contributor Eneas Menéndez
 * @change Se restauró la implementación original del componente.
 * @reason Mantener el diseño de navegación original del proyecto.
 * @version 1.0.6
 * @constructor
 */
export const MainNav = () => {
  return (
    <nav>
      <ul>
        <li className="logo-text">MANEX</li>
        <li>
          <NavLink to={'/dashboard'}
            className={({ isActive }) => (isActive ? 'activo' : undefined) + " btn-navlink"}>
            Inicio
          </NavLink>
        </li>
        <li>
          <NavLink to={'/dashboard'}
            className={({ isActive }) => (isActive ? 'activo' : undefined) + " btn-navlink"}>
            TBD
          </NavLink>
        </li>
        <li>
          <NavLink to={'/dashboard'} 
          className={({ isActive }) => (isActive ? 'activo' : undefined) + " btn-navlink"}>
          TBD
          </NavLink>
        </li>
        <li></li>
      </ul>
    </nav>
  )
}
