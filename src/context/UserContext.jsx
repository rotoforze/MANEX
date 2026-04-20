import React, { createContext, useContext } from 'react'

const UserContext = createContext();
export function UserProvider({ children }) {
    return (
        <UserProvider.Provider
            value={{}} >
                {children}
            </UserProvider.Provider>
    )
}

export function useUsers() {
    return useContext(UserContext);
}

// por si lo necesito
export function loader() {

}