import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
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

    const [paginaActual, setPaginaActual] = useState(0);
    const [hayPaginaSiguiente, setHayPaginaSiguiente] = useState(false);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [cantidadPorPagina] = useState(10);
    const [filtros, setFiltros] = useState({ nombre: '', descripcion: '', estado: '' });
    const setFiltro = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));
    const [eliminando, setEliminando] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState(undefined);

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

    const cargarProductos = () => {
        try {
            apiFetch(
                `${import.meta.env.VITE_BACKEND_PRODUCTO}?pagina=${paginaActual}&cantidad=${cantidadPorPagina}`,
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
                        const items = data?.data || [];
                        const resultados = data?.resultados ?? items.length;
                        setListaProductos(items);
                        setTotalRegistros(resultados);
                        setHayPaginaSiguiente(resultados >= cantidadPorPagina);
                    }
                });
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, [paginaActual]);

    const productosFiltrados = listaProductos.filter(p => (
        (!filtros.nombre || String(p?.Nombre ?? '').toLowerCase().includes(filtros.nombre.toLowerCase())) &&
        (!filtros.descripcion || String(p?.Descripcion ?? '').toLowerCase().includes(filtros.descripcion.toLowerCase())) &&
        (!filtros.estado || p?.Estado === filtros.estado)
    ));

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

            {listaProductos.length > 0 ? (
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
                            <tr className="table-light">
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
                                <th />
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {productosFiltrados.length > 0 ? productosFiltrados.map((producto) => (
                                <tr key={producto?.ID} className="h-auto">
                                    <th scope="row">{producto?.ID}</th>
                                    <td>{producto?.Nombre}</td>
                                    <td>{producto?.Descripcion}</td>
                                    <td>
                                        <span className={`badge ${obtenerClaseEstado(producto?.Estado)}`}>
                                            {producto?.Estado ?? '—'}
                                        </span>
                                    </td>
                                    <td className="h-auto acciones-tabla">
                                        <button
                                            className="btn btn-primary btn-sm bi bi-pencil-fill"
                                            title="Editar producto"
                                            aria-label="Editar producto"
                                            onClick={() => {
                                                setProductoSeleccionado(producto);
                                                setMostrarFormulario(true);
                                            }}
                                            disabled={!tengoPermiso('/productos', 'POST')}
                                        />
                                        <button className="btn btn-danger btn-sm bi bi-trash-fill"title="Eliminar producto"
                                                aria-label="Eliminar producto"disabled={!tengoPermiso('/productos', 'DELETE')}
                                         onClick={() => {           
                                                setProductoAEliminar(producto);
                                                setEliminando(true);
                                        }}
                                    />
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
                            Página {paginaActual + 1} · {totalRegistros} registros
                        </span>
                        <button
                            className="btn btn-outline-secondary btn-sm bi bi-chevron-right"
                            aria-label="Página siguiente"
                            disabled={!hayPaginaSiguiente}
                            onClick={() => { if (hayPaginaSiguiente) setPaginaActual(paginaActual + 1); }}
                        />
                        <button
                            className="btn btn-outline-secondary btn-sm bi bi-chevron-bar-right"
                            aria-label="Última página"
                            disabled
                        />
                    </div>
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
