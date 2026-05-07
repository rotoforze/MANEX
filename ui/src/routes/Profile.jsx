import React, {useEffect, useState} from 'react'
import {useUsers} from "../context/UserContext.jsx";
import {Form} from "react-router-dom";
import {NavbarConfigProfileLogout} from "../components/NavbarConfigProfileLogout.jsx";


export const Profile = () => {
    const {user} = useUsers();
    const [profile, setProfile] = useState({});
    useEffect(() => {
        // buscamos el id del usuario
        try {
            fetch(import.meta.env.VITE_BACKEND_EMPLEADO + user?.id,
                {method: 'GET', headers: {'Content-Type': 'application/json', 'token': user?.token}})
                .then((response) => response.json()
                ).then((data) => {
                if (data) setProfile(data?.usuario[0])

            });
        } catch (error) {
            console.error(error);
        }
    }, [])

    return (
        <NavbarConfigProfileLogout>
            <div className="card-body">
                {profile ?
                    (
                        <>
                            <h5 className="card-title">{profile?.Nombre} {profile?.Apellidos}</h5>
                            <h6 className="card-text">Información</h6>
                            <Form>
                                <div>
                                    <h6 className="card-text">Empleado</h6>
                                </div>
                                <div>
                                    <label htmlFor="nombre">Nombre</label>
                                    <input type="text" id="nombre" defaultValue={profile?.Nombre} disabled/>
                                </div>
                                <div>
                                    <label htmlFor="apellidos">Apellidos</label>
                                    <input type="text" id="apellidos" defaultValue={profile?.apellidos} disabled/>
                                </div>
                                <div>
                                    <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
                                    <input type="date" id="fechaNacimiento" defaultValue={profile.fecha_nacimiento ? profile.fecha_nacimiento.split('T')[0] : ''} disabled/>
                                </div>
                            </Form>
                        </>
                    )
                    :
                    <h6 className="card-text">Usuario no visible.</h6>}
            </div>
        </NavbarConfigProfileLogout>
    )
}
