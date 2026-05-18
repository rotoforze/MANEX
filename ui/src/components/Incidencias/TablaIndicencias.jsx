import {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {useUsers} from "../../context/UserContext.jsx";
import {apiFetch} from "../../utils/apiFetch.jsx";
import {useDebounce} from "../../hooks/useDebounce.js";
import {EditarIncidenciaForm} from "./EditarIncidenciaForm.jsx";
import {DelIncidencia} from "./DelIncidencia.jsx";
import "../../../public/styles/tablaPermisos.css";
import "../../../public/styles/mainPages.css";

/**
 * Muestra en formato tabla las incidencias con paginación.
 * Permite editar y eliminar cada incidencia.
 *
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.2.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaIncidencias({tipoIncidencia, idEmpleado}) {
export function TablaIncidencias({tipoIncidencia, idEmpleado}) {
    const [listaIncidencias, setListaIncidencias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');

    const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [incidenciaAEliminar, setIncidenciaAEliminar] = useState(undefined);

    const [paginaActual, setPaginaActual] = useState(() => parseInt(sessionStorage.getItem('tabla_incidencias_pagina') || '0', 10));
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [cantidadPorPagina] = useState(10);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filtros, setFiltros] = useState({
        estado: searchParams.get('estado') || '',
        observaciones: searchParams.get('observaciones') || '',
        comentario: searchParams.get('comentario') || '',
        nombre: searchParams.get('nombre') || '',
        apellidos: searchParams.get('apellidos') || '',
    });
    const setFiltro = (campo, valor) => setFiltros(prev => ({...prev, [campo]: valor}));
    const dObservaciones = useDebounce(filtros.observaciones);
    const dComentario = useDebounce(filtros.comentario);
    const dNombre = useDebounce(filtros.nombre);
    const dApellidos = useDebounce(filtros.apellidos);
    const dComentario = useDebounce(filtros.comentario);
    const dNombre = useDebounce(filtros.nombre);
    const dApellidos = useDebounce(filtros.apellidos);

    const {user, tengoPermiso} = useUsers();

    useEffect(() => {
        sessionStorage.setItem('tabla_incidencias_pagina', paginaActual);
    }, [paginaActual]);

    useEffect(() => {
        const p = {};
        if (filtros.estado) p.estado = filtros.estado;
        if (dObservaciones) p.observaciones = dObservaciones;
        if (dComentario) p.comentario = dComentario;
        if (dNombre) p.nombre = dNombre;
        if (dApellidos) p.apellidos = dApellidos;
        setSearchParams(p, {replace: true});
        if (filtros.estado) p.estado = filtros.estado;
        if (dObservaciones) p.observaciones = dObservaciones;
        if (dComentario) p.comentario = dComentario;
        if (dNombre) p.nombre = dNombre;
        if (dApellidos) p.apellidos = dApellidos;
        setSearchParams(p, {replace: true});
    }, [filtros.estado, dObservaciones, dComentario, dNombre, dApellidos]);

    useEffect(() => {
        setPaginaActual(0);
    }, [filtros.estado, dObservaciones, dComentario, dNombre, dApellidos]);

    const hayFiltros = !!(filtros.estado || dObservaciones || dComentario || dNombre || dApellidos);
    const limpiarFiltros = () => {
        setFiltros({estado: '', observaciones: '', comentario: '', nombre: '', apellidos: ''});
        setSearchParams({}, {replace: true});
        setFiltros({estado: '', observaciones: '', comentario: '', nombre: '', apellidos: ''});
        setSearchParams({}, {replace: true});
    };

    const cargarIncidencias = () => {
        setCargando(true);
        const urlIncidencias = import.meta.env.VITE_BACKEND_INCIDENCIAS
            || `${import.meta.env.VITE_BACKEND}/incidencias`;

        const params = new URLSearchParams({pagina: paginaActual, cantidad: cantidadPorPagina});
        if (idEmpleado) params.set('id_empleado', idEmpleado);
        if (filtros.estado) params.set('estado', filtros.estado);
        if (dObservaciones) params.set('observaciones', dObservaciones);
        if (dComentario) params.set('comentario', dComentario);
        if (dNombre) params.set('nombre', dNombre);
        if (dApellidos) params.set('apellidos', dApellidos);
        if (dComentario) params.set('comentario', dComentario);
        if (dNombre) params.set('nombre', dNombre);
        if (dApellidos) params.set('apellidos', dApellidos);

        apiFetch(
            `${urlIncidencias}?${params}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'token': user?.token,
                },
            }
        )
            .then(res => res.json())
            .then(data => {
                setListaIncidencias(data?.data || []);
                setPaginaMaxima((data?.meta?.totalPaginas || 1) - 1);
                setTotalRegistros(data?.meta?.resultados || 0);
                setErrorCarga('');
            })
            .catch(e => {
                console.error(e);
                setErrorCarga('No se han podido cargar las incidencias.');
                setListaIncidencias([]);
            })
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarIncidencias();
    }, [paginaActual, cantidadPorPagina, user?.token, idEmpleado, filtros.estado, dObservaciones, dComentario, dNombre, dApellidos]);

    function obtenerClaseEstado(estado) {
        switch (estado) {
            case 'Pendiente':
            case 'Abierta':
                return 'text-bg-danger';
            case 'En proceso':
                return 'text-bg-warning';
            case 'Resuelta':
            case 'Cerrada':
                return 'text-bg-success';
            default:
                return 'text-bg-secondary';
        }
    }

    function obtenerValor(incidencia, claves, valorPorDefecto = 'N/A') {
        const valor = claves
            .map((clave) => incidencia?.[clave])
            .find((dato) => dato !== undefined && dato !== null && dato !== '');
        return valor ?? valorPorDefecto;
    }

    function formatearFecha(fecha) {
        return fecha
            ? new Date(fecha).toLocaleTimeString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
            : 'N/A';
    }

    // Número de columnas según si se muestra o no el empleado
    const numColumnas = idEmpleado ? 5 : 7;

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
                <i className="bi bi-exclamation-circle tabla-empty-icon text-danger" aria-hidden="true"/>
                <p className="text-danger mb-0">{errorCarga}</p>
            </div>
        );
    }

    return (
        <>
            {eliminando && (
                <DelIncidencia
                    incidenciaAEliminar={incidenciaAEliminar}
                    setIncidenciaAEliminar={setIncidenciaAEliminar}
                    eliminando={eliminando}
                    setEliminando={setEliminando}
                    user={user}
                    fetchInicio={cargarIncidencias}
                />
            )}

            {mostrarFormulario && (
                <EditarIncidenciaForm
                    incidencia={incidenciaSeleccionada}
                    funcionDeCierreDeFormulario={() => setMostrarFormulario(false)}
                    handleIncidenciaActualizada={() => {
                        setMostrarFormulario(false);
                        cargarIncidencias();
                    }}
                />
            )}

            {listaIncidencias.length > 0 || hayFiltros ? (
                <div className="m-3 d-flex flex-column contenedor-tabla">
                    <div className={"table-responsive"}>
                        <table className="table table-striped overflow-x-auto align-middle">
                            <thead>
                <div className="m-3 d-flex flex-column contenedor-tabla">
                    <div className={"table-responsive"}>
                        <table className="table table-striped">
                            <thead>
                            <tr>
                                <th scope="col">#</th>
                                {!idEmpleado && <th scope="col">Nombre</th>}
                                {!idEmpleado && <th scope="col">Apellidos</th>}
                                <th scope="col" className={"col-2"}>Fecha</th>
                                <th scope="col" className={"col-3"}>Estado</th>
                                <th scope="col" className={"col-4"}>Observaciones <span className={"text-secondary small"}>(Respuesta de quien ha revisado tu solicitud)</span></th>
                                <th scope="col" className={"col-5"}>Comentario</th>
                                <th scope="col">Acciones</th>
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
                                <th/>
                                <th>
                                    <select className="form-select form-select-sm" value={filtros.estado}
                                            onChange={e => setFiltro('estado', e.target.value)}>
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
                                <th/>
                                <th>
                                    <select className="form-select form-select-sm" value={filtros.estado}
                                            onChange={e => setFiltro('estado', e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="Abierta">Abierta</option>
                                        <option value="Cerrada">Cerrada</option>
                                    </select>
                                </th>
                                <th><input className="form-control form-control-sm" type="text"
                                           placeholder="Observaciones" value={filtros.observaciones}
                                           onChange={e => setFiltro('observaciones', e.target.value)}/></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Comentario"
                                           value={filtros.comentario}
                                           onChange={e => setFiltro('comentario', e.target.value)}/></th>
                                <th>
                                    {hayFiltros && (
                                        <button className="btn btn-outline-secondary btn-sm w-100"
                                                onClick={limpiarFiltros} title="Limpiar filtros">
                                            <i className="bi bi-x-lg me-1" aria-hidden="true"/>Limpiar
                                        <button className="btn btn-outline-secondary btn-sm w-100"
                                                onClick={limpiarFiltros} title="Limpiar filtros">
                                            <i className="bi bi-x-lg me-1" aria-hidden="true"/>Limpiar
                                        </button>
                                    )}
                                </th>
                            </tr>
                            </thead>
                            <tbody className="table-group-divider">
                            </thead>
                            <tbody className="table-group-divider">
                            {listaIncidencias.length > 0 ? listaIncidencias.map((incidencia) => {
                                const id     = obtenerValor(incidencia, ['ID']);
                                const estado = obtenerValor(incidencia, ['estado'], 'Sin estado');
                                const fecha  = obtenerValor(incidencia, ['fecha_creacion'], null);

                                return (
                                    <tr key={id}>
                                        <th scope="row">{id}</th>
                                        {!idEmpleado && <td>{incidencia?.nombre_empleado ?? '—'}</td>}
                                        {!idEmpleado && <td>{incidencia?.apellidos_empleado ?? '—'}</td>}
                                        <td>{formatearFecha(fecha)}</td>
                                        <td>
                                            <span className={`badge ${obtenerClaseEstado(estado)}`}>
                                                {estado}
                                            </span>
                                        </td>
                                        <td>{obtenerValor(incidencia, ['Observaciones'])}</td>
                                        <td>{obtenerValor(incidencia, ['Comentario'])}</td>
                                        <td className="h-auto w-100 p-1">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                title="Editar incidencia"
                                                aria-label="Editar incidencia"
                                                disabled={!tengoPermiso('/incidencias', 'POST')}
                                                onClick={() => {
                                                    setIncidenciaSeleccionada(incidencia);
                                                    setMostrarFormulario(true);
                                                }}
                                            ><i className="bi bi-pencil-fill" aria-hidden="true"/></button>&nbsp;
                                            <button
                                                className="btn btn-danger btn-sm"
                                                title="Eliminar incidencia"
                                                aria-label="Eliminar incidencia"
                                                disabled={!tengoPermiso('/incidencias', 'DELETE')}
                                                onClick={() => {
                                                    setIncidenciaAEliminar(incidencia);
                                                    setEliminando(true);
                                                }}
                                            ><i className="bi bi-trash-fill" aria-hidden="true"/></button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={numColumnas} className="text-center text-muted py-4 small">
                                        Sin resultados con los filtros aplicados.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {listaIncidencias.length > 0 && (
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
                    )}
                </div>
            ) : (
                <div className="tabla-empty-state">
                    <i className="bi bi-bookmark tabla-empty-icon" aria-hidden="true"/>
                    <i className="bi bi-bookmark tabla-empty-icon" aria-hidden="true"/>
                    <p className="text-muted mb-0">No hay incidencias registradas.</p>
                </div>
            )}
        </>
    );
}
