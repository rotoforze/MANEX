import {apiFetch} from "../../utils/apiFetch.jsx";

/**
 * Permite eliminar un permiso.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @param param0
 * @param param0.setRutaAEditar
 * @param param0.rutaAEditar
 * @param param0.eliminando
 * @param param0.setEliminando
 * @param param0.editando
 * @param param0.setEditando
 * @param param0.confirmar
 * @param param0.setConfirmar
 * @param param0.estado
 * @param param0.setEstado
 * @param param0.user
 * @param param0.fetchInicio
 * @returns {React.JSX.Element}
 * @constructor
 */
export function DelPermiso({
                               setRutaAEditar,
                               rutaAEditar,
                               eliminando,
                               setEliminando,
                               setEditando,
                               confirmar,
                               setConfirmar,
                               estado,
                               setEstado,
                               user,
                               fetchInicio,
                           }) {
    return (
        <div className="superponer">
            <div className={"card confirmacion"}>
                <div className="card-header d-flex justify-content-end">
                    <button className={"bi-x bi btn btn-outline-danger"} onClick={() => {
                        setRutaAEditar(null);
                        setEliminando(false);
                        setEditando(false);
                        setConfirmar(false);
                    }}></button>
                </div>

                <div className={"card-body"}>
                    <h1 className={"card-title"}>{eliminando ? 'Eliminar ' : ''}{rutaAEditar || ''}</h1>
                    <p>¿Quieres {eliminando ? 'eliminar ' : ''} los permisos
                        de {rutaAEditar || ''}?</p>
                    {estado && <p className={"text-danger"}>{estado}</p>}
                    <div>
                        <label className={"form-label"}>Escribe '<b>CONFIRMAR</b>' para poder confirmar.</label>
                        <input type="text" className={"form-control"}
                               placeholder={"Escribe 'CONFIRMAR' para poder confirmar."} onChange={(e) => {
                            setConfirmar(e.target.value.toUpperCase() == 'CONFIRMAR');
                        }}/>
                        <div className={"gap-3 d-flex justify-content-center mt-3 p-2"}>
                            <button className={"btn btn-primary"} onClick={() => {
                                setEstado('Confirmando cambios...');
                                const urlencoded = new URLSearchParams();
                                urlencoded.append("ruta", rutaAEditar);
                                apiFetch(import.meta.env.VITE_BACKEND_PERMISOS, {
                                    method: 'DELETE', headers: {'token': user?.token}, body: urlencoded,
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        // intervalo para que se vayan poniendo los segundos solos
                                        var seconds = 4;
                                        const idSeg = setInterval(() => {
                                            setEstado('Cambios confirmados. Se refrescará en ' + seconds-- + 's.');
                                            if (seconds == -1) clearTimeout(idSeg);

                                        }, 1000);
                                        setEstado('Cambios confirmados. Se refrescará en ' + seconds-- + 's.');
                                        // devolvemos los valores a su estado original
                                        const id = setTimeout(() => {
                                            setEstado(undefined);
                                            setRutaAEditar(null);
                                            setEliminando(false);
                                            setEditando(false);
                                            setConfirmar(false);
                                            fetchInicio();
                                            clearTimeout(id);
                                        }, 5000);
                                    });
                            }} disabled={!confirmar || estado}>Confirmar
                            </button>
                            <button className={"btn btn-danger"} onClick={() => {
                                setEstado(undefined);
                                setRutaAEditar(null);
                                setEliminando(false);
                                setEditando(false);
                                setConfirmar(false);
                            }}>Cancelar
                            </button>
                        </div>
                    </div>
                </div>
                {
                    estado && <div className={"alert-danger alert"}><b>{estado}</b></div>
                }
            </div>
        </div>
    )
}