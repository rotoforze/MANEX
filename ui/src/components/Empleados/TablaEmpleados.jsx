import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { EditarEmpleadoForm } from "./EditarEmpleadoForm.jsx";
import { DelEmpleado } from "./DelEmpleado.jsx";
import "../../../public/styles/tablaPermisos.css";

/**
 * Muestra en formato tabla los empleados recibidos.
 * Permite editar cada empleado abriendo un formulario superpuesto.
 *
 *
 * @author Alex Bernardos Gil
 * @version 1.1.0
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.3.0
 * @constructor
 */
export function TablaEmpleados() {
    const [listaEmpleados, setListaEmpleados] = useState([]);
    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [resultadosPorPagina, setResultadosPorPagina] = useState(0);
    const [cantidadPorPagina] = useState(10);

    // Estado del formulario de edición
    const [empleadoEditando, setEmpleadoEditando] = useState(null); // null = cerrado

    const { user } = useUsers();

    const cargarEmpleados = () => {
        try {
            apiFetch(
                `${import.meta.env.VITE_BACKEND_EMPLEADO}?pagina=${paginaActual}&cantidad=${cantidadPorPagina}`,
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
                        setPaginaMaxima(data?.meta?.totalPaginas - 1);
                        setResultadosPorPagina(data?.meta?.resultados);
                    }
                });
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        cargarEmpleados();
    }, [paginaActual]);

    // Llamado por EditarEmpleadoForm tras éxito: cierra el formulario y recarga la tabla
    const handleEmpleadoActualizado = () => {
        setEmpleadoEditando(null);
        cargarEmpleados();
    };

    return (
        <>
            {/* Formulario de edición superpuesto */}
            {empleadoEditando && (
                <EditarEmpleadoForm
                    empleado={empleadoEditando}
                    funcionDeCierreDeFormulario={() => setEmpleadoEditando(null)}
                    handleEmpleadoActualizado={handleEmpleadoActualizado}
                />
            )}

            {listaEmpleados?.length > 0 ? (
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
                                            ? new Date(empleado.fecha_nacimiento).toLocaleDateString('es-ES', { timeZone: 'UTC' })
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        {empleado?.fecha_alta
                                            ? new Date(empleado.fecha_alta).toLocaleDateString('es-ES', { timeZone: 'UTC' })
                                            : 'N/A'}
                                    </td>
                                    <td>{empleado?.ID_DEPARTAMENTO}</td>
                                    <td>{empleado?.ID_CONTRATO}</td>
                                    <td className="h-auto acciones-tabla">
                                        <button
                                            className="btn btn-primary bi-pencil-fill"
                                            title="Editar empleado"
                                            onClick={() => setEmpleadoEditando(empleado)}
                                        />
                                        <button
                                            className="btn btn-danger bi-trash-fill"
                                            title="Eliminar empleado"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Paginación */}
                    <div className="gap-3 d-flex justify-content-center mb-3">
                        <button
                            className="btn btn-primary bi-chevron-left"
                            disabled={paginaActual === 0}
                            onClick={() => {
                                if (paginaActual > 0) setPaginaActual(paginaActual - 1);
                            }}
                        />
                        <b>
                            Mostrando {resultadosPorPagina}/{cantidadPorPagina} en la página {paginaActual}
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
                <b>No hay empleados.</b>
            )}
        </>
    );
}
