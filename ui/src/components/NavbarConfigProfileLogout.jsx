import { NavLink } from "react-router-dom";
import "../../public/styles/mainPages.css";

/**
 *
 * Barra de navegación del apartado de configuración y perfil. Además, de cerrar sesión.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @constructor
 */
export const NavbarConfigProfileLogout = ({ children }) => {
    return (
        <div className="d-flex flex-column card w-100 h-100 empleados-container">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs justify-content-center flex-wrap">
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

            <div className="card-body overflow-auto">
                {children}
            </div>
        </div>
    )
}
