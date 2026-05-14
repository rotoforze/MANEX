import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import "../../../public/styles/tablaPermisos.css";

export function TablaFichajes() {

    const [listaFichajes, setListaFichajes] = useState([]);
    const [errorCarga, setErrorCarga] = useState('');
    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [resultadosPorPagina, setResultadosPorPagina] = useState(0);
    const [cantidadPorPagina] = useState(10);

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

                if (!response.ok) {
                    throw new Error(data?.message || 'No se han podido cargar los fichajes.');
                }

                return data;
            })
            .then((data) => {
                setListaFichajes(data?.data || []);
                setPaginaMaxima((data?.meta?.totalPaginas || 1) - 1);
                setResultadosPorPagina(data?.meta?.resultados || 0);
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
        return <b className="text-danger">{errorCarga}</b>;
    }

    return (
        <>
            {listaFichajes.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Empleado</th>
                                <th>Usuario</th>
                                <th>Nombre</th>
                                <th>Apellidos</th>
                                <th>Entrada</th>
                                <th>Salida</th>
                                <th>Tipo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="table-group-divider">
                            {listaFichajes.map((fichaje) => {
                                const id = obtenerValor(fichaje, ['id', 'ID']);
                                const idEmpleado = obtenerValor(fichaje, ['id_empleado', 'ID_EMPLEADO']);
                                const username = obtenerValor(fichaje, ['username', 'USERNAME']);
                                const nombre = obtenerValor(fichaje, ['nombre', 'Nombre']);
                                const entrada = obtenerValor(fichaje, ['fecha_entrada', 'Fecha_entrada'], null);

                                return (
                                    <tr key={id} className="h-auto">
                                        <th>{id}</th>

                                        <td>{idEmpleado}</td>

                                        <td>{username}</td>

                                        <td>{nombre}</td>

                                        <td>{obtenerValor(fichaje, ['apellidos', 'Apellidos'])}</td>

                                        <td>{formatearFecha(entrada)}</td>

                                        <td>{formatearFecha(obtenerValor(fichaje, ['fecha_salida', 'Fecha_salida'], null))}</td>

                                        <td>{obtenerValor(fichaje, ['tipo', 'Tipo'])}</td>

                                        <td className="h-auto acciones-tabla">
                                            <button className="btn btn-primary bi-pencil-fill" title="Editar fichaje" />

                                            <button className="btn btn-danger bi-trash-fill" title="Eliminar fichaje" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="gap-3 d-flex justify-content-center mb-3">
                        <button
                            className="btn btn-primary bi-chevron-left"
                            disabled={paginaActual === 0}
                            onClick={() => {
                                if (paginaActual > 0) setPaginaActual(paginaActual - 1);
                            }}
                        />

                        <b>Mostrando {resultadosPorPagina}/{cantidadPorPagina} en la pagina {paginaActual}</b>

                        <button
                            className="btn btn-primary bi-chevron-right"
                            disabled={!(paginaActual < paginaMaxima)}
                            onClick={() => {
                                if (paginaActual < paginaMaxima) setPaginaActual(paginaActual + 1);
                            }}
                        />
                    </div>
                </div>
            ) : (
                <b>No hay fichajes.</b>
            )}
        </>
    );
}
