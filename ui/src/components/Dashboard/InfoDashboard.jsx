import React, { useEffect, useState, useCallback } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";

const INTERVALO_RECARGA = 300; // segundos

// Límites máximos definidos en paginacion.mjs del backend
const LIMITE = {
    empleados:     15,
    productos:     25,
    contratos:     15,
    departamentos: 15,
    default:       10,
};

/**
 * Recorre todas las páginas de un endpoint paginado y devuelve todos los registros.
 */
async function fetchTodos(url, headers, cantidad) {
    let pagina = 0;
    let todos = [];
    while (true) {
        const res = await apiFetch(`${url}?pagina=${pagina}&cantidad=${cantidad}`, { headers });
        if (!res.ok) break;
        const data = await res.json();
        const registros = data?.data ?? [];
        todos = [...todos, ...registros];
        // Paramos si recibimos menos registros de los pedidos (última página)
        // o si el backend nos da totalPaginas fiable
        const totalPaginas = data?.meta?.totalPaginas;
        if (registros.length === 0) break;
        if (totalPaginas != null && pagina >= totalPaginas - 1) break;
        if (totalPaginas == null && registros.length < cantidad) break;
        pagina++;
    }
    return todos;
}

/**
 * Dashboard principal para el control general de la aplicación.
 * Muestra KPIs, gráficas y tablas de todos los módulos.
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.1.0
 * @constructor
 */

