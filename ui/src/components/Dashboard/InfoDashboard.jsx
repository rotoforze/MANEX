import {useEffect, useState, useCallback} from "react";
import {NavLink} from "react-router-dom";
import {useUsers} from "../../context/UserContext.jsx";
import {apiFetch} from "../../utils/apiFetch.jsx";
import {useMensaje} from "../../hooks/useMensaje.js";

const INTERVALO_RECARGA = 300;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatHora(fechaStr) {
    if (!fechaStr) return '—';
    return fechaStr.slice(11, 16);
}

function formatFecha(fechaStr) {
    if (!fechaStr) return '—';
    const [y, m, d] = fechaStr.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

function calcularDuracion(entrada, salida) {
    if (!entrada) return '—';
    const start = new Date(entrada.replace(' ', 'T'));
    const end = salida ? new Date(salida.replace(' ', 'T')) : new Date();
    const diffMs = end - start;
    if (diffMs < 0) return '—';
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function obtenerClaseEstado(estado) {
    switch (estado) {
        case 'Pendiente':
        case 'Abierta':
            return 'text-bg-danger';
        case 'En proceso':
        case 'En revision':
        case 'En revisión':
            return 'text-bg-warning';
        case 'Aprobada':
        case 'Concedido':
        case 'Resuelta':
            return 'text-bg-success';
        case 'Rechazada':
        case 'Rechazado':
        case 'Cerrada':
            return 'text-bg-secondary';
        default:
            return 'text-bg-primary';
    }
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function KpiCard({icono, titulo, valor, subtitulo, color}) {
    return (
        <div className={`card border-0 shadow-sm h-100 border-start border-4 border-${color}`}>
            <div className="card-body d-flex align-items-center gap-3">
                <div className={`fs-2 text-${color}`}>
                    <i className={`bi ${icono}`} aria-hidden="true"></i>
                </div>
                <div>
                    <div className="text-muted small">{titulo}</div>
                    <div className="fs-3 fw-bold lh-1">{valor ?? '—'}</div>
                    {subtitulo && <div className="text-muted" style={{fontSize: '0.75rem'}}>{subtitulo}</div>}
                </div>
            </div>
        </div>
    );
}

function BarraProgreso({etiqueta, valor, total, color}) {
    const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
    return (
        <div className="mb-2">
            <div className="d-flex justify-content-between small mb-1">
                <span>{etiqueta}</span>
                <span className="fw-semibold">{valor} <span className="text-muted">({pct}%)</span></span>
            </div>
            <div className="progress" style={{height: '6px'}}>
                <div
                    className={`progress-bar bg-${color}`}
                    style={{width: `${pct}%`, transition: 'width 0.6s ease'}}
                />
            </div>
        </div>
    );
}

function TablaResumen({filas, columnas, vacia}) {
    if (!filas?.length) {
        return <p className="text-muted small text-center py-3 mb-0">{vacia}</p>;
    }
    return (
        <div className="table-responsive">
            <table className="table table-sm table-striped mb-0">
                <thead>
                <tr>{columnas.map(c => <th key={c.key} scope="col" className={c.className}>{c.label}</th>)}</tr>
                </thead>
                <tbody className="table-group-divider">
                {filas.map((fila, i) => (
                    <tr key={fila.id ?? fila.ID ?? i}>
                        {columnas.map(c => <td key={c.key} className={c.className}>{c.render(fila)}</td>)}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Panel RRHH: Solicitudes de cambio de contraseña

const PANEL_POR_PAGINA = 5;

function PanelSolicitudesPassword({token, base}) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [codigoAprobado, setCodigo] = useState(null); // { username, code }
    const [procesando, setProcesando] = useState(null); // id en proceso
    const [pagina, setPagina] = useState(0);
    const [copiado, setCopiado] = useState(null);

    async function cargar() {
        setCargando(true);
        try {
            const res = await apiFetch(`${base}/password-requests`, {headers: {token}});
            const data = await res.json();
            setSolicitudes(data?.solicitudes ?? []);
            setPagina(0);
        } catch { /* silent */
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargar();
    }, []);

    async function gestionar(id, accion) {
        setProcesando(id);
        try {
            const res = await apiFetch(`${base}/password-requests`, {
                method: 'POST',
                headers: {token, 'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({id, accion}).toString(),
            });
            const data = await res.json();
            if (res.ok) {
                if (accion === 'aprobar') setCodigo({username: data.username, code: data.code});
                cargar();
            }
        } catch { /* silent */
        } finally {
            setProcesando(null);
        }
    }

    function formatFechaSol(fechaStr) {
        if (!fechaStr) return '—';
        const d = new Date(fechaStr);
        return d.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (cargando) return null;
    if (!solicitudes.length && !codigoAprobado) return null;

    const totalPaginas = Math.ceil(solicitudes.length / PANEL_POR_PAGINA);
    const solicitudesPagina = solicitudes.slice(pagina * PANEL_POR_PAGINA, (pagina + 1) * PANEL_POR_PAGINA);

    return (
        <>
            <hr className="my-4"/>
            <h6 className="fw-semibold text-muted mb-3 text-uppercase"
                style={{letterSpacing: '0.05em', fontSize: '0.75rem'}}>
                <i className="bi bi-key-fill me-2 text-warning" aria-hidden="true"></i>
                Solicitudes de cambio de contraseña
                {solicitudes.length > 0 && (
                    <span className="badge text-bg-warning ms-2">{solicitudes.length}</span>
                )}
            </h6>

            {/* Código generado tras aprobar */}
            {codigoAprobado && (
                <div className="alert alert-success d-flex align-items-start gap-3 mb-3" role="alert">
                    <i className="bi bi-check-circle-fill fs-5 flex-shrink-0 mt-1"></i>
                    <div>
                        <div className="fw-semibold mb-1">Solicitud
                            de <strong>{codigoAprobado.username}</strong> aprobada
                        </div>
                        <div className="small mb-1">Comunica este código al empleado para que restablezca su
                            contraseña:
                        </div>
                        <span className="fs-4 fw-bold font-monospace letter-spacing-2 me-3">{codigoAprobado.code}</span>
                        <button
                            type="button"
                            className={`btn btn-sm me-2 ${copiado ? 'btn-success' : 'btn-outline-secondary'}`}
                            title="Copiar código"
                            aria-label="Copiar código"
                            onClick={() => {
                                navigator.clipboard.writeText(codigoAprobado.code);
                                setCopiado(true);
                                setTimeout(() => setCopiado(false), 2000);
                            }}
                        >
                            <i className={`bi ${copiado ? 'bi-check-lg' : 'bi-clipboard'}`} aria-hidden="true"></i>
                            {copiado ? ' Copiado' : ' Copiar'}
                        </button>
                        <span className="badge text-bg-light text-muted">Válido 24 horas</span>
                    </div>
                    <button type="button" className="btn-close ms-auto" onClick={() => setCodigo(null)}
                            aria-label="Cerrar"></button>
                </div>
            )}

            {solicitudes.length > 0 && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-sm table-striped mb-0">
                                <thead>
                                <tr>
                                    <th scope="col" className="ps-3">Usuario</th>
                                    <th scope="col">Fecha solicitud</th>
                                    <th scope="col" className="text-end pe-3">Acciones</th>
                                </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                {solicitudesPagina.map(s => (
                                    <tr key={s.id}>
                                        <td className="ps-3 fw-semibold">
                                            <i className="bi bi-person me-2 text-muted"></i>{s.username}
                                        </td>
                                        <td className="text-muted small align-middle">{formatFechaSol(s.fecha_solicitud)}</td>
                                        <td className="text-end pe-3">
                                            <button
                                                className="btn btn-sm btn-success me-2"
                                                onClick={() => gestionar(s.id, 'aprobar')}
                                                disabled={procesando === s.id}
                                            >
                                                {procesando === s.id
                                                    ? <span className="spinner-border spinner-border-sm"
                                                            role="status"></span>
                                                    : <><i className="bi bi-check-lg me-1"></i>Aprobar</>
                                                }
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => gestionar(s.id, 'rechazar')}
                                                disabled={procesando === s.id}
                                            >
                                                <i className="bi bi-x-lg me-1"></i>Rechazar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación del panel */}
                        {totalPaginas > 1 && (
                            <div className="d-flex align-items-center justify-content-center gap-2 py-2 border-top">
                                <button
                                    className="btn btn-outline-secondary btn-sm bi bi-chevron-left"
                                    aria-label="Anterior"
                                    disabled={pagina === 0}
                                    onClick={() => setPagina(p => p - 1)}
                                />
                                <span className="small text-muted">
                                    {pagina + 1} / {totalPaginas}
                                </span>
                                <button
                                    className="btn btn-outline-secondary btn-sm bi bi-chevron-right"
                                    aria-label="Siguiente"
                                    disabled={pagina >= totalPaginas - 1}
                                    onClick={() => setPagina(p => p + 1)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

/**
 * Dashboard unificado. Muestra datos personales del usuario (todos los departamentos)
 * y estadísticas globales (solo administradores, departamento > 1).
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 3.0.0
 * @constructor
 */
export function InfoDashboard() {
    const {user, isInitialLoading} = useUsers();
    const base = import.meta.env.VITE_BACKEND_DASHBOARD || `${import.meta.env.VITE_BACKEND}/dashboard`;

    // ── Estado ──
    const [cargando, setCargando] = useState(true);
    const [errorDashboard, setErrorDashboard] = useState(null);
    const [ultimaActualizacion, setUltima] = useState(null);

    // Datos personales
    const [perfil, setPerfil] = useState(null);
    const [fichajes, setFichajes] = useState([]);
    const [incidencias, setIncidencias] = useState([]);
    const [vacaciones, setVacaciones] = useState([]);
    const [kpisPersonales, setKpisPersonales] = useState(null);

    // Datos globales (solo admin — el backend decide si los incluye)
    const [kpisGlobales, setKpisGlobales] = useState(null);

    // Fichaje en curso
    const [ahora, setAhora] = useState(new Date());
    const [mensajeFichaje, setMensajeFichaje] = useMensaje();
    const [enviandoFichaje, setEnviandoFichaje] = useState(false);
    const [tipoSeleccionado, setTipoSeleccionado] = useState('Presencial');

    useEffect(() => {
        const tick = setInterval(() => setAhora(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    // ── Carga de datos ──
    const cargarDatos = useCallback(async (silencioso = false) => {
        if (isInitialLoading || !user?.username) return;
        if (!silencioso) setCargando(true);
        try {
            const res = await apiFetch(
                `${base}?username=${encodeURIComponent(user.username)}`,
                {headers: {token: user?.token}}
            );
            const data = await res.json();

            const userData = data?.user ?? {};
            setPerfil(userData.perfil ?? null);
            setFichajes(userData.fichajes ?? []);
            setIncidencias(userData.incidencias ?? []);
            setVacaciones(userData.vacaciones ?? []);
            setKpisPersonales(userData.kpis ?? null);

            const stats = data?.globalStats ?? {};
            setKpisGlobales(Object.keys(stats).length > 0 ? stats : null);

            setUltima(new Date());
        } catch (e) {
            console.error('Error cargando dashboard:', e);
            setErrorDashboard('No se pudieron cargar los datos del dashboard. Comprueba tu conexión.');
        } finally {
            setCargando(false);
        }
    }, [isInitialLoading, user?.token, user?.username, base]);

    useEffect(() => {
        if (isInitialLoading) return;
        cargarDatos();
        const intervalo = setInterval(() => cargarDatos(true), INTERVALO_RECARGA * 1000);
        return () => clearInterval(intervalo);
    }, [cargarDatos, isInitialLoading]);

    // ── Derivados personales ──
    const fichajeActivo = fichajes.find(f => f.fecha_entrada && !f.fecha_salida) ?? null;
    const incAbiertas = kpisPersonales?.incidencias?.abiertas ?? 0;
    const incTotal = kpisPersonales?.incidencias?.total ?? 0;
    const vacPendientes = kpisPersonales?.vacaciones?.pendientes ?? 0;
    const vacTotal = kpisPersonales?.vacaciones?.total ?? 0;

    // ── Derivados globales ──
    const inc = kpisGlobales?.incidencias ?? {};
    const inv = kpisGlobales?.inventario ?? {};
    const vac = kpisGlobales?.vacaciones ?? {};

    const incGlobalPendientes = (inc['Abierta'] ?? 0) + (inc['Pendiente'] ?? 0);
    const incGlobalEnProceso = inc['En proceso'] ?? 0;
    const incGlobalResueltas = (inc['Cerrada'] ?? 0) + (inc['Resuelta'] ?? 0);
    const incGlobalTotal = inc.total ?? 0;
    const ratioResolucion = incGlobalTotal > 0 ? Math.round((incGlobalResueltas / incGlobalTotal) * 100) : 0;

    const invDisponible = inv['Disponible'] ?? 0;
    const invNoDisponible = inv['No disponible'] ?? 0;
    const invEnvio = inv['En proceso de envio'] ?? 0;
    const invMantenimiento = inv['En mantenimiento'] ?? 0;
    const invTotal = inv.total ?? 0;

    const vacGlobalPendientes = (vac['En revisión'] ?? vac['En revision'] ?? 0) + (vac['Pendiente'] ?? 0);
    const vacGlobalAprobadas = (vac['Concedido'] ?? 0) + (vac['Aprobada'] ?? 0);
    const vacGlobalRechazadas = (vac['Rechazado'] ?? 0) + (vac['Rechazada'] ?? 0);
    const vacGlobalTotal = vac.total ?? 0;
    const vacActivas = vac.activas ?? 0;
    const vacProximas = vac.proximas ?? 0;

    // ── Acción fichaje ──
    async function handleFichaje(accion) {
        setEnviandoFichaje(true);
        setMensajeFichaje(null);
        try {
            const params = accion === 'entrada'
                ? {username: user.username, tipo: tipoSeleccionado}
                : {id: fichajeActivo.id, username: user.username, tipo: fichajeActivo.tipo ?? 'Presencial'};
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND}/fichajes`, {
                method: 'POST',
                headers: {token: user.token, 'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams(params).toString(),
            });
            const data = await res.json();
            if (res.ok) {
                setMensajeFichaje({
                    tipo: 'success',
                    texto: accion === 'entrada' ? 'Entrada registrada.' : 'Salida registrada.'
                });
                cargarDatos(true);
            } else {
                setMensajeFichaje({tipo: 'danger', texto: data?.message ?? 'Error al registrar fichaje.'});
            }
        } catch {
            setMensajeFichaje({tipo: 'danger', texto: 'Error de conexión.'});
        } finally {
            setEnviandoFichaje(false);
        }
    }

    // ── Render ──
    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4 py-4 dashboard">
<<<<<<< HEAD

            {errorDashboard && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                    <span>{errorDashboard}</span>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger ms-auto"
                        onClick={() => {
                            setErrorDashboard(null);
                            cargarDatos();
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            )}
=======
>>>>>>> e6ea361054ad13a9e53f3c907b851a82b43e76cd

            {errorDashboard && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                    <span>{errorDashboard}</span>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger ms-auto"
                        onClick={() => {
                            setErrorDashboard(null);
                            cargarDatos();
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {/* ══════════════════════════════════════════════
                SECCIÓN PERSONAL
            ══════════════════════════════════════════════ */}

            {/* ── Bienvenida ── */}
            <div className="card border-0 shadow-sm mb-4 dashboard-hero text-white rounded-3 p-4">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{width: 56, height: 56}}
                    >
                        <i className="bi bi-person-fill fs-3 text-white" aria-hidden="true"></i>
                    </div>
                    <div>
                        <h5 className="mb-0 fw-bold">
                            Bienvenido, {perfil?.Nombre ?? user.username}{perfil?.Apellidos ? ` ${perfil.Apellidos}` : ''}
                        </h5>
                        <p className="mb-0 opacity-75 small">
                            {perfil?.email && (
                                <span className="me-3">
                                    <i className="bi bi-envelope me-1" aria-hidden="true"></i>{perfil.email}
                                </span>
                            )}
                            {perfil?.fecha_alta && (
                                <span>
                                    <i className="bi bi-calendar3 me-1" aria-hidden="true"></i>
                                    Desde {formatFecha(perfil.fecha_alta)}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── KPIs personales ── */}
            <div className="row g-3 mb-4">

                {/* Fichaje */}
                <div className="col-md-6 col-lg-4">
                    <div
                        className={`card border-0 shadow-sm h-100 border-start border-4 border-${fichajeActivo ? 'success' : 'secondary'}`}>
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <i className={`bi bi-clock-fill fs-5 text-${fichajeActivo ? 'success' : 'secondary'}`}
                                   aria-hidden="true"></i>
                                <span className="fw-semibold small">Fichaje</span>
                                <span className={`badge ms-auto text-bg-${fichajeActivo ? 'success' : 'secondary'}`}>
                                    {fichajeActivo ? 'EN CURSO' : 'FUERA'}
                                </span>
                            </div>
                            <div className="text-muted small mb-3">
                                {fichajeActivo ? (
                                    <>
                                        <span>Entrada: <b>{new Date(fichajeActivo.fecha_entrada).toLocaleTimeString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}</b></span>
                                        <span className="mx-1">·</span>
                                        <span>Duración: <b>{calcularDuracion(fichajeActivo.fecha_entrada, null)}</b></span>
                                        <span className="mx-1">·</span>
                                        <span className="text-primary fw-semibold">
                                            {ahora.toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </span>
                                    </>
                                ) : fichajes[0]?.fecha_salida ? (
                                    <>Última salida: <b>{formatHora(fichajes[0].fecha_salida)}</b></>
                                ) : (
                                    'Sin fichajes registrados.'
                                )}
                            </div>
                            {!fichajeActivo && (
                                <div className="mb-2">
                                    <label htmlFor="tipoFichaje" className="form-label small mb-1">Tipo de
                                        registro</label>
                                    <select
                                        id="tipoFichaje"
                                        className="form-select form-select-sm"
                                        value={tipoSeleccionado}
                                        onChange={e => setTipoSeleccionado(e.target.value)}
                                        disabled={enviandoFichaje}
                                    >
                                        <option value="Presencial">Presencial</option>
                                        <option value="Teletrabajo">Teletrabajo</option>
                                    </select>
                                </div>
                            )}
                            {mensajeFichaje && (
                                <div className={`alert alert-${mensajeFichaje.tipo} py-1 px-2 small mb-2`} role="alert">
                                    {mensajeFichaje.texto}
                                </div>
                            )}
                            <button
                                className={`btn btn-sm w-100 btn-${fichajeActivo ? 'outline-danger' : 'outline-success'}`}
                                onClick={() => handleFichaje(fichajeActivo ? 'salida' : 'entrada')}
                                disabled={enviandoFichaje}
                            >
                                <i className={`bi bi-${fichajeActivo ? 'door-open' : 'door-closed-fill'} me-1`}
                                   aria-hidden="true"></i>
                                {enviandoFichaje ? 'Procesando...' : fichajeActivo ? 'Registrar salida' : 'Registrar entrada'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Incidencias personales */}
                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="fs-2 text-warning">
                                <i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
                            </div>
                            <div>
                                <div className="text-muted small">Mis incidencias abiertas</div>
                                <div className="fs-3 fw-bold lh-1">{incAbiertas}</div>
                                <div className="text-muted" style={{fontSize: '0.75rem'}}>de {incTotal} totales</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vacaciones personales */}
                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-info">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="fs-2 text-info">
                                <i className="bi bi-calendar-check-fill" aria-hidden="true"></i>
                            </div>
                            <div>
                                <div className="text-muted small">Mis solicitudes pendientes</div>
                                <div className="fs-3 fw-bold lh-1">{vacPendientes}</div>
                                <div className="text-muted" style={{fontSize: '0.75rem'}}>de {vacTotal} totales</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Panel RRHH: Solicitudes de cambio de contraseña ── */}
            {user?.departamento >= 5 && (
                <PanelSolicitudesPassword token={user?.token} base={import.meta.env.VITE_BACKEND}/>
            )}

            {/* ── Fichajes recientes (solo para quien puede ver fichajes de todos) ── */}
            {user?.departamento >= 5 && (
                <div className="card border-0 shadow-sm mb-4">
                    <div
                        className="card-header bg-transparent border-bottom pb-2 pt-3 px-3 d-flex justify-content-between align-items-center">
                        <h6 className="fw-semibold mb-0">
                            <i className="bi bi-person-check me-2 text-primary" aria-hidden="true"></i>Fichajes recientes
                        </h6>
                        <NavLink to="/fichajes" className="btn btn-outline-primary btn-sm">
                            Ver más <i className="bi bi-arrow-right ms-1" aria-hidden="true"></i>
                        </NavLink>
                    </div>
                    <div className="card-body p-0">
                        <TablaResumen
                            vacia="No hay fichajes registrados."
                            filas={fichajes.slice(0, 7)}
                            columnas={[
                                {
                                    key: 'fecha',
                                    label: 'Fecha',
                                    className: 'ps-3',
                                    render: f => formatFecha(f.fecha_entrada)
                                },
                                {key: 'entrada', label: 'Entrada', render: f => formatHora(f.fecha_entrada)},
                                {key: 'salida', label: 'Salida', render: f => formatHora(f.fecha_salida)},
                                {key: 'tipo', label: 'Tipo', render: f => f.tipo ?? '—'},
                                {
                                    key: 'duracion', label: 'Duración', render: f => f.fecha_salida
                                        ? calcularDuracion(f.fecha_entrada, f.fecha_salida)
                                        : <span className="badge text-bg-success">En curso</span>
                                },
                            ]}
                        />
                    </div>
                </div>
            )}

            {/* ── Mis incidencias ── */}
            <div className="card border-0 shadow-sm mb-4">
                <div
                    className="card-header bg-transparent border-bottom pb-2 pt-3 px-3 d-flex justify-content-between align-items-center">
                    <h6 className="fw-semibold mb-0">
                        <i className="bi bi-bookmark me-2 text-warning" aria-hidden="true"></i>Mis incidencias
                    </h6>
                    <NavLink to="/incidencia" className="btn btn-outline-warning btn-sm">
                        Ver más <i className="bi bi-arrow-right ms-1" aria-hidden="true"></i>
                    </NavLink>
                </div>
                <div className="card-body p-0">
                    <TablaResumen
                        vacia="No tienes incidencias abiertas."
                        filas={incidencias.filter(i => !['Resuelta', 'Cerrada', 'Rechazada', 'Rechazado'].includes(i.estado)).slice(0, 5)}
                        columnas={[
                            {key: 'id', label: '#', className: 'ps-3', render: i => i.ID ?? i.id ?? '—'},
                            {key: 'fecha', label: 'Fecha', render: i => formatFecha(i.fecha_creacion?.slice(0, 10))},
                            {
                                key: 'estado', label: 'Estado', render: i => (
                                    <span className={`badge ${obtenerClaseEstado(i.estado)}`}>{i.estado ?? '—'}</span>
                                )
                            },
                            {
                                key: 'obs',
                                label: 'Observaciones',
                                className: 'text-truncate',
                                render: i => i.Observaciones ?? i.observaciones ?? '—'
                            },
                        ]}
                    />
                </div>
            </div>

            {/* ── Mis solicitudes de vacaciones ── */}
            <div className="card border-0 shadow-sm mb-4">
                <div
                    className="card-header bg-transparent border-bottom pb-2 pt-3 px-3 d-flex justify-content-between align-items-center">
                    <h6 className="fw-semibold mb-0">
                        <i className="bi bi-calendar-check me-2 text-info" aria-hidden="true"></i>Mis solicitudes de
                        vacaciones
                    </h6>
                    <NavLink to="/solicitudes" className="btn btn-outline-info btn-sm">
                        Ver más <i className="bi bi-arrow-right ms-1" aria-hidden="true"></i>
                    </NavLink>
                </div>
                <div className="card-body p-0">
                    <TablaResumen
                        vacia="No hay solicitudes registradas."
                        filas={vacaciones.slice(0, 5)}
                        columnas={[
                            {key: 'id', label: '#', className: 'ps-3', render: v => v.id_incidencia ?? '—'},
                            {key: 'tipo', label: 'Tipo', render: v => v.tipo ?? '—'},
                            {key: 'inicio', label: 'Inicio', render: v => formatFecha(v.fecha_inicio?.slice(0, 10))},
                            {key: 'fin', label: 'Fin', render: v => formatFecha(v.fecha_fin?.slice(0, 10))},
                            {
                                key: 'estado', label: 'Estado', render: v => (
                                    <span className={`badge ${obtenerClaseEstado(v.estado)}`}>{v.estado ?? '—'}</span>
                                )
                            },
                        ]}
                    />
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                SECCIÓN ESTADÍSTICAS GLOBALES (solo admins y gerencia)
            ══════════════════════════════════════════════ */}
            {kpisGlobales && user?.departamento >= 7 && (
                <>
                    <hr className="my-4"/>

                    <h6 className="fw-semibold text-muted mb-3 text-uppercase"
                        style={{letterSpacing: '0.05em', fontSize: '0.75rem'}}>
                        <i className="bi bi-bar-chart-fill me-2" aria-hidden="true"></i>
                        Estadísticas globales
                    </h6>

                    {/* KPIs globales */}
                    <div className="row g-3 mb-4 justify-content-center">
                        <div className="col-6 col-md-4 col-lg">
                            <KpiCard icono="bi-people-fill" titulo="Empleados" valor={kpisGlobales.empleados}
                                     color="primary"/>
                        </div>
                        <div className="col-6 col-md-4 col-lg">
                            <KpiCard icono="bi-exclamation-triangle-fill" titulo="Incidencias" valor={incGlobalTotal}
                                     subtitulo={`${incGlobalPendientes} abiertas`} color="warning"/>
                        </div>
                        <div className="col-6 col-md-4 col-lg">
                            <KpiCard icono="bi-box-seam-fill" titulo="Inventario" valor={invTotal}
                                     subtitulo={`${invDisponible} disponibles`} color="info"/>
                        </div>
                        <div className="col-6 col-md-4 col-lg">
                            <KpiCard icono="bi-clock-history" titulo="Fichajes" valor={kpisGlobales.fichajes}
                                     color="secondary"/>
                        </div>
                        <div className="col-6 col-md-4 col-lg">
                            <KpiCard icono="bi-umbrella-fill" titulo="De vacaciones" valor={vacActivas}
                                     subtitulo={`${vacProximas} próximas en 7 días`} color="success"/>
                        </div>
                    </div>

                    {/* Gráficas */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <h6 className="fw-semibold mb-3">
                                        <i className="bi bi-exclamation-circle me-2 text-warning"
                                           aria-hidden="true"></i>
                                        Incidencias por estado
                                    </h6>
                                    <BarraProgreso etiqueta="Abiertas" valor={incGlobalPendientes}
                                                   total={incGlobalTotal} color="danger"/>
                                    <BarraProgreso etiqueta="Resueltas" valor={incGlobalResueltas}
                                                   total={incGlobalTotal} color="success"/>
                                    <div
                                        className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">Ratio de resolución</span>
                                        <span
                                            className={`fw-bold fs-5 text-${ratioResolucion >= 70 ? 'success' : ratioResolucion >= 40 ? 'warning' : 'danger'}`}>
                                            {ratioResolucion}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <h6 className="fw-semibold mb-3">
                                        <i className="bi bi-boxes me-2 text-info" aria-hidden="true"></i>
                                        Inventario por estado
                                    </h6>
                                    <BarraProgreso etiqueta="Disponible" valor={invDisponible} total={invTotal}
                                                   color="success"/>
                                    <BarraProgreso etiqueta="No disponible" valor={invNoDisponible} total={invTotal}
                                                   color="danger"/>
                                    <BarraProgreso etiqueta="En proceso de envío" valor={invEnvio} total={invTotal}
                                                   color="primary"/>
                                    <BarraProgreso etiqueta="En mantenimiento" valor={invMantenimiento} total={invTotal}
                                                   color="warning"/>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <h6 className="fw-semibold mb-3">
                                        <i className="bi bi-calendar-check me-2 text-success" aria-hidden="true"></i>
                                        Solicitudes de vacaciones
                                    </h6>
                                    <BarraProgreso etiqueta="Pendientes" valor={vacGlobalPendientes}
                                                   total={vacGlobalTotal} color="warning"/>
                                    <BarraProgreso etiqueta="Concedidas" valor={vacGlobalAprobadas}
                                                   total={vacGlobalTotal} color="success"/>
                                    <BarraProgreso etiqueta="Rechazadas" valor={vacGlobalRechazadas}
                                                   total={vacGlobalTotal} color="danger"/>
                                    <div
                                        className="mt-3 pt-2 border-top d-flex justify-content-between text-muted small">
                                        <span>Total solicitudes</span>
                                        <span className="fw-semibold text-dark">{vacGlobalTotal}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Barra inferior ── */}
            <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
                {ultimaActualizacion && (
                    <small className="text-muted">
                        Última actualización: {ultimaActualizacion.toLocaleTimeString('es-ES')}
                    </small>
                )}
                <button
                    className="btn btn-outline-primary btn-sm bi bi-arrow-clockwise"
                    onClick={() => cargarDatos()}
                    disabled={cargando}
                    title="Recargar ahora"
                >
                    {' '}Actualizar
                </button>
            </div>

        </div>
    );
}
