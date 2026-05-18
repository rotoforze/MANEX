import { useState } from "react";
import { apiFetch } from "../../utils/apiFetch.jsx";

/**
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 */
export function DelIncidencia({ incidenciaAEliminar, setIncidenciaAEliminar, eliminando, setEliminando, user, fetchInicio }) {
    const [confirmar, setConfirmar] = useState(false);
    const [estado, setEstado] = useState(undefined);

    function cerrar() {
        setIncidenciaAEliminar(undefined);
        setEliminando(false);
        setConfirmar(false);
        setEstado(undefined);
    }

    function handleEliminar() {
        setEstado("Confirmando cambios...");

        const urlencoded = new URLSearchParams();
        urlencoded.append("id", incidenciaAEliminar?.ID);

        apiFetch(
            import.meta.env.VITE_BACKEND_INCIDENCIAS || `${import.meta.env.VITE_BACKEND}/incidencias`,
            {
                method: "DELETE",
                headers: {
                    token: user?.token,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: urlencoded,
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data?.status === 200) {
                    let seconds = 4;
                    const idSeg = setInterval(() => {
                        seconds--;
                        setEstado(`Incidencia eliminada. Se refrescará en ${seconds}s.`);
                        if (seconds <= 0) clearInterval(idSeg);
                    }, 1000);
                    setEstado(`Incidencia eliminada. Se refrescará en ${seconds}s.`);
                    setTimeout(() => {
                        cerrar();
                        fetchInicio();
                    }, 5000);
                } else {
                    setEstado(data?.message || "Error al eliminar la incidencia.");
                }
            })
            .catch(() => setEstado("Error al eliminar la incidencia."));
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
                    <h2 className="card-title">Eliminar incidencia</h2>
                    <p>
                        ¿Quieres eliminar la incidencia <b>#{incidenciaAEliminar?.ID}</b>
                        {incidenciaAEliminar?.Observaciones ? (
                            <> — <i>{incidenciaAEliminar.Observaciones}</i></>
                        ) : null}?
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
                                setConfirmar(e.target.value.toUpperCase() === "CONFIRMAR")
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
                            <button className="btn btn-danger btn-sm" onClick={cerrar}>
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
