import {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {useUsers} from "../../context/UserContext.jsx";
import {apiFetch} from "../../utils/apiFetch.jsx";
import {useDebounce} from "../../hooks/useDebounce.js";
import "../../../public/styles/tablaPermisos.css";
import "../../../public/styles/mainPages.css";

/**
 * Muestra en formato tabla los fichajes con paginación.
 *
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.1.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaFichajes({setFichajeActivo}) {

    const [listaFichajes, setListaFichajes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');
    const [paginaActual, setPaginaActual] = useState(() => parseInt(sessionStorage.getItem('tabla_fichajes_pagina') || '0', 10));
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [cantidadPorPagina] = useState(10);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filtros, setFiltros] = useState({
        usuario: '',
        nombre: searchParams.get('nombre') || '',
        apellidos: searchParams.get('apellidos') || '',
        tipo: searchParams.get('tipo') || '',
    });
    const setFiltro = (campo, valor) => setFiltros(prev => ({...prev, [campo]: valor}));
    const dNombre = useDebounce(filtros.nombre);
    const dApellidos = useDebounce(filtros.apellidos);

    const {user} = useUsers();

    useEffect(() => {
        sessionStorage.setItem('tabla_fichajes_pagina', paginaActual);
    }, [paginaActual]);

    useEffect(() => {
        const p = {};
        if (dNombre) p.nombre = dNombre;
        if (dApellidos) p.apellidos = dApellidos;
        if (filtros.tipo) p.tipo = filtros.tipo;
        setSearchParams(p, {replace: true});
    }, [dNombre, dApellidos, filtros.tipo]);

    useEffect(() => {
        setPaginaActual(0);
    }, [dNombre, dApellidos, filtros.tipo]);

    const hayFiltros = !!(dNombre || dApellidos || filtros.tipo);
    const limpiarFiltros = () => {
        setFiltros({usuario: '', nombre: '', apellidos: '', tipo: ''});
        setSearchParams({}, {replace: true});
    };

    useEffect(() => {
        setCargando(true);
        const urlFichajes = import.meta.env.VITE_BACKEND_FICHAJES
            || `${import.meta.env.VITE_BACKEND}/fichajes`;

        const params = new URLSearchParams({
            pagina: paginaActual,
            cantidad: cantidadPorPagina,
            username: user?.username
        });
        if (dNombre) params.set('nombre', dNombre);
        if (dApellidos) params.set('apellidos', dApellidos);
        if (filtros.tipo) params.set('tipo', filtros.tipo);

        apiFetch(
            `${urlFichajes}?${params}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'token': user?.token,
                },
            }
        )
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data?.message || 'No se han podido cargar los fichajes.');
                return data;
            })
            .then((data) => {
                setFichajeActivo(data?.meta?.fichajeActivo)
                setListaFichajes(data?.data || []);
                setPaginaMaxima((data?.meta?.totalPaginas || 1) - 1);
                setTotalRegistros(data?.meta?.resultados || 0);
                setErrorCarga('');
            })
            .catch((e) => {
                console.error(e);
                setErrorCarga(e?.message || 'No se han podido cargar los fichajes.');
                setListaFichajes([]);
            })
            .finally(() => setCargando(false));
    }, [paginaActual, cantidadPorPagina, user?.token, dNombre, dApellidos, filtros.tipo]);

    function obtenerValor(fichaje, claves, valorPorDefecto = 'N/A') {
        const valor = claves
            .map((clave) => fichaje?.[clave])
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
            {listaFichajes.length > 0 || hayFiltros ? (
                <div className="contenedor-tabla m-3 d-flex flex-column justify-content-start">
                    <div className={"table-responsive"}>
                        <table className="table table-striped">
                            <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Empleado</th>
                                <th scope="col">Usuario</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">Apellidos</th>
                                <th scope="col">Entrada</th>
                                <th scope="col">Salida</th>
                                <th scope="col">Tipo</th>
                                <th scope="col"></th>
                            </tr>
                            <tr>
                                <th/>
                                <th/>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Usuario"
                                           value={filtros.usuario}
                                           onChange={e => setFiltro('usuario', e.target.value)}/></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Nombre"
                                           value={filtros.nombre} onChange={e => setFiltro('nombre', e.target.value)}/>
                                </th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Apellidos"
                                           value={filtros.apellidos}
                                           onChange={e => setFiltro('apellidos', e.target.value)}/></th>
                                <th/>
                                <th/>
                                <th>
                                    <select className="form-select form-select-sm" value={filtros.tipo}
                                            onChange={e => setFiltro('tipo', e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="Presencial">Presencial</option>
                                        <option value="Remoto">Remoto</option>
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
                            {listaFichajes.length > 0 ? listaFichajes.map((fichaje) => {
                                const id = obtenerValor(fichaje, ['id']);
                                const idEmpleado = obtenerValor(fichaje, ['id_empleado']);
                                const username = obtenerValor(fichaje, ['username']);
                                const nombre = obtenerValor(fichaje, ['nombre']);
                                const entrada = obtenerValor(fichaje, ['fecha_entrada'], null);

                                return (
                                    <tr key={id} className="h-auto">
                                        <th scope="row">{id}</th>
                                        <td>{idEmpleado}</td>
                                        <td>{username}</td>
                                        <td>{nombre}</td>
                                        <td>{obtenerValor(fichaje, ['apellidos'])}</td>
                                        <td>{formatearFecha(entrada)}</td>
                                        <td>{formatearFecha(obtenerValor(fichaje, ['fecha_salida'], null))}</td>
                                        <td>{obtenerValor(fichaje, ['tipo'])}</td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={9} className="text-center text-muted py-4 small">
                                        Sin resultados con los filtros aplicados.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                    {listaFichajes.length > 0 &&
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
                    <i className="bi bi-person-check tabla-empty-icon" aria-hidden="true"/>
                    <p className="text-muted mb-0">No hay fichajes registrados.</p>
                </div>
            )}
        </>
    );
}
