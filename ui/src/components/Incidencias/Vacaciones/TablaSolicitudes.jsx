import { useEffect, useState } from "react";
import { useUsers } from "../../../context/UserContext.jsx";
import { apiFetch } from "../../../utils/apiFetch.jsx";
import { EditarSolicitudForm } from "./EditarSolicitudForm.jsx";
import "../../../../public/styles/tablaPermisos.css";

export function TablaSolicitudes() {

    const [listaSolicitudes, setListaSolicitudes] = useState([]);
    const [errorCarga, setErrorCarga] = useState('');
    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [resultadosPorPagina, setResultadosPorPagina] = useState(0);
    const [cantidadPorPagina] = useState(10);
    const [solicitudEditando, setSolicitudEditando] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const { user } = useUsers();

    useEffect(() => {
        const urlSolicitudes = import.meta.env.VITE_BACKEND_SOLICITUDES
            || import.meta.env.VITE_BACKEND_SOLICITUD
            || `${import.meta.env.VITE_BACKEND}/vacaciones`;

        apiFetch(
            `${urlSolicitudes}?pagina=${paginaActual}&cantidad=${cantidadPorPagina}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'token': user?.token,
                },
            }
        )
            .then((response) => response.json())
            .then((data) => {
                setListaSolicitudes(data?.data || []);
                setPaginaMaxima((data?.meta?.totalPaginas || 1) - 1);
                setResultadosPorPagina(data?.meta?.resultados || 0);
                setErrorCarga('');
            })
            .catch((e) => {
                console.error(e);
                setErrorCarga('No se han podido cargar las solicitudes.');
                setListaSolicitudes([]);
            });
    }, [paginaActual, cantidadPorPagina, user?.token, refreshKey]);

    function handleSolicitudActualizada() {
        setSolicitudEditando(null);
        setRefreshKey(prevKey => prevKey + 1);
    }

    function obtenerClaseEstado(estado) {
        switch (estado) {
            case 'Pendiente':
                return 'text-bg-danger';
            case 'En proceso':
            case 'En revision':
            case 'En revisión':
                return 'text-bg-warning';
            case 'Aprobada':
            case 'Concedido':
            case 'Resuelta':
                return 'text-bg-success';
            case 'Rechazada':
            case 'Rechazado':
                return 'text-bg-secondary';
            default:
                return 'text-bg-primary';
        }
    }

    function obtenerValor(solicitud, claves, valorPorDefecto = 'N/A') {
        const valor = claves
            .map((clave) => solicitud?.[clave])
            .find((dato) => dato !== undefined && dato !== null && dato !== '');

        return valor ?? valorPorDefecto;
    }

    function formatearFecha(fecha) {
        return fecha
            ? new Date(fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' })
            : 'N/A';
    }

    if (errorCarga) {
        return <b className="text-danger">{errorCarga}</b>;
    }

    return (
        <>
            {solicitudEditando && (
                <EditarSolicitudForm
                    solicitud={solicitudEditando}
                    funcionDeCierreDeFormulario={() => setSolicitudEditando(null)}
                    handleSolicitudActualizada={handleSolicitudActualizada}
                />
            )}

            {listaSolicitudes.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tipo</th>
                                <th>Fecha inicio</th>
                                <th>Fecha fin</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="table-group-divider">
                            {listaSolicitudes.map((solicitud) => {
                                const idIncidencia = obtenerValor(solicitud, ['id_incidencia', 'ID_INCIDENCIA', 'ID']);
                                const estado = obtenerValor(solicitud, ['estado', 'Estado'], 'Sin estado');

                                return (
                                    <tr key={idIncidencia} className="h-auto">
                                        <th>{idIncidencia}</th>

                                        <td>{obtenerValor(solicitud, ['tipo', 'Tipo'])}</td>

                                        <td>{formatearFecha(obtenerValor(solicitud, ['fecha_inicio', 'Fecha_inicio'], null))}</td>

                                        <td>{formatearFecha(obtenerValor(solicitud, ['fecha_fin', 'Fecha_fin'], null))}</td>

                                        <td>
                                            <span className={`badge ${obtenerClaseEstado(estado)}`}>
                                                {estado}
                                            </span>
                                        </td>

                                        <td className="h-auto acciones-tabla">
                                            <button
                                                className="btn btn-primary bi-pencil-fill"
                                                title="Editar solicitud"
                                                onClick={() => setSolicitudEditando(solicitud)}
                                            />

                                            <button className="btn btn-danger bi-trash-fill" title="Eliminar solicitud" />
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

                        <b>
                            Mostrando {resultadosPorPagina}/{cantidadPorPagina} en la pagina {paginaActual}
                        </b>

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
                <b>No hay solicitudes.</b>
            )}
        </>
    );
}
