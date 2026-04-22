import React, { useEffect } from 'react'
import { MainNav } from '../components/MainNav'
import { Outlet, useNavigate } from 'react-router-dom';
import {useUsers} from "../context/UserContext.jsx";

/**
 *
 * Siempre se muestra este componente. Muestra el outlet y el MainNav (Solo si el usuario se ha logeado)
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @contributor Eneas Menéndez
 * @change Se movió la navegación a un useEffect.
 * @reason Evitar navegación durante el render y reducir renderizados innecesarios.
 * @version 1.2.0
 * @constructor
 */
export const RootLayout = () => {
    const { user } = useUsers();
    const navigate = useNavigate();

    useEffect(() => {
        if (user.token) navigate('/');
    }, [navigate, user.token]);

    return (
        <>

            {!user.token && user.token !== undefined ? <MainNav /> : null}
            <Outlet />

        </>
    )
}
