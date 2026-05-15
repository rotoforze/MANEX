import { useState } from "react";
import { useUsers } from "../../context/UserContext.jsx";
import { apiFetch } from "../../utils/apiFetch.jsx";

/**
 * Diálogo de confirmación para eliminar un departamento.
 * Requiere escribir 'CONFIRMAR' antes de permitir el borrado.
 *
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @param {Object}   departamento               - Departamento a eliminar (debe tener .ID y .Nombre)
 * @param {Function} funcionDeCierreDeFormulario - Cierra el diálogo sin eliminar
 * @param {Function} handleDepartamentoEliminado - Callback tras eliminación exitosa
 * @returns {React.JSX.Element}
 */
export function DelDepartamento({ departamento, funcionDeCierreDeFormulario, handleDepartamentoEliminado }) {
    const { user } = useUsers();
    const [confirmar, setConfirmar] = useState(false);
    const [estado, setEstado] = useState(null);

    function handleEliminar() {
        setEstado('Confirmando cambios...');

        const urlencoded = new URLSearchParams();
        urlencoded.append('id', departamento?.ID);

        apiFetch(import.meta.env.VITE_BACKEND_DEPARTAMENTOS, {
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
                        setEstado(`Departamento eliminado. Se refrescará en ${seconds}s.`);
                        if (seconds <= 0) clearInterval(idSeg);
                    }, 1000);
                    setEstado(`Departamento eliminado. Se refrescará en ${seconds}s.`);
                    setTimeout(() => handleDepartamentoEliminado?.(), 5000);
                } else {
                    setEstado(data?.message ?? 'Error al eliminar el departamento.');
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
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={funcionDeCierreDeFormulario}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body">
                    <h2 className="card-title">Eliminar departamento</h2>
                    <p>
                        ¿Quieres eliminar el departamento <b>#{departamento?.ID}</b> — <b>{departamento?.Nombre}</b>?
                    </p>
                    <p className="text-muted small">
                        Si hay empleados asignados a este departamento, no podrá eliminarse.
                    </p>

                    <div>
                        <label className="form-label">
                            Escribe '<b>CONFIRMAR</b>' para continuar.
                        </label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Escribe 'CONFIRMAR' para poder confirmar."
                            onChange={e => setConfirmar(e.target.value.toUpperCase() === 'CONFIRMAR')}
                        />

                        <div className="gap-3 d-flex justify-content-center mt-3 p-2">
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleEliminar}
                                disabled={!confirmar || !!estado}
                            >
                                Confirmar
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={funcionDeCierreDeFormulario}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>

                {estado && (
                    <div className="alert alert-danger mb-0" role="alert">
                        <b>{estado}</b>
                    </div>
                )}
            </div>
        </div>
    );
}
