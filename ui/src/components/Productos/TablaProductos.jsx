import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import { EditarProductoForm } from "./EditarProductoForm.jsx";
import "../../../public/styles/tablaPermisos.css";
import "../../../public/styles/mainPages.css";
import { DelProducto } from "./DelProducto.jsx";

/**
 * Muestra en formato tabla los productos recibidos.
 * Permite editar cada producto.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.1.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaProductos() {
    const [listaProductos, setListaProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [paginaActual, setPaginaActual] = useState(() => parseInt(sessionStorage.getItem('tabla_productos_pagina') || '0', 10));
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [cantidadPorPagina] = useState(10);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filtros, setFiltros] = useState({
        nombre:      searchParams.get('nombre')      || '',
        descripcion: searchParams.get('descripcion') || '',
        estado:      searchParams.get('estado')      || '',
    });
    const setFiltro = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));
    const dNombre      = useDebounce(filtros.nombre);
    const dDescripcion = useDebounce(filtros.descripcion);
    const [eliminando, setEliminando] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState(undefined);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState(null);

    const { user, tengoPermiso } = useUsers();

    function obtenerClaseEstado(estado) {
        switch (estado) {
            case 'Disponible': return 'text-bg-success';
            case 'No disponible': return 'text-bg-danger';
            case 'En proceso de envio':
            case 'En proceso de envío': return 'text-bg-primary';
            case 'En mantenimiento': return 'text-bg-warning';
            default: return 'text-bg-secondary';
        }
    }

    useEffect(() => {
        sessionStorage.setItem('tabla_productos_pagina', paginaActual);
    }, [paginaActual]);

    // Sincronizar URL con los filtros actuales (se actualiza tras el debounce en texto)
    useEffect(() => {
        const p = {};
        if (dNombre)        p.nombre      = dNombre;
        if (dDescripcion)   p.descripcion = dDescripcion;
        if (filtros.estado) p.estado      = filtros.estado;
        setSearchParams(p, { replace: true });
    }, [dNombre, dDescripcion, filtros.estado]);

    useEffect(() => {
        setPaginaActual(0);
    }, [dNombre, dDescripcion, filtros.estado]);

    const hayFiltros = !!(dNombre || dDescripcion || filtros.estado);
    const limpiarFiltros = () => {
        setFiltros({ nombre: '', descripcion: '', estado: '' });
        setSearchParams({}, { replace: true });
    };

    const cargarProductos = () => {
        setCargando(true);
        setErrorCarga(null);

        const params = new URLSearchParams({ pagina: paginaActual, cantidad: cantidadPorPagina });
        if (dNombre)        params.set('nombre', dNombre);
        if (dDescripcion)   params.set('descripcion', dDescripcion);
        if (filtros.estado) params.set('estado', filtros.estado);

        apiFetch(
            `${import.meta.env.VITE_BACKEND_PRODUCTO}?${params}`,
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
                if (data) {
                    setListaProductos(data?.data || []);
                    setPaginaMaxima((data?.meta?.totalPaginas || 1) - 1);
                    setTotalRegistros(data?.meta?.resultados || 0);
                }
            })
            .catch(e => {
                console.error(e);
                setErrorCarga('No se pudieron cargar los productos. Comprueba la conexión con el servidor.');
            })
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarProductos();
    }, [paginaActual, dNombre, dDescripcion, filtros.estado]);

    return (
        <>
            {eliminando && (
                <DelProducto
                    productoAEliminar={productoAEliminar}
                    setProductoAEliminar={setProductoAEliminar}
                    eliminando={eliminando}
                    setEliminando={setEliminando}
                    user={user}
                    fetchInicio={cargarProductos}
                />
            )}
            {errorCarga && (
                <div className="alert alert-danger mx-3 mt-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorCarga}
                </div>
            )}

            {mostrarFormulario && (
                <EditarProductoForm
                    producto={productoSeleccionado}
                    funcionDeCierreDeFormulario={() => setMostrarFormulario(false)}
                    handleProductoActualizado={() => {
                        setMostrarFormulario(false);
                        cargarProductos();
                    }}
                />
            )}

            {cargando ? (
                <div className="tabla-empty-state">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : listaProductos.length > 0 || hayFiltros ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">Descripción</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Acciones</th>
                            </tr>
                            <tr>
                                <th />
                                <th><input className="form-control form-control-sm" type="text" placeholder="Nombre" value={filtros.nombre} onChange={e => setFiltro('nombre', e.target.value)} /></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Descripción" value={filtros.descripcion} onChange={e => setFiltro('descripcion', e.target.value)} /></th>
                                <th>
                                    <select className="form-select form-select-sm" value={filtros.estado} onChange={e => setFiltro('estado', e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="Disponible">Disponible</option>
                                        <option value="No disponible">No disponible</option>
                                        <option value="En proceso de envio">En proceso de envio</option>
                                        <option value="En mantenimiento">En mantenimiento</option>
                                    </select>
                                </th>
                                <th>
                                    {hayFiltros && (
                                        <button className="btn btn-outline-secondary btn-sm w-100" onClick={limpiarFiltros} title="Limpiar filtros">
                                            <i className="bi bi-x-lg me-1" aria-hidden="true" />Limpiar
                                        </button>
                                    )}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {listaProductos.length > 0 ? listaProductos.map((producto) => (
                                <tr key={producto?.ID} className="h-auto">
                                    <th scope="row">{producto?.ID}</th>
                                    <td>{producto?.Nombre}</td>
                                    <td>{producto?.Descripcion}</td>
                                    <td>
                                        <span className={`badge ${obtenerClaseEstado(producto?.Estado)}`}>
                                            {producto?.Estado ?? '—'}
                                        </span>
                                    </td>
                                    <td className="h-auto w-auto p-1">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            title="Editar producto"
                                            aria-label="Editar producto"
                                            onClick={() => {
                                                setProductoSeleccionado(producto);
                                                setMostrarFormulario(true);
                                            }}
                                            disabled={!tengoPermiso('/productos', 'POST')}
<<<<<<< HEAD
                                        ><i className="bi bi-pencil-fill" aria-hidden="true" /></button>
=======
                                        ><i className="bi bi-pencil-fill" aria-hidden="true" /></button>&nbsp;
>>>>>>> 0c5e882a66dd9c7ba78ea925cc0e82f99c53f40d
                                        <button
                                            className="btn btn-danger btn-sm"
                                            title="Eliminar producto"
                                            aria-label="Eliminar producto"
                                            disabled={!tengoPermiso('/productos', 'DELETE')}
                                            onClick={() => {
                                                setProductoAEliminar(producto);
                                                setEliminando(true);
                                            }}
                                        ><i className="bi bi-trash-fill" aria-hidden="true" /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-4 small">
                                        Sin resultados con los filtros aplicados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {listaProductos.length > 0 && <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
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
                    </div>}
                </div>
            ) : (
                <div className="tabla-empty-state">
                    <i className="bi bi-box tabla-empty-icon" aria-hidden="true" />
                    <p className="text-muted mb-0">No hay productos registrados.</p>
                </div>
            )}
        </>
    );
}
