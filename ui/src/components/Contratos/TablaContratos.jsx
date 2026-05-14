import { useEffect, useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { EditarContratoForm } from "./EditarContratoForm.jsx";
import { DelContrato } from "./DelContrato.jsx";

/**
 * Muestra en formato tabla los contratos existentes con paginación.
 * Permite editar y eliminar cada contrato.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaContratos() {
    const [listaContratos, setListaContratos] = useState([]);
    const [paginaActual, setPaginaActual] = useState(0);
    const [paginaMaxima, setPaginaMaxima] = useState(0);
    const [resultadosPorPagina, setResultadosPorPagina] = useState(0);
    const [cantidadPorPagina] = useState(10);

    const [contratoEditando, setContratoEditando] = useState(null);
    const [contratoEliminando, setContratoEliminando] = useState(null);

    const { user, tengoPermiso } = useUsers();

    const cargarContratos = () => {
        try {
            apiFetch(
                `${import.meta.env.VITE_BACKEND_CONTRATOS}?pagina=${paginaActual}&cantidad=${cantidadPorPagina}`,
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
                        setListaContratos(data?.data);
                        setPaginaMaxima(Math.ceil(data?.resultados / cantidadPorPagina) - 1);
                        setResultadosPorPagina(data?.resultados);
                    }
                });
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        cargarContratos();
    }, [paginaActual]);

    const handleContratoActualizado = () => {
        setContratoEditando(null);
        cargarContratos();
    };

    const handleContratoEliminado = () => {
        setContratoEliminando(null);
        cargarContratos();
    };

    return (
        <>
            {contratoEditando && (
                <EditarContratoForm
                    contrato={contratoEditando}
                    funcionDeCierreDeFormulario={() => setContratoEditando(null)}
                    handleContratoActualizado={handleContratoActualizado}
                />
            )}

            {contratoEliminando && (
                <DelContrato
                    contrato={contratoEliminando}
                    funcionDeCierreDeFormulario={() => setContratoEliminando(null)}
                    handleContratoEliminado={handleContratoEliminado}
                />
            )}

            {listaContratos?.length > 0 ? (
                <div className="table-responsive m-3 d-flex flex-column justify-content-start">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Salario anual (€)</th>
                                <th scope="col">Horas anuales</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {listaContratos.map((contrato) => (
                                <tr key={contrato?.ID} className="h-auto">
                                    <th scope="row">{contrato?.ID}</th>
                                    <td>{contrato?.Salario_anual?.toLocaleString('es-ES')} €</td>
                                    <td>{contrato?.Horas_anuales} h</td>
                                    <td className="h-auto acciones-tabla">
                                        <button
                                            className="btn btn-primary bi-pencil-fill"
                                            title="Editar contrato"
                                            onClick={() => setContratoEditando(contrato)}
                                            disabled={!tengoPermiso('/contratos', 'POST')}
                                        />
                                        <button
                                            className="btn btn-danger bi-trash-fill"
                                            title="Eliminar contrato"
                                            onClick={() => setContratoEliminando(contrato)}
                                            disabled={!tengoPermiso('/contratos', 'DELETE')}
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
                <b>No hay contratos.</b>
            )}
        </>
    );
}