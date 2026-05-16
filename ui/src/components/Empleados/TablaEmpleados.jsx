import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { EditarEmpleadoForm } from "./EditarEmpleadoForm.jsx";
import { DelEmpleado } from "./DelEmpleado.jsx";
import "../../../public/styles/tablaPermisos.css";
import "../../../public/styles/mainPages.css";

/**
 * Muestra en formato tabla los empleados recibidos.
 * Permite editar y eliminar cada empleado.
 *
 * @author Alex Bernardos Gil
 * @contributor Eneas de la Rosa Menendez Pedrosa
 * @version 1.4.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaEmpleados() {
    const [listaEmpleados, setListaEmpleados] = useState([]);
    const [paginaActual, setPaginaActual] = useState(() => parseInt(sessionStorage.getItem('tabla_empleados_pagina') || '0', 10));
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [cantidadPorPagina] = useState(10);
    const [totalRegistros, setTotalRegistros] = useState(0);

    const [empleadoEditando, setEmpleadoEditando] = useState(null);
    const [empleadoEliminando, setEmpleadoEliminando] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState(null);
    const [filtros, setFiltros] = useState({ nombre: '', apellidos: '', email: '', telefono: '', departamento: '', contrato: '' });
    const setFiltro = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));

    const { user, tengoPermiso } = useUsers();

    useEffect(() => {
        sessionStorage.setItem('tabla_empleados_pagina', paginaActual);
    }, [paginaActual]);

    const cargarEmpleados = () => {
        setCargando(true);
        setErrorCarga(null);
        apiFetch(
            `${import.meta.env.VITE_BACKEND_EMPLEADO}?pagina=${paginaActual}&cantidad=${cantidadPorPagina}`,
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
                    setListaEmpleados(data?.data);
                    setPaginaMaxima((data?.meta?.totalPaginas || 1) - 1);
                    setTotalRegistros(data?.meta?.resultados || 0);
                }
            })
            .catch(e => {
                console.error(e);
                setErrorCarga('No se pudieron cargar los empleados. Comprueba la conexión con el servidor.');
            })
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarEmpleados();
    }, [paginaActual]);

    const handleEmpleadoActualizado = () => {
        setEmpleadoEditando(null);
        cargarEmpleados();
    };

    const handleEmpleadoEliminado = () => {
        setEmpleadoEliminando(null);
        cargarEmpleados();
    };

    const empleadosFiltrados = listaEmpleados.filter(e => (
        (!filtros.nombre || String(e?.Nombre ?? '').toLowerCase().includes(filtros.nombre.toLowerCase())) &&
        (!filtros.apellidos || String(e?.Apellidos ?? '').toLowerCase().includes(filtros.apellidos.toLowerCase())) &&
        (!filtros.email || String(e?.email ?? '').toLowerCase().includes(filtros.email.toLowerCase())) &&
        (!filtros.telefono || String(e?.telefono ?? '').toLowerCase().includes(filtros.telefono.toLowerCase())) &&
        (!filtros.departamento || String(e?.ID_DEPARTAMENTO ?? '').toLowerCase().includes(filtros.departamento.toLowerCase())) &&
        (!filtros.contrato || String(e?.ID_CONTRATO ?? '').toLowerCase().includes(filtros.contrato.toLowerCase()))
    ));

    return (
        <>
            {empleadoEditando && (
                <EditarEmpleadoForm
                    empleado={empleadoEditando}
                    funcionDeCierreDeFormulario={() => setEmpleadoEditando(null)}
                    handleEmpleadoActualizado={handleEmpleadoActualizado}
                />
            )}

            {empleadoEliminando && (
                <DelEmpleado
                    usuarioAEditar={empleadoEliminando}
                    setUsuarioAEditar={setEmpleadoEliminando}
                    eliminando={!!empleadoEliminando}
                    setEliminando={(v) => { if (!v) setEmpleadoEliminando(null); }}
                    user={user}
                    fetchInicio={handleEmpleadoEliminado}
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
            ) : listaEmpleados?.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">Apellido</th>
                                <th scope="col">Email</th>
                                <th scope="col">Teléfono</th>
                                <th scope="col">F. nacimiento</th>
                                <th scope="col">F. alta</th>
                                <th scope="col">Dpto.</th>
                                <th scope="col">Contrato</th>
                                <th scope="col">Acciones</th>
                            </tr>
                            <tr className="table-light">
                                <th />
                                <th><input className="form-control form-control-sm" type="text" placeholder="Nombre" value={filtros.nombre} onChange={e => setFiltro('nombre', e.target.value)} /></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Apellidos" value={filtros.apellidos} onChange={e => setFiltro('apellidos', e.target.value)} /></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Email" value={filtros.email} onChange={e => setFiltro('email', e.target.value)} /></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Teléfono" value={filtros.telefono} onChange={e => setFiltro('telefono', e.target.value)} /></th>
                                <th />
                                <th />
                                <th><input className="form-control form-control-sm" type="text" placeholder="Dpto." value={filtros.departamento} onChange={e => setFiltro('departamento', e.target.value)} /></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Contrato" value={filtros.contrato} onChange={e => setFiltro('contrato', e.target.value)} /></th>
                                <th />
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {empleadosFiltrados.length > 0 ? empleadosFiltrados.map((empleado) => (
                                <tr key={empleado?.ID} className="h-auto">
                                    <th scope="row">{empleado?.ID}</th>
                                    <td>{empleado?.Nombre}</td>
                                    <td>{empleado?.Apellidos}</td>
                                    <td>{empleado?.email}</td>
                                    <td>{empleado?.telefono}</td>
                                    <td>
                                        {empleado?.fecha_nacimiento
                                            ? new Date(empleado.fecha_nacimiento).toLocaleDateString('es-ES', { timeZone: 'UTC' })
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        {empleado?.fecha_alta
                                            ? new Date(empleado.fecha_alta).toLocaleDateString('es-ES', { timeZone: 'UTC' })
                                            : 'N/A'}
                                    </td>
                                    <td>{empleado?.ID_DEPARTAMENTO}</td>
                                    <td>{empleado?.ID_CONTRATO}</td>
                                    <td className="h-auto acciones-tabla">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            title="Editar empleado"
                                            aria-label="Editar empleado"
                                            onClick={() => setEmpleadoEditando(empleado)}
                                            disabled={!tengoPermiso('/empleados', 'POST')}
                                        ><i className="bi bi-pencil-fill" aria-hidden="true" /></button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            title="Eliminar empleado"
                                            aria-label="Eliminar empleado"
                                            onClick={() => setEmpleadoEliminando(empleado)}
                                            disabled={!tengoPermiso('/empleados', 'DELETE')}
                                        ><i className="bi bi-trash-fill" aria-hidden="true" /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={10} className="text-center text-muted py-4 small">
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
                    <i className="bi bi-people tabla-empty-icon" aria-hidden="true" />
                    <p className="text-muted mb-0">No hay empleados registrados.</p>
                </div>
            )}
        </>
    );
}
