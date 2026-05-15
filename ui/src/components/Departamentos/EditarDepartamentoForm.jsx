import { useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";
import { useMensaje } from "../../hooks/useMensaje.js";

/**
 * Formulario de edición de un departamento existente.
 * Envía POST a VITE_BACKEND_DEPARTAMENTOS con { nombre, idAModificar }.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @param {Object}   departamento               - Fila del departamento tal como llega del listado
 * @param {Function} funcionDeCierreDeFormulario - Cierra el formulario sin guardar
 * @param {Function} handleDepartamentoActualizado - Callback tras actualización exitosa
 * @returns {React.JSX.Element}
 */
export function EditarDepartamentoForm({ departamento, funcionDeCierreDeFormulario, handleDepartamentoActualizado }) {
    const { user } = useUsers();
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useMensaje();
    const [nombre, setNombre] = useState(departamento?.Nombre ?? '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensaje(null);

        try {
            const response = await apiFetch(
                import.meta.env.VITE_BACKEND_DEPARTAMENTOS,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'token': user?.token,
                    },
                    body: new URLSearchParams({ nombre, idAModificar: departamento?.ID }).toString(),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMensaje({ tipo: 'success', texto: 'Departamento actualizado correctamente.' });
                setTimeout(() => handleDepartamentoActualizado?.(), 1000);
            } else {
                setMensaje({ tipo: 'danger', texto: data?.message ?? 'Error al actualizar el departamento.' });
            }
        } catch (err) {
            console.error(err);
            setMensaje({ tipo: 'danger', texto: 'Error de conexión con el servidor.' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="superponer">
            <div className="card confirmacion" style={{ width: 'min(95dvw, 480px)' }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span className="small text-muted">ID: {departamento?.ID}</span>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={funcionDeCierreDeFormulario}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Editar departamento</h2>

                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} py-1 px-2 small mb-2`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="nombre" className="form-label small mb-1">
                                Nombre <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                id="nombre"
                                name="nombre"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                maxLength={60}
                                required
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={funcionDeCierreDeFormulario}
                                disabled={enviando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                disabled={enviando}
                            >
                                {enviando ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
