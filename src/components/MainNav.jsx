import React from 'react'
import { NavLink } from 'react-router'

export const MainNav = () => {
  return (
    <navbar>
      <ul>
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
    </navbar>
  )
}
