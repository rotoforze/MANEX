import React, {useEffect, useState} from 'react'
import {useUsers} from "../context/UserContext.jsx";
import {Form} from "react-router-dom";
import {NavbarConfigProfileLogout} from "../components/NavbarConfigProfileLogout.jsx";
import "../../public/styles/Profile.css";


export const Profile = () => {
    const {user} = useUsers();
    const [profile, setProfile] = useState({});

    useEffect(() => {
        try {
            fetch(import.meta.env.VITE_BACKEND_EMPLEADO + '?id=' +user?.id,
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
            <div className="profile-container">
                {profile ? (
                    <>
                        {/* Header del Perfil */}
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {profile?.Nombre?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h1 className="profile-user-name">
                                {profile?.Nombre} {profile?.Apellidos}
                            </h1>
                            <p className="profile-user-role">
                                Empleado
                            </p>
                        </div>

                        {/* Información del Empleado */}
                        <div className="profile-info-section">
                            <h3 className="profile-info-title">
                                <i className="bi bi-person-fill"></i>
                                Información Personal
                            </h3>
                            <Form>
                                <div className="profile-form">
                                    <div className="profile-form-group">
                                        <label htmlFor="nombre">
                                            <i className="bi bi-person"></i> Nombre
                                        </label>
                                        <input 
                                            type="text" 
                                            id="nombre" 
                                            className="form-control"
                                            defaultValue={profile?.Nombre} 
                                            disabled
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label htmlFor="apellidos">
                                            <i className="bi bi-person"></i> Apellidos
                                        </label>
                                        <input 
                                            type="text" 
                                            id="apellidos" 
                                            className="form-control"
                                            defaultValue={profile?.Apellidos} 
                                            disabled
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label htmlFor="fechaNacimiento">
                                            <i className="bi bi-calendar"></i> Fecha de Nacimiento
                                        </label>
                                        <input 
                                            type="date" 
                                            id="fechaNacimiento" 
                                            className="form-control"
                                            defaultValue={profile.fecha_nacimiento ? profile.fecha_nacimiento.split('T')[0] : ''} 
                                            disabled
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label htmlFor="email">
                                            <i className="bi bi-envelope"></i> Email
                                        </label>
                                        <input 
                                            type="email" 
                                            id="email" 
                                            className="form-control"
                                            defaultValue={profile?.email || 'No disponible'} 
                                            disabled
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label htmlFor="telefono">
                                            <i className="bi bi-telephone"></i> Teléfono
                                        </label>
                                        <input 
                                            type="tel" 
                                            id="telefono" 
                                            className="form-control"
                                            defaultValue={profile?.Telefono || 'No disponible'} 
                                            disabled
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label htmlFor="departamento">
                                            <i className="bi bi-building"></i> Departamento
                                        </label>
                                        <input 
                                            type="text" 
                                            id="departamento" 
                                            className="form-control"
                                            defaultValue={profile?.id_departamento || 'No disponible'} 
                                            disabled
                                        />
                                    </div>
                                </div>
                            </Form>
                        </div>

                        {/* Información de Contrato */}
                        <div className="profile-info-section">
                            <h3 className="profile-info-title">
                                <i className="bi bi-file-earmark-text"></i>
                                Información de Contrato
                            </h3>
                            <Form>
                                <div className="profile-form">
                                    <div className="profile-form-group">
                                        <label htmlFor="idContrato">
                                            <i className="bi bi-hash"></i> ID Contrato
                                        </label>
                                        <input 
                                            type="text" 
                                            id="idContrato" 
                                            className="form-control"
                                            defaultValue={profile?.id_contrato || 'No disponible'} 
                                            disabled
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label htmlFor="usuario">
                                            <i className="bi bi-user-circle"></i> Usuario
                                        </label>
                                        <input 
                                            type="text" 
                                            id="usuario" 
                                            className="form-control"
                                            defaultValue={profile?.usuario || 'No disponible'} 
                                            disabled
                                        />
                                    </div>
                                </div>
                            </Form>
                        </div>

                        {/* Acciones */}
                        <div className="profile-actions">
                            <button className="btn btn-outline-primary" disabled>
                                <i className="bi bi-pencil-square"></i> Editar Perfil
                            </button>
                            <button className="btn btn-outline-secondary" disabled>
                                <i className="bi bi-key"></i> Cambiar Contraseña
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="profile-error">
                        <i className="bi bi-exclamation-triangle"></i> Usuario no visible o no se pudo cargar la información.
                    </div>
                )}
            </div>
        </NavbarConfigProfileLogout>
    )
}
