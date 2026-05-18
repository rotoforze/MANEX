import React, {useState} from 'react'
import {NavLink} from 'react-router-dom'
import {useUsers} from '../context/UserContext.jsx'
import "../../public/styles/Navigation.css";

/**
 * Menú de navegación.
 *
 * Escritorio (>1000px): sidebar lateral izquierdo (comportamiento original).
 * Móvil (≤1000px):
 *   - dept >= 5: barra inferior colapsable con todos los enlaces.
 *   - dept < 5:  barra inferior fija con solo iconos.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @contributor Eneas de la Rosa Menéndez Pedrosa
 * @version 2.1.0
 * @constructor
 */
export const MainNav = () => {
    const {user, tengoPermiso} = useUsers()
    const username = user?.username || 'Usuario'
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const dept = user?.departamento ?? 0

    const toggleMenu = () => setIsMenuOpen(prev => !prev)
    const closeMenu = () => setIsMenuOpen(false)

    const links = [
        {to: '/dashboard', icon: 'bi-house-door', label: 'Inicio', show: true},
        {
            to: '/empleados',
            icon: 'bi-person',
            label: 'Empleados',
            show: tengoPermiso('/empleados', 'POST') || tengoPermiso('/empleados', 'DELETE')
        },
        {
            to: '/productos',
            icon: 'bi-box',
            label: 'Productos',
            show: tengoPermiso('/productos', 'POST') || tengoPermiso('/productos', 'DELETE')
        },
        {
            to: '/contratos',
            icon: 'bi-file-earmark-text',
            label: 'Contratos',
            show: tengoPermiso('/contratos', 'POST') || tengoPermiso('/contratos', 'DELETE')
        },
        {
            to: '/departamentos',
            icon: 'bi-building',
            label: 'Departamentos',
            show: tengoPermiso('/departamentos', 'POST') || tengoPermiso('/departamentos', 'DELETE')
        },
        {
            to: '/fichajes',
            icon: 'bi-stopwatch',
            label: 'Fichajes',
            show: tengoPermiso('/fichajes', 'POST') || tengoPermiso('/fichajes', 'DELETE')
        },
        {
            to: '/incidencia',
            icon: 'bi-question-octagon',
            label: 'Incidencias',
            show: tengoPermiso('/incidencias', 'POST') || tengoPermiso('/incidencias', 'DELETE')
        },
        {
            to: '/solicitudes',
            icon: 'bi-umbrella',
            label: 'Días libres/Vacaciones',
            show: tengoPermiso('/vacaciones', 'POST') || tengoPermiso('/vacaciones', 'DELETE')
        },
    ].filter(l => l.show)

    const navLinkClass = ({isActive}) =>
        `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`

    const userDropdownMenu = (
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
            {
                tengoPermiso('/permisos', 'POST') && tengoPermiso('/permisos', 'DELETE') &&
                (<li>
                    <NavLink className="dropdown-item" to="/configuration" onClick={closeMenu}>
                        Configuración
                    </NavLink>
                </li>)
            }
            <li>
                <NavLink className="dropdown-item" to="/profile" onClick={closeMenu}>
                    Perfil
                </NavLink>
            </li>
            <li>
                <hr className="dropdown-divider"/>
            </li>
            <li>
                <NavLink className="dropdown-item" to="/logout" onClick={closeMenu}>
                    Cerrar sesión
                </NavLink>
            </li>
        </ul>
    )

    return (
        <>
            {/* ── Sidebar lateral (solo escritorio) ── */}
            <aside
                className={`main-nav d-flex flex-column flex-shrink-0 p-3 text-white bg-dark ${isMenuOpen ? 'menu-open' : ''}`}
            >
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
                        <i className={`bi ${isMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true"/>
                    </button>
                </div>

                <hr/>

                <ul className="nav nav-pills flex-column mb-auto">

                    <li className="nav-item">
                        {links.map(link => (
                            <NavLink
                                key={link.to}
                                className={navLinkClass}
                                to={link.to}
                                end
                                onClick={closeMenu}
                            >
                                <i className={`bi ${link.icon} me-2`} aria-hidden="true"/>
                                {link.label}
                            </NavLink>
                        ))}
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
                        <span
                            className="main-nav-avatar rounded-circle me-2 d-inline-flex align-items-center justify-content-center">
                            {username.charAt(0).toUpperCase()}
                        </span>
                        <strong>{username}</strong>
                    </button>
                    {userDropdownMenu}
                </div>
            </aside>

            {/* ── Barra inferior móvil: colapsable (dept >= 5) ── */}
            {dept >= 5 && (
                <nav className="bottom-nav-admin bg-dark text-white">
                    {isMenuOpen && (
                        <div className="bottom-nav-panel">
                            <ul className="nav nav-pills flex-column p-3 mb-0">
                                {links.map(link => (
                                    <li key={link.to} className="nav-item">
                                        <NavLink
                                            className={({isActive}) =>
                                                `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`
                                            }
                                            to={link.to}
                                            end
                                            onClick={closeMenu}
                                        >
                                            <i className={`bi ${link.icon} me-2`} aria-hidden="true"/>
                                            {link.label}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="bottom-nav-bar d-flex align-items-center justify-content-between px-3">
                        <NavLink
                            className="text-white text-decoration-none fw-bold fs-5"
                            to="/dashboard"
                            onClick={closeMenu}
                        >
                            MANEX
                        </NavLink>
                        <button
                            className="btn btn-link text-white p-1"
                            onClick={toggleMenu}
                            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        >
                            <i className={`bi ${isMenuOpen ? 'bi-chevron-down' : 'bi-chevron-up'} fs-5`}
                               aria-hidden="true"/>
                        </button>
                        <div className="dropup">
                            <button
                                className="btn btn-link d-flex align-items-center text-white text-decoration-none dropdown-toggle p-0"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <span
                                    className="main-nav-avatar rounded-circle me-2 d-inline-flex align-items-center justify-content-center">
                                    {username.charAt(0).toUpperCase()}
                                </span>
                                <strong className="d-none d-sm-inline">{username}</strong>
                            </button>
                            {userDropdownMenu}
                        </div>
                    </div>
                </nav>
            )}

            {/* ── Barra inferior móvil: solo iconos (dept < 5) ── */}
            {dept < 5 && (
                <nav className="bottom-nav-icons bg-dark text-white">
                    <div className="d-flex align-items-center justify-content-around h-100 px-2">
                        {links.map(link => (
                            <NavLink
                                key={link.to}
                                className={({isActive}) =>
                                    `bottom-icon-link d-flex flex-column align-items-center ${isActive ? 'active' : ''}`
                                }
                                to={link.to}
                                end
                                title={link.label}
                                aria-label={link.label}
                            >
                                <i className={`bi ${link.icon} fs-5`} aria-hidden="true"/>
                            </NavLink>
                        ))}
                        <div className="dropup">
                            <button
                                className="btn btn-link bottom-icon-link d-flex flex-column align-items-center p-0"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                title={username}
                                aria-label="Menú de usuario"
                            >
                                <span
                                    className="main-nav-avatar-sm rounded-circle d-inline-flex align-items-center justify-content-center">
                                    {username.charAt(0).toUpperCase()}
                                </span>
                            </button>
                            {userDropdownMenu}
                        </div>
                    </div>
                </nav>
            )}
        </>
    )
}
