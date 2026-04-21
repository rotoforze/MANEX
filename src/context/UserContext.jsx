import React, {createContext, useContext, useState} from 'react'

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
export function UserProvider({ children }) {

    const [user, setUser] = useState({
        username: '',
        token: window?.token?.value || ''
    });

    /**
     *
     * Crea el objeto del usuario.
     *
     * @param {String} username
     * @param {String} token
     * @author Alex Bernardos Gil
     * @version 1.0.0
     */
    function changeUserInformation(username = undefined, token = window?.token?.value) {
        setUser({
            username: username || user.username,
            token: token || user.token
        })
    }



    return (
        <UserContext.Provider
            value={{user, changeUserInformation}} >
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
    return window.token?.value;
}