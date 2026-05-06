import React, {useEffect} from 'react'
import {useUsers} from "../context/UserContext.jsx";


export const Profile = () => {
    const {user} = useUsers();
    useEffect(() => {
        // buscamos el id del usuario
    }, [])

    return (
        <div>
            <h1>{user.id}</h1>

        </div>)
}
