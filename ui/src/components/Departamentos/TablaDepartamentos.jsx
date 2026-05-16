import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { EditarDepartamentoForm } from "./EditarDepartamentoForm.jsx";
import { DelDepartamento } from "./DelDepartamento.jsx";
import "../../../public/styles/tablaPermisos.css";
import "../../../public/styles/mainPages.css";

/**
 * Muestra en formato tabla los departamentos con paginación.
 * Permite editar y eliminar cada departamento.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @returns {React.JSX.Element}
 */
export function TablaDepartamentos() {
    const [listaDepartamentos, setListaDepartamentos] = useState([]);
    const [paginaActual, setPaginaActual] = useState(() => parseInt(sessionStorage.getItem('tabla_departamentos_pagina') || '0', 10));
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [cantidadPorPagina] = useState(10);

    const [departamentoEditando, setDepartamentoEditando] = useState(null);
    const [departamentoEliminando, setDepartamentoEliminando] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState(null);
    const [filtros, setFiltros] = useState({ nombre: '' });
    const setFiltro = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));

    const { user, tengoPermiso } = useUsers();

    useEffect(() => {
        sessionStorage.setItem('tabla_departamentos_pagina', paginaActual);
    }, [paginaActual]);

    const cargarDepartamentos = () => {
        setCargando(true);
        setErrorCarga(null);
        apiFetch(
            `${import.meta.env.VITE_BACKEND_DEPARTAMENTOS}?pagina=${paginaActual}&cantidad=${cantidadPorPagina}`,
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
                    setListaDepartamentos(data?.data || []);
                    const total = data?.resultados || 0;
                    setTotalRegistros(total);
                    setPaginaMaxima(Math.max(0, Math.ceil(total / cantidadPorPagina) - 1));
                }
            })
            .catch(e => {
                console.error(e);
                setErrorCarga('No se pudieron cargar los departamentos. Comprueba la conexión con el servidor.');
            })
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarDepartamentos();
    }, [paginaActual]);

    const handleDepartamentoActualizado = () => {
        setDepartamentoEditando(null);
        cargarDepartamentos();
    };

    const handleDepartamentoEliminado = () => {
        setDepartamentoEliminando(null);
        cargarDepartamentos();
    };

    const departamentosFiltrados = listaDepartamentos.filter(d => (
        (!filtros.nombre || String(d?.Nombre ?? '').toLowerCase().includes(filtros.nombre.toLowerCase()))
    ));

    return (
        <>
            {departamentoEditando && (
                <EditarDepartamentoForm
                    departamento={departamentoEditando}
                    funcionDeCierreDeFormulario={() => setDepartamentoEditando(null)}
                    handleDepartamentoActualizado={handleDepartamentoActualizado}
                />
            )}

            {departamentoEliminando && (
                <DelDepartamento
                    departamento={departamentoEliminando}
                    funcionDeCierreDeFormulario={() => setDepartamentoEliminando(null)}
                    handleDepartamentoEliminado={handleDepartamentoEliminado}
                />
            )}

            {errorCarga && (
                <div className="alert alert-danger mx-3 mt-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorCarga}
                </div>
            )}

            {cargando ? (
                <div className="tabla-empty-state">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : listaDepartamentos.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">Acciones</th>
                            </tr>
                            <tr className="table-light">
                                <th />
                                <th><input className="form-control form-control-sm" type="text" placeholder="Nombre" value={filtros.nombre} onChange={e => setFiltro('nombre', e.target.value)} /></th>
                                <th />
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {departamentosFiltrados.length > 0 ? departamentosFiltrados.map(departamento => (
                                <tr key={departamento?.ID} className="h-auto">
                                    <th scope="row">{departamento?.ID}</th>
                                    <td>{departamento?.Nombre}</td>
                                    <td className="h-auto acciones-tabla">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            title="Editar departamento"
                                            aria-label="Editar departamento"
                                            onClick={() => setDepartamentoEditando(departamento)}
                                            disabled={!tengoPermiso('/departamentos', 'POST')}
                                        ><i className="bi bi-pencil-fill" aria-hidden="true" /></button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            title="Eliminar departamento"
                                            aria-label="Eliminar departamento"
                                            onClick={() => setDepartamentoEliminando(departamento)}
                                            disabled={!tengoPermiso('/departamentos', 'DELETE')}
                                        ><i className="bi bi-trash-fill" aria-hidden="true" /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center text-muted py-4 small">
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
                    <i className="bi bi-building tabla-empty-icon" aria-hidden="true" />
                    <p className="text-muted mb-0">No hay departamentos registrados.</p>
                </div>
            )}
        </>
    );
}
