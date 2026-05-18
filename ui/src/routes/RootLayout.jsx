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
        window.scrollTo(0, 0);
        // Forzar reflow del viewport en iOS
        document.documentElement.style.height = '';
        requestAnimationFrame(() => {
            document.documentElement.style.height = '100%';
        });
    }, [location.pathname]);

    const PUBLIC_ROUTES = ['/', '/login'];
    useEffect(() => {
        if (isInitialLoading || location.pathname === '/error') return;

        if (user?.username && user?.authenticated && existeCookie()) {
            if (PUBLIC_ROUTES.includes(location.pathname)) {
                navigate('/dashboard');
            }
        } else {
            if (!PUBLIC_ROUTES.includes(location.pathname)) navigate('/login');
        }
    }, [user, isInitialLoading, location.pathname])
    if (isInitialLoading) return <Loading/>;
    if (user?.username && user?.authenticated && existeCookie()) {
        return (
            <div className="app-shell d-flex min-vh-100">
                <MainNav/>
                <main className="app-content">
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