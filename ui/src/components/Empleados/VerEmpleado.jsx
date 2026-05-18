import React, { useState, useEffect } from 'react';
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";

/**Vista de perfil completo de un empleado.
 *
<<<<<<< HEAD
<<<<<<< HEAD
=======
 * @author Covadonga Blanco Alvarez
>>>>>>> main
=======
 * @author Covadonga Blanco Alvarez
>>>>>>> e6ea361054ad13a9e53f3c907b851a82b43e76cd
 * @version 5.2
 * @param {Object}   empleado - Fila del empleado tal como llega del listado
 * @param {Function} onClose  - Cierra la ventana
 */
export function VerEmpleado({ empleado, onClose }) {
    const { user } = useUsers();

    const [seccionActiva, setSeccionActiva] = useState('personal');
    const [perfil,        setPerfil]        = useState(null);
    const [horasMes,      setHorasMes]      = useState(null);
    const [fichajes,      setFichajes]      = useState([]);
    const [incidencias,   setIncidencias]   = useState([]);
    const [solicitudes,   setSolicitudes]   = useState([]);
    const [cargando,      setCargando]      = useState(true);
    const [error,         setError]         = useState(null);

    const BASE = import.meta.env.VITE_BACKEND;

    useEffect(() => {
        if (!empleado?.ID) return;
        setCargando(true);
        setError(null);

        apiFetch(
            `${BASE}/empleado-perfil?id=${empleado.ID}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'token': user?.token,
                },
            }
        )
            .then(r => r.json())
            .then(d => {
                if (d?.status !== 200) throw new Error(d?.message ?? 'Error al cargar el perfil.');
                setPerfil(d.data.empleado);
                setHorasMes(d.data.horas_mes);
                setFichajes(d.data.fichajes      ?? []);
                setIncidencias(d.data.incidencias  ?? []);
                setSolicitudes(d.data.solicitudes  ?? []);
            })
            .catch(e => setError(e.message ?? 'No se pudo cargar el perfil del empleado.'))
            .finally(() => setCargando(false));
    }, [empleado?.ID]);

    const fmt = (fecha) =>
        fecha ? new Date(fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A';

    const fmtDT = (fecha) =>
        fecha ? new Date(fecha).toLocaleString('es-ES', { timeZone: 'UTC', hour12: false }) : '-';

    const estadoBadge = (estado) => ({
        pendiente:  'warning',
        resuelta:   'success',
        aprobada:   'success',
        rechazada:  'danger',
        abierta:    'danger',
        en_proceso: 'info',
        cerrada:    'secondary',
    }[estado?.toLowerCase()] ?? 'secondary');

    const textoDiferencia = (horas_mes) => {
        if (!horas_mes) return null;
        const diff = horas_mes.diferencia_min;
        const absH = Math.floor(Math.abs(diff) / 60);
        const absM = Math.abs(diff) % 60;
        const tiempo = absH > 0 ? `${absH}h ${absM}m` : `${absM}m`;
        if (diff > 0) return { texto: `${tiempo} de exceso sobre las horas del contrato`, color: 'success' };
        if (diff < 0) return { texto: `Faltan ${tiempo} para completar las horas del contrato`, color: 'warning' };
        return { texto: 'Horas completadas exactamente', color: 'success' };
    };

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

    const secciones = [
        { id: 'personal',    label: 'Datos personales', icon: 'bi-person-fill' },
        { id: 'horas',       label: 'Horas este mes',   icon: 'bi-clock-fill' },
        { id: 'fichajes',    label: 'Fichajes',          icon: 'bi-calendar2-check-fill' },
        { id: 'solicitudes', label: 'Solicitudes',       icon: 'bi-file-earmark-text-fill' },
        { id: 'incidencias', label: 'Incidencias',       icon: 'bi-exclamation-triangle-fill' },
    ];

    const diferencia = textoDiferencia(horasMes);

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

                    {cargando && <Spinner />}

                    {!cargando && error && (
                        <p className="text-muted text-center small py-4 mb-0">
                            <i className="bi bi-wifi-off me-1" />{error}
                        </p>
                    )}

                    {!cargando && !error && (
                        <>
                            {/* Datos Personales */}
                            {seccionActiva === 'personal' && (
                                <div>
                                    <h5 className="mb-3 small fw-semibold text-uppercase text-muted">
                                        <i className="bi bi-person-fill me-1" />Informacion personal
                                    </h5>
                                    <div className="row g-2">
                                        {[
                                            { label: 'Nombre',           value: perfil?.Nombre },
                                            { label: 'Apellidos',        value: perfil?.Apellidos },
                                            { label: 'Email',            value: perfil?.email ?? perfil?.EMAIL },
                                            { label: 'Telefono',         value: perfil?.telefono },
                                            { label: 'Fecha nacimiento', value: fmt(perfil?.fecha_nacimiento) },
                                            { label: 'Fecha de alta',    value: fmt(perfil?.fecha_alta) },
                                            { label: 'Departamento',     value: perfil?.nombre_departamento ?? '-' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="col-sm-6 col-md-4">
                                                <div className="border rounded p-2" style={{ background: 'var(--bs-light, #f8f9fa)' }}>
                                                    <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                        {label}
                                                    </div>
                                                    <div className="fw-medium" style={{ fontSize: '0.85rem' }}>
                                                        {value ?? <span className="text-muted">-</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Horas de este mes*/}
                            {seccionActiva === 'horas' && (
                                <div>
                                    <h5 className="mb-3 small fw-semibold text-uppercase text-muted">
                                        <i className="bi bi-clock-fill me-1" />Horas trabajadas este mes
                                    </h5>
                                    <div className="d-flex flex-column align-items-center justify-content-center py-3 gap-3">


                                        <div
                                            className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                                            style={{ width: 140, height: 140 }}
                                        >
                                            <div className="text-center">
                                                <div className="fw-bold text-primary" style={{ fontSize: '2.4rem', lineHeight: 1 }}>
                                                    {horasMes?.trabajadas_h ?? 0}
                                                </div>
                                                <div className="text-muted small">horas</div>
                                            </div>
                                        </div>


                                        {/* Diferencia de horas contrato y trabajadas */}
                                        {diferencia && (
                                            <span className={`badge bg-${diferencia.color} px-3 py-2`} style={{ fontSize: '0.8rem' }}>
                                                {diferencia.texto}
                                            </span>
                                        )}

                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {horasMes?.trabajadas_min ?? 0} minutos sobre la ultima hora completa
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fichajes*/}
                            {seccionActiva === 'fichajes' && (
                                <div>
                                    <h5 className="mb-3 small fw-semibold text-uppercase text-muted">
                                        <i className="bi bi-calendar2-check-fill me-1" />Ultimos fichajes
                                    </h5>
                                    {fichajes.length === 0
                                        ? <EmptyState icono="bi-calendar-x" texto="No hay fichajes registrados." />
                                        : (
                                            <div className="table-responsive">
                                                <table className="table table-sm table-striped table-hover">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="small">Entrada</th>
                                                            <th className="small">Salida</th>
                                                            <th className="small">Tipo</th>
                                                            <th className="small">Duracion</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {fichajes.map(f => {
                                                            const durMs = f.fecha_salida
                                                                ? new Date(f.fecha_salida) - new Date(f.fecha_entrada)
                                                                : null;
                                                            return (
                                                                <tr key={f.id}>
                                                                    <td className="small">{fmtDT(f.fecha_entrada)}</td>
                                                                    <td className="small">{fmtDT(f.fecha_salida)}</td>
                                                                    <td className="small">
                                                                        <span className="badge bg-secondary">{f.tipo ?? '-'}</span>
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
                                    {solicitudes.length === 0
                                        ? <EmptyState icono="bi-file-earmark-x" texto="No hay solicitudes de vacaciones." />
                                        : (
                                            <div className="table-responsive">
                                                <table className="table table-sm table-striped table-hover">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="small">Fecha inicio</th>
                                                            <th className="small">Fecha fin</th>
                                                            <th className="small">Tipo</th>
                                                            <th className="small">Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {solicitudes.map(s => (
                                                            <tr key={s.ID_INCIDENCIA}>
                                                                <td className="small">{fmt(s.fecha_inicio)}</td>
                                                                <td className="small">{fmt(s.fecha_fin)}</td>
                                                                <td className="small text-muted">{s.tipo ?? '-'}</td>
                                                                <td className="small">
                                                                    <span className={`badge bg-${estadoBadge(s.estado)}`}>
                                                                        {s.estado ?? '-'}
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

                            {/* Incidencias */}
                            {seccionActiva === 'incidencias' && (
                                <div>
                                    <h5 className="mb-3 small fw-semibold text-uppercase text-muted">
                                        <i className="bi bi-exclamation-triangle-fill me-1" />Incidencias
                                    </h5>
                                    {incidencias.length === 0
                                        ? <EmptyState icono="bi-shield-check" texto="No hay incidencias registradas." />
                                        : (
                                            <div className="table-responsive">
                                                <table className="table table-sm table-striped table-hover">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="small">Estado</th>
                                                            <th className="small">Fecha creacion</th>
                                                            <th className="small">Observaciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {incidencias.map(inc => (
                                                            <tr key={inc.ID}>
                                                                <td className="small">
                                                                    <span className={`badge bg-${estadoBadge(inc.estado)}`}>
                                                                        {inc.estado ?? '-'}
                                                                    </span>
                                                                </td>
                                                                <td className="small">{fmtDT(inc.fecha_creacion)}</td>
                                                                <td className="small text-muted">
                                                                    {inc.Observaciones ?? '-'}
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
                        </>
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
