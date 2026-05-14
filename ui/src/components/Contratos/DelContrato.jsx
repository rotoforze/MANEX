import { useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";

/**
 * Diálogo de confirmación para eliminar un contrato.
 * Requiere escribir 'CONFIRMAR' antes de permitir el borrado.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @param {Object}   contrato                   - Contrato a eliminar (debe tener .ID)
 * @param {Function} funcionDeCierreDeFormulario - Cierra el diálogo sin eliminar
 * @param {Function} handleContratoEliminado     - Callback tras eliminación exitosa
 * @returns {React.JSX.Element}
 * @constructor
 */
export function DelContrato({ contrato, funcionDeCierreDeFormulario, handleContratoEliminado }) {
    const { user } = useUsers();
    const [confirmar, setConfirmar] = useState(false);
    const [estado, setEstado] = useState(null);

    function handleEliminar() {
        setEstado('Confirmando cambios...');

        const urlencoded = new URLSearchParams();
        urlencoded.append('id', contrato?.ID);

        apiFetch(import.meta.env.VITE_BACKEND_CONTRATOS, {
            method: 'DELETE',
            headers: { token: user?.token },
            body: urlencoded,
        })
            .then(res => res.json())
            .then((data) => {
                if (data?.status === 200) {
                    let seconds = 4;
                    const idSeg = setInterval(() => {
                        seconds--;
                        setEstado(`Contrato eliminado. Se refrescará en ${seconds}s.`);
                        if (seconds <= 0) clearInterval(idSeg);
                    }, 1000);
                    setEstado(`Contrato eliminado. Se refrescará en ${seconds}s.`);
                    setTimeout(() => {
                        handleContratoEliminado?.();
                    }, 5000);
                } else {
                    setEstado(data?.message ?? 'Error al eliminar el contrato.');
                }
            })
            .catch(() => {
                setEstado('Error de conexión con el servidor.');
            });
    }

    return (
        <div className="superponer">
            <div className="card confirmacion">
                <div className="card-header d-flex justify-content-end">
                    <button
                        className="bi-x bi btn btn-outline-danger"
                        onClick={funcionDeCierreDeFormulario}
                    />
                </div>

                <div className="card-body">
                    <h1 className="card-title">Eliminar contrato</h1>
                    <p>
                        ¿Quieres eliminar el contrato <b>#{contrato?.ID}</b> (
                        {contrato?.Salario_anual?.toLocaleString('es-ES')} € ·{' '}
                        {contrato?.Horas_anuales} h)?
                    </p>
                    <p className="text-muted small">
                        Si hay empleados asignados a este contrato, no podrá eliminarse.
                    </p>

                    <div>
                        <label className="form-label">
                            Escribe '<b>CONFIRMAR</b>' para continuar.
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Escribe 'CONFIRMAR' para poder confirmar."
                            onChange={(e) =>
                                setConfirmar(e.target.value.toUpperCase() === 'CONFIRMAR')
                            }
                        />

                        <div className="gap-3 d-flex justify-content-center mt-3 p-2">
                            <button
                                className="btn btn-primary"
                                onClick={handleEliminar}
                                disabled={!confirmar || !!estado}
                            >
                                Confirmar
                            </button>
                            <button className="btn btn-danger" onClick={funcionDeCierreDeFormulario}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>

                {estado && (
                    <div className="alert-danger alert">
                        <b>{estado}</b>
                    </div>
                )}
            </div>
        </div>
    );
}