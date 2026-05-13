import React, {useEffect, useState} from "react";
import {apiFetch} from "../../utils/apiFetch.jsx";

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

    const [guardar, setGuardar] = useState(false);
    const [departamentosRaw, setDepartamentosRaw] = useState({});

    const parsePermiso = (val) => {
        if (Array.isArray(val)) return val.map(String);
        if (typeof val === 'string') return [val];
        return [];
    };

    const [departamentosGet, setDepartamentosGet] = useState(() => parsePermiso(oldPermisos[rutaAEditar]['GET']));
    const [quiereAlMenosGet, setQuiereAlMenosGet] = useState(String(oldPermisos[rutaAEditar]['GET']).includes('>'));

    const [departamentosPost, setDepartamentosPost] = useState(() => parsePermiso(oldPermisos[rutaAEditar]['POST']));
    const [quiereAlMenosPost, setQuiereAlMenosPost] = useState(String(oldPermisos[rutaAEditar]['POST']).includes('>'));

    const [departamentosDelete, setDepartamentosDelete] = useState(() => parsePermiso(oldPermisos[rutaAEditar]['DELETE']));
    const [quiereAlMenosDelete, setQuiereAlMenosDelete] = useState(String(oldPermisos[rutaAEditar]['DELETE']).includes('>'));

    useEffect(() => {
        setDepartamentosRaw(Object.fromEntries(listaDepartamentos));

        for (const [metodo, valor] of Object.entries(oldPermisos[rutaAEditar])) {
            if (valor === false) continue;
            const permisos = Array.isArray(valor) ? valor.map(String) : [String(valor)];
            if (metodo === 'GET') setDepartamentosGet(permisos);
            if (metodo === 'POST') setDepartamentosPost(permisos);
            if (metodo === 'DELETE') setDepartamentosDelete(permisos);
        }
    }, []);

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
                apiSave(rutaAEditar, 'GET', departamentosGet, user?.token),
                apiSave(rutaAEditar, 'POST', departamentosPost, user?.token),
                apiSave(rutaAEditar, 'DELETE', departamentosDelete, user?.token),
            ]);

            let seconds = 4;
            const idSeg = setInterval(() => {
                setEstado(`Cambios confirmados. Se refrescará en ${seconds--}s.`);
                if (seconds === -1) clearInterval(idSeg);
            }, 1000);
            setEstado(`Cambios confirmados. Se refrescará en ${seconds--}s.`);

            const id = setTimeout(() => {
                setEstado(undefined);
                setRutaAEditar(null);
                setEditando(false);
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
                ? `radio${prefijo}${id}${nombre}`
                : `checkbox${prefijo}${id}${nombre}`;
            const defaultCheck = departamentos.some(d => String(d).startsWith('>'))
                || departamentos.includes(String(id));
            const checkProps = quiereAlMenos
                ? {checked: defaultCheck}
                : {defaultChecked: defaultCheck};
            return (
                <div className={"form-check form-switch w-100 text-start"} key={id}>
                    <input name={quiereAlMenos ? `radio${prefijo}` : nameEtiqueta}
                           id={nameEtiqueta}
                           className={"mx-1"}
                           type={quiereAlMenos ? 'radio' : 'checkbox'}
                           onChange={() => handleDepartamentoParaMetodo(setDepartamentos, departamentos, String(id), quiereAlMenos)}
                           {...checkProps}
                           disabled={guardar}/>
                    <label htmlFor={nameEtiqueta} id={nameEtiqueta}> {nombre} </label>
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
                    <button className={"bi-x bi btn btn-outline-danger"} onClick={() => setEditando(false)}></button>
                </div>
                <div className={"card-body"}>
                    <h1 className={"card-title"}>{editando ? 'Editando ' : ''}{rutaAEditar || ''}</h1>

                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th className={"col"}>Permiso</th>
                            <th className={"col"}>
                                {oldPermisos[rutaAEditar]['GET'] && <i className={"bi bi-check2-square text-success"}> </i>}
                                {nuevosPermisos?.[rutaAEditar]?.['GET'] !== undefined && <i className={"bi bi-check2-square text-info"}> </i>}
                                GET
                            </th>
                            <th className={"col"}>
                                {oldPermisos[rutaAEditar]['POST'] && <i className={"bi bi-check2-square text-success"}> </i>}
                                {nuevosPermisos?.[rutaAEditar]?.['POST'] !== undefined && <i className={"bi bi-check2-square text-info"}> </i>}
                                POST
                            </th>
                            <th className={"col"}>
                                {oldPermisos[rutaAEditar]['DELETE'] && <i className={"bi bi-check2-square text-success"}> </i>}
                                {nuevosPermisos?.[rutaAEditar]?.['DELETE'] !== undefined && <i className={"bi bi-check2-square text-info"}> </i>}
                                DELETE
                            </th>
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

                    <button className={"btn " + (guardar ? 'btn-success' : 'btn-outline-success')}
                            onClick={() => handleConfirmar(!guardar)}>
                        {guardar ? 'Seguir editando' : 'Guardar'}
                    </button>

                    {guardar && (<>
                        <p>¿Quieres {editando ? 'guardar ' : ''} los permisos de {rutaAEditar || ''}?</p>
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
        </div>
    );
}

export default EditPermiso;