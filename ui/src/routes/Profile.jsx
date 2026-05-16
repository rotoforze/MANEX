import React, {useEffect, useState} from 'react'
import {useUsers} from "../context/UserContext.jsx";
import {Form} from "react-router-dom";
import {NavbarConfigProfileLogout} from "../components/NavbarConfigProfileLogout.jsx";
import "../../public/styles/Profile.css";
import {apiFetch} from "../utils/apiFetch.jsx";
import {useMensaje} from "../hooks/useMensaje.js";


export const Profile = () => {
    const {user} = useUsers();
    const base = import.meta.env.VITE_BACKEND;
    const [profile, setProfile] = useState({});

    // ── Modal cambiar contraseña ──
    const [modalAbierto, setModalAbierto] = useState(false);
    const [passActual, setPassActual]     = useState('');
    const [passNuevo, setPassNuevo]       = useState('');
    const [passConfirm, setPassConfirm]   = useState('');
    const [mostrarPass, setMostrarPass]   = useState(false);
    const [enviando, setEnviando]         = useState(false);
    const [mensajePass, setMensajePass]   = useMensaje();

    function abrirModal() {
        setPassActual(''); setPassNuevo(''); setPassConfirm('');
        setMostrarPass(false); setMensajePass(null);
        setModalAbierto(true);
    }
    function cerrarModal() { setModalAbierto(false); }

    async function handleCambiarPassword(e) {
        e.preventDefault();
        if (passNuevo !== passConfirm) {
            setMensajePass({ tipo: 'danger', texto: 'Las contraseñas nuevas no coinciden.' });
            return;
        }
        setEnviando(true);
        setMensajePass(null);
        try {
            const res = await apiFetch(`${base}/password`, {
                method: 'POST',
                headers: { token: user.token, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ password_actual: passActual, password_nuevo: passNuevo, confirmar: passConfirm }).toString(),
            });
            const data = await res.json();
            if (res.ok) {
                setMensajePass({ tipo: 'success', texto: data.message });
                setTimeout(cerrarModal, 1800);
            } else {
                setMensajePass({ tipo: 'danger', texto: data.message ?? 'No se pudo cambiar la contraseña.' });
            }
        } catch {
            setMensajePass({ tipo: 'danger', texto: 'Error de conexión.' });
        } finally {
            setEnviando(false);
        }
    }

    useEffect(() => {
        try {
            apiFetch(import.meta.env.VITE_BACKEND_EMPLEADO + '?id=' +user?.id,
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
        <>
        {/* ── Modal cambiar contraseña ── */}
        {modalAbierto && (
            <div
                className="modal d-block"
                tabIndex="-1"
                role="dialog"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                onClick={e => { if (e.target === e.currentTarget) cerrarModal(); }}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="bi bi-key me-2"></i>Cambiar contraseña
                            </h5>
                            <button type="button" className="btn-close" onClick={cerrarModal} aria-label="Cerrar"></button>
                        </div>
                        <form onSubmit={handleCambiarPassword}>
                            <div className="modal-body d-grid gap-3">
                                {mensajePass && (
                                    <div className={`alert alert-${mensajePass.tipo} py-2 px-3 small mb-0`} role="alert">
                                        <i className={`bi bi-${mensajePass.tipo === 'danger' ? 'exclamation-triangle' : 'check-circle'} me-2`}></i>
                                        {mensajePass.texto}
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="pass-actual" className="form-label">Contraseña actual</label>
                                    <input
                                        id="pass-actual"
                                        type={mostrarPass ? 'text' : 'password'}
                                        className="form-control"
                                        value={passActual}
                                        onChange={e => setPassActual(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label htmlFor="pass-nuevo" className="form-label">Nueva contraseña</label>
                                    <div className="input-group">
                                        <input
                                            id="pass-nuevo"
                                            type={mostrarPass ? 'text' : 'password'}
                                            className="form-control"
                                            value={passNuevo}
                                            onChange={e => setPassNuevo(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setMostrarPass(v => !v)}
                                            aria-label={mostrarPass ? 'Ocultar' : 'Mostrar'}
                                        >
                                            <i className={`bi ${mostrarPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                    <div className="form-text">Mínimo 6 caracteres.</div>
                                </div>
                                <div>
                                    <label htmlFor="pass-confirm" className="form-label">Confirmar nueva contraseña</label>
                                    <input
                                        id="pass-confirm"
                                        type={mostrarPass ? 'text' : 'password'}
                                        className="form-control"
                                        value={passConfirm}
                                        onChange={e => setPassConfirm(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" onClick={cerrarModal} disabled={enviando}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={enviando}>
                                    {enviando
                                        ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Guardando...</>
                                        : <><i className="bi bi-check-lg me-1"></i>Guardar contraseña</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
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
                            <button className="btn btn-outline-secondary" onClick={abrirModal}>
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
        </>
    )
}
