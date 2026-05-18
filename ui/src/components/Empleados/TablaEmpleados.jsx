import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import { EditarEmpleadoForm } from "./EditarEmpleadoForm.jsx";
import { VerEmpleado } from "./VerEmpleado.jsx";
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
    const [empleadoViendo, setEmpleadoViendo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filtros, setFiltros] = useState({
        nombre: searchParams.get('nombre') || '',
        apellidos: searchParams.get('apellidos') || '',
        email: searchParams.get('email') || '',
        telefono: searchParams.get('telefono') || '',
        departamento: searchParams.get('departamento') || '',
        contrato: searchParams.get('contrato') || '',
    });
    const setFiltro = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));
    const dNombre = useDebounce(filtros.nombre);
    const dApellidos = useDebounce(filtros.apellidos);
    const dEmail = useDebounce(filtros.email);
    const dTelefono = useDebounce(filtros.telefono);
    const dDepartamento = useDebounce(filtros.departamento);
    const dContrato = useDebounce(filtros.contrato);

    const {user, tengoPermiso} = useUsers();

    useEffect(() => {
        sessionStorage.setItem('tabla_empleados_pagina', paginaActual);
    }, [paginaActual]);

    useEffect(() => {
        const p = {};
        if (dNombre) p.nombre = dNombre;
        if (dApellidos) p.apellidos = dApellidos;
        if (dEmail) p.email = dEmail;
        if (dTelefono) p.telefono = dTelefono;
        if (dDepartamento) p.departamento = dDepartamento;
        if (dContrato) p.contrato = dContrato;
        setSearchParams(p, { replace: true });
    }, [dNombre, dApellidos, dEmail, dTelefono, dDepartamento, dContrato]);

    useEffect(() => {
        setPaginaActual(0);
    }, [dNombre, dApellidos, dEmail, dTelefono, dDepartamento, dContrato]);

    const hayFiltros = !!(dNombre || dApellidos || dEmail || dTelefono || dDepartamento || dContrato);
    const limpiarFiltros = () => {
        setFiltros({nombre: '', apellidos: '', email: '', telefono: '', departamento: '', contrato: ''});
        setSearchParams({}, {replace: true});
    };

    useEffect(() => {
        sessionStorage.setItem('tabla_empleados_pagina', paginaActual);
    }, [paginaActual]);

    useEffect(() => {
        const p = {};
        if (dNombre) p.nombre = dNombre;
        if (dApellidos) p.apellidos = dApellidos;
        if (dEmail) p.email = dEmail;
        if (dTelefono) p.telefono = dTelefono;
        if (dDepartamento) p.departamento = dDepartamento;
        if (dContrato) p.contrato = dContrato;
        setSearchParams(p, { replace: true });
    }, [dNombre, dApellidos, dEmail, dTelefono, dDepartamento, dContrato]);

    useEffect(() => {
        setPaginaActual(0);
    }, [dNombre, dApellidos, dEmail, dTelefono, dDepartamento, dContrato]);

     hayFiltros = !!(dNombre || dApellidos || dEmail || dTelefono || dDepartamento || dContrato);
    limpiarFiltros = () => {
        setFiltros({ nombre: '', apellidos: '', email: '', telefono: '', departamento: '', contrato: '' });
        setSearchParams({}, { replace: true });
    };

    const cargarEmpleados = () => {
        setCargando(true);
        setErrorCarga(null);

        const params = new URLSearchParams({ pagina: paginaActual, cantidad: cantidadPorPagina });
        if (dNombre) params.set('nombre', dNombre);
        if (dApellidos) params.set('apellidos', dApellidos);
        if (dEmail) params.set('email', dEmail);
        if (dTelefono) params.set('telefono', dTelefono);
        if (dDepartamento) params.set('departamento', dDepartamento);
        if (dContrato) params.set('contrato', dContrato);

        apiFetch(
            `${import.meta.env.VITE_BACKEND_EMPLEADO}?${params}`,
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
    }, [paginaActual, dNombre, dApellidos, dEmail, dTelefono, dDepartamento, dContrato]);

    const handleEmpleadoActualizado = () => {
        setEmpleadoEditando(null);
        cargarEmpleados();
    };

    const handleEmpleadoEliminado = () => {
        setEmpleadoEliminando(null);
        cargarEmpleados();
    };


    return (
        <>
            {empleadoViendo && (
                <VerEmpleado
                    empleado={empleadoViendo}
                    onClose={() => setEmpleadoViendo(null)}
                />
            )}
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
                    setEliminando={(v) => {
                        if (!v) setEmpleadoEliminando(null);
                    }}
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
            ) : listaEmpleados?.length > 0 || hayFiltros ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <div className={"table-responsive"}>
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                <th scope="col" className={"col-0"}>#</th>
                                <th scope="col" className={"col-2"}>Nombre</th>
                                <th scope="col" className={"col-2"}>Apellido</th>
                                <th scope="col" className={"col-2"}>Email</th>
                                <th scope="col" className={"col-1"}>Teléfono</th>
                                <th scope="col" className={"col-1"}>F. nacimiento</th>
                                <th scope="col" className={"col-1"}>F. alta</th>
                                <th scope="col" className={"col-0"}>Dpto.</th>
                                <th scope="col" className={"col-0"}>Contrato</th>
                                <th scope="col" className={"col-2"}>Acciones</th>
                            </tr>
                            <tr>
                                <th/>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Nombre"
                                           value={filtros.nombre} onChange={e => setFiltro('nombre', e.target.value)}/>
                                </th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Apellidos"
                                           value={filtros.apellidos}
                                           onChange={e => setFiltro('apellidos', e.target.value)}/></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Email"
                                           value={filtros.email} onChange={e => setFiltro('email', e.target.value)}/>
                                </th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Teléfono"
                                           value={filtros.telefono}
                                           onChange={e => setFiltro('telefono', e.target.value)}/></th>
                                <th/>
                                <th/>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Dpto."
                                           value={filtros.departamento}
                                           onChange={e => setFiltro('departamento', e.target.value)}/></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Contrato"
                                           value={filtros.contrato}
                                           onChange={e => setFiltro('contrato', e.target.value)}/></th>
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
                            {listaEmpleados.length > 0 ? listaEmpleados.map((empleado) => (
                                <tr key={empleado?.ID}>
                                    <th scope="row">{empleado?.ID}</th>
                                    <td className="text-nowrap">{empleado?.Nombre}</td>
                                    <td className="text-nowrap">{empleado?.Apellidos}</td>
                                    <td>{empleado?.email}</td>
                                    <td className="text-nowrap">{empleado?.telefono}</td>
                                    <td className="text-nowrap">
                                        {empleado?.fecha_nacimiento
                                            ? new Date(empleado.fecha_nacimiento).toLocaleDateString('es-ES', {timeZone: 'UTC'})
                                            : 'N/A'}
                                    </td>
                                    <td className="text-nowrap">
                                        {empleado?.fecha_alta
                                            ? new Date(empleado.fecha_alta).toLocaleDateString('es-ES', {timeZone: 'UTC'})
                                            : 'N/A'}
                                    </td>
                                    <td>{empleado?.ID_DEPARTAMENTO}</td>
                                    <td>{empleado?.ID_CONTRATO}</td>
                                    <td className="h-auto w-100 p-1">
                                        <button
                                            className="btn btn-info btn-sm"
                                            title="Ver empleado"
                                            aria-label="Ver empleado"
                                            onClick={() => setEmpleadoViendo(empleado)}
                                        >
                                            <i className="bi bi-eye-fill" aria-hidden="true"/>
                                        </button>
                                        <button
                                            className="btn btn-info btn-sm"
                                            title="Ver empleado"
                                            aria-label="Ver empleado"
                                            onClick={() => setEmpleadoViendo(empleado)}
                                        >
                                            <i className="bi bi-eye-fill" aria-hidden="true" />
                                        </button>
                                        <button
                                            className="btn btn-info btn-sm"
                                            title="Ver empleado"
                                            aria-label="Ver empleado"
                                            onClick={() => setEmpleadoViendo(empleado)}
                                        >
                                            <i className="bi bi-eye-fill" aria-hidden="true" />
                                        </button>
                                        &nbsp;
                                        <button
                                            className="btn btn-primary btn-sm"
                                            title="Editar empleado"
                                            aria-label="Editar empleado"
                                            onClick={() => setEmpleadoEditando(empleado)}
                                            disabled={!tengoPermiso('/empleados', 'POST')}
                                        ><i className="bi bi-pencil-fill" aria-hidden="true"/></button>
                                        &nbsp;
                                        <button
                                            className="btn btn-danger btn-sm"
                                            title="Eliminar empleado"
                                            aria-label="Eliminar empleado"
                                            onClick={() => setEmpleadoEliminando(empleado)}
                                            disabled={!tengoPermiso('/empleados', 'DELETE')}
                                        ><i className="bi bi-trash-fill" aria-hidden="true"/></button>
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
                    </div>
                    {listaEmpleados?.length > 0 &&
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
                    <i className="bi bi-people tabla-empty-icon" aria-hidden="true"/>
                    <p className="text-muted mb-0">No hay empleados registrados.</p>
                </div>
            )}
        </>
    );
}
