import React from 'react'
import { MainNav } from '../components/MainNav'
import { LoginPage } from './LoginPage';
import { Outlet } from 'react-router';

export const RootLayout = () => {
    const authUser = (cookieStore.get('token')).value || '';
    
    // si el usuario ha iniciado sesion, se mete en el outlet
    // la navegacion, si no, carga el login.
    
    return (
        <>
            {authUser ? 
            (<>
            <main>
                <MainNav/>
                <Outlet/>
            </main>
            </>) :
            <LoginPage />
            }
        </>
    )
}
