import React, { useState, useEffect } from 'react';
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";

/**
 *@author Covadonga Blanco Alvarez
 * @version 1.0
 * @param {Object}   empleado -
 * @param {Function} onClose  
 */
export function VerEmpleado({ empleado, onClose }) {
    const { user } = useUsers();

    const [seccionActiva, setSeccionActiva] = useState('personal');

    const [fichajes,    setFichajes]    = useState([]);
    const [incidencias, setIncidencias] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [nombreDpto,  setNombreDpto]  = useState(null);

    const [cargandoFichajes,    setCargandoFichajes]    = useState(false);
    const [cargandoIncidencias, setCargandoIncidencias] = useState(false);
    const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false);
    const [cargandoDpto,        setCargandoDpto]        = useState(false);

    const [errorFichajes,    setErrorFichajes]    = useState(null);
    const [errorIncidencias, setErrorIncidencias] = useState(null);
    const [errorSolicitudes, setErrorSolicitudes] = useState(null);

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'token': user?.token,
    };

    const BASE = import.meta.env.VITE_BACKEND;

    // Departamento 
    useEffect(() => {
        if (!empleado?.ID_DEPARTAMENTO) return;
        setCargandoDpto(true);
        apiFetch(
            import.meta.env.VITE_BACKEND_DEPARTAMENTOS,
            { method: 'GET', headers }
        )
            .then(r => r.json())
            .then(d => {
                const lista = d?.data ?? d?.usuario ?? [];
                const dpto  = lista.find(dep =>
                    String(dep?.ID ?? dep?.id) === String(empleado.ID_DEPARTAMENTO)
                );
                setNombreDpto(dpto?.Nombre ?? dpto?.nombre ?? dpto?.NOMBRE ?? null);
            })
            .catch(() => setNombreDpto(null))
            .finally(() => setCargandoDpto(false));
    }, [empleado?.ID_DEPARTAMENTO]);

    // Fichajes 
    useEffect(() => {
        if (!empleado?.USERNAME) return;
        setCargandoFichajes(true);
        setErrorFichajes(null);
        apiFetch(
            `${BASE}/fichajes?username=${encodeURIComponent(empleado.USERNAME)}`,
            { method: 'GET', headers }
        )
            .then(r => r.json())
            .then(d => setFichajes(!d?.usuario ? [] : d.usuario))
            .catch(() => setErrorFichajes('No se pudieron cargar los fichajes.'))
            .finally(() => setCargandoFichajes(false));
    }, [empleado?.USERNAME]);

    // Incidencias 
     useEffect(() => {
            if (!empleado?.ID) return;
            setCargandoIncidencias(true);
            setErrorIncidencias(null);
            apiFetch(
                `${BASE}/incidencias?id_empleado=${empleado.ID}`,
                { method: 'GET', headers }
            )
                .then(r => r.json())
                .then(d => setIncidencias(!d?.usuario ? [] : d.usuario))
                .catch(() => setErrorIncidencias('No se pudieron cargar las incidencias.'))
                .finally(() => setCargandoIncidencias(false));
        }, [empleado?.ID]);

    // Vacaciones 
    useEffect(() => {
        if (!empleado?.ID) return;
        setCargandoSolicitudes(true);
        setErrorSolicitudes(null);
        apiFetch(
            `${BASE}/vacaciones?id_empleado=${empleado.ID}`,
            { method: 'GET', headers }
        )
            .then(r => r.json())
            .then(d => setSolicitudes(!d?.usuario ? [] : d.usuario))
            .catch(() => setErrorSolicitudes('No se pudieron cargar las solicitudes.'))
            .finally(() => setCargandoSolicitudes(false));
    }, [empleado?.ID]);

    // Horas este mes 
    const horasMes = React.useMemo(() => {
        const ahora   = new Date();
        const mes     = ahora.getMonth();
        const ano     = ahora.getFullYear();
        const del_mes = fichajes.filter(f => {
            if (!f.fecha_entrada || !f.fecha_salida) return false;
            const d = new Date(f.fecha_entrada);
            return d.getMonth() === mes && d.getFullYear() === ano;
        });
        const totalMs = del_mes.reduce(
            (acc, f) => acc + (new Date(f.fecha_salida) - new Date(f.fecha_entrada)),
            0
        );
        return {
            horas:    Math.floor(totalMs / 3600000),
            minutos:  Math.floor((totalMs % 3600000) / 60000),
            cantidad: del_mes.length,
        };
    }, [fichajes]);

    const fmt = (fecha) =>
        fecha ? new Date(fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A';

    const fmtDT = (fecha) =>
        fecha ? new Date(fecha).toLocaleString('es-ES', { timeZone: 'UTC', hour12: false }) : '—';

    const estadoBadge = (estado) => ({
        pendiente:  'warning',
        resuelta:   'success',
        aprobada:   'success',
        rechazada:  'danger',
        abierta:    'danger',
        en_proceso: 'info',
        cerrada:    'secondary',
    }[estado?.toLowerCase()] ?? 'secondary');

    const Spinner = () => (
        <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    const EmptyState = ({ icono, texto }) => (
        <div className="text-center py-5">
            <i className={`bi ${icono} text-muted`} style={{ fontSize: '2rem' }} />
            <p className="text-muted mt-2 small mb-0">{texto}</p>
        </div>
    );

    const ErrorState = ({ texto }) => (
        <p className="text-muted text-center small py-4 mb-0">
            <i className="bi bi-wifi-off me-1" />{texto}
        </p>
    );

    const secciones = [
        { id: 'personal',    label: 'Datos personales', icon: 'bi-person-fill' },
        { id: 'horas',       label: 'Horas este mes',   icon: 'bi-clock-fill' },
        { id: 'fichajes',    label: 'Fichajes',          icon: 'bi-calendar2-check-fill' },
        { id: 'solicitudes', label: 'Solicitudes',       icon: 'bi-file-earmark-text-fill' },
        { id: 'incidencias', label: 'Incidencias',       icon: 'bi-exclamation-triangle-fill' },
    ];

    return (
        <div className="superponer">
            <div
                className="card confirmacion"
                style={{ width: 'min(95dvw, 1100px)', maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}
            >

                <div className="card-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                            style={{ width: 38, height: 38, fontSize: '0.85rem' }}
                        >
                            {(empleado?.Nombre?.[0] ?? '?').toUpperCase()}
                            {(empleado?.Apellidos?.[0] ?? '').toUpperCase()}
                        </div>
                        <div className="fw-semibold" style={{ fontSize: '0.95rem' }}>
                            {empleado?.Nombre} {empleado?.Apellidos}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={onClose}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="border-bottom px-3 pt-2" style={{ background: 'var(--bs-light, #f8f9fa)' }}>
                    <ul className="nav nav-tabs border-0" style={{ flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none' }}>
                        {secciones.map(s => (
                            <li key={s.id} className="nav-item">
                                <button
                                    className={`nav-link border-0 small d-flex align-items-center gap-1 ${seccionActiva === s.id ? 'active fw-semibold' : 'text-muted'}`}
                                    onClick={() => setSeccionActiva(s.id)}
                                    style={{
                                        whiteSpace: 'nowrap',
                                        background: 'transparent',
                                        borderBottom: seccionActiva === s.id
                                            ? '2px solid var(--bs-primary)'
                                            : '2px solid transparent',
                                    }}
                                >
                                    <i className={`bi ${s.icon}`} aria-hidden="true" style={{ fontSize: '0.75rem' }} />
                                    {s.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card-body p-3" style={{ overflowY: 'auto', flex: 1 }}>

                    {/* Datos Personales */}
                    {seccionActiva === 'personal' && (
                        <div>
                            <h5 className="mb-3 small fw-semibold text-uppercase text-muted">
                                <i className="bi bi-person-fill me-1" />Información personal
                            </h5>
                            <div className="row g-2">
                                {[
                                    { label: 'Nombre',           value: empleado?.Nombre },
                                    { label: 'Apellidos',        value: empleado?.Apellidos },
                                    { label: 'Email',            value: empleado?.email },
                                    { label: 'Teléfono',         value: empleado?.telefono },
                                    { label: 'Fecha nacimiento', value: fmt(empleado?.fecha_nacimiento) },
                                    { label: 'Fecha de alta',    value: fmt(empleado?.fecha_alta) },
                                    {
                                        label: 'Rol',
                                        value: cargandoDpto
                                            ? <span className="text-muted fst-italic" style={{ fontSize: '0.8rem' }}>Cargando...</span>
                                            : (nombreDpto ?? '—'),
                                    },
                                ].map(({ label, value }) => (
                                    <div key={label} className="col-sm-6 col-md-4">
                                        <div className="border rounded p-2" style={{ background: 'var(--bs-light, #f8f9fa)' }}>
                                            <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                {label}
                                            </div>
                                            <div className="fw-medium" style={{ fontSize: '0.85rem' }}>
                                                {value ?? <span className="text-muted">—</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Horas del mes*/}
                    {seccionActiva === 'horas' && (
                        <div>
                            <h5 className="mb-3 small fw-semibold text-uppercase text-muted">
                                <i className="bi bi-clock-fill me-1" />Horas trabajadas este mes
                            </h5>
                            {cargandoFichajes ? <Spinner /> : (
                                <div className="d-flex flex-column align-items-center justify-content-center py-4 gap-3">
                                    <div
                                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                                        style={{ width: 140, height: 140 }}
                                    >
                                        <div className="text-center">
                                            <div className="fw-bold text-primary" style={{ fontSize: '2.4rem', lineHeight: 1 }}>
                                                {horasMes.horas}
                                            </div>
                                            <div className="text-muted small">horas</div>
                                        </div>
                                    </div>
                                    <div className="text-muted small">{horasMes.minutos} minutos adicionales</div>
                                    <div className="text-muted small">
                                        Calculado a partir de {horasMes.cantidad} fichaje{horasMes.cantidad !== 1 ? 's' : ''} completado{horasMes.cantidad !== 1 ? 's' : ''} este mes
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/*Fichajes */}
                    {seccionActiva === 'fichajes' && (
                        <div>
                            <h5 className="mb-3 small fw-semibold text-uppercase text-muted">
                                <i className="bi bi-calendar2-check-fill me-1" />Últimos fichajes
                            </h5>
                            {cargandoFichajes ? <Spinner /> :
                             errorFichajes    ? <ErrorState texto={errorFichajes} /> :
                             fichajes.length === 0
                                ? <EmptyState icono="bi-calendar-x" texto="No hay fichajes registrados." />
                                : (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-striped table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="small">Entrada</th>
                                                    <th className="small">Salida</th>
                                                    <th className="small">Tipo</th>
                                                    <th className="small">Duración</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fichajes.slice(0, 20).map(f => {
                                                    const durMs = f.fecha_salida
                                                        ? new Date(f.fecha_salida) - new Date(f.fecha_entrada)
                                                        : null;
                                                    return (
                                                        <tr key={f.id}>
                                                            <td className="small">{fmtDT(f.fecha_entrada)}</td>
                                                            <td className="small">{fmtDT(f.fecha_salida)}</td>
                                                            <td className="small">
                                                                <span className="badge bg-secondary">{f.tipo ?? '—'}</span>
                                                            </td>
                                                            <td className="small">
                                                                {durMs !== null
                                                                    ? `${Math.floor(durMs / 3600000)}h ${Math.floor((durMs % 3600000) / 60000)}m`
                                                                    : <span className="text-warning small">En curso</span>}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {fichajes.length > 20 && (
                                            <p className="text-muted text-center small">
                                                Mostrando los 20 más recientes de {fichajes.length} totales.
                                            </p>
                                        )}
                                    </div>
                                )
                            }
                        </div>
                    )}

                    {/* Solicitudes */}
                    {seccionActiva === 'solicitudes' && (
                        <div>
                            <h5 className="mb-3 small fw-semibold text-uppercase text-muted">
                                <i className="bi bi-file-earmark-text-fill me-1" />Solicitudes de vacaciones
                            </h5>
                            {cargandoSolicitudes ? <Spinner /> :
                             errorSolicitudes     ? <ErrorState texto={errorSolicitudes} /> :
                             solicitudes.length === 0
                                ? <EmptyState icono="bi-file-earmark-x" texto="No hay solicitudes de vacaciones." />
                                : (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-striped table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="small">Fecha inicio</th>
                                                    <th className="small">Fecha fin</th>
                                                    <th className="small">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {solicitudes.map(s => (
                                                    <tr key={s.ID ?? s.id}>
                                                        <td className="small">{fmt(s.fecha_inicio)}</td>
                                                        <td className="small">{fmt(s.fecha_fin)}</td>
                                                        <td className="small">
                                                            <span className={`badge bg-${estadoBadge(s.estado)}`}>
                                                                {s.estado ?? '—'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            }
                        </div>
                    )}

                    {/* Incidencias*/}
                    {seccionActiva === 'incidencias' && (
                        <div>
                            <h5 className="mb-3 small fw-semibold text-uppercase text-muted">
                                <i className="bi bi-exclamation-triangle-fill me-1" />Incidencias
                            </h5>
                            {cargandoIncidencias ? <Spinner /> :
                             errorIncidencias     ? <ErrorState texto={errorIncidencias} /> :
                             incidencias.length === 0
                                ? <EmptyState icono="bi-shield-check" texto="No hay incidencias registradas." />
                                : (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-striped table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="small">Estado</th>
                                                    <th className="small">Fecha creación</th>
                                                    <th className="small">Observaciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {incidencias.map(inc => (
                                                    <tr key={inc.ID ?? inc.id}>
                                                        <td className="small">
                                                            <span className={`badge bg-${estadoBadge(inc.estado)}`}>
                                                                {inc.estado ?? '—'}
                                                            </span>
                                                        </td>
                                                        <td className="small">{fmtDT(inc.fecha_creacion)}</td>
                                                        <td className="small text-muted">
                                                            {inc.Observaciones ?? inc.observaciones ?? inc.descripcion ?? '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            }
                        </div>
                    )}

                </div>

                <div className="card-footer d-flex justify-content-end">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
