import {apiFetch} from "../../utils/apiFetch.jsx";
import React, {useState} from "react";

function apiSave(ruta, metodo, perms, token) {
    const urlencoded = new URLSearchParams();
    urlencoded.append("ruta", ruta);
    urlencoded.append("metodo", metodo);
    perms.forEach(p => urlencoded.append("permisos[]", p));
    return apiFetch(import.meta.env.VITE_BACKEND_PERMISOS, {
        method: 'POST',
        headers: {'token': token},
        body: urlencoded,
    }).then(res => res.json());
}

function NewPermiso({
                        setFormularioNuevoVisible,
                        formularioNuevoVisible,
                        confirmar,
                        setConfirmar,
                        estado,
                        setEstado,
                        user,
                        fetchInicio,
                        listaDepartamentos
                    }) {

    const [guardar, setGuardar] = useState(false);
    const [nuevoPermiso, setNuevoPermiso] = useState(undefined);
    const [seHaEstablecidoNombre, setSeHaEstablecidoNombre] = useState(false);

    const handleNewNombre = (nombre) => {
        if (nombre) {
            setNuevoPermiso(nombre);
            setSeHaEstablecidoNombre(true);
            return;
        }
        setNuevoPermiso(undefined);
        setSeHaEstablecidoNombre(false);
    };

    const [departamentosGet, setDepartamentosGet] = useState([]);
    const [quiereAlMenosGet, setQuiereAlMenosGet] = useState(false);

    const [departamentosPost, setDepartamentosPost] = useState([]);
    const [quiereAlMenosPost, setQuiereAlMenosPost] = useState(false);

    const [departamentosDelete, setDepartamentosDelete] = useState([]);
    const [quiereAlMenosDelete, setQuiereAlMenosDelete] = useState(false);

    const handleConfirmar = (val) => {
        setGuardar(val);
    };

    const handleDepartamentoParaMetodo = (setter, getter, permisoToAdd, quiereAlMenos) => {
        if (!setter || !getter || !permisoToAdd) return;
        let copia = structuredClone(getter);
        if (copia.includes(permisoToAdd)) {
            copia = copia.filter(i => i !== permisoToAdd);
        } else if (quiereAlMenos) {
            copia = ['>' + permisoToAdd];
        } else {
            copia.push(permisoToAdd);
        }
        setter(copia);
    };

    const handleGuardar = async () => {
        setEstado('Confirmando cambios...');
        try {
            await Promise.all([
                apiSave(nuevoPermiso, 'GET', departamentosGet, user?.token),
                apiSave(nuevoPermiso, 'POST', departamentosPost, user?.token),
                apiSave(nuevoPermiso, 'DELETE', departamentosDelete, user?.token),
            ]);

            let seconds = 4;
            const idSeg = setInterval(() => {
                setEstado(`Cambios confirmados. Se refrescará en ${seconds--}s.`);
                if (seconds === -1) clearInterval(idSeg);
            }, 1000);
            setEstado(`Cambios confirmados. Se refrescará en ${seconds--}s.`);

            const id = setTimeout(() => {
                setEstado(undefined);
                setFormularioNuevoVisible(false);
                setConfirmar(false);
                fetchInicio();
                clearTimeout(id);
            }, 5000);
        } catch (e) {
            setEstado('Error al guardar: ' + e.message);
        }
    };

    const renderDepartamentos = (lista, departamentos, setDepartamentos, quiereAlMenos, prefijo) => {
        return Array.from(lista).map(([id, nombre]) => {
            const nameEtiqueta = quiereAlMenos
                ? `radio${prefijo}${id}${nombre.replaceAll(' ', '')}`
                : `checkbox${prefijo}${id}${nombre.replaceAll(' ', '')}`;
            const defaultCheck = departamentos.some(d => String(d).startsWith('>'))
                || departamentos.includes(String(id));
            const checkProps = quiereAlMenos
                ? {checked: defaultCheck}
                : {defaultChecked: defaultCheck};
            return (
                <div className={"form-check form-switch w-100 text-start"} key={id}>
                    <input name={quiereAlMenos ? "radio" + prefijo : nameEtiqueta}
                           id={nameEtiqueta}
                           className={"mx-1"}
                           type={quiereAlMenos ? 'radio' : 'checkbox'}
                           onChange={() => handleDepartamentoParaMetodo(setDepartamentos, departamentos, String(id), quiereAlMenos)}
                           {...checkProps}
                           disabled={guardar}/>
                    <label htmlFor={quiereAlMenos ? "radio" + prefijo : nameEtiqueta} id={nameEtiqueta}> {nombre} </label>
                </div>
            );
        });
    };

    const renderSwitch = (quiereAlMenos, setQuiereAlMenos, prefijo) => (
        <div className={"d-flex flex-row"}>
            <label className="form-check-label" htmlFor={`switch${prefijo}`}>Al menos&nbsp;</label>
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch"
                       id={`switch${prefijo}`}
                       defaultChecked={!quiereAlMenos}
                       onChange={() => setQuiereAlMenos(!quiereAlMenos)}
                       disabled={guardar}/>
                <label className="form-check-label" htmlFor={`switch${prefijo}`}>Multiple</label>
            </div>
        </div>
    );

    return (
        <div className="superponer">
            <div className={"card w-75 confirmacion"}>
                <div className="card-header d-flex justify-content-end">
                    <button className={"bi-x bi btn btn-outline-danger"} onClick={() => setFormularioNuevoVisible(false)}></button>
                </div>
                <div className={"card-body"}>
                    <h1 className={"card-title"}>Creando nuevo permiso</h1>
                    <label className={(seHaEstablecidoNombre ? "" : "bi-exclamation-triangle text-danger")} htmlFor={"nuevaRuta"}>
                        &nbsp;Nombre del nuevo permiso
                    </label>
                    <input name={"nuevaRuta"} id={"nuevaRuta"} type={"text"} placeholder={"Nueva ruta"}
                           className={"form-control mb-3"} onChange={(e) => handleNewNombre(e?.target?.value)}/>

                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th className={"col"}>Permiso</th>
                            <th className={"col"}>GET</th>
                            <th className={"col"}>POST</th>
                            <th className={"col"}>DELETE</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th scope="row">Departamentos</th>
                            <td>{renderDepartamentos(listaDepartamentos, departamentosGet, setDepartamentosGet, quiereAlMenosGet, 'GET')}</td>
                            <td>{renderDepartamentos(listaDepartamentos, departamentosPost, setDepartamentosPost, quiereAlMenosPost, 'POST')}</td>
                            <td>{renderDepartamentos(listaDepartamentos, departamentosDelete, setDepartamentosDelete, quiereAlMenosDelete, 'DELETE')}</td>
                        </tr>
                        <tr>
                            <th scope="row">Acciones</th>
                            <td>{renderSwitch(quiereAlMenosGet, setQuiereAlMenosGet, 'GET')}</td>
                            <td>{renderSwitch(quiereAlMenosPost, setQuiereAlMenosPost, 'POST')}</td>
                            <td>{renderSwitch(quiereAlMenosDelete, setQuiereAlMenosDelete, 'DELETE')}</td>
                        </tr>
                        </tbody>
                    </table>

                    <button className={"btn " + (!nuevoPermiso ? 'btn-light' : guardar ? 'btn-success' : 'btn-outline-success')}
                            onClick={() => handleConfirmar(!guardar)}
                            disabled={!nuevoPermiso}>
                        {!nuevoPermiso ? 'Primero indica el nuevo nombre' : guardar ? 'Seguir editando' : 'Guardar'}
                    </button>

                    {guardar && (<>
                        <p className="mt-3">¿Quieres crear el permiso <b>{nuevoPermiso}</b>?</p>
                        {estado && <p className={"text-danger"}>{estado}</p>}
                        <div>
                            <label className={"form-label"}>Escribe '<b>CONFIRMAR</b>' para poder confirmar.</label>
                            <input type="text" className={"form-control"}
                                   placeholder={"Escribe 'CONFIRMAR' para poder confirmar."}
                                   onChange={(e) => setConfirmar(e.target.value.toUpperCase() === 'CONFIRMAR')}/>
                            <div className={"gap-3 d-flex justify-content-center mt-3 p-2"}>
                                <button className={"btn btn-primary"}
                                        onClick={handleGuardar}
                                        disabled={!confirmar || estado}>
                                    Confirmar
                                </button>
                                <button className={"btn btn-danger"} onClick={() => {
                                    setEstado(undefined);
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
        </div>
    );
}

export default NewPermiso;