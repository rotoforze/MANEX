import { useEffect, useState } from "react";
import { useUsers } from "../../../context/UserContext.jsx";
import "../../../../public/styles/tablaPermisos.css";

/**
 * Muestra en formato tabla las solicitudes recibidas.
 *
 * @author Eneas Menendez
 * @version 1.0.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaSolicitudes() {

    const [listaSolicitudes, setListaSolicitudes] = useState([]);

    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [resultadosPorPagina, setResultadosPorPagina] = useState(0);
    const [cantidadPorPagina, setCantidadPorPagina] = useState(10);

    const { user } = useUsers();

    useEffect(() => {
        try {
            fetch(
                import.meta.env.VITE_BACKEND_SOLICITUD +
                '?pagina=' + paginaActual +
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
                        setListaSolicitudes(data?.data || []);
                        setPaginaMaxima(data?.meta?.totalPaginas - 1);
                        setResultadosPorPagina(data?.meta?.resultados);
                    }
                });

        } catch (e) {
            console.error(e);
        }
    }, [paginaActual]);

    /**
     * Devuelve la clase bootstrap del badge segun el estado.
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

            case 'Aprobada':
            case 'Resuelta':
                return 'text-bg-success';

            case 'Rechazada':
                return 'text-bg-secondary';

            default:
                return 'text-bg-primary';
        }
    }

    function formatearFecha(fecha) {
        return fecha
            ? new Date(fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' })
            : 'N/A';
    }

    return (
        listaSolicitudes.length > 0 ?
            (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Tipo</th>
                                <th scope="col">Descripcion</th>
                                <th scope="col">Fecha</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="table-group-divider">
                            {
                                listaSolicitudes.map((solicitud) => (

                                    <tr key={solicitud?.ID} className="h-auto">

                                        <th scope="row">{solicitud?.ID}</th>

                                        <td>{solicitud?.Tipo || 'N/A'}</td>

                                        <td>{solicitud?.Descripcion || 'N/A'}</td>

                                        <td>{formatearFecha(solicitud?.Fecha)}</td>

                                        <td>
                                            <span className={`badge ${obtenerClaseEstado(solicitud?.Estado)}`}>
                                                {solicitud?.Estado || 'Sin estado'}
                                            </span>
                                        </td>

                                        <td className={"h-auto acciones-tabla"}>
                                            <button className="btn btn-primary bi-pencil-fill"></button>

                                            <button className="btn btn-danger bi-trash-fill"></button>
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
            : <b>No hay solicitudes.</b>
    );
}
