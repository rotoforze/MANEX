import { useEffect, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { useMensaje } from "../../hooks/useMensaje.js";

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
        case 'Abierta':         return 'text-bg-danger';
        case 'En proceso':
        case 'En revision':
        case 'En revisión':     return 'text-bg-warning';
        case 'Aprobada':
        case 'Concedido':
        case 'Resuelta':        return 'text-bg-success';
        case 'Rechazada':
        case 'Rechazado':
        case 'Cerrada':         return 'text-bg-secondary';
        default:                return 'text-bg-primary';
    }
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function KpiCard({ icono, titulo, valor, subtitulo, color }) {
    return (
        <div className={`card border-0 shadow-sm h-100 border-start border-4 border-${color}`}>
            <div className="card-body d-flex align-items-center gap-3">
                <div className={`fs-2 text-${color}`}>
                    <i className={`bi ${icono}`} aria-hidden="true"></i>
                </div>
                <div>
                    <div className="text-muted small">{titulo}</div>
                    <div className="fs-3 fw-bold lh-1">{valor ?? '—'}</div>
                    {subtitulo && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{subtitulo}</div>}
                </div>
            </div>
        </div>
    );
}

function BarraProgreso({ etiqueta, valor, total, color }) {
    const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
    return (
        <div className="mb-2">
            <div className="d-flex justify-content-between small mb-1">
                <span>{etiqueta}</span>
                <span className="fw-semibold">{valor} <span className="text-muted">({pct}%)</span></span>
            </div>
            <div className="progress" style={{ height: '6px' }}>
                <div
                    className={`progress-bar bg-${color}`}
                    style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
                />
            </div>
        </div>
    );
}

