import React, {useEffect} from 'react'
import {MainNav} from '../components/MainNav'
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useUsers} from "../context/UserContext.jsx";
import {Loading} from "../components/Loading.jsx";

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
    const {user, isInitialLoading} = useUsers();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isInitialLoading || location.pathname === '/error') return;

        if (user?.username && user?.authenticated && existeCookie()) {
            if (location.pathname === '/') {
                navigate('/dashboard');
            }
        } else {
            if (location.pathname !== '/') navigate('/');
        }
    }, [user, isInitialLoading, location.pathname])
    if (isInitialLoading) return <Loading/>;
    if (user?.username && user?.authenticated  && existeCookie()) {
        return (
            <div className="app-shell d-flex min-vh-100">
                <MainNav/>
                <main className="app-content overflow-scroll">
                    <Outlet/>
                </main>
            </div>
        )
    }

    return <Outlet/>
}

function existeCookie() {
    return document.cookie.split('; ').some(cookie => cookie.startsWith('token='));
}