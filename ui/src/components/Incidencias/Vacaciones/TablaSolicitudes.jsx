import {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {useUsers} from "../../../context/UserContext.jsx";
import {apiFetch} from "../../../utils/apiFetch.jsx";
import {useDebounce} from "../../../hooks/useDebounce.js";
import {EditarSolicitudForm} from "./EditarSolicitudForm.jsx";
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
export function TablaSolicitudes({idEmpleado}) {
    const [listaSolicitudes, setListaSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');
    const [paginaActual, setPaginaActual] = useState(() => parseInt(sessionStorage.getItem('tabla_solicitudes_pagina') || '0', 10));
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [cantidadPorPagina] = useState(10);
    const [solicitudEditando, setSolicitudEditando] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filtros, setFiltros] = useState({
        tipo: searchParams.get('tipo') || '',
        estado: searchParams.get('estado') || '',
        nombre: searchParams.get('nombre') || '',
        apellidos: searchParams.get('apellidos') || '',
    });
    const setFiltro = (campo, valor) => setFiltros(prev => ({...prev, [campo]: valor}));
    const dNombre = useDebounce(filtros.nombre);
    const dApellidos = useDebounce(filtros.apellidos);

    const {user, tengoPermiso} = useUsers();

    useEffect(() => {
        sessionStorage.setItem('tabla_solicitudes_pagina', paginaActual);
    }, [paginaActual]);

    useEffect(() => {
        const p = {};
        if (filtros.tipo) p.tipo = filtros.tipo;
        if (filtros.estado) p.estado = filtros.estado;
        if (dNombre) p.nombre = dNombre;
        if (dApellidos) p.apellidos = dApellidos;
        setSearchParams(p, {replace: true});
    }, [filtros.tipo, filtros.estado, dNombre, dApellidos]);

    useEffect(() => {
        setPaginaActual(0);
    }, [filtros.tipo, filtros.estado, dNombre, dApellidos]);

    const hayFiltros = !!(filtros.tipo || filtros.estado || dNombre || dApellidos);
    const limpiarFiltros = () => {
        setFiltros({tipo: '', estado: '', nombre: '', apellidos: ''});
        setSearchParams({}, {replace: true});
    };

    const estadosNoModificables = ['Concedido', 'Rechazado'];

    useEffect(() => {
        setCargando(true);
        const urlSolicitudes = import.meta.env.VITE_BACKEND_SOLICITUDES
            || import.meta.env.VITE_BACKEND_SOLICITUD
            || `${import.meta.env.VITE_BACKEND}/vacaciones`;

        const params = new URLSearchParams({pagina: paginaActual, cantidad: cantidadPorPagina});
        if (idEmpleado) params.set('id_empleado', idEmpleado);
        if (filtros.tipo) params.set('tipo', filtros.tipo);
        if (filtros.estado) params.set('estado', filtros.estado);
        if (dNombre) params.set('nombre', dNombre);
        if (dApellidos) params.set('apellidos', dApellidos);

        apiFetch(
            `${urlSolicitudes}?${params}`,
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
    }, [paginaActual, cantidadPorPagina, user?.token, refreshKey, idEmpleado, filtros.tipo, filtros.estado, dNombre, dApellidos]);

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
            ? new Date(fecha).toLocaleDateString('es-ES', {timeZone: 'UTC'})
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
                <i className="bi bi-exclamation-circle tabla-empty-icon text-danger" aria-hidden="true"/>
                <p className="text-danger mb-0">{errorCarga}</p>
            </div>
        );
    }


    return (
        <>
            {solicitudEditando && (
                <EditarSolicitudForm
                    solicitud={solicitudEditando}
                    funcionDeCierreDeFormulario={() => setSolicitudEditando(null)}
                    handleSolicitudActualizada={handleSolicitudActualizada}
                />
            )}

            {listaSolicitudes.length > 0 || hayFiltros ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <div className={"table-responsive"}>
                        <table className="table table-striped">
                            <thead>
                            <tr>
                                <th scope="col" className="text-nowrap">#</th>
                                {!idEmpleado && <th scope="col" className="text-nowrap">Nombre</th>}
                                {!idEmpleado && <th scope="col" className="text-nowrap">Apellidos</th>}
                                <th scope="col" className="col-3 text-nowrap">Tipo</th>
                                <th scope="col" className="col-3 text-nowrap">Descripción</th>
                                <th scope="col" className="text-nowrap">Fecha inicio</th>
                                <th scope="col" className="text-nowrap">Fecha fin</th>
                                <th scope="col" className="text-nowrap col-3">Estado</th>
                                <th scope="col" className="text-nowrap">Acciones</th>
                            </tr>
                            <tr>
                                <th/>
                                {!idEmpleado &&
                                    <th><input className="form-control form-control-sm" type="text" placeholder="Nombre"
                                               value={filtros.nombre}
                                               onChange={e => setFiltro('nombre', e.target.value)}/></th>}
                                {!idEmpleado && <th><input className="form-control form-control-sm" type="text"
                                                           placeholder="Apellidos" value={filtros.apellidos}
                                                           onChange={e => setFiltro('apellidos', e.target.value)}/>
                                </th>}
                                <th>
                                    <select className="form-select form-select-sm" value={filtros.tipo}
                                            onChange={e => setFiltro('tipo', e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="Permiso de días">Permiso de días</option>
                                        <option value="Solicitud de semana de vacaciones">Solicitud de semana de
                                            vacaciones
                                        </option>
                                        <option value="Permiso familiar">Permiso familiar</option>
                                    </select>
                                </th>
                                <th/>
                                <th/>
                                <th/>
                                <th>
                                    <select className="form-select form-select-sm" value={filtros.estado}
                                            onChange={e => setFiltro('estado', e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="Concedido">Concedido</option>
                                        <option value="Rechazado">Rechazado</option>
                                        <option value="En revisión">En revisión</option>
                                    </select>
                                </th>
                                <th>
                                    {hayFiltros && (
                                        <button className="btn btn-outline-secondary btn-sm w-100"
                                                onClick={limpiarFiltros} title="Limpiar filtros">
                                            <i className="bi bi-x-lg me-1" aria-hidden="true"/>Limpiar
                                        </button>
                                    )}
                                </th>
                            </tr>
                            </thead>
                            <tbody className="table-group-divider">
                            {listaSolicitudes.length > 0 ? listaSolicitudes.map((solicitud) => {
                                const idIncidencia = obtenerValor(solicitud, ['ID_INCIDENCIA']);
                                const estado = obtenerValor(solicitud, ['estado'], 'Sin estado');

                                return (
                                    <tr key={idIncidencia} className="h-auto">
                                        <th scope="row">{idIncidencia}</th>
                                        {!idEmpleado && <td>{solicitud?.nombre_empleado ?? '—'}</td>}
                                        {!idEmpleado && <td>{solicitud?.apellidos_empleado ?? '—'}</td>}
                                        <td>{obtenerValor(solicitud, ['tipo'])}</td>
                                        <td>{obtenerValor(solicitud, ['comentario'])}</td>
                                        <td>{formatearFecha(obtenerValor(solicitud, ['fecha_inicio'], null))}</td>
                                        <td>{formatearFecha(obtenerValor(solicitud, ['fecha_fin'], null))}</td>
                                        <td>
                                            <span className={`badge ${obtenerClaseEstado(estado)}`}>
                                                {estado}
                                            </span>
                                        </td>
                                        <td className="h-auto w-100 p-1">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                title="Editar solicitud"
                                                aria-label="Editar solicitud" disabled={!tengoPermiso('/vacaciones', 'POST') || estadosNoModificables.includes(estado)}
                                                onClick={() => setSolicitudEditando(solicitud)}
                                            ><i className="bi bi-pencil-fill" aria-hidden="true" /></button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={idEmpleado ? 6 : 8} className="text-center text-muted py-4 small">
                                        Sin resultados con los filtros aplicados.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {listaSolicitudes.length > 0 &&
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
                                onClick={() => {
                                    if (paginaActual > 0) setPaginaActual(paginaActual - 1);
                                }}
                            />
                            <span className="small text-muted">
                            Página {paginaActual + 1} de {paginaMaxima + 1} · {totalRegistros} registros
                        </span>
                            <button
                                className="btn btn-outline-secondary btn-sm bi bi-chevron-right"
                                aria-label="Página siguiente"
                                disabled={!(paginaActual < paginaMaxima)}
                                onClick={() => {
                                    if (paginaActual < paginaMaxima) setPaginaActual(paginaActual + 1);
                                }}
                            />
                            <button
                                className="btn btn-outline-secondary btn-sm bi bi-chevron-bar-right"
                                aria-label="Última página"
                                disabled={!(paginaActual < paginaMaxima)}
                                onClick={() => setPaginaActual(paginaMaxima)}
                            />
                        </div>}
                </div>
            ) : (
                <div className="tabla-empty-state">
                    <i className="bi bi-window-plus tabla-empty-icon" aria-hidden="true"/>
                    <p className="text-muted mb-0">No hay solicitudes registradas.</p>
                </div>
            )}
        </>
    );
}
