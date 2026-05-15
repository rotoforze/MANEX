import { useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { enviarContrato } from "../../utils/RegisterNewContrato.js";
import { useMensaje } from "../../hooks/useMensaje.js";

/**
 * Formulario para crear un nuevo contrato.
 * Envía POST a VITE_BACKEND_CONTRATOS con { salarioAnual, horasAnuales }.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.1.0
 * @param {Function} funcionDeCierreDeFormulario - Cierra el formulario
 * @param {Function} handleNuevoContrato         - Callback tras creación exitosa
 * @returns {React.JSX.Element}
 * @constructor
 */
export function NuevoContratoForm({ funcionDeCierreDeFormulario, handleNuevoContrato }) {
    const { user } = useUsers();

    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useMensaje();

    const [form, setForm] = useState({
        salarioAnual: '',
        horasAnuales: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensaje(null);

        const [ok, texto] = await enviarContrato(user?.token, form.salarioAnual, form.horasAnuales);
        if (ok) {
            setMensaje({ tipo: 'success', texto });
            setTimeout(() => handleNuevoContrato?.(), 1000);
        } else {
            setMensaje({ tipo: 'danger', texto });
        }
        setEnviando(false);
    };

    return (
        <div className="superponer">
            <div className="card confirmacion" style={{ width: 'min(95dvw, 480px)' }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">Nuevo contrato</span>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={funcionDeCierreDeFormulario}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body p-2">
                    {mensaje && (
                        <div className={`alert alert-${mensaje.tipo} py-1 px-2 small mb-2`} role="alert">
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

                        <div className="d-flex justify-content-end gap-2">
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
                                {enviando ? 'Guardando...' : 'Crear contrato'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
