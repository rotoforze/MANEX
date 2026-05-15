import { useState } from "react";
import { useMensaje } from "../../hooks/useMensaje.js";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";

/**
 * Formulario de edición de un contrato existente.
 * Envía POST a VITE_BACKEND_CONTRATOS con { salarioAnual, horasAnuales, idAModificar }.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @param {Object}   contrato                   - Fila del contrato tal como llega del listado
 * @param {Function} funcionDeCierreDeFormulario - Cierra el formulario sin guardar
 * @param {Function} handleContratoActualizado   - Callback tras actualización exitosa
 * @returns {React.JSX.Element}
 * @constructor
 */
export function EditarContratoForm({ contrato, funcionDeCierreDeFormulario, handleContratoActualizado }) {
    const { user } = useUsers();

    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useMensaje();

    const [form, setForm] = useState({
        idAModificar: contrato?.ID ?? '',
        salarioAnual: contrato?.Salario_anual ?? '',
        horasAnuales: contrato?.Horas_anuales ?? '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensaje(null);

        try {
            const response = await apiFetch(
                import.meta.env.VITE_BACKEND_CONTRATOS,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'token': user?.token,
                    },
                    body: new URLSearchParams(form).toString(),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMensaje({ tipo: 'success', texto: 'Contrato actualizado correctamente.' });
                setTimeout(() => {
                    handleContratoActualizado?.();
                }, 1000);
            } else {
                setMensaje({ tipo: 'danger', texto: data?.message ?? 'Error al actualizar el contrato.' });
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
                    <span className="small text-muted">ID: {contrato?.ID}</span>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={funcionDeCierreDeFormulario}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-2">
                    <h2 className="text-center mb-2">Editar contrato</h2>

                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} py-1 px-2 small mb-2`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-2">
                            <label htmlFor="salarioAnual" className="form-label small mb-1">
                                Salario anual (€) <span className="text-danger">*</span>
                            </label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                id="salarioAnual"
                                name="salarioAnual"
                                value={form.salarioAnual}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="horasAnuales" className="form-label small mb-1">
                                Horas anuales <span className="text-danger">*</span>
                            </label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                id="horasAnuales"
                                name="horasAnuales"
                                value={form.horasAnuales}
                                onChange={handleChange}
                                min="0"
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