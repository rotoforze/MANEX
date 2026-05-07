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
        <navbarConfigProfileLogout>
            <div className="card-body">
                <h5 className="card-title">Usuario</h5>
            </div>
        </navbarConfigProfileLogout>
    )
}
