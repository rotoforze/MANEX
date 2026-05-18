import React, {useEffect, useState} from 'react'
import {Form, Link, useActionData, useNavigate, useNavigation} from 'react-router-dom'
import {useUsers} from "../context/UserContext.jsx";
import {Loading} from "../components/Loading.jsx";
import '../../public/styles/mainPages.css'
import {apiFetch} from "../utils/apiFetch.jsx";

/**
 * Componente que muestra el formulario de inicio de sesión y, de forma integrada,
 * el flujo de recuperación de contraseña en dos pasos.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @contributor Eneas de la Rosa Menéndez Pedrosa
 * @version 2.0.0
 * @constructor
 */
const LoginPage = () => {

    const actionData = useActionData();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const {user, changeUserInformation} = useUsers();
    const seEstaEnviando = navigation.state === 'submitting';

    const [passwordShown, setPasswordShown] = useState(false);
    const [cargando, setCargado] = useState(true);

    // ── Vista: 'login' | 'recuperar' | 'reset' ──
    const [vista, setVista] = useState('login');

    // ── Estado recuperación ──
    const [recUsername, setRecUsername] = useState('');
    const [codigoInput, setCodigoInput] = useState('');
    const [passNuevo, setPassNuevo] = useState('');
    const [passConfirm, setPassConfirm] = useState('');
    const [mostrarPassRec, setMostrarPassRec] = useState(false);
    const [recCargando, setRecCargando] = useState(false);
    const [recMensaje, setRecMensaje] = useState(null);
    const [resetExito, setResetExito] = useState(false);

    function irARecuperar() {
        setVista('recuperar');
        setRecUsername('');
        setCodigoInput('');
        setPassNuevo('');
        setPassConfirm('');
        setRecMensaje(null);
        setResetExito(false);
    }

    function volverAlLogin() {
        setVista('login');
    }

    // ── Efectos login ──
    useEffect(() => {
        if (actionData?.error == 404) {
            setRecMensaje({tipo: 'danger', texto: actionData?.message});
            deleteTokenCookie();
            return;
        }
        if (actionData?.success) navigate('/dashboard');
    }, [actionData, navigate]);

    useEffect(() => {
        try {
            apiFetch(import.meta.env.VITE_BACKEND,
                {method: 'GET', headers: {'Content-Type': 'application/json'}})
                .then(r => r.json())
                .then(data => {
                    if (!data.status == 200) navigate('/error');
                })
                .catch(() => navigate('/error'))
                .finally(() => setCargado(false));
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        if (!actionData) return;
        console.log(actionData);
        if (actionData?.error == 404) {
            setRecMensaje({tipo: 'danger', texto: actionData?.message});
            deleteTokenCookie();
            return;
        }
        if (actionData?.success) {
            if (document.activeElement) {
                document.activeElement.blur();
            }
            changeUserInformation(actionData.username, actionData.id, actionData.token, actionData.department, true);
        }
    }, [actionData]);

    // ── Paso 1: enviar solicitud a RRHH ──
    async function handleSolicitarCodigo(e) {
        e.preventDefault();
        setRecMensaje(null);
        setRecCargando(true);
        try {
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND}/recuperar`, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({username: recUsername}).toString(),
            });
            const data = await res.json();
            if (res.ok) {
                setRecMensaje({tipo: 'success', texto: data.message});
            } else {
                setRecMensaje({tipo: 'danger', texto: data.message ?? 'No se pudo enviar la solicitud.'});
            }
        } catch {
            setRecMensaje({tipo: 'danger', texto: 'Error de conexión con el servidor.'});
        } finally {
            setRecCargando(false);
        }
    }

    // ── Paso 2: aplicar reset ──
    async function handleReset(e) {
        e.preventDefault();
        if (passNuevo !== passConfirm) {
            setRecMensaje({tipo: 'danger', texto: 'Las contraseñas no coinciden.'});
            return;
        }
        setRecMensaje(null);
        setRecCargando(true);
        try {
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND}/reset`, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({
                    username: recUsername,
                    code: codigoInput,
                    password_nuevo: passNuevo,
                    confirmar: passConfirm,
                }).toString(),
            });
            const data = await res.json();
            if (res.ok) {
                setResetExito(true);
            } else {
                setRecMensaje({tipo: 'danger', texto: data.message ?? 'No se pudo restablecer la contraseña.'});
            }
        } catch {
            setRecMensaje({tipo: 'danger', texto: 'Error de conexión con el servidor.'});
        } finally {
            setRecCargando(false);
        }
    }

    // ── Render ──
    return (
        <main className="login-page d-flex align-items-center justify-content-center min-vh-100 px-3">
            {cargando ? (
                <Loading/>
            ) : (
                <section className="card login-card shadow-lg border-0 w-100">
                    <div className="card-body p-4 p-md-5">

                        {/* ════════════════════════════
                            VISTA: LOGIN
                        ════════════════════════════ */}
                        {vista === 'login' && (
                            <>
                                {actionData?.status && (
                                    <div className="alert alert-danger" role="alert">
                                        <i className="bi bi-patch-exclamation-fill me-1"></i>
                                        {actionData.message}
                                    </div>
                                )}

                                <h1 className="h3 text-center mb-4 fw-semibold">Iniciar sesión</h1>

                                <Form method="POST">
                                    <input type="text" name="token" id="token" defaultValue={user.token} hidden/>

                                    <div className="d-grid gap-3">
                                        <div>
                                            <label className="form-label" htmlFor="user">Usuario</label>
                                            <input
                                                className="form-control"
                                                id="user" type="text" name="user"
                                                required minLength={1} maxLength={16}
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label" htmlFor="password">Contraseña</label>
                                            <div className="input-group">
                                                <input
                                                    className="form-control"
                                                    id="password" name="password"
                                                    type={passwordShown ? 'text' : 'password'}
                                                    required minLength={0} maxLength={255}
                                                />
                                                <button
                                                    className="btn btn-outline-secondary" type="button"
                                                    onClick={() => setPasswordShown(v => !v)}
                                                    aria-label={passwordShown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                >
                                                    <i className={`bi ${passwordShown ? 'bi-eye-slash' : 'bi-eye'}`}
                                                       aria-hidden="true"/>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-check">
                                            <input
                                                className="form-check-input" type="checkbox"
                                                id="keepSession" name="keepSession"
                                                defaultChecked={!!user.token}
                                            />
                                            <label className="form-check-label form-control-sm" htmlFor="keepSession">
                                                Mantener la sesión iniciada
                                            </label>
                                        </div>

                                        <button className="btn btn-primary btn-lg w-100" type="submit"
                                                disabled={seEstaEnviando}>
                                            {seEstaEnviando ? 'Iniciando sesión...' : 'Iniciar sesión'}
                                        </button>
                                    </div>
                                </Form>

                                <div className="mt-4 text-center">
                                    <button
                                        className="btn link-primary p-0 small text-secondary"
                                        type="button"
                                        onClick={irARecuperar}
                                    >
                                        <i className="bi bi-shield-lock me-1"></i>¿Problemas para iniciar sesión?
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ════════════════════════════
                            VISTA: RECUPERAR — Paso 1
                        ════════════════════════════ */}
                        {vista === 'recuperar' && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-link p-0 text-muted small mb-3 d-flex align-items-center gap-1"
                                    onClick={volverAlLogin}
                                >
                                    <i className="bi bi-arrow-left"></i> Volver
                                </button>

                                <div className="text-center mb-4">
                                    <i className="bi bi-shield-lock fs-2 text-primary" aria-hidden="true"></i>
                                    <h2 className="h5 fw-semibold mt-2 mb-1">Recuperar contraseña</h2>
                                    <p className="text-muted small mb-0">
                                        Introduce tu usuario y recibirás un código para restablecer tu contraseña.
                                    </p>
                                </div>

                                {recMensaje && (
                                    <div className={`alert alert-${recMensaje.tipo} py-2 px-3 small`} role="alert">
                                        <i className={`bi bi-${recMensaje.tipo === 'danger' ? 'exclamation-triangle' : 'check-circle'} me-2`}></i>
                                        {recMensaje.texto}
                                    </div>
                                )}

                                <form onSubmit={handleSolicitarCodigo}>
                                    <div className="mb-3">
                                        <label htmlFor="rec-user" className="form-label">Nombre de usuario</label>
                                        <input
                                            id="rec-user"
                                            type="text"
                                            className="form-control"
                                            value={recUsername}
                                            onChange={e => setRecUsername(e.target.value)}
                                            required autoFocus
                                            minLength={1} maxLength={16}
                                        />
                                    </div>
                                    <button className="btn btn-primary w-100" type="submit" disabled={recCargando}>
                                        {recCargando
                                            ? <><span className="spinner-border spinner-border-sm me-2"
                                                      role="status"></span>Enviando solicitud...</>
                                            : 'Solicitar cambio de contraseña'
                                        }
                                    </button>
                                </form>

                                {recMensaje?.tipo === 'success' && (
                                    <div className="mt-3 text-center">
                                        <p className="small text-muted mb-2">
                                            Cuando RRHH apruebe tu solicitud y te proporcione el código, pulsa el botón
                                            de abajo.
                                        </p>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary w-100"
                                            onClick={() => {
                                                setVista('reset');
                                                setRecMensaje(null);
                                            }}
                                        >
                                            <i className="bi bi-key me-2"></i>Ya tengo un código
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ════════════════════════════
                            VISTA: RESET — Paso 2
                        ════════════════════════════ */}
                        {vista === 'reset' && (
                            <>
                                {resetExito ? (
                                    <div className="text-center py-2">
                                        <i className="bi bi-check-circle-fill text-success fs-1 d-block mb-3"></i>
                                        <p className="fw-semibold">¡Contraseña restablecida!</p>
                                        <p className="text-muted small">Ya puedes iniciar sesión con tu nueva
                                            contraseña.</p>
                                        <button className="btn btn-primary w-100 mt-2" onClick={volverAlLogin}>
                                            Ir al inicio de sesión
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-muted small mb-3 d-flex align-items-center gap-1"
                                            onClick={() => {
                                                setVista('recuperar');
                                                setRecMensaje(null);
                                            }}
                                        >
                                            <i className="bi bi-arrow-left"></i> Volver
                                        </button>

                                        <div className="text-center mb-3">
                                            <h2 className="h5 fw-semibold mb-1">Nueva contraseña</h2>
                                            <p className="text-muted small mb-0">
                                                Introduce el código que RRHH te ha proporcionado.
                                            </p>
                                        </div>

                                        {recMensaje && (
                                            <div className={`alert alert-${recMensaje.tipo} py-2 px-3 small`}
                                                 role="alert">
                                                <i className={`bi bi-${recMensaje.tipo === 'danger' ? 'exclamation-triangle' : 'check-circle'} me-2`}></i>
                                                {recMensaje.texto}
                                            </div>
                                        )}

                                        <form onSubmit={handleReset}>
                                            <div className="d-grid gap-3">
                                                <div>
                                                    <label htmlFor="reset-user" className="form-label">Usuario</label>
                                                    <input
                                                        id="reset-user"
                                                        type="text"
                                                        className="form-control"
                                                        value={recUsername}
                                                        onChange={e => setRecUsername(e.target.value)}
                                                        required minLength={1} maxLength={16}
                                                        placeholder="Tu nombre de usuario"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="reset-code" className="form-label">Código de
                                                        recuperación</label>
                                                    <input
                                                        id="reset-code"
                                                        type="text"
                                                        className="form-control font-monospace text-uppercase"
                                                        value={codigoInput}
                                                        onChange={e => setCodigoInput(e.target.value.toUpperCase())}
                                                        required maxLength={8}
                                                        placeholder="Código de 8 caracteres"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="reset-pass" className="form-label">Nueva
                                                        contraseña</label>
                                                    <div className="input-group">
                                                        <input
                                                            id="reset-pass"
                                                            type={mostrarPassRec ? 'text' : 'password'}
                                                            className="form-control"
                                                            value={passNuevo}
                                                            onChange={e => setPassNuevo(e.target.value)}
                                                            required minLength={6} maxLength={255}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => setMostrarPassRec(v => !v)}
                                                            aria-label={mostrarPassRec ? 'Ocultar' : 'Mostrar'}
                                                        >
                                                            <i className={`bi ${mostrarPassRec ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                                        </button>
                                                    </div>
                                                    <div className="form-text">Mínimo 6 caracteres.</div>
                                                </div>
                                                <div>
                                                    <label htmlFor="reset-confirm" className="form-label">Confirmar
                                                        contraseña</label>
                                                    <input
                                                        id="reset-confirm"
                                                        type={mostrarPassRec ? 'text' : 'password'}
                                                        className="form-control"
                                                        value={passConfirm}
                                                        onChange={e => setPassConfirm(e.target.value)}
                                                        required minLength={6} maxLength={255}
                                                    />
                                                </div>
                                                <button className="btn btn-primary w-100" type="submit"
                                                        disabled={recCargando}>
                                                    {recCargando
                                                        ? <><span className="spinner-border spinner-border-sm me-2"
                                                                  role="status"></span>Restableciendo...</>
                                                        : 'Restablecer contraseña'
                                                    }
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </>
                        )}

                    </div>
                    <div className="card-footer d-flex justify-content-center w-100 bg-transparent border-0">
                        <Link to="/"
                              className="navbar-brand w-auto text-secondary link-primary bi bi-arrow-left-short"> Página
                            de información</Link>
                    </div>
                </section>
            )}
        </main>
    );
};

export default LoginPage;
