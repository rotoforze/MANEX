import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { DelEmpleado } from "./DelEmpleado.jsx";
import "../../../public/styles/tablaPermisos.css";

/**
 * Muestra en formato tabla los empleados recibidos.
 *
 * @author Alex Bernardos Gil
 * @version 1.1.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaEmpleados() {
    const [listaEmpleados, setListaEmpleados] = useState([]);
    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [resultadosPorPagina, setResultadosPorPagina] = useState(0);
    const [cantidadPorPagina] = useState(10);

    const [eliminando, setEliminando] = useState(false);
    const [usuarioAEditar, setUsuarioAEditar] = useState(undefined);

    const { user } = useUsers();

    function fetchInicio() {
        try {
            apiFetch(
                import.meta.env.VITE_BACKEND_EMPLEADO +
                    "?pagina=" + paginaActual +
                    "&cantidad=" + cantidadPorPagina,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        token: user?.token,
                    },
                }
            )
                .then((response) => response.json())
                .then((data) => {
                    if (data) {
                        setListaEmpleados(data?.data);
                        setPaginaMaxima(data?.meta?.totalPaginas - 1);
                        setResultadosPorPagina(data?.meta?.resultados);
                    }
                });
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        fetchInicio();
    }, [paginaActual]);

    return (
        <>
            {eliminando && (
                <DelEmpleado
                    usuarioAEditar={usuarioAEditar}
                    setUsuarioAEditar={setUsuarioAEditar}
                    eliminando={eliminando}
                    setEliminando={setEliminando}
                    user={user}
                    fetchInicio={fetchInicio}
                />
            )}

            {listaEmpleados.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">Apellido</th>
                                <th scope="col">Email</th>
                                <th scope="col">Teléfono</th>
                                <th scope="col">Fecha de nacimiento</th>
                                <th scope="col">Fecha de alta</th>
                                <th scope="col">Departamento</th>
                                <th scope="col">Contrato</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {listaEmpleados.map((empleado) => (
                                <tr key={empleado?.ID} className="h-auto">
                                    <th scope="row">{empleado?.ID}</th>
                                    <td>{empleado?.Nombre}</td>
                                    <td>{empleado?.Apellidos}</td>
                                    <td>{empleado?.email}</td>
                                    <td>{empleado?.telefono}</td>
                                    <td>
                                        {empleado?.fecha_nacimiento
                                            ? new Date(empleado.fecha_nacimiento).toLocaleDateString(
                                                  "es-ES",
                                                  { timeZone: "UTC" }
                                              )
                                            : "N/A"}
                                    </td>
                                    <td>
                                        {empleado?.fecha_alta
                                            ? new Date(empleado.fecha_alta).toLocaleDateString(
                                                  "es-ES",
                                                  { timeZone: "UTC" }
                                              )
                                            : "N/A"}
                                    </td>
                                    <td>{empleado?.ID_DEPARTAMENTO}</td>
                                    <td>{empleado?.ID_CONTRATO}</td>
                                    <td className="h-auto acciones-tabla">
                                        <button className="btn btn-primary bi-pencil-fill" />
                                        <button
                                            className="btn btn-danger bi-trash-fill"
                                            onClick={() => {
                                                setUsuarioAEditar(empleado);
                                                setEliminando(true);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
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
                            Mostrando {resultadosPorPagina}/{cantidadPorPagina} en la
                            página {paginaActual}
                        </b>
                        <button
                            className="btn btn-primary bi-chevron-right"
                            disabled={!(paginaActual < paginaMaxima)}
                            onClick={() => {
                                if (paginaActual < paginaMaxima)
                                    setPaginaActual(paginaActual + 1);
                            }}
                        />
                    </div>
                </div>
            ) : (
                <b>No hay empleados.</b>
            )}
        </>
    );
}