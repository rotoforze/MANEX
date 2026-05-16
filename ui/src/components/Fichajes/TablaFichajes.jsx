import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
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
    const [errorCarga, setErrorCarga] = useState('');
    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [cantidadPorPagina] = useState(10);
    const [filtros, setFiltros] = useState({ usuario: '', nombre: '', apellidos: '', tipo: '' });
    const setFiltro = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));

    const { user } = useUsers();

    useEffect(() => {
        const urlFichajes = import.meta.env.VITE_BACKEND_FICHAJES
            || `${import.meta.env.VITE_BACKEND}/fichajes`;

        apiFetch(
            `${urlFichajes}?pagina=${paginaActual}&cantidad=${cantidadPorPagina}&username=${user?.username}`,
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
                console.log(data)
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
            });
    }, [paginaActual, cantidadPorPagina, user?.token]);

    function obtenerValor(fichaje, claves, valorPorDefecto = 'N/A') {
        const valor = claves
            .map((clave) => fichaje?.[clave])
            .find((dato) => dato !== undefined && dato !== null && dato !== '');
        return valor ?? valorPorDefecto;
    }

    function formatearFecha(fecha) {
        return fecha
            ? new Date(fecha).toLocaleString('es-ES', { timeZone: 'UTC' })
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

    const fichajesFiltrados = listaFichajes.filter(f => (
        (!filtros.usuario || String(f?.username ?? '').toLowerCase().includes(filtros.usuario.toLowerCase())) &&
        (!filtros.nombre || String(f?.nombre ?? '').toLowerCase().includes(filtros.nombre.toLowerCase())) &&
        (!filtros.apellidos || String(f?.apellidos ?? '').toLowerCase().includes(filtros.apellidos.toLowerCase())) &&
        (!filtros.tipo || f?.tipo === filtros.tipo)
    ));

    return (
        <>
            {listaFichajes.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
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
                            </tr>
                            <tr className="table-light">
                                <th />
                                <th />
                                <th><input className="form-control form-control-sm" type="text" placeholder="Usuario" value={filtros.usuario} onChange={e => setFiltro('usuario', e.target.value)} /></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Nombre" value={filtros.nombre} onChange={e => setFiltro('nombre', e.target.value)} /></th>
                                <th><input className="form-control form-control-sm" type="text" placeholder="Apellidos" value={filtros.apellidos} onChange={e => setFiltro('apellidos', e.target.value)} /></th>
                                <th />
                                <th />
                                <th>
                                    <select className="form-select form-select-sm" value={filtros.tipo} onChange={e => setFiltro('tipo', e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="Presencial">Presencial</option>
                                        <option value="Remoto">Remoto</option>
                                    </select>
                                </th>
                                <th />
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {fichajesFiltrados.length > 0 ? fichajesFiltrados.map((fichaje) => {
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
                    <i className="bi bi-person-check tabla-empty-icon" aria-hidden="true" />
                    <p className="text-muted mb-0">No hay fichajes registrados.</p>
                </div>
            )}
        </>
    );
}
