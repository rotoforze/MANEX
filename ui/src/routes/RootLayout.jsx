import React, {useEffect} from 'react'
import {MainNav} from '../components/MainNav'
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
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
    const {user} = useUsers();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user?.username && user?.authenticated) {
            if (location.pathname === '/') navigate('/dashboard');
        } else if (!user?.username && !user?.authenticated) {
            if (location.pathname !== '/') navigate('/');
        }
    }, [user?.username, user?.authenticated, location.pathname, navigate])

    return (
        <>

            {user?.username && user?.authenticated ? <MainNav/> : null}
            <Outlet/>

        </>
    )
}
