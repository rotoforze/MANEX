import React, { useEffect } from 'react'
import { MainNav } from '../components/MainNav'
import { Outlet, useNavigate } from 'react-router';

export const RootLayout = () => {
    const authUser = (cookieStore.get('token')).value || '';
    const navigate = useNavigate();
    useEffect(() => {
        if (!authUser) navigate('/');
    }, [authUser])
    // si el usuario ha iniciado sesion, se mete en el outlet y carga
    // la navegacion, si no, carga solo el login.

    return (
        <>
            <main>
                {authUser ? <MainNav /> : null}
                <Outlet />
            </main>
        </>
    )
}
