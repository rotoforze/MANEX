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

    const [departamentosGet, setDepartamentosGet] = useState([]);
    const [quiereAlMenosGet, setQuiereAlMenosGet] = useState(oldPermisos[rutaAEditar]['GET'][0].includes('>'));

    const [departamentosPost, setDepartamentosPost] = useState([]);
    const [quiereAlMenosPost, setQuiereAlMenosPost] = useState(oldPermisos[rutaAEditar]['POST'][0].includes('>'));

    const [departamentosDelete, setDepartamentosDelete] = useState([]);
    const [quiereAlMenosDelete, setQuiereAlMenosDelete] = useState(oldPermisos[rutaAEditar]['DELETE'][0].includes('>'));

    useEffect(() => {
        listaDepartamentos.forEach((value, key) => {
            setDepartamentosRaw(Object.fromEntries(listaDepartamentos))
        })

        const parsedRutas = Object.entries(oldPermisos[rutaAEditar]);

        for (const parsedRuta of parsedRutas) {
            const metodo = parsedRuta[0];
            if (parsedRuta[1] === false) {
            } else {
                var permisos = parsedRuta[1][0][0] === '>' ? parsedRuta[1][0] : []
                if (permisos.length === 0) {
                    for (const o in parsedRuta[1]) {
                        permisos.push(parseInt(parsedRuta[1][o]));
                    }
                }
            }

            if (metodo === 'GET') setDepartamentosGet(permisos);
            if (metodo === 'POST') setDepartamentosPost(permisos);
            if (metodo === 'DELETE') setDepartamentosDelete(permisos);
        }
    }, []);

    const handleConfirmar = (val) => {
        console.log(oldPermisos[rutaAEditar]['GET'], oldPermisos[rutaAEditar]['POST'], oldPermisos[rutaAEditar]['DELETE']);
        console.log(departamentosGet, departamentosPost, departamentosDelete, rutaAEditar);
        setGuardar(val);
    }

    const handleChangeStateAlMenosUno = () => {

    }

    const handleDepartamentoParaMetodo = (setter, getter, permisoToAdd, quiereAlMenos) => {
        if (!setter || !getter || !permisoToAdd || !quiereAlMenos) return;

        let copia = structuredClone(getter);

        if (quiereAlMenos) {
            copia = ['>' + permisoToAdd];
        } else copia.push(permisoToAdd);

        setter(copia);
        console.log(getter);
    }

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
                            {oldPermisos[rutaAEditar]['GET'] && <i className={"bi bi-check2-square text-success"}> </i>}

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
                        <td>
                            {Array.from(listaDepartamentos).map(([id, nombre]) => {
                                    const nameEtiqueta = quiereAlMenosGet ? `radioGET${id}${nombre}` : `checkboxGET${id}${nombre}`;
                                    const defaultCheck = oldPermisos[rutaAEditar]['GET'][0][0] === '>' || departamentosGet.includes(id);
                                    const checkProps = quiereAlMenosGet
                                        ? {defaultChecked: defaultCheck}
                                        : {checked: defaultCheck};
                                    return (
                                        <div className={"form-check form-switch w-100 text-start"} key={id}>
                                            <input name={quiereAlMenosGet ? 'radioGET' : nameEtiqueta}
                                                   id={nameEtiqueta}
                                                   className={"mx-1"} type={quiereAlMenosGet ? 'radio' : 'checkbox'}
                                                   onChange={() => handleDepartamentoParaMetodo(setDepartamentosGet, departamentosGet, id, quiereAlMenosGet)}
                                                   {...checkProps} disabled={guardar}/>
                                            <label htmlFor={nameEtiqueta}
                                                   id={nameEtiqueta}> {nombre} </label>
                                        </div>)
                                }
                            )
                            }
                        </td>
                        <td>
                            {Array.from(listaDepartamentos).map(([id, nombre]) => {
                                    const nameEtiqueta = quiereAlMenosPost ? `radioPOST${id}${nombre}` : `checkboxPOST${id}${nombre}`;
                                    const defaultCheck = oldPermisos[rutaAEditar]['POST'][0][0] === '>' || departamentosPost.includes(id);
                                    const checkProps = quiereAlMenosPost
                                        ? {defaultChecked: defaultCheck}
                                        : {checked: defaultCheck};
                                    return (
                                        <div className={"form-check form-switch w-100 text-start"} key={id}>
                                            <input name={quiereAlMenosPost ? 'radioPOST' : nameEtiqueta}
                                                   id={nameEtiqueta}
                                                   className={"mx-1"} type={quiereAlMenosPost ? 'radio' : 'checkbox'}
                                                   onChange={() => handleDepartamentoParaMetodo(setDepartamentosPost, departamentosPost, id, quiereAlMenosPost)}
                                                   {...checkProps} disabled={guardar}/>
                                            <label htmlFor={nameEtiqueta}
                                                   id={nameEtiqueta}> {nombre} </label>
                                        </div>)
                                }
                            )
                            }
                        </td>
                        <td>
                            {Array.from(listaDepartamentos).map(([id, nombre]) => {
                                    const nameEtiqueta = quiereAlMenosDelete ? `radioDELETE${id}${nombre}` : `checkboxDELETE${id}${nombre}`;
                                const defaultCheck = oldPermisos[rutaAEditar]['DELETE'][0][0] === '>' || departamentosDelete.includes(id);
                                const checkProps = quiereAlMenosDelete
                                    ? {defaultChecked: defaultCheck}
                                    : {checked: defaultCheck};
                                    return (
                                        <div className={"form-check form-switch w-100 text-start"} key={id}>
                                            <input name={quiereAlMenosDelete ? 'radioDELETE' : nameEtiqueta}
                                                   id={nameEtiqueta}
                                                   className={"mx-1"} type={quiereAlMenosDelete ? 'radio' : 'checkbox'}
                                                   onChange={() => handleDepartamentoParaMetodo(setDepartamentosDelete, departamentosDelete, id, quiereAlMenosDelete)}
                                                   {...checkProps} disabled={guardar}/>
                                            <label htmlFor={nameEtiqueta}
                                                   id={nameEtiqueta}> {nombre} </label>
                                        </div>)
                                }
                            )
                            }
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Acciones</th>
                        <td>
                            {(
                                <div className={"d-flex flex-row"}>
                                    <label className="form-check-label" htmlFor="switchCheckDefault">Al
                                        menos&nbsp;</label>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" role="switch"
                                               id="switchCheckDefault" defaultChecked={!quiereAlMenosGet}
                                               onChange={() => setQuiereAlMenosGet(!quiereAlMenosGet)} disabled={guardar}/>
                                        <label className="form-check-label"
                                               htmlFor="switchCheckDefault">Multiple</label>
                                    </div>
                                </div>)}
                        </td>
                        <td>
                            {(
                                <div className={"d-flex flex-row"}>
                                    <label className="form-check-label" htmlFor="switchCheckDefault">Al
                                        menos&nbsp;</label>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" role="switch"
                                               id="switchCheckDefault" defaultChecked={!quiereAlMenosPost}
                                               onChange={() => setQuiereAlMenosPost(!quiereAlMenosPost)} disabled={guardar}/>
                                        <label className="form-check-label"
                                               htmlFor="switchCheckDefault">Multiple</label>
                                    </div>
                                </div>)}
                        </td>
                        <td>
                            {(
                                <div className={"d-flex flex-row"}>
                                    <label className="form-check-label" htmlFor="switchCheckDefault">Al
                                        menos&nbsp;</label>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" role="switch"
                                               id="switchCheckDefault" defaultChecked={!quiereAlMenosDelete}
                                               onChange={() => setQuiereAlMenosDelete(!quiereAlMenosDelete)} disabled={guardar}/>
                                        <label className="form-check-label"
                                               htmlFor="switchCheckDefault">Multiple</label>
                                    </div>
                                </div>)}
                        </td>
                    </tr>
                    </tbody>
                </table>
                {/* confirmación */}
                <button className={"btn " + (guardar ? 'btn-success' : 'btn-outline-success')}
                        onClick={() => handleConfirmar(!guardar)}>{guardar ? 'Seguir editando' : 'Guardar'}</button>
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
