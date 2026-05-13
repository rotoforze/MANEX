import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import "../../../public/styles/tablaPermisos.css";

export function TablaIncidencias({ tipoIncidencia }) {

    const [listaIncidencias, setListaIncidencias] = useState([]);
    const [errorCarga, setErrorCarga] = useState('');
    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [resultadosPorPagina, setResultadosPorPagina] = useState(0);
    const [cantidadPorPagina] = useState(10);

    const { user } = useUsers();

    useEffect(() => {
        const urlIncidencias = import.meta.env.VITE_BACKEND_INCIDENCIAS
            || `${import.meta.env.VITE_BACKEND}/incidencias`;

        apiFetch(
            `${urlIncidencias}?pagina=${paginaActual}&cantidad=${cantidadPorPagina}`,
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
                setListaIncidencias(data?.data || []);
                setPaginaMaxima((data?.meta?.totalPaginas || 1) - 1);
                setResultadosPorPagina(data?.meta?.resultados || 0);
                setErrorCarga('');
            })
            .catch(e => {
                console.error(e);
                setErrorCarga('No se han podido cargar las incidencias.');
                setListaIncidencias([]);
            });
    }, [paginaActual, tipoIncidencia, cantidadPorPagina, user?.token]);

    function obtenerClaseEstado(estado) {
        switch (estado) {
            case 'Pendiente':
            case 'Abierta':
                return 'text-bg-danger';
            case 'En proceso':
                return 'text-bg-warning';
            case 'Resuelta':
            case 'Cerrada':
                return 'text-bg-success';
            default:
                return 'text-bg-secondary';
        }
    }

    function obtenerValor(incidencia, claves, valorPorDefecto = 'N/A') {
        const valor = claves
            .map((clave) => incidencia?.[clave])
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
            {listaIncidencias.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">

                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Empleado</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Observaciones</th>
                                <th>Comentario</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="table-group-divider">
                            {listaIncidencias.map((incidencia) => {
                                const id = obtenerValor(incidencia, ['ID', 'id']);
                                const estado = obtenerValor(incidencia, ['estado', 'Estado'], 'Sin estado');
                                const fecha = obtenerValor(incidencia, ['fecha_creacion', 'Fecha_creacion', 'Fecha'], null);

                                return (
                                    <tr key={id}>
                                        <th>{id}</th>

                                        <td>{obtenerValor(incidencia, ['ID_empleado', 'id_empleado'])}</td>

                                        <td>{formatearFecha(fecha)}</td>

                                        <td>
                                            <span className={`badge ${obtenerClaseEstado(estado)}`}>
                                                {estado}
                                            </span>
                                        </td>

                                        <td>{obtenerValor(incidencia, ['Observaciones', 'observaciones', 'Descripcion', 'descripcion'])}</td>

                                        <td>{obtenerValor(incidencia, ['Comentario', 'comentario', 'Titulo', 'titulo'])}</td>

                                        <td className="acciones-tabla">
                                            <button
                                                className="btn btn-primary bi-pencil-fill"
                                                title="Editar incidencia"
                                            />
                                            <button
                                                className="btn btn-danger bi-trash-fill"
                                                title="Eliminar incidencia"
                                            />
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
                <b>No hay incidencias.</b>
            )}
        </>
    );
}
