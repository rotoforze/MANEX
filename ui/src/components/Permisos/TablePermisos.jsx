import { useUsers } from "../../context/UserContext.jsx";
import "../../../public/styles/tablaPermisos.css";
import React, { useEffect, useState } from "react";

export function TablePermisos() {
    const { user } = useUsers();

    const [permisos, setPermisos] = useState({});
    const [departamentos, setDepartamentos] = useState(new Map())
    const [rutaAEditar, setRutaAEditar] = useState(null);
    const [departamentosParaLaRuta, setDepartamentosParaLaRuta] = useState([]);
    const [eliminando, setEliminando] = useState(false);
    const [editando, setEditando] = useState(false);
    const [confirmar, setConfirmar] = useState(false);
    const [estado, setEstado] = useState(undefined);

    const fetchInicio = () => {
        fetch(import.meta.env.VITE_BACKEND_PERMISOS, {
            method: 'GET', headers: { 'token': user?.token }
        })
            .then(res => res.json())
            .then(data => {
                setPermisos(data);
            });
        fetch(import.meta.env.VITE_BACKEND_DEPARTAMENTOS, {
            method: 'GET', headers: { 'token': user?.token }
        })
            .then(res => res.json())
            .then(data => {
                let mapa = new Map()
                data.data.forEach(d => {
                    mapa.set(d.ID, d.Nombre);
                })
                setDepartamentos(mapa);
            });
    }

    useEffect(() => {
        fetchInicio();
    }, []);
    return (
        <div>
            {
                editando || eliminando ? (<div className="superponer">
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
                            <h1 className={"card-title"}>{eliminando ? 'Eliminar ' : ''}{editando ? 'Guardar ' : ''}{rutaAEditar || ''}</h1>
                            <p>¿Quieres {eliminando ? 'eliminar ' : ''}{editando ? 'guardar ' : ''} los permisos
                                de {rutaAEditar || ''}?</p>
                            {estado && <p className={"text-danger"}>{estado}</p>}
                            <div>
                                <label className={"form-label"}>Escribe 'CONFIRMAR' para poder confirmar.</label>
                                <input type="text" className={"form-control"}
                                    placeholder={"Escribe 'CONFIRMAR' para poder confirmar."} onChange={(e) => {
                                        setConfirmar(e.target.value.toUpperCase() == 'CONFIRMAR');
                                    }} />
                                <div className={"gap-3 d-flex justify-content-center mt-3 p-2"}>
                                    <button className={"btn btn-primary"} onClick={() => {
                                        setEstado('Confirmando cambios...');
                                        const urlencoded = new URLSearchParams();
                                        urlencoded.append("ruta", rutaAEditar);
                                        fetch(import.meta.env.VITE_BACKEND_PERMISOS, {
                                            method: 'DELETE', headers: { 'token': user?.token }, body: urlencoded,
                                        })
                                            .then(res => res.json())
                                            .then(data => {
                                                setEstado('Cambios confirmados.');
                                                setTimeout(() => {
                                                    setEstado(undefined);
                                                    setRutaAEditar(null);
                                                    setEliminando(false);
                                                    setEditando(false);
                                                    setConfirmar(false);
                                                    fetchInicio();
                                                }, 2000);
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
                    </div>
                </div>) : null
            }
            {permisos ? (<>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 mb-4 gap-3">

                    <div>
                        <h2 className="fw-bold mb-1">
                            Permisos
                        </h2>

                        <p className="text-muted mb-0">
                            Administrar y gestionar los permisos de los roles.
                        </p>
                    </div>

                </div>
                <div className="table-responsive permisos-table-wrapper">
                    <table className="table table-striped permisos-table">
                        <thead>
                            <tr>
                                <th className={"col"}>Permiso</th>
                                <th className={"col"}>GET</th>
                                <th className={"col"}>POST</th>
                                <th className={"col"}>DELETE</th>
                                <th className={"col"}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className={"table-group-divider"}>
                            {permisos && permisos != null && permisos != undefined ? Object.entries(permisos).map((permiso, index) => {
                                if (permiso[1] == null || permiso[1] == undefined) return;
                                const hijos = Object.entries(permiso[1]);
                                try {
                                    var permisoProtected = isProtected(hijos);

                                    var permisoGet = getValoresEnGet(hijos);
                                    var permisoGetTexto = parseToText(permisoGet, departamentos);

                                    var permisoPost = getValoresEnPost(hijos);
                                    var permisoPostTexto = parseToText(permisoPost, departamentos);

                                    var permisoDelete = getValoresEnDelete(hijos);
                                    var permisoDeleteTexto = parseToText(permisoDelete, departamentos);

                                } catch (e) {
                                    console.error(e); // TODO quitar mas adelante
                                }
                                return (
                                    <React.Fragment key={permiso[0]}>
                                        <tr className="h-auto table-group-divider">
                                            <th scope="row" className="permisos-table-route">
                                                {permiso[0]}&nbsp;&nbsp;
                                                {permisoProtected && <span className="badge bg-danger bi-shield">!</span>}
                                            </th>
                                            <td className={"h-auto"}>
                                                <input type="checkbox"
                                                    className="form-check-input form-check bg-dark justificar-centro"
                                                    disabled={permisoProtected} defaultChecked={!!permisoGet} />
                                            </td>
                                            <td className={"h-auto"}>
                                                <input type="checkbox"
                                                    className="form-check-input form-check bg-dark justificar-centro"
                                                    disabled={permisoProtected} defaultChecked={!!permisoPost} />
                                            </td>
                                            <td className={"h-auto"}>
                                                <input type="checkbox"
                                                    className="form-check-input form-check bg-dark justificar-centro"
                                                    disabled={permisoProtected} defaultChecked={!!permisoDelete} />
                                            </td>
                                            <td className={"h-auto"}>
                                                <button className="btn btn-danger bi-trash-fill mt-2" onClick={() => {
                                                    setEliminando(true);
                                                    setRutaAEditar(permiso[0]);
                                                }} disabled={hijos[0][1]}></button>
                                            </td>
                                        </tr>
                                        <tr className="h-auto">
                                            <td>Departamentos</td>
                                            <td className="permisos-table-text">
                                                {permisoGetTexto || ''}
                                            </td>
                                            <td className="permisos-table-text">
                                                {permisoPostTexto || ''}
                                            </td>
                                            <td className="permisos-table-text">
                                                {permisoDeleteTexto || ''}
                                            </td>
                                            <td>
                                                <button className="btn btn-primary bi-pencil-fill"
                                                    disabled={hijos[0][1]}></button>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                )
                            }) : (<tr>
                                <td>No hay permisos disponibles</td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </>) : (<h2>No tienes acceso a la configuración</h2>)}


        </div>
    )
}

function parseToText(perm, listaDepartamentos) {
    return perm == '*' ? 'Todos' : perm[0].includes('>') ? 'Al menos: ' + listaDepartamentos.get(parseInt(perm[0][1])) : perm.map(id => listaDepartamentos.get(parseInt(id))).join(', ') || 'N/A'
}

function isProtected(permiso) {
    for (const permisoElement of permiso) {
        if (permisoElement[0] == 'protected') {
            return permisoElement[1];
        }
    }
}

function getValoresEnGet(permiso) {
    for (const permisoElement of permiso) {
        if (permisoElement[0] == 'GET') {
            return permisoElement[1];
        }
    }
}

function getValoresEnPost(permiso) {
    for (const permisoElement of permiso) {
        if (permisoElement[0] == 'POST') {
            return permisoElement[1];
        }
    }
}

function getValoresEnDelete(permiso) {
    for (const permisoElement of permiso) {
        if (permisoElement[0] == 'DELETE') {
            return permisoElement[1];
            return permisoElement[1];
        }
    }
}