function TablaResumen({ filas, columnas, vacia }) {
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
    const { user, isInitialLoading } = useUsers();
    const base = import.meta.env.VITE_BACKEND_DASHBOARD || `${import.meta.env.VITE_BACKEND}/dashboard`;
    const esAdmin = user?.departamento > 1;

    // ── Estado ──
    const [cargando, setCargando]             = useState(true);
    const [ultimaActualizacion, setUltima]    = useState(null);

    // Datos personales
    const [perfil, setPerfil]                 = useState(null);
    const [fichajes, setFichajes]             = useState([]);
    const [incidencias, setIncidencias]       = useState([]);
    const [vacaciones, setVacaciones]         = useState([]);
    const [kpisPersonales, setKpisPersonales] = useState(null);

    // Datos globales (solo admin)
    const [kpisGlobales, setKpisGlobales]     = useState(null);

    // Fichaje en curso
    const [ahora, setAhora]                         = useState(new Date());
    const [mensajeFichaje, setMensajeFichaje]       = useMensaje();
    const [enviandoFichaje, setEnviandoFichaje]     = useState(false);
    const [tipoSeleccionado, setTipoSeleccionado]   = useState('Presencial');

    useEffect(() => {
        const tick = setInterval(() => setAhora(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    // ── Carga de datos ──
    const cargarDatos = useCallback(async (silencioso = false) => {
        if (isInitialLoading || !user?.username) return;
        if (!silencioso) setCargando(true);
        try {
            const headers = { token: user?.token };
            const peticiones = [
                apiFetch(`${base}?username=${encodeURIComponent(user.username)}`, { headers }),
            ];
            if (esAdmin) peticiones.push(apiFetch(base, { headers }));

            const respuestas = await Promise.all(peticiones);
            const [dataPersonal, dataAdmin] = await Promise.all(respuestas.map(r => r.json()));

            if (!dataPersonal?.perfil) {
                console.error('Dashboard: no se encontró perfil para', user.username, dataPersonal);
            }

            setPerfil(dataPersonal?.perfil ?? null);
            setFichajes(dataPersonal?.fichajes ?? []);
            setIncidencias(dataPersonal?.incidencias ?? []);
            setVacaciones(dataPersonal?.vacaciones ?? []);
            setKpisPersonales(dataPersonal?.kpis ?? null);

            if (esAdmin && dataAdmin) setKpisGlobales(dataAdmin?.kpis ?? null);

            setUltima(new Date());
        } catch (e) {
            console.error('Error cargando dashboard:', e);
        } finally {
            setCargando(false);
        }
    }, [isInitialLoading, user?.token, user?.username, esAdmin, base]);

    useEffect(() => {
        if (isInitialLoading) return;
        cargarDatos();
        const intervalo = setInterval(() => cargarDatos(true), INTERVALO_RECARGA * 1000);
        return () => clearInterval(intervalo);
    }, [cargarDatos, isInitialLoading]);

    // ── Derivados personales ──
    const fichajeActivo  = fichajes.find(f => f.fecha_entrada && !f.fecha_salida) ?? null;
    const incAbiertas    = kpisPersonales?.incidencias?.abiertas  ?? 0;
    const incTotal       = kpisPersonales?.incidencias?.total     ?? 0;
    const vacPendientes  = kpisPersonales?.vacaciones?.pendientes ?? 0;
    const vacTotal       = kpisPersonales?.vacaciones?.total      ?? 0;

    // ── Derivados globales ──
    const inc = kpisGlobales?.incidencias ?? {};
    const inv = kpisGlobales?.inventario  ?? {};
    const vac = kpisGlobales?.vacaciones  ?? {};

    const incGlobalPendientes = (inc['Abierta']   ?? 0) + (inc['Pendiente'] ?? 0);
    const incGlobalEnProceso  =  inc['En proceso'] ?? 0;
    const incGlobalResueltas  = (inc['Cerrada']   ?? 0) + (inc['Resuelta'] ?? 0);
    const incGlobalTotal      =  inc.total         ?? 0;
    const ratioResolucion     = incGlobalTotal > 0 ? Math.round((incGlobalResueltas / incGlobalTotal) * 100) : 0;

    const invDisponible    = inv['Disponible']          ?? 0;
    const invNoDisponible  = inv['No disponible']       ?? 0;
    const invEnvio         = inv['En proceso de envio'] ?? 0;
    const invMantenimiento = inv['En mantenimiento']    ?? 0;
    const invTotal         = inv.total                  ?? 0;

    const vacGlobalPendientes  = (vac['En revisión'] ?? vac['En revision'] ?? 0) + (vac['Pendiente'] ?? 0);
    const vacGlobalAprobadas   = (vac['Concedido']   ?? 0) + (vac['Aprobada']   ?? 0);
    const vacGlobalRechazadas  = (vac['Rechazado']   ?? 0) + (vac['Rechazada']  ?? 0);
    const vacGlobalTotal       =  vac.total ?? 0;

    // ── Acción fichaje ──
    async function handleFichaje(accion) {
        setEnviandoFichaje(true);
        setMensajeFichaje(null);
        try {
            const params = accion === 'entrada'
                ? { username: user.username, tipo: tipoSeleccionado }
                : { id: fichajeActivo.id, username: user.username, tipo: fichajeActivo.tipo ?? 'Presencial' };
            const res = await apiFetch(`${import.meta.env.VITE_BACKEND}/fichajes`, {
                method: 'POST',
                headers: { token: user.token, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(params).toString(),
            });
            const data = await res.json();
            if (res.ok) {
                setMensajeFichaje({ tipo: 'success', texto: accion === 'entrada' ? 'Entrada registrada.' : 'Salida registrada.' });
                cargarDatos(true);
            } else {
                setMensajeFichaje({ tipo: 'danger', texto: data?.message ?? 'Error al registrar fichaje.' });
            }
        } catch {
            setMensajeFichaje({ tipo: 'danger', texto: 'Error de conexión.' });
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
        <div className="container-fluid px-4 py-4">

            {/* ══════════════════════════════════════════════
                SECCIÓN PERSONAL
            ══════════════════════════════════════════════ */}

            {/* ── Bienvenida ── */}
            <div className="card border-0 shadow-sm mb-4 dashboard-hero text-white rounded-3 p-4">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 56, height: 56 }}
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
                    <div className={`card border-0 shadow-sm h-100 border-start border-4 border-${fichajeActivo ? 'success' : 'secondary'}`}>
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <i className={`bi bi-clock-fill fs-5 text-${fichajeActivo ? 'success' : 'secondary'}`} aria-hidden="true"></i>
                                <span className="fw-semibold small">Fichaje</span>
                                <span className={`badge ms-auto text-bg-${fichajeActivo ? 'success' : 'secondary'}`}>
                                    {fichajeActivo ? 'EN CURSO' : 'FUERA'}
                                </span>
                            </div>
                            <div className="text-muted small mb-3">
                                {fichajeActivo ? (
                                    <>
                                        <span>Entrada: <b>{formatHora(fichajeActivo.fecha_entrada)}</b></span>
                                        <span className="mx-1">·</span>
                                        <span>Duración: <b>{calcularDuracion(fichajeActivo.fecha_entrada, null)}</b></span>
                                        <span className="mx-1">·</span>
                                        <span className="text-primary fw-semibold">
                                            {ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
                                    <label htmlFor="tipoFichaje" className="form-label small mb-1">Tipo de registro</label>
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
                                <i className={`bi bi-${fichajeActivo ? 'door-open' : 'door-closed-fill'} me-1`} aria-hidden="true"></i>
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
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>de {incTotal} totales</div>
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
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>de {vacTotal} totales</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Fichajes recientes ── */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-transparent border-bottom pb-2 pt-3 px-3 d-flex justify-content-between align-items-center">
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
                            { key: 'fecha', label: 'Fecha', className: 'ps-3', render: f => formatFecha(f.fecha_entrada) },
                            { key: 'entrada', label: 'Entrada', render: f => formatHora(f.fecha_entrada) },
                            { key: 'salida', label: 'Salida', render: f => formatHora(f.fecha_salida) },
                            { key: 'tipo', label: 'Tipo', render: f => f.tipo ?? '—' },
                            { key: 'duracion', label: 'Duración', render: f => f.fecha_salida
                                ? calcularDuracion(f.fecha_entrada, f.fecha_salida)
                                : <span className="badge text-bg-success">En curso</span>
                            },
                        ]}
                    />
                </div>
            </div>

            {/* ── Mis incidencias ── */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-transparent border-bottom pb-2 pt-3 px-3 d-flex justify-content-between align-items-center">
                    <h6 className="fw-semibold mb-0">
                        <i className="bi bi-bookmark me-2 text-warning" aria-hidden="true"></i>Mis incidencias
                    </h6>
                    <NavLink to="/incidencia" className="btn btn-outline-warning btn-sm">
                        Ver más <i className="bi bi-arrow-right ms-1" aria-hidden="true"></i>
                    </NavLink>
                </div>
                <div className="card-body p-0">
                    <TablaResumen
                        vacia="No hay incidencias registradas."
                        filas={incidencias.slice(0, 5)}
                        columnas={[
                            { key: 'id', label: '#', className: 'ps-3', render: i => i.ID ?? i.id ?? '—' },
                            { key: 'fecha', label: 'Fecha', render: i => formatFecha(i.fecha_creacion?.slice(0, 10)) },
                            { key: 'estado', label: 'Estado', render: i => (
                                <span className={`badge ${obtenerClaseEstado(i.estado)}`}>{i.estado ?? '—'}</span>
                            )},
                            { key: 'obs', label: 'Observaciones', className: 'text-truncate', render: i => i.Observaciones ?? i.observaciones ?? '—' },
                        ]}
                    />
                </div>
            </div>

            {/* ── Mis solicitudes de vacaciones ── */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-transparent border-bottom pb-2 pt-3 px-3 d-flex justify-content-between align-items-center">
                    <h6 className="fw-semibold mb-0">
                        <i className="bi bi-calendar-check me-2 text-info" aria-hidden="true"></i>Mis solicitudes de vacaciones
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
                            { key: 'id', label: '#', className: 'ps-3', render: v => v.id_incidencia ?? '—' },
                            { key: 'tipo', label: 'Tipo', render: v => v.tipo ?? '—' },
                            { key: 'inicio', label: 'Inicio', render: v => formatFecha(v.fecha_inicio?.slice(0, 10)) },
                            { key: 'fin', label: 'Fin', render: v => formatFecha(v.fecha_fin?.slice(0, 10)) },
                            { key: 'estado', label: 'Estado', render: v => (
                                <span className={`badge ${obtenerClaseEstado(v.estado)}`}>{v.estado ?? '—'}</span>
                            )},
                        ]}
                    />
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                SECCIÓN ESTADÍSTICAS GLOBALES (solo admins)
            ══════════════════════════════════════════════ */}
            {esAdmin && kpisGlobales && (
                <>
                    <hr className="my-4" />

                    <h6 className="fw-semibold text-muted mb-3 text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                        <i className="bi bi-bar-chart-fill me-2" aria-hidden="true"></i>
                        Estadísticas globales
                    </h6>

                    {/* KPIs globales */}
                    <div className="row g-3 mb-4 justify-content-center">
                        <div className="col-6 col-md-4 col-lg">
                            <KpiCard icono="bi-people-fill"               titulo="Empleados"   valor={kpisGlobales.empleados}                                          color="primary" />
                        </div>
                        <div className="col-6 col-md-4 col-lg">
                            <KpiCard icono="bi-exclamation-triangle-fill" titulo="Incidencias" valor={incGlobalTotal}   subtitulo={`${incGlobalPendientes} abiertas`}   color="warning" />
                        </div>
                        <div className="col-6 col-md-4 col-lg">
                            <KpiCard icono="bi-box-seam-fill"             titulo="Inventario"  valor={invTotal}         subtitulo={`${invDisponible} disponibles`}      color="info" />
                        </div>
                        <div className="col-6 col-md-4 col-lg">
                            <KpiCard icono="bi-clock-history"             titulo="Fichajes"    valor={kpisGlobales.fichajes}                                           color="secondary" />
                        </div>
                        <div className="col-6 col-md-4 col-lg">
                            <KpiCard icono="bi-umbrella-fill"             titulo="Vacaciones"  valor={vacGlobalTotal}   subtitulo={`${vacGlobalPendientes} pendientes`} color="success" />
                        </div>
                    </div>

                    {/* Gráficas */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <h6 className="fw-semibold mb-3">
                                        <i className="bi bi-exclamation-circle me-2 text-warning" aria-hidden="true"></i>
                                        Incidencias por estado
                                    </h6>
                                    <BarraProgreso etiqueta="Abiertas"   valor={incGlobalPendientes} total={incGlobalTotal} color="danger" />
                                    <BarraProgreso etiqueta="En proceso" valor={incGlobalEnProceso}  total={incGlobalTotal} color="warning" />
                                    <BarraProgreso etiqueta="Resueltas"  valor={incGlobalResueltas}  total={incGlobalTotal} color="success" />
                                    <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">Ratio de resolución</span>
                                        <span className={`fw-bold fs-5 text-${ratioResolucion >= 70 ? 'success' : ratioResolucion >= 40 ? 'warning' : 'danger'}`}>
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
                                    <BarraProgreso etiqueta="Disponible"          valor={invDisponible}    total={invTotal} color="success" />
                                    <BarraProgreso etiqueta="No disponible"       valor={invNoDisponible}  total={invTotal} color="danger" />
                                    <BarraProgreso etiqueta="En proceso de envío" valor={invEnvio}         total={invTotal} color="primary" />
                                    <BarraProgreso etiqueta="En mantenimiento"    valor={invMantenimiento} total={invTotal} color="warning" />
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
                                    <BarraProgreso etiqueta="Pendientes"  valor={vacGlobalPendientes} total={vacGlobalTotal} color="warning" />
                                    <BarraProgreso etiqueta="Concedidas"  valor={vacGlobalAprobadas}  total={vacGlobalTotal} color="success" />
                                    <BarraProgreso etiqueta="Rechazadas"  valor={vacGlobalRechazadas} total={vacGlobalTotal} color="danger" />
                                    <div className="mt-3 pt-2 border-top d-flex justify-content-between text-muted small">
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
