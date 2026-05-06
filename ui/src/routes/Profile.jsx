import React, {useEffect} from 'react'
import {useUsers} from "../context/UserContext.jsx";
import {NavLink} from "react-router-dom";


export const Profile = () => {
    const {user} = useUsers();
    useEffect(() => {
        // buscamos el id del usuario
        try {
            fetch(import.meta.env.VITE_BACKEND_EMPLEADO + user?.id,
                {method: 'GET', headers: {'Content-Type': 'application/json'}})
                .then((response) => response.json())
        } catch (error) {
            console.error(error);
        }
    }, [])

    return (
        <div>
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
                    <h5 className="card-title">nombre completo</h5>

                </div>
            </div>
        </div>)
}
