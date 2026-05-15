import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import "../../../public/styles/tablaPermisos.css";
import "../../../public/styles/mainPages.css";

/**
 * Muestra en formato tabla las incidencias con paginación.
 *
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.1.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaIncidencias({ tipoIncidencia }) {
    const [listaIncidencias, setListaIncidencias] = useState([]);
    const [errorCarga, setErrorCarga] = useState('');
    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [cantidadPorPagina] = useState(10);
    const [filtros, setFiltros] = useState({ estado: '', observaciones: '', comentario: '' });
    const setFiltro = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));

    const { user } = useUsers();

    useEffect(() => {
        const urlIncidencias = import.meta.env.VITE_BACKEND_INCIDENCIAS
            || `${import.meta.env.VITE_BACKEND}/incidencias`;

        apiFetch(
            `${urlIncidencias}?pagina=${paginaActual}&cantidad=${cantidadPorPagina}`,
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
            });
    }, [paginaActual, tipoIncidencia, cantidadPorPagina, user?.token]);

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
            ? new Date(fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' })
            : 'N/A';
    }

    if (errorCarga) {
        return (
            <div className="tabla-empty-state">
                <i className="bi bi-exclamation-circle tabla-empty-icon text-danger" aria-hidden="true" />
                <p className="text-danger mb-0">{errorCarga}</p>
            </div>
        );
    }

    const incidenciasFiltradas = listaIncidencias.filter(i => (
        (!filtros.estado || i?.estado === filtros.estado) &&
        (!filtros.observaciones || String(i?.Observaciones ?? '').toLowerCase().includes(filtros.observaciones.toLowerCase())) &&
        (!filtros.comentario || String(i?.Comentario ?? '').toLowerCase().includes(filtros.comentario.toLowerCase()))
    ));

    return (
        <>
            {listaIncidencias.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Empleado</th>
                                <th scope="col">Fecha</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Observaciones</th>
                                <th scope="col">Comentario</th>
                                <th scope="col">Acciones</th>
                            </tr>
                            <tr className="table-light">
                                <th />
                                <th />
                                <th />
                                <th>
                                    <select className="form-select form-select-sm" value={filtros.estado} onChange={e => setFiltro('estado', e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="Abierta">Abierta</option>
                                        <option value="Cerrada">Cerrada</option>
                                    </select>
                                </th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Observaciones" value={filtros.observaciones} onChange={e => setFiltro('observaciones', e.target.value)} /></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Comentario" value={filtros.comentario} onChange={e => setFiltro('comentario', e.target.value)} /></th>
                                <th />
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {incidenciasFiltradas.length > 0 ? incidenciasFiltradas.map((incidencia) => {
                                const id = obtenerValor(incidencia, ['ID']);
                                const estado = obtenerValor(incidencia, ['estado'], 'Sin estado');
                                const fecha = obtenerValor(incidencia, ['fecha_creacion'], null);

                                return (
                                    <tr key={id}>
                                        <th scope="row">{id}</th>
                                        <td>{obtenerValor(incidencia, ['ID_empleado'])}</td>
                                        <td>{formatearFecha(fecha)}</td>
                                        <td>
                                            <span className={`badge ${obtenerClaseEstado(estado)}`}>
                                                {estado}
                                            </span>
                                        </td>
                                        <td>{obtenerValor(incidencia, ['Observaciones'])}</td>
                                        <td>{obtenerValor(incidencia, ['Comentario'])}</td>
                                        <td className="acciones-tabla">
                                            <button
                                                className="btn btn-primary btn-sm bi bi-pencil-fill"
                                                title="Editar incidencia"
                                                aria-label="Editar incidencia"
                                            />
                                            <button
                                                className="btn btn-danger btn-sm bi bi-trash-fill"
                                                title="Eliminar incidencia"
                                                aria-label="Eliminar incidencia"
                                            />
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted py-4 small">
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
                    <i className="bi bi-bookmark tabla-empty-icon" aria-hidden="true" />
                    <p className="text-muted mb-0">No hay incidencias registradas.</p>
                </div>
            )}
        </>
    );
}