function KpiCard({ icono, titulo, valor, subtitulo, color }) {
    return (
        <div className={`card border-0 shadow-sm h-100 border-start border-4 border-${color}`}>
            <div className="card-body d-flex align-items-center gap-3">
                <div className={`fs-2 text-${color}`}>
                    <i className={`bi ${icono}`}></i>
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

function Countdown({ segundos, total }) {
    const pct = ((total - segundos) / total) * 100;
    return (
        <div className="d-flex align-items-center gap-2 text-muted small">
            <div className="progress flex-grow-1" style={{ height: '4px' }}>
                <div
                    className="progress-bar bg-primary"
                    style={{ width: `${pct}%`, transition: 'width 1s linear' }}
                />
            </div>
            <span>Actualiza en {segundos}s</span>
        </div>
    );
}

export function InfoDashboard() {
    const { user } = useUsers();

    const [cargando, setCargando]          = useState(true);
    const [ultimaActualizacion, setUltima] = useState(null);
    const [countdown, setCountdown]        = useState(INTERVALO_RECARGA);

    const [empleados, setEmpleados]         = useState([]);
    const [incidencias, setIncidencias]     = useState([]);
    const [inventario, setInventario]       = useState([]);
    const [fichajes, setFichajes]           = useState([]);
    const [vacaciones, setVacaciones]       = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [contratos, setContratos]         = useState([]);

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        try {
            const headers = { token: user?.token };
            const [
                resEmp, resInc, resInv,
                resFich, resVac, resDep, resCon
            ] = await Promise.all([
                fetchTodos(import.meta.env.VITE_BACKEND_EMPLEADO,             headers, LIMITE.empleados),
                fetchTodos(import.meta.env.VITE_BACKEND_PERMISOS,             headers, LIMITE.default),
                fetchTodos(import.meta.env.VITE_BACKEND_PRODUCTO,             headers, LIMITE.productos),
                fetchTodos(import.meta.env.VITE_BACKEND_LISTA_EMPLEADOS?.replace('empleados', 'fichajes'),   headers, LIMITE.default).catch(() => []),
                fetchTodos(import.meta.env.VITE_BACKEND_LISTA_EMPLEADOS?.replace('empleados', 'vacaciones'), headers, LIMITE.default).catch(() => []),
                fetchTodos(import.meta.env.VITE_BACKEND_DEPARTAMENTOS,                                       headers, LIMITE.departamentos).catch(() => []),
                fetchTodos(import.meta.env.VITE_BACKEND_LISTA_EMPLEADOS?.replace('empleados', 'contratos'),  headers, LIMITE.contratos).catch(() => []),
            ]);

            setEmpleados(resEmp);
            setIncidencias(resInc);
            setInventario(resInv);
            setFichajes(resFich);
            setVacaciones(resVac);
            setDepartamentos(resDep);
            setContratos(resCon);
            setUltima(new Date());
            setCountdown(INTERVALO_RECARGA);
        } catch (e) {
            console.error('Error cargando dashboard:', e);
        } finally {
            setCargando(false);
        }
    }, [user?.token]);

    useEffect(() => {
        cargarDatos();
        const intervalo = setInterval(cargarDatos, INTERVALO_RECARGA * 1000);
        return () => clearInterval(intervalo);
    }, [cargarDatos]);

    useEffect(() => {
        const tick = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : INTERVALO_RECARGA));
        }, 1000);
        return () => clearInterval(tick);
    }, []);

    const incPendientes   = incidencias.filter(i => i?.estado === 'Abierta').length;
    const incEnProceso    = incidencias.filter(i => i?.estado === 'En proceso').length;
    const incResueltas    = incidencias.filter(i => i?.estado === 'Cerrada').length;

    const invDisponible   = inventario.filter(i => i?.Estado === 'Disponible').length;
    const invNoDisponible = inventario.filter(i => i?.Estado === 'No disponible').length;
    const invEnvio        = inventario.filter(i => i?.Estado === 'En proceso de envio').length;
    const invMantenimiento= inventario.filter(i => i?.Estado === 'En mantenimiento').length;

    const vacPendientes   = vacaciones.filter(v => v?.estado === 'En revisión').length;
    const vacAprobadas    = vacaciones.filter(v => v?.estado === 'Aprobada').length;

    const ratioResolucion = incidencias.length > 0
        ? Math.round((incResueltas / incidencias.length) * 100)
        : 0;

    return (
        <div className="container-fluid px-0">

            {/* ── Cabecera ── */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    {ultimaActualizacion && (
                        <small className="text-muted">
                            Última actualización: {ultimaActualizacion.toLocaleTimeString('es-ES')}
                        </small>
                    )}
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div style={{ minWidth: '220px' }}>
                        <Countdown segundos={countdown} total={INTERVALO_RECARGA} />
                    </div>
                    <button
                        className="btn btn-outline-primary btn-sm bi bi-arrow-clockwise"
                        onClick={cargarDatos}
                        disabled={cargando}
                        title="Recargar ahora"
                    >
                        {' '}Actualizar
                    </button>
                </div>
            </div>

            {cargando && (
                <div className="text-center text-muted py-3">
                    <div className="spinner-border spinner-border-sm me-2" />
                    Cargando datos...
                </div>
            )}

            {/* ── Fila 1: KPIs ── */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-md-4 col-xl-2">
                    <KpiCard icono="bi-people-fill"              titulo="Empleados"    valor={empleados.length}    color="primary" />
                </div>
                <div className="col-6 col-md-4 col-xl-2">
                    <KpiCard icono="bi-exclamation-triangle-fill" titulo="Incidencias"  valor={incidencias.length}  subtitulo={`${incPendientes} pendientes`} color="warning" />
                </div>
                <div className="col-6 col-md-4 col-xl-2">
                    <KpiCard icono="bi-box-seam-fill"            titulo="Inventario"   valor={inventario.length}   subtitulo={`${invDisponible} disponibles`} color="info" />
                </div>
                <div className="col-6 col-md-4 col-xl-2">
                    <KpiCard icono="bi-clock-history"            titulo="Fichajes"     valor={fichajes.length}     color="secondary" />
                </div>
                <div className="col-6 col-md-4 col-xl-2">
                    <KpiCard icono="bi-umbrella-fill"            titulo="Vacaciones"   valor={vacaciones.length}   subtitulo={`${vacPendientes} pendientes`} color="success" />
                </div>
                <div className="col-6 col-md-4 col-xl-2">
                    <KpiCard icono="bi-building"                 titulo="Departamentos" valor={departamentos.length} color="danger" />
                </div>
            </div>

            {/* ── Fila 2: Gráficas ── */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="fw-semibold mb-3">
                                <i className="bi bi-exclamation-circle me-2 text-warning"></i>
                                Incidencias por estado
                            </h6>
                            <BarraProgreso etiqueta="Abiertas" valor={incPendientes} total={incidencias.length} color="danger" />
                            <BarraProgreso etiqueta="En proceso" valor={incEnProceso}  total={incidencias.length} color="warning" />
                            <BarraProgreso etiqueta="Resueltas"  valor={incResueltas}  total={incidencias.length} color="success" />
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
                                <i className="bi bi-boxes me-2 text-info"></i>
                                Inventario por estado
                            </h6>
                            <BarraProgreso etiqueta="Disponible"          valor={invDisponible}    total={inventario.length} color="success" />
                            <BarraProgreso etiqueta="No disponible"       valor={invNoDisponible}  total={inventario.length} color="danger" />
                            <BarraProgreso etiqueta="En proceso de envío" valor={invEnvio}         total={inventario.length} color="primary" />
                            <BarraProgreso etiqueta="En mantenimiento"    valor={invMantenimiento} total={inventario.length} color="warning" />
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="fw-semibold mb-3">
                                <i className="bi bi-calendar-check me-2 text-success"></i>
                                Solicitudes de vacaciones
                            </h6>
                            <BarraProgreso etiqueta="Pendientes" valor={vacPendientes} total={vacaciones.length} color="warning" />
                            <BarraProgreso etiqueta="Aprobadas"  valor={vacAprobadas}  total={vacaciones.length} color="success" />
                            <div className="mt-3 pt-2 border-top">
                                <div className="d-flex justify-content-between small text-muted">
                                    <span>Total solicitudes</span>
                                    <span className="fw-semibold text-dark">{vacaciones.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Fila 3: Tablas ── */}
            <div className="row g-3">

                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom fw-semibold">
                            <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
                            Últimas incidencias
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-sm table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Título</th>
                                        <th>Estado</th>
                                        <th>Comentario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidencias.slice(0, 6).map(i => (
                                        <tr key={i?.ID}>
                                            <td className="text-muted small">{i?.ID}</td>
                                            <td className="small">{i?.Observaciones ?? '—'}</td>
                                            <td>
                                                <span className={`badge bg-${
                                                    i?.estado === 'Cerrada'    ? 'success' :
                                                    i?.estado === 'En proceso' ? 'warning' :
                                                    'danger'}`}>
                                                    {i?.estado ?? '—'}
                                                </span>
                                            </td>
                                            <td className="small">{i?.Comentario ?? '—'}</td>
                                        </tr>
                                    ))}
                                    {incidencias.length === 0 && (
                                        <tr><td colSpan={4} className="text-center text-muted py-3 small">Sin incidencias</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom fw-semibold">
                            <i className="bi bi-clock me-2 text-secondary"></i>
                            Últimos fichajes
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-sm table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Entrada</th>
                                        <th>Salida</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fichajes.slice(0, 6).map((f, idx) => (
                                        <tr key={f?.ID ?? idx}>
                                            <td className="small">{f?.USERNAME ?? f?.username ?? '—'}</td>
                                            <td className="small text-muted">
                                                {f?.fecha_entrada
                                                    ? new Date(f.fecha_entrada).toLocaleString('es-ES', { timeZone: 'UTC' })
                                                    : '—'}
                                            </td>
                                            <td className="small text-muted">
                                                {f?.fecha_salida
                                                    ? new Date(f.fecha_salida).toLocaleString('es-ES', { timeZone: 'UTC' })
                                                    : <span className="badge bg-success">Activo</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {fichajes.length === 0 && (
                                        <tr><td colSpan={3} className="text-center text-muted py-3 small">Sin fichajes</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom fw-semibold">
                            <i className="bi bi-box-seam me-2 text-info"></i>
                            Inventario reciente
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-sm table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventario.slice(0, 6).map(p => (
                                        <tr key={p?.ID}>
                                            <td className="text-muted small">{p?.ID}</td>
                                            <td className="small">{p?.Nombre ?? '—'}</td>
                                            <td>
                                                <span className={`badge bg-${
                                                    p?.Estado === 'Disponible'          ? 'success' :
                                                    p?.Estado === 'No disponible'       ? 'danger'  :
                                                    p?.Estado === 'En proceso de envio' ? 'primary' :
                                                    'warning'}`}>
                                                    {p?.Estado ?? '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {inventario.length === 0 && (
                                        <tr><td colSpan={3} className="text-center text-muted py-3 small">Sin productos</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom fw-semibold">
                            <i className="bi bi-building me-2 text-danger"></i>
                            Departamentos y contratos
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="text-muted small mb-2 fw-semibold">Departamentos</div>
                                    {departamentos.length === 0
                                        ? <p className="text-muted small">Sin datos</p>
                                        : departamentos.slice(0, 6).map(d => (
                                            <div key={d?.ID} className="d-flex justify-content-between border-bottom py-1 small">
                                                <span>{d?.Nombre ?? d?.nombre ?? '—'}</span>
                                                <span className="badge bg-light text-dark">{d?.ID}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className="col-6">
                                    <div className="text-muted small mb-2 fw-semibold">Contratos activos</div>
                                    {contratos.length === 0
                                        ? <p className="text-muted small">Sin datos</p>
                                        : contratos.slice(0, 6).map(c => (
                                            <div key={c?.ID} className="d-flex justify-content-between border-bottom py-1 small">
                                                <span>{c?.Nombre ?? c?.tipo ?? c?.nombre ?? '—'}</span>
                                                <span className="badge bg-light text-dark">{c?.ID}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
