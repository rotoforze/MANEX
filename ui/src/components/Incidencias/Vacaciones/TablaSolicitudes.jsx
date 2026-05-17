import { useEffect, useState } from "react";
import { useUsers } from "../../../context/UserContext.jsx";
import { apiFetch } from "../../../utils/apiFetch.jsx";
import { EditarSolicitudForm } from "./EditarSolicitudForm.jsx";
import "../../../../public/styles/tablaPermisos.css";
import "../../../../public/styles/mainPages.css";

/**
 * Muestra en formato tabla las solicitudes de vacaciones con paginación.
 *
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.1.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaSolicitudes({ idEmpleado }) {
    const [listaSolicitudes, setListaSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');
    const [paginaActual, setPaginaActual] = useState(() => parseInt(sessionStorage.getItem('tabla_solicitudes_pagina') || '0', 10));
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [cantidadPorPagina] = useState(10);
    const [solicitudEditando, setSolicitudEditando] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [filtros, setFiltros] = useState({ tipo: '', estado: '' });
    const setFiltro = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));

    const { user } = useUsers();

    useEffect(() => {
        sessionStorage.setItem('tabla_solicitudes_pagina', paginaActual);
    }, [paginaActual]);

    useEffect(() => {
        setCargando(true);
        const urlSolicitudes = import.meta.env.VITE_BACKEND_SOLICITUDES
            || import.meta.env.VITE_BACKEND_SOLICITUD
            || `${import.meta.env.VITE_BACKEND}/vacaciones`;

        const filtroEmpleado = idEmpleado ? `&id_empleado=${idEmpleado}` : '';

        apiFetch(
            `${urlSolicitudes}?pagina=${paginaActual}&cantidad=${cantidadPorPagina}${filtroEmpleado}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'token': user?.token,
                },
            }
        )
            .then((response) => response.json())
            .then((data) => {
                setListaSolicitudes(data?.data || []);
                setPaginaMaxima((data?.meta?.totalPaginas || 1) - 1);
                setTotalRegistros(data?.meta?.resultados || 0);
                setErrorCarga('');
            })
            .catch((e) => {
                console.error(e);
                setErrorCarga('No se han podido cargar las solicitudes.');
                setListaSolicitudes([]);
            })
            .finally(() => setCargando(false));
    }, [paginaActual, cantidadPorPagina, user?.token, refreshKey, idEmpleado]);

    function handleSolicitudActualizada() {
        setSolicitudEditando(null);
        setRefreshKey(prevKey => prevKey + 1);
    }

    function obtenerClaseEstado(estado) {
        switch (estado) {
            case 'Pendiente':
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
                return 'text-bg-secondary';
            default:
                return 'text-bg-primary';
        }
    }

    function obtenerValor(solicitud, claves, valorPorDefecto = 'N/A') {
        const valor = claves
            .map((clave) => solicitud?.[clave])
            .find((dato) => dato !== undefined && dato !== null && dato !== '');
        return valor ?? valorPorDefecto;
    }

    function formatearFecha(fecha) {
        return fecha
            ? new Date(fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' })
            : 'N/A';
    }

    if (cargando) {
        return (
            <div className="tabla-empty-state">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (errorCarga) {
        return (
            <div className="tabla-empty-state">
                <i className="bi bi-exclamation-circle tabla-empty-icon text-danger" aria-hidden="true" />
                <p className="text-danger mb-0">{errorCarga}</p>
            </div>
        );
    }

    const solicitudesFiltradas = listaSolicitudes.filter(s => (
        (!filtros.tipo || s?.tipo === filtros.tipo) &&
        (!filtros.estado || s?.estado === filtros.estado)
    ));

    return (
        <>
            {solicitudEditando && (
                <EditarSolicitudForm
                    solicitud={solicitudEditando}
                    funcionDeCierreDeFormulario={() => setSolicitudEditando(null)}
                    handleSolicitudActualizada={handleSolicitudActualizada}
                />
            )}

            {listaSolicitudes.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Tipo</th>
                                <th scope="col">Fecha inicio</th>
                                <th scope="col">Fecha fin</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Acciones</th>
                            </tr>
                            <tr className="table-light">
                                <th />
                                <th>
                                    <select className="form-select form-select-sm" value={filtros.tipo} onChange={e => setFiltro('tipo', e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="Permiso de días">Permiso de días</option>
                                        <option value="Solicitud de semana de vacaciones">Solicitud de semana de vacaciones</option>
                                        <option value="Permiso familiar">Permiso familiar</option>
                                    </select>
                                </th>
                                <th />
                                <th />
                                <th>
                                    <select className="form-select form-select-sm" value={filtros.estado} onChange={e => setFiltro('estado', e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="Concedido">Concedido</option>
                                        <option value="Rechazado">Rechazado</option>
                                        <option value="En revisión">En revisión</option>
                                    </select>
                                </th>
                                <th />
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {solicitudesFiltradas.length > 0 ? solicitudesFiltradas.map((solicitud) => {
                                const idIncidencia = obtenerValor(solicitud, ['ID_INCIDENCIA']);
                                const estado = obtenerValor(solicitud, ['estado'], 'Sin estado');

                                return (
                                    <tr key={idIncidencia} className="h-auto">
                                        <th scope="row">{idIncidencia}</th>
                                        <td>{obtenerValor(solicitud, ['tipo'])}</td>
                                        <td>{formatearFecha(obtenerValor(solicitud, ['fecha_inicio'], null))}</td>
                                        <td>{formatearFecha(obtenerValor(solicitud, ['fecha_fin'], null))}</td>
                                        <td>
                                            <span className={`badge ${obtenerClaseEstado(estado)}`}>
                                                {estado}
                                            </span>
                                        </td>
                                        <td className="h-auto acciones-tabla">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                title="Editar solicitud"
                                                aria-label="Editar solicitud"
                                                onClick={() => setSolicitudEditando(solicitud)}
                                            ><i className="bi bi-pencil-fill" aria-hidden="true" /></button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                title="Eliminar solicitud"
                                                aria-label="Eliminar solicitud"
                                            ><i className="bi bi-trash-fill" aria-hidden="true" /></button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-4 small">
                                        Sin resultados con los filtros aplicados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                        <button
                            className="btn btn-outline-secondary btn-sm bi bi-chevron-bar-left"
                            aria-label="Primera página"
                            disabled={paginaActual === 0}
                            onClick={() => setPaginaActual(0)}
                        />
                        <button
                            className="btn btn-outline-secondary btn-sm bi bi-chevron-left"
                            aria-label="Página anterior"
                            disabled={paginaActual === 0}
                            onClick={() => { if (paginaActual > 0) setPaginaActual(paginaActual - 1); }}
                        />
                        <span className="small text-muted">
                            Página {paginaActual + 1} de {paginaMaxima + 1} · {totalRegistros} registros
                        </span>
                        <button
                            className="btn btn-outline-secondary btn-sm bi bi-chevron-right"
                            aria-label="Página siguiente"
                            disabled={!(paginaActual < paginaMaxima)}
                            onClick={() => { if (paginaActual < paginaMaxima) setPaginaActual(paginaActual + 1); }}
                        />
                        <button
                            className="btn btn-outline-secondary btn-sm bi bi-chevron-bar-right"
                            aria-label="Última página"
                            disabled={!(paginaActual < paginaMaxima)}
                            onClick={() => setPaginaActual(paginaMaxima)}
                        />
                    </div>
                </div>
            ) : (
                <div className="tabla-empty-state">
                    <i className="bi bi-window-plus tabla-empty-icon" aria-hidden="true" />
                    <p className="text-muted mb-0">No hay solicitudes registradas.</p>
                </div>
            )}
        </>
    );
}
