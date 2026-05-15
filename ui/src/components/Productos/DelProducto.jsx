import { useState } from "react";
import { apiFetch } from "../../utils/apiFetch.jsx";

/**
 * Diálogo de confirmación para eliminar un producto.
 *
 * @author Covadonga Blanco Álvarez
 * @version 1.0.0
 */
export function DelProducto({ productoAEliminar, setProductoAEliminar, eliminando, setEliminando, user, fetchInicio }) {
    const [confirmar, setConfirmar] = useState(false);
    const [estado, setEstado] = useState(undefined);

    function cerrar() {
        setProductoAEliminar(undefined);
        setEliminando(false);
        setConfirmar(false);
        setEstado(undefined);
    }

    function handleEliminar() {
        setEstado("Confirmando cambios...");

        const urlencoded = new URLSearchParams();
        urlencoded.append("id", productoAEliminar?.ID);

        apiFetch(import.meta.env.VITE_BACKEND_PRODUCTO, {
            method: "DELETE",
            headers: {
                token: user?.token,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: urlencoded,
        })
            .then((res) => res.json())
            .then((data) => {
                if (data?.status === 200) {
                    let seconds = 4;
                    const idSeg = setInterval(() => {
                        seconds--;
                        setEstado(`Producto eliminado. Se refrescará en ${seconds}s.`);
                        if (seconds <= 0) clearInterval(idSeg);
                    }, 1000);
                    setEstado(`Producto eliminado. Se refrescará en ${seconds}s.`);
                    setTimeout(() => {
                        cerrar();
                        fetchInicio();
                    }, 5000);
                } else {
                    setEstado(data?.message || "Error al eliminar el producto.");
                }
            })
            .catch(() => setEstado("Error al eliminar el producto."));
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
                    <h2 className="card-title">Eliminar producto</h2>
                    <p>
                        ¿Quieres eliminar el producto{" "}
                        <b>{productoAEliminar?.Nombre}</b>?
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