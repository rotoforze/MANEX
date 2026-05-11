import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import {apiFetch} from "../../utils/apiFetch.jsx";

/**
 * Muestra en formato tabla las incidencias recibidas
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaIncidencias({ tipoIncidencia }) {

    const [listaIncidencias, setListaIncidencias] = useState([]);

    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [resultadosPorPagina, setResultadosPorPagina] = useState(0);
    const [cantidadPorPagina, setCantidadPorPagina] = useState(10);

    const { user } = useUsers();

    useEffect(() => {

        try {

            apiFetch(
                import.meta.env.VITE_BACKEND_INCIDENCIA +
                '?pagina=' + paginaActual +
                '&cantidad=' + cantidadPorPagina +
                '&tipo=' + tipoIncidencia,
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

                        setListaIncidencias(data?.data);
                        setPaginaMaxima(data?.meta?.totalPaginas - 1);
                        setResultadosPorPagina(data?.meta?.resultados);

                    }
                });

        } catch (e) {

            console.error(e);

        }

    }, [paginaActual, tipoIncidencia]);

    /**
     * Devuelve la clase bootstrap del badge según el estado
     *
     * @param estado
     * @returns {string}
     */
    function obtenerClaseEstado(estado) {

        switch (estado) {

            case 'Pendiente':
                return 'text-bg-danger';

            case 'En proceso':
                return 'text-bg-warning';

            case 'Resuelta':
                return 'text-bg-success';

            default:
                return 'text-bg-secondary';
        }
    }

    return (

        listaIncidencias.length > 0 ?

            (

                <div className="table-responsive m-3 d-flex flex-column justify-content-start">

                    <table className="table table-striped align-middle">

                        <thead>

                            <tr>

                                <th scope="col">#</th>

                                <th scope="col">Título</th>

                                <th scope="col">Descripción</th>

                                <th scope="col">Estado</th>

                                <th scope="col">Prioridad</th>

                                <th scope="col">Acciones</th>

                            </tr>

                        </thead>

                        <tbody className="table-group-divider">

                            {

                                listaIncidencias.map((incidencia) => (

                                    <tr key={incidencia?.ID} className="h-auto">

                                        <th scope="row">
                                            {incidencia?.ID}
                                        </th>

                                        <td>
                                            {incidencia?.Titulo}
                                        </td>

                                        <td>
                                            {incidencia?.Descripcion}
                                        </td>

                                        <td>

                                            <span className={`badge ${obtenerClaseEstado(incidencia?.Estado)}`}>

                                                {incidencia?.Estado}

                                            </span>

                                        </td>

                                        <td>
                                            {incidencia?.Prioridad}
                                        </td>

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
                            en la página {paginaActual}

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

            : <b>No hay incidencias.</b>
    );
}