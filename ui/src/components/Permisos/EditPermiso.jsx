import React, {useEffect, useState} from "react";
import {apiFetch} from "../../utils/apiFetch.jsx";
import {UNSAFE_DataRouterContext} from "react-router-dom";

function EditPermiso({
                         setEditando,
                         setRutaAEditar,
                         editando,
                         rutaAEditar,
                         confirmar,
                         setConfirmar,
                         estado,
                         setEstado,
                         user,
                         fetchInicio,
                         nuevosPermisos,
                         listaDepartamentos,
                         oldPermisos
                     }) {

    const [guardar, setGuardar] = useState(false)
    const [permisoAEditar, setPermisoAEditar] = useState(Object.keys(oldPermisos).includes(rutaAEditar) ? oldPermisos[rutaAEditar] : undefined);
    const [departamentosRaw, setDepartamentosRaw] = useState({});
    const [departamentos, setDepartamentos] = useState({});
    useEffect(() => {
        listaDepartamentos.forEach((value, key) => {
            setDepartamentosRaw(Object.fromEntries(listaDepartamentos))
        })
    }, []);
    console.log(departamentosRaw);
    return (<div className="superponer">
        <div className={"card w-75 confirmacion"}>
            <div className="card-header d-flex justify-content-end">
                <button className={"bi-x bi btn btn-outline-danger"} onClick={() => {
                    setEditando(false);
                }}></button>
            </div>
            <div className={"card-body"}>
                <h1 className={"card-title"}>{editando ? 'Editando ' : ''}{rutaAEditar || ''}</h1>

                {/* visualización de datos */}
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th className={"col"}>Permiso</th>
                        {<th className={"col"}>
                            {oldPermisos[rutaAEditar]['GET'] &&
                                <i className={"bi bi-check2-square text-success"}> </i>}

                            {(nuevosPermisos !== undefined && nuevosPermisos[rutaAEditar] !== undefined && nuevosPermisos[rutaAEditar]['GET'] !== undefined) &&
                                <i className={"bi bi-check2-square text-info"}> </i>}

                            GET</th>}
                        {<th className={"col"}>
                            {oldPermisos[rutaAEditar]['POST'] &&
                                <i className={"bi bi-check2-square text-success"}> </i>}

                            {(nuevosPermisos !== undefined && nuevosPermisos[rutaAEditar] !== undefined && nuevosPermisos[rutaAEditar]['POST'] !== undefined) &&
                                <i className={"bi bi-check2-square text-info"}> </i>}

                            POST</th>}
                        {<th className={"col"}>
                            {oldPermisos[rutaAEditar]['DELETE'] &&
                                <i className={"bi bi-check2-square text-success"}> </i>}

                            {(nuevosPermisos !== undefined && nuevosPermisos[rutaAEditar] !== undefined && nuevosPermisos[rutaAEditar]['DELETE'] !== undefined) &&
                                <i className={"bi bi-check2-square text-info"}> </i>}

                            DELETE</th>}
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <th scope="row">Departamentos</th>
                        <td className={"d-flex flex-column"} colSpan={3}>
                            {Array.from(listaDepartamentos).map(([id, nombre]) => (
                                <div className={"form-check form-switch w-100 text-start"} key={id}>
                                    <input name={"checkboxGET" + {id} + {nombre}} id={"checkboxGET" + {id} + {nombre}}
                                           className={"mx-1"} type={"checkbox"} key={id}/>
                                    <label htmlFor={"checkboxGET" + {id} + {nombre}}
                                           id={"checkboxGET" + {id} + {nombre}}> {nombre} </label>
                                </div>
                            ))}
                        </td>
                    </tr>
                    </tbody>
                </table>
                {/* confirmación */}
                <button className={"btn " + (guardar ? 'btn-success' : 'btn-outline-success')}
                        onClick={() => setGuardar(!guardar)}>{guardar ? 'Seguir editando' : 'Guardar'}</button>
                {guardar && (<>
                    <p>¿Quieres {editando ? 'guardar ' : ''} los permisos
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
                                            setEditando(false);
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
                                setEditando(false);
                                setConfirmar(false);
                            }}>Cancelar
                            </button>
                        </div>
                    </div>
                </>)}
            </div>
            {estado && <div className={"alert-success alert"}><b>{estado}</b></div>}
        </div>
    </div>)
}

export default EditPermiso
