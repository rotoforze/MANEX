import React, {createContext, useContext, useState, useEffect} from 'react'
import {authUser} from '../utils/AuthUser'

const UserContext = createContext();

/**
 *  Da acceso a todos los hijos de su etiqutea.
 *
 * @param { Object } children
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @constructor
 */
export function UserProvider({children}) {

    const [user, setUser] = useState({
        username: '',
        id: '',
        departamento: 0,
        token: getCookie('token') || '',
        authenticated: false,
    });

    const [isInitialLoading, setIsInitialLoading] = useState(true);

    /**
     * Comprueba si la cookie existe en el navegador, si existe, manda el formulario con
     * la cookie.
     *
     * @author Alex Bernardos Gil
     * @version 1.2.0
     * @returns {Promise<boolean>}
     */
    const autoLogin = async () => {
        const token = getCookie('token');
        if (!token) return;

        const result = await authUser(null, null, false, token);
        if (result?.success) {
            setUser({
                username: result.username,
                id: result.id,
                departamento: result.department,
                token,
                authenticated: true
            });
            return true;
        }
        return false;
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        autoLogin().finally(() => setIsInitialLoading(false));
    }, []);

    /**
     *
     * Crea o actualiza el objeto del usuario.
     *
     * @param {String} username
     * @param {String} token
     * @author Alex Bernardos Gil
     * @version 1.1.0
     */
    function changeUserInformation(username = undefined, id = undefined, token = window?.token?.value, departamento = undefined, authenticated = false) {
        setUser({
            username: username || user.username,
            token: token || user.token,
            departamento: departamento || user.departamento,
            id: id || user.id,
            authenticated: authenticated || user.authenticated
        })
    }


    return (
        <UserContext.Provider
            value={{user, changeUserInformation, isInitialLoading}}>
            {children}
        </UserContext.Provider>
    )
}

/**
 *
 * Devuelve useContext del user.
 *
 * @returns {useContext}
 * @author Alex Bernardos Gil
 * @version 1.0.0
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useUsers() {
    return useContext(UserContext);
}

/**
 *
 * Devuelve el token que tenga el navegador.
 *
 * @returns {String}
 * @author Alex Bernardos Gil
 * @version 1.0.0
 */
// eslint-disable-next-line react-refresh/only-export-components
export function loaderAuthTokenCookie() {
    return getCookie('token') || null;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }

    return null;
}