import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import "../../../public/styles/tablaPermisos.css";
import { EditarProductoForm } from "./EditarProductoForm.jsx";

/**
 * Muestra en formato tabla los productos recibidos
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaProductos() {

    const [listaProductos, setListaProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [resultadosPorPagina, setResultadosPorPagina] = useState(0);
    const [cantidadPorPagina, setCantidadPorPagina] = useState(10);

    const { user, tengoPermiso } = useUsers();

    useEffect(() => {
        try {
            fetch(
                import.meta.env.VITE_BACKEND_PRODUCTO +
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
                        setListaProductos(data?.data);
                        setPaginaMaxima(data?.meta?.totalPaginas - 1);
                        setResultadosPorPagina(data?.meta?.resultados);
                    }
                });

        } catch (e) {
            console.error(e);
        }
    }, [paginaActual]);

    return (
        <>
            {mostrarFormulario && (
                <EditarProductoForm
                    producto={productoSeleccionado}
                    funcionDeCierreDeFormulario={() => setMostrarFormulario(false)}
                    handleProductoActualizado={() => {
                        setMostrarFormulario(false);
                        setPaginaActual(0); // Refrescar la tabla
                    }}
                />
            )}

            {listaProductos.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">Descripción</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="table-group-divider">
                            {listaProductos.map((producto) => (
                                <tr key={producto?.ID} className="h-auto">
                                    <th scope="row">{producto?.ID}</th>
                                    <td>{producto?.Nombre}</td>
                                    <td>{producto?.Descripcion}</td>
                                    <td>{producto?.Estado}</td>
                                    <td className={"h-auto acciones-tabla"}>
                                        <button
                                            className="btn btn-primary bi-pencil-fill"
                                            onClick={() => {
                                                setProductoSeleccionado(producto);
                                                setMostrarFormulario(true);
                                            }} disabled={ !tengoPermiso('/productos', 'POST')}
                                        ></button>

                                        <button className="btn btn-danger bi-trash-fill" disabled={ !tengoPermiso('/productos', 'DELETE')}></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="gap-3 d-flex justify-content-center mb-3">
                        <button
                            className="btn btn-primary bi-chevron-left"
                            disabled={paginaActual == 0}
                            onClick={() => {
                                if (paginaActual > 0) setPaginaActual(paginaActual - 1);
                            }} disabled={!tengoPermiso('/productos', 'POST')}
                        ></button>
                        <b>
                            Mostrando {resultadosPorPagina}/{cantidadPorPagina} en la página {paginaActual}
                        </b>
                        <button
                            className="btn btn-primary bi-chevron-right"
                            disabled={!(paginaActual < paginaMaxima)}
                            onClick={() => {
                                if (paginaActual < paginaMaxima) setPaginaActual(paginaActual + 1);
                            }}
                        ></button>
                    </div>
                </div>
            ) : (
                <b>No hay productos.</b>
            )}
        </>
    );
}
