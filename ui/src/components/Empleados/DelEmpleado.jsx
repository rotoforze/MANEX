import { useState } from "react";
import { apiFetch } from "../../utils/apiFetch.jsx";

/**
 * Permite eliminar un empleado.
 *
 * @author Alex Bernardos Gil
 * @version 1.1.0
 * @param param0.usuarioAEditar   - objeto empleado a eliminar (debe tener .username)
 * @param param0.setUsuarioAEditar
 * @param param0.eliminando
 * @param param0.setEliminando
 * @param param0.user             - usuario autenticado (para el token)
 * @param param0.fetchInicio      - callback para recargar la tabla tras eliminar
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
        setEstado("Confirmando cambios...");

        const urlencoded = new URLSearchParams();
        urlencoded.append("usuario", usuarioAEditar?.USERNAME);;

       
        apiFetch(import.meta.env.VITE_BACKEND_EMPLEADO, {
            method: "DELETE",
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

                const id = setTimeout(() => {
                    cerrar();
                    fetchInicio();
                    clearTimeout(id);
                }, 5000);
            })
            .catch(() => {
                setEstado("Error al eliminar el empleado.");
            });
    }

    if (!eliminando) return null;

    return (
        <div className="superponer">
            <div className="card confirmacion">
                <div className="card-header d-flex justify-content-end">
                    <button
                        className="bi-x bi btn btn-outline-danger"
                        onClick={cerrar}
                    />
                </div>

                <div className="card-body">
                    <h1 className="card-title">
                        Eliminar empleado
                    </h1>
                    <p>
                        ¿Quieres eliminar al empleado{" "}
                        <b>{usuarioAEditar?.Nombre} {usuarioAEditar?.Apellidos}</b>?
                    </p>

                    <div>
                        <label className="form-label">
                            Escribe '<b>CONFIRMAR</b>' para poder confirmar.
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Escribe 'CONFIRMAR' para poder confirmar."
                            onChange={(e) =>
                                setConfirmar(e.target.value.toUpperCase() === "CONFIRMAR")
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
                            <button className="btn btn-danger" onClick={cerrar}>
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