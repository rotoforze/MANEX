import React, { useEffect, useState } from 'react'
import { useUsers } from "../context/UserContext.jsx";
import { NavbarConfigProfileLogout } from "../components/NavbarConfigProfileLogout.jsx";
import "../../public/styles/Profile.css";
import { apiFetch } from "../utils/apiFetch.jsx";
import { useMensaje } from "../hooks/useMensaje.js";

// ── Theme helpers (outside component to run once) ──────────────────────────
const getStoredTheme    = ()        => localStorage.getItem('theme');
const setStoredTheme    = theme     => localStorage.setItem('theme', theme);
const getPreferredTheme = ()        => {
    const stored = getStoredTheme();
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
const applyTheme = theme => {
    const resolved = theme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
    document.documentElement.setAttribute('data-bs-theme', resolved);
};

// Apply immediately on module load (before React renders)
applyTheme(getPreferredTheme());

// ── Small hook to expose/toggle theme state inside React ───────────────────
function useTheme() {
    const [theme, setThemeState] = useState(getPreferredTheme);

    // Keep in sync when OS preference changes and user hasn't overridden
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (!getStoredTheme()) {
                const next = mq.matches ? 'dark' : 'light';
                setThemeState(next);
                applyTheme(next);
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const setTheme = theme => {
        setStoredTheme(theme);
        applyTheme(theme);
        setThemeState(theme);
    };

    const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

    return { theme, toggle };
}
// ──────────────────────────────────────────────────────────────────────────

export const Profile = () => {
    const { user } = useUsers();
    const base = import.meta.env.VITE_BACKEND;
    const dept = user?.departamento ?? 0;
    const maxFechaNacimiento = new Date(Date.now() - 16 * 365.25 * 24 * 3600000).toISOString().split('T')[0];

    const { theme, toggle: toggleTheme } = useTheme();

    const [profile, setProfile]     = useState(null);
    const [cargando, setCargando]   = useState(true);

    // ── Modal cambiar contraseña ──
    const [modalAbierto, setModalAbierto] = useState(false);
    const [passActual, setPassActual]     = useState('');
    const [passNuevo, setPassNuevo]       = useState('');
    const [passConfirm, setPassConfirm]   = useState('');
    const [mostrarPass, setMostrarPass]   = useState(false);
    const [enviando, setEnviando]         = useState(false);
    const [mensajePass, setMensajePass]   = useMensaje();

    // ── Edición de perfil ──
    const [modoEdicion, setModoEdicion]     = useState(false);
    const [formData, setFormData]           = useState({});
    const [guardando, setGuardando]         = useState(false);
    const [mensajePerfil, setMensajePerfil] = useMensaje();

    function perfilAForm(p) {
        return {
            nombre:           p?.Nombre           || '',
            apellidos:        p?.Apellidos        || '',
            fecha_nacimiento: p?.fecha_nacimiento ? p.fecha_nacimiento.split('T')[0] : '',
            email:            p?.email            || '',
            telefono:         p?.Telefono         || '',
            usuario:          p?.usuario          || '',
            id_contrato:      p?.ID_CONTRATO     ?? p?.id_contrato     ?? '',
            id_departamento:  p?.ID_DEPARTAMENTO ?? p?.id_departamento ?? '',
        };
    }

    function cargarPerfil() {
        setCargando(true);
        apiFetch(`${import.meta.env.VITE_BACKEND_EMPLEADO}?id=${user?.id}`,
            { method: 'GET', headers: { 'Content-Type': 'application/json', token: user?.token } })
            .then(r => r.json())
            .then(data => {
                if (data) {
                    const p = data?.usuario?.[0];
                    setProfile(p);
                    setFormData(perfilAForm(p));
                }
            })
            .catch(e => console.error(e))
            .finally(() => setCargando(false));
    }

    useEffect(() => { cargarPerfil(); }, []);

    function setField(name, value) {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    function cancelarEdicion() {
        setFormData(perfilAForm(profile));
        setModoEdicion(false);
        setMensajePerfil(null);
    }

    async function handleGuardarPerfil(e) {
        e.preventDefault();
        setGuardando(true);
        setMensajePerfil(null);
        try {
            const res = await apiFetch(`${base}/empleados`, {
                method: 'POST',
                headers: { token: user.token, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    id:               user.id,
                    nombre:           formData.nombre,
                    apellidos:        formData.apellidos,
                    fecha_nacimiento: formData.fecha_nacimiento,
                    email:            formData.email,
                    telefono:         formData.telefono,
                    usuario:          formData.usuario,
                    ID_departamento:  formData.id_departamento,
                    ID_contrato:      formData.id_contrato,
                }).toString(),
            });
            const data = await res.json();
            if (res.ok) {
                const extra = data.usernameChanged
                    ? ' El nombre de usuario ha cambiado — cierra sesión y vuelve a entrar para que surta efecto.'
                    : '';
                setMensajePerfil({ tipo: 'success', texto: `Perfil actualizado correctamente.${extra}` });
                setModoEdicion(false);
                cargarPerfil();
            } else {
                setMensajePerfil({ tipo: 'danger', texto: data.message ?? 'Error al guardar.' });
            }
        } catch {
            setMensajePerfil({ tipo: 'danger', texto: 'Error de conexión.' });
        } finally {
            setGuardando(false);
        }
    }

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

    const puedeEditarPersonal = dept >= 5;
    const puedeEditarEmpresa  = dept >= 7;
    const rolLabel = dept >= 7 ? 'Gerencia / Administración' : dept >= 5 ? 'Recursos Humanos' : 'Empleado';

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
                                                required minLength={6}
                                            />
                                            <button type="button" className="btn btn-outline-secondary"
                                                    onClick={() => setMostrarPass(v => !v)}
                                                    aria-label={mostrarPass ? 'Ocultar' : 'Mostrar'}>
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
                                            required minLength={6}
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

                    {cargando ? (
                        <div className="d-flex justify-content-center align-items-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ) : profile ? (
                        <>
                            {/* ── Header ── */}
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    {profile?.Nombre?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <h1 className="profile-user-name">
                                    {profile?.Nombre} {profile?.Apellidos}
                                </h1>
                                <p className="profile-user-role">{rolLabel}</p>
                            </div>

                            {/* ── Mensaje global de perfil ── */}
                            {mensajePerfil && (
                                <div className={`alert alert-${mensajePerfil.tipo} mb-3`} role="alert">
                                    <i className={`bi bi-${mensajePerfil.tipo === 'danger' ? 'exclamation-triangle' : 'check-circle'} me-2`}></i>
                                    {mensajePerfil.texto}
                                </div>
                            )}

                            <form id="profile-form" onSubmit={handleGuardarPerfil}>

                                {/* ── Información Personal ── */}
                                <div className="profile-info-section">
                                    <h3 className="profile-info-title">
                                        <i className="bi bi-person-fill"></i>
                                        Información Personal
                                    </h3>

                                    {puedeEditarPersonal ? (
                                        <div className="profile-form">
                                            <div className="profile-form-group">
                                                <label htmlFor="nombre"><i className="bi bi-person"></i> Nombre</label>
                                                <input
                                                    type="text" id="nombre" className="form-control"
                                                    value={formData.nombre}
                                                    onChange={e => setField('nombre', e.target.value)}
                                                    disabled={!modoEdicion}
                                                    required maxLength={30}
                                                />
                                            </div>
                                            <div className="profile-form-group">
                                                <label htmlFor="apellidos"><i className="bi bi-person"></i> Apellidos</label>
                                                <input
                                                    type="text" id="apellidos" className="form-control"
                                                    value={formData.apellidos}
                                                    onChange={e => setField('apellidos', e.target.value)}
                                                    disabled={!modoEdicion}
                                                    maxLength={60}
                                                />
                                            </div>
                                            <div className="profile-form-group">
                                                <label htmlFor="fechaNacimiento"><i className="bi bi-calendar"></i> Fecha de Nacimiento</label>
                                                <input
                                                    type="date" id="fechaNacimiento" className="form-control"
                                                    value={formData.fecha_nacimiento}
                                                    onChange={e => setField('fecha_nacimiento', e.target.value)}
                                                    disabled={!modoEdicion}
                                                    min="1900-01-01"
                                                    max={maxFechaNacimiento}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="profile-form mb-2">
                                                <div className="profile-form-group">
                                                    <label><i className="bi bi-person"></i> Nombre</label>
                                                    <span className="profile-readonly-value">{profile?.Nombre || '—'}</span>
                                                </div>
                                                <div className="profile-form-group">
                                                    <label><i className="bi bi-person"></i> Apellidos</label>
                                                    <span className="profile-readonly-value">{profile?.Apellidos || '—'}</span>
                                                </div>
                                                <div className="profile-form-group">
                                                    <label><i className="bi bi-calendar"></i> Fecha de Nacimiento</label>
                                                    <span className="profile-readonly-value">{formData.fecha_nacimiento || '—'}</span>
                                                </div>
                                                <div className="profile-form-group">
                                                    <label><i className="bi bi-person-badge"></i> Usuario</label>
                                                    <span className="profile-readonly-value">{formData.usuario || '—'}</span>
                                                </div>
                                            </div>
                                            <p className="text-muted small mb-0">
                                                <i className="bi bi-lock me-1"></i>
                                                Datos gestionados por Recursos Humanos.
                                            </p>
                                        </>
                                    )}

                                    <hr className="my-4" />

                                    <p className="profile-subsection-label">
                                        <i className="bi bi-envelope"></i> Contacto
                                    </p>
                                    <div className="profile-form">
                                        <div className="profile-form-group">
                                            <label htmlFor="email"><i className="bi bi-envelope"></i> Email</label>
                                            <input
                                                type="email" id="email" className="form-control"
                                                value={formData.email}
                                                onChange={e => setField('email', e.target.value)}
                                                disabled={!modoEdicion}
                                                maxLength={90}
                                            />
                                        </div>
                                        <div className="profile-form-group">
                                            <label htmlFor="telefono"><i className="bi bi-telephone"></i> Teléfono</label>
                                            <input
                                                type="tel" id="telefono" className="form-control"
                                                value={formData.telefono}
                                                onChange={e => setField('telefono', e.target.value)}
                                                disabled={!modoEdicion}
                                                maxLength={12}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* ── Datos de empresa ── */}
                                <div className="profile-info-section">
                                    <h3 className="profile-info-title">
                                        <i className="bi bi-file-earmark-text"></i>
                                        Datos de empresa
                                        {!puedeEditarEmpresa && (
                                            <span className="badge text-bg-secondary ms-2 fw-normal" style={{ fontSize: '0.7rem' }}>
                                            Solo gerencia
                                        </span>
                                        )}
                                    </h3>

                                    {puedeEditarEmpresa ? (
                                        <div className="profile-form">
                                            <div className="profile-form-group">
                                                <label htmlFor="id_contrato"><i className="bi bi-hash"></i> ID Contrato</label>
                                                <input
                                                    type="number" id="id_contrato" className="form-control"
                                                    value={formData.id_contrato}
                                                    onChange={e => setField('id_contrato', e.target.value)}
                                                    disabled={!modoEdicion}
                                                    min={1}
                                                />
                                            </div>
                                            <div className="profile-form-group">
                                                <label htmlFor="id_departamento"><i className="bi bi-building"></i> ID Departamento</label>
                                                <input
                                                    type="number" id="id_departamento" className="form-control"
                                                    value={formData.id_departamento}
                                                    onChange={e => setField('id_departamento', e.target.value)}
                                                    disabled={!modoEdicion}
                                                    min={1}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="profile-form mb-2">
                                                <div className="profile-form-group">
                                                    <label><i className="bi bi-hash"></i> ID Contrato</label>
                                                    <span className="profile-readonly-value">{formData.id_contrato || '—'}</span>
                                                </div>
                                                <div className="profile-form-group">
                                                    <label><i className="bi bi-building"></i> ID Departamento</label>
                                                    <span className="profile-readonly-value">{formData.id_departamento || '—'}</span>
                                                </div>
                                            </div>
                                            <p className="text-muted small mb-0">
                                                <i className="bi bi-lock me-1"></i>
                                                Datos gestionados por Gerencia.
                                            </p>
                                        </>
                                    )}
                                </div>

                            </form>

                            {/* ── Acciones ── */}
                            <div className="profile-actions">
                                <button
                                    type="button"
                                    className={`btn btn-outline-primary${modoEdicion ? ' d-none' : ''}`}
                                    onClick={() => { setModoEdicion(true); setMensajePerfil(null); }}
                                >
                                    <i className="bi bi-pencil-square"></i>{' '}
                                    {puedeEditarPersonal ? 'Editar perfil' : 'Editar datos de contacto'}
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-outline-secondary${modoEdicion ? ' d-none' : ''}`}
                                    onClick={abrirModal}
                                >
                                    <i className="bi bi-key"></i> Cambiar Contraseña
                                </button>

                                {/* ── Toggle de tema ── */}
                                <button
                                    type="button"
                                    className={`btn btn-outline-secondary${modoEdicion ? ' d-none' : ''}`}
                                    onClick={toggleTheme}
                                    aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                                    title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                                >
                                    <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`}></i>
                                    {' '}{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                                </button><br/><br/><br/>

                                <button
                                    type="button"
                                    className={`btn btn-primary${!modoEdicion ? ' d-none' : ''}`}
                                    onClick={handleGuardarPerfil}
                                    disabled={guardando}
                                >
                                    {guardando
                                        ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Guardando...</>
                                        : <><i className="bi bi-check-lg me-1"></i>Guardar cambios</>
                                    }
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-outline-secondary${!modoEdicion ? ' d-none' : ''}`}
                                    onClick={cancelarEdicion}
                                    disabled={guardando}
                                >
                                    <i className="bi bi-x-lg me-1"></i>Cancelar
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="profile-error">
                            <i className="bi bi-exclamation-triangle"></i> No se pudo cargar la información del perfil.
                        </div>
                    )}
                </div>
            </NavbarConfigProfileLogout>
        </>
    );
};