import React, {useEffect} from 'react'
import {deleteTokenCookie} from "../utils/AuthUser.js";
import {useNavigate} from "react-router-dom";
import {useUsers} from "../context/UserContext.jsx";

/**
 *
 * Página para hacer log-out
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @constructor
 */
export const Logout = () => {

    const {user} = useUsers();
    // para cerrar sesión basta con borrar la cookie y reiniciar la página.
    useEffect(() => {
        if (user?.token) deleteTokenCookie();
        window.location.replace('/login');
    }, [])

    return (
        <div>
            <p>
                Cerrando sesión...
            </p>
        </div>
    )
}