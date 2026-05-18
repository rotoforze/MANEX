import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { EditarContratoForm } from "./EditarContratoForm.jsx";
import { DelContrato } from "./DelContrato.jsx";
import "../../../public/styles/tablaPermisos.css";
import "../../../public/styles/mainPages.css";

/**
 * Muestra en formato tabla los contratos existentes con paginación.
 * Permite editar y eliminar cada contrato.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.1.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaContratos() {
    const [listaContratos, setListaContratos] = useState([]);
    const [paginaActual, setPaginaActual] = useState(() => parseInt(sessionStorage.getItem('tabla_contratos_pagina') || '0', 10));
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [cantidadPorPagina] = useState(10);

    const [contratoEditando, setContratoEditando] = useState(null);
    const [contratoEliminando, setContratoEliminando] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState(null);
    const [filtros, setFiltros] = useState({ salario: '', horas: '' });
    const setFiltro = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));

    const { user, tengoPermiso } = useUsers();

    useEffect(() => {
        sessionStorage.setItem('tabla_contratos_pagina', paginaActual);
    }, [paginaActual]);

    const cargarContratos = () => {
        setCargando(true);
        setErrorCarga(null);
        apiFetch(
            `${import.meta.env.VITE_BACKEND_CONTRATOS}?pagina=${paginaActual}&cantidad=${cantidadPorPagina}`,
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
                    setListaContratos(data?.data);
                    const total = data?.resultados || 0;
                    setTotalRegistros(total);
                    setPaginaMaxima(Math.max(0, Math.ceil(total / cantidadPorPagina) - 1));
                }
            })
            .catch(e => {
                console.error(e);
                setErrorCarga('No se pudieron cargar los contratos. Comprueba la conexión con el servidor.');
            })
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarContratos();
    }, [paginaActual]);

    const handleContratoActualizado = () => {
        setContratoEditando(null);
        cargarContratos();
    };

    const handleContratoEliminado = () => {
        setContratoEliminando(null);
        cargarContratos();
    };

    const contratosFiltrados = listaContratos.filter(c => (
        (!filtros.salario || String(c?.Salario_anual ?? '').includes(filtros.salario)) &&
        (!filtros.horas || String(c?.Horas_anuales ?? '').includes(filtros.horas))
    ));

    return (
        <>
            {contratoEditando && (
                <EditarContratoForm
                    contrato={contratoEditando}
                    funcionDeCierreDeFormulario={() => setContratoEditando(null)}
                    handleContratoActualizado={handleContratoActualizado}
                />
            )}

            {contratoEliminando && (
                <DelContrato
                    contrato={contratoEliminando}
                    funcionDeCierreDeFormulario={() => setContratoEliminando(null)}
                    handleContratoEliminado={handleContratoEliminado}
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
            ) : listaContratos?.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Salario anual (€)</th>
                                <th scope="col">Horas anuales</th>
                                <th scope="col">Acciones</th>
                            </tr>
                            <tr>
                                <th />
                                <th><input className="form-control form-control-sm" type="text" placeholder="Salario" value={filtros.salario} onChange={e => setFiltro('salario', e.target.value)} /></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Horas" value={filtros.horas} onChange={e => setFiltro('horas', e.target.value)} /></th>
                                <th />
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {contratosFiltrados.length > 0 ? contratosFiltrados.map((contrato) => (
                                <tr key={contrato?.ID} className="h-auto">
                                    <th scope="row">{contrato?.ID}</th>
                                    <td>{contrato?.Salario_anual?.toLocaleString('es-ES')} €</td>
                                    <td>{contrato?.Horas_anuales} h</td>
                                    <td className="h-auto w-auto p-1">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            title="Editar contrato"
                                            aria-label="Editar contrato"
                                            onClick={() => setContratoEditando(contrato)}
                                            disabled={!tengoPermiso('/contratos', 'POST')}
                                        ><i className="bi bi-pencil-fill" aria-hidden="true" /></button>&nbsp;
                                        <button
                                            className="btn btn-danger btn-sm"
                                            title="Eliminar contrato"
                                            aria-label="Eliminar contrato"
                                            onClick={() => setContratoEliminando(contrato)}
                                            disabled={!tengoPermiso('/contratos', 'DELETE')}
                                        ><i className="bi bi-trash-fill" aria-hidden="true" /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted py-4 small">
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
                    <i className="bi bi-file-earmark-text tabla-empty-icon" aria-hidden="true" />
                    <p className="text-muted mb-0">No hay contratos registrados.</p>
                </div>
            )}
        </>
    );
}
