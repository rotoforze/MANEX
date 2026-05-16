import { useEffect, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { useMensaje } from "../../hooks/useMensaje.js";

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

/**
 * Vista personal del dashboard para el empleado.
 * Muestra estado de fichaje, KPIs propios, fichajes recientes,
 * incidencias y solicitudes de vacaciones del usuario autenticado.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @returns {React.JSX.Element}
 */
export function InfoDashboardEmpleado() {
    const { user } = useUsers();
    const base = import.meta.env.VITE_BACKEND;

    const [perfil, setPerfil]           = useState(null);
    const [fichajes, setFichajes]       = useState([]);
    const [incidencias, setIncidencias] = useState([]);
    const [vacaciones, setVacaciones]   = useState([]);
    const [kpisEmpleado, setKpisEmpleado] = useState(null);
    const [cargando, setCargando]         = useState(true);
    const [mensajeFichaje, setMensajeFichaje] = useMensaje();
    const [enviandoFichaje, setEnviandoFichaje] = useState(false);
    const [tipoSeleccionado, setTipoSeleccionado] = useState('Presencial');
    const [ahora, setAhora]               = useState(new Date());

    useEffect(() => {
        const tick = setInterval(() => setAhora(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    const cargarDatos = useCallback(async (silencioso = false) => {
        if (!silencioso) setCargando(true);
        try {
            const urlDashboard = import.meta.env.VITE_BACKEND_DASHBOARD || `${base}/dashboard`;
            const res = await apiFetch(
                `${urlDashboard}?username=${encodeURIComponent(user?.username)}`,
                { headers: { token: user?.token } }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message);
            setPerfil(data?.perfil ?? null);
            setFichajes(data?.fichajes ?? []);
            setIncidencias(data?.incidencias ?? []);
            setVacaciones(data?.vacaciones ?? []);
            setKpisEmpleado(data?.kpis ?? null);
        } catch (e) {
            console.error(e);
        } finally {
            setCargando(false);
        }
    }, [user?.token, user?.username, base]);

    useEffect(() => { cargarDatos(); }, [cargarDatos]);

    const fichajeActivo = fichajes.find(f => f.fecha_entrada && !f.fecha_salida) ?? null;
    const incAbiertas   = kpisEmpleado?.incidencias?.abiertas  ?? incidencias.filter(i => i?.estado === 'Abierta' || i?.estado === 'Pendiente').length;
    const incTotal      = kpisEmpleado?.incidencias?.total     ?? incidencias.length;
    const vacPendientes = kpisEmpleado?.vacaciones?.pendientes ?? vacaciones.filter(v => v?.estado === 'En revisión' || v?.estado === 'Pendiente').length;
    const vacTotal      = kpisEmpleado?.vacaciones?.total      ?? vacaciones.length;

    async function handleFichaje(accion) {
        setEnviandoFichaje(true);
        setMensajeFichaje(null);
        try {
            const params = accion === 'entrada'
                ? { username: user.username, tipo: tipoSeleccionado }
                : { id: fichajeActivo.id, username: user.username, tipo: fichajeActivo.tipo ?? 'Presencial' };
            const res = await apiFetch(`${base}/fichajes`, {
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

    if (cargando) return (
        <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    return (
        <div className="container-fluid px-0">

            {/* ── Bienvenida ── */}
            <div className="card border-0 shadow-sm mb-4 dashboard-hero text-white rounded-3 p-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
                         style={{ width: 56, height: 56 }}>
                        <i className="bi bi-person-fill fs-3 text-white" aria-hidden="true"></i>
                    </div>
                    <div>
                        <h5 className="mb-0 fw-bold">
                            Bienvenido, {perfil?.nombre ?? user.username}{perfil?.apellidos ? ` ${perfil.apellidos}` : ''}
                        </h5>
                        <p className="mb-0 opacity-75 small">
                            {perfil?.email && (
                                <span className="me-3">
                                    <i className="bi bi-envelope me-1" aria-hidden="true"></i>{perfil.email}
                                </span>
                            )}
                            {perfil?.fecha_contratacion && (
                                <span>
                                    <i className="bi bi-calendar3 me-1" aria-hidden="true"></i>
                                    Desde {formatFecha(perfil.fecha_contratacion)}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── KPIs ── */}
            <div className="row g-3 mb-4">

                {/* Fichaje */}
                <div className="col-md-6 col-lg-4">
                    <div className={`card border-0 shadow-sm h-100 border-start border-4 border-${fichajeActivo ? 'success' : 'secondary'}`}>
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <i className={`bi bi-clock-fill fs-5 text-${fichajeActivo ? 'success' : 'secondary'}`} aria-hidden="true"></i>
                                <span className="fw-semibold small">Fichaje</span>
                                <span className={`badge ms-auto text-bg-${fichajeActivo ? 'success' : 'secondary'}`}>
                                    {fichajeActivo ? 'EN ENTRADA' : 'FUERA'}
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

                {/* Incidencias */}
                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="fs-2 text-warning">
                                <i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
                            </div>
                            <div>
                                <div className="text-muted small">Incidencias abiertas</div>
                                <div className="fs-3 fw-bold lh-1">{incAbiertas}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>de {incTotal} totales</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vacaciones */}
                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-info">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="fs-2 text-info">
                                <i className="bi bi-calendar-check-fill" aria-hidden="true"></i>
                            </div>
                            <div>
                                <div className="text-muted small">Solicitudes pendientes</div>
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
                    {fichajes.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-sm table-striped mb-0">
                                <thead>
                                    <tr>
                                        <th scope="col" className="ps-3">Fecha</th>
                                        <th scope="col">Entrada</th>
                                        <th scope="col">Salida</th>
                                        <th scope="col">Tipo</th>
                                        <th scope="col">Duración</th>
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {fichajes.slice(0, 7).map((f, i) => (
                                        <tr key={f.id ?? i}>
                                            <td className="ps-3">{formatFecha(f.fecha_entrada)}</td>
                                            <td>{formatHora(f.fecha_entrada)}</td>
                                            <td>{formatHora(f.fecha_salida)}</td>
                                            <td>{f.tipo ?? '—'}</td>
                                            <td>
                                                {f.fecha_salida
                                                    ? calcularDuracion(f.fecha_entrada, f.fecha_salida)
                                                    : <span className="badge text-bg-success">En curso</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="tabla-empty-state">
                            <i className="bi bi-person-check tabla-empty-icon" aria-hidden="true" />
                            <p className="text-muted mb-0">No hay fichajes registrados.</p>
                        </div>
                    )}
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
                    {incidencias.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-sm table-striped mb-0">
                                <thead>
                                    <tr>
                                        <th scope="col" className="ps-3">#</th>
                                        <th scope="col">Fecha</th>
                                        <th scope="col">Estado</th>
                                        <th scope="col">Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {incidencias.slice(0, 5).map((inc, i) => (
                                        <tr key={inc.ID ?? inc.id ?? i}>
                                            <td className="ps-3">{inc.ID ?? inc.id ?? '—'}</td>
                                            <td>{formatFecha(inc.fecha_creacion?.slice(0, 10))}</td>
                                            <td>
                                                <span className={`badge ${obtenerClaseEstado(inc.estado)}`}>
                                                    {inc.estado ?? '—'}
                                                </span>
                                            </td>
                                            <td className="text-truncate" style={{ maxWidth: 200 }}>
                                                {inc.Observaciones ?? inc.observaciones ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="tabla-empty-state">
                            <i className="bi bi-bookmark tabla-empty-icon" aria-hidden="true" />
                            <p className="text-muted mb-0">No hay incidencias registradas.</p>
                        </div>
                    )}
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
                    {vacaciones.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-sm table-striped mb-0">
                                <thead>
                                    <tr>
                                        <th scope="col" className="ps-3">#</th>
                                        <th scope="col">Tipo</th>
                                        <th scope="col">Inicio</th>
                                        <th scope="col">Fin</th>
                                        <th scope="col">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {vacaciones.slice(0, 5).map((v, i) => (
                                        <tr key={v.id_incidencia ?? i}>
                                            <td className="ps-3">{v.id_incidencia ?? '—'}</td>
                                            <td>{v.tipo ?? '—'}</td>
                                            <td>{formatFecha(v.fecha_inicio?.slice(0, 10))}</td>
                                            <td>{formatFecha(v.fecha_fin?.slice(0, 10))}</td>
                                            <td>
                                                <span className={`badge ${obtenerClaseEstado(v.estado)}`}>
                                                    {v.estado ?? '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="tabla-empty-state">
                            <i className="bi bi-calendar-check tabla-empty-icon" aria-hidden="true" />
                            <p className="text-muted mb-0">No hay solicitudes registradas.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
