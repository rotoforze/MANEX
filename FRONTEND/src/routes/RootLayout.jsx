import React from 'react'
import { MainNav } from '../components/MainNav'
import { Outlet, useNavigate } from 'react-router-dom';
import {useUsers} from "../context/UserContext.jsx";

/**
 *
 * Siempre se muestra este componente. Muestra el outlet y el MainNav (Solo si el usuario se ha logeado)
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.2.0
 * @constructor
 */
export const RootLayout = () => {
    const { user } = useUsers();
    const navigate = useNavigate();

    if (user?.token) navigate('/');

    return (
        <>

            {user?.token && user?.username ? <MainNav /> : null}
            <Outlet />

        </>
    )
}
