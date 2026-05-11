import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import {apiFetch} from "../../utils/apiFetch.jsx";

/**
 * Muestra en formato tabla los fichajes recibidos.
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @returns {React.JSX.Element}
 * @constructor
 */

export function TablaFichajes() {

    const [listaFichajes, setListaFichajes] = useState([]);

    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [resultadosPorPagina, setResultadosPorPagina] = useState(0);
    const [cantidadPorPagina, setCantidadPorPagina] = useState(10);

    const { user } = useUsers();

    useEffect(() => {
        try {
            apiFetch(
                import.meta.env.VITE_BACKEND +
                '/fichajes?pagina=' + paginaActual +
                '&cantidad=' + cantidadPorPagina,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'token': user?.token
                    }
                }
            )
                .then((response) => response.json())
                .then((data) => {
                    if (data) {
                        setListaFichajes(data?.data || []);
                        setPaginaMaxima(data?.meta?.totalPaginas - 1);
                        setResultadosPorPagina(data?.meta?.resultados);
                    }
                });

        } catch (e) {
            console.error(e);
        }
    }, [paginaActual]);

    function formatearFecha(fecha) {
        return fecha
            ? new Date(fecha).toLocaleString('es-ES', { timeZone: 'UTC' })
            : 'N/A';
    }

    return (
        listaFichajes.length > 0 ?
            (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped align-middle">
                        <thead>
                            <tr>
                                <th scope="col">Nombre</th>
                                <th scope="col">Apellidos</th>
                                <th scope="col">Entrada</th>
                                <th scope="col">Salida</th>
                                <th scope="col">Tipo</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="table-group-divider">
                            {
                                listaFichajes.map((fichaje, index) => (

                                    <tr key={`${fichaje?.nombre}-${fichaje?.fecha_entrada}-${index}`} className="h-auto">

                                        <td>{fichaje?.nombre || 'N/A'}</td>

                                        <td>{fichaje?.apellidos || 'N/A'}</td>

                                        <td>{formatearFecha(fichaje?.fecha_entrada)}</td>

                                        <td>{formatearFecha(fichaje?.fecha_salida)}</td>

                                        <td>{fichaje?.tipo || 'N/A'}</td>

                                        <td className={"row-cols-1 gap-2"}>
                                            <button className="btn btn-primary bi-pencil-fill"></button>

                                            <button className="btn btn-danger bi-trash-fill mt-2"></button>
                                        </td>

                                    </tr>

                                ))
                            }
                        </tbody>
                    </table>

                    <div className="gap-3 d-flex justify-content-center mb-3">

                        <button
                            className="btn btn-primary bi-chevron-left"
                            disabled={paginaActual == 0}
                            onClick={() => {
                                if (paginaActual > 0) {
                                    setPaginaActual(paginaActual - 1);
                                }
                            }}>
                        </button>

                        <b>
                            Mostrando {resultadosPorPagina}/{cantidadPorPagina}
                            en la pagina {paginaActual}
                        </b>

                        <button
                            className="btn btn-primary bi-chevron-right"
                            disabled={!(paginaActual < paginaMaxima)}
                            onClick={() => {
                                if (paginaActual < paginaMaxima) {
                                    setPaginaActual(paginaActual + 1);
                                }
                            }}>
                        </button>

                    </div>
                </div>
            )
            : <b>No hay fichajes.</b>
    );
}
