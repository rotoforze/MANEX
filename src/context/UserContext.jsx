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
        token: window?.token?.value || '',
        permisos: [
            'contrato',
            'departamento',
            'empleado',
            'envia_una',
            'fichajes',
            'incidencia',
            'incidencia_inventario',
            'incidencia_it',
            'inventario',
            'solicitud_vacaciones',
            'usuario'
        ]
    });

    /**
     *
     * Crea el objeto del usuario.
     *
     * @param {String} username
     * @param {String} token
     * @param {Array<String>} permisos
     * @author Alex Bernardos Gil
     * @contributor Eneas Menéndez
     * @change Se añadió soporte para permisos del usuario.
     * @reason Permitir que componentes como el dashboard muestren apartados dinámicos según acceso.
     * @version 1.0.0
     */
    function changeUserInformation(
        username = undefined,
        token = window?.token?.value,
        permisos = undefined
    ) {
        setUser({
            username: username || user.username,
            token: token || user.token,
            permisos: permisos || user.permisos
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
