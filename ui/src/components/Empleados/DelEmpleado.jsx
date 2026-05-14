import { useState } from "react";
import { apiFetch } from "../../utils/apiFetch.jsx";

/**
 * Diálogo de confirmación para eliminar un empleado.
 * Requiere escribir 'CONFIRMAR' antes de permitir el borrado.
 *
 * @author Alex Bernardos Gil
 * @contributor Eneas de la Rosa Menéndez Pedrosa
 * @version 1.2.0
 * @param {Object}   usuarioAEditar   - Empleado a eliminar (debe tener .USERNAME)
 * @param {Function} setUsuarioAEditar
 * @param {boolean}  eliminando
 * @param {Function} setEliminando
 * @param {Object}   user             - Usuario autenticado (para el token)
 * @param {Function} fetchInicio      - Callback para recargar la tabla tras eliminar
 * @returns {React.JSX.Element}
 * @constructor
 */
export function DelEmpleado({
    usuarioAEditar,
    setUsuarioAEditar,
    eliminando,
    setEliminando,
    user,
    fetchInicio,
}) {
    const [confirmar, setConfirmar] = useState(false);
    const [estado, setEstado] = useState(undefined);

    function cerrar() {
        setUsuarioAEditar(undefined);
        setEliminando(false);
        setConfirmar(false);
        setEstado(undefined);
    }

    function handleEliminar() {
        setEstado('Confirmando cambios...');

        const urlencoded = new URLSearchParams();
        urlencoded.append('usuario', usuarioAEditar?.USERNAME);

        apiFetch(import.meta.env.VITE_BACKEND_EMPLEADO, {
            method: 'DELETE',
            headers: { token: user?.token },
            body: urlencoded,
        })
            .then((res) => res.json())
            .then(() => {
                let seconds = 4;
                const idSeg = setInterval(() => {
                    seconds--;
                    setEstado(`Cambios confirmados. Se refrescará en ${seconds}s.`);
                    if (seconds <= 0) clearInterval(idSeg);
                }, 1000);
                setEstado(`Cambios confirmados. Se refrescará en ${seconds}s.`);
                setTimeout(() => {
                    cerrar();
                    fetchInicio();
                }, 5000);
            })
            .catch(() => {
                setEstado('Error al eliminar el empleado.');
            });
    }

    if (!eliminando) return null;

    return (
        <div className="superponer">
            <div className="card confirmacion">
                <div className="card-header d-flex justify-content-end">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm bi bi-x"
                        onClick={cerrar}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="card-body">
                    <h2 className="card-title">Eliminar empleado</h2>
                    <p>
                        ¿Quieres eliminar al empleado{' '}
                        <b>{usuarioAEditar?.Nombre} {usuarioAEditar?.Apellidos}</b>?
                    </p>

                    <div>
                        <label className="form-label">
                            Escribe '<b>CONFIRMAR</b>' para continuar.
                        </label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Escribe 'CONFIRMAR' para poder confirmar."
                            onChange={(e) =>
                                setConfirmar(e.target.value.toUpperCase() === 'CONFIRMAR')
                            }
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
                                onClick={cerrar}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>

                {estado && (
                    <div className="alert alert-danger" role="alert">
                        <b>{estado}</b>
                    </div>
                )}
            </div>
        </div>
    );
}
