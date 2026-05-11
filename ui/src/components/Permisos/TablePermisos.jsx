import { useUsers } from "../../context/UserContext.jsx";
import "../../../public/styles/tablaPermisos.css";
import {DelPermiso} from "./DelPermiso.jsx";
import EditPermiso from "./EditPermiso.jsx";
import {apiFetch} from "../../utils/apiFetch.jsx";
import React, { useEffect, useState } from "react";

/**
 * Muestra en formato tabla los permisos de MANEX. permite ver y borrar
 * WIP: Crear y editar.
 *
 * @author Alex Bernardos Gil
 * @version 2.1
 * @returns {React.JSX.Element}
 * @constructor
 */
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
    const [permisoParaEditarOBorrar, setPermisoParaEditarOBorrar] = useState(user.departamento == 8);
    const [permisosNuevos, setPermisosNuevos] = useState({});

    const fetchInicio = () => {
        apiFetch(import.meta.env.VITE_BACKEND_PERMISOS, {
            method: 'GET', headers: {'token': user?.token}
        })
            .then(res => res.json())
            .then(data => {
                setPermisos(data);
            });
        apiFetch(import.meta.env.VITE_BACKEND_DEPARTAMENTOS, {
            method: 'GET', headers: {'token': user?.token}
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
                (eliminando) && permisoParaEditarOBorrar ?
                    <DelPermiso setRutaAEditar={setRutaAEditar} rutaAEditar={rutaAEditar} eliminando={eliminando}
                                setEliminando={setEliminando} setEditando={setEditando}
                                confirmar={confirmar} setConfirmar={setConfirmar} estado={estado} setEstado={setEstado}
                                user={user} fetchInicio={fetchInicio}/> : null
            }
            {
                (editando) && permisoParaEditarOBorrar ?
                    <EditPermiso setRutaAEditar={setRutaAEditar} rutaAEditar={rutaAEditar} editando={editando}
                                 setEliminando={setEliminando} setEditando={setEditando} oldPermisos={permisos}
                                 confirmar={confirmar} setConfirmar={setConfirmar} estado={estado} setEstado={setEstado}
                                 user={user} fetchInicio={fetchInicio} nuevosPermisos={permisosNuevos}
                                 listaDepartamentos={departamentos}/> : null
            }
            {permisos && permisoParaEditarOBorrar ? (<>
                <h2>Permisos</h2>

                <h4>Selecciona un permiso para ver su configuración.</h4>
                <table className="table table-striped">
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
                            console.error(e);
                        }
                        return (
                            <>
                                <tr className="h-auto table-group-divider" key={index}>
                                    <th scope="row">
                                        {permiso[0]}&nbsp;&nbsp;
                                        {permisoProtected && <span className="badge bg-danger bi-shield">!</span>}
                                    </th>
                                    <td className={"h-auto"}>
                                        <input type="checkbox"
                                               className="form-check-input form-check bg-dark justificar-centro"
                                               disabled={permisoProtected || !permisoParaEditarOBorrar}
                                               defaultChecked={!!permisoGet} onChange={(e) => {

                                            if (e.target.checked) {
                                                setPermisosNuevos({
                                                    ...permisosNuevos,
                                                    [permiso[0]]: {
                                                        ...permisosNuevos[permiso[0]],
                                                        GET: permisoGet
                                                    }
                                                });
                                            } else {
                                                setPermisosNuevos({
                                                    ...permisosNuevos,
                                                    [permiso[0]]: {
                                                        ...permisosNuevos[permiso[0]],
                                                        GET: false
                                                    }
                                                });
                                            }
                                        }}/>
                                    </td>
                                    <td className={"h-auto"}>
                                        <input type="checkbox"
                                               className="form-check-input form-check bg-dark justificar-centro"
                                               disabled={permisoProtected || !permisoParaEditarOBorrar}
                                               defaultChecked={!!permisoPost} onChange={(e) => {

                                            if (e.target.checked) {
                                                setPermisosNuevos({
                                                    ...permisosNuevos,
                                                    [permiso[0]]: {
                                                        ...permisosNuevos[permiso[0]],
                                                        POST: permisoGet
                                                    }
                                                });
                                            } else {
                                                setPermisosNuevos({
                                                    ...permisosNuevos,
                                                    [permiso[0]]: {
                                                        ...permisosNuevos[permiso[0]],
                                                        POST: false
                                                    }
                                                });
                                            }
                                        }}/>
                                    </td>
                                    <td className={"h-auto"}>
                                        <input type="checkbox"
                                               className="form-check-input form-check bg-dark justificar-centro"
                                               disabled={permisoProtected || !permisoParaEditarOBorrar}
                                               defaultChecked={!!permisoDelete} onChange={(e) => {
                                            if (e.target.checked) {
                                                setPermisosNuevos({
                                                    ...permisosNuevos,
                                                    [permiso[0]]: {
                                                        ...permisosNuevos[permiso[0]],
                                                        DELETE: permisoGet
                                                    }
                                                });
                                            } else {
                                                setPermisosNuevos({
                                                    ...permisosNuevos,
                                                    [permiso[0]]: {
                                                        ...permisosNuevos[permiso[0]],
                                                        DELETE: false
                                                    }
                                                });
                                            }
                                        }}/>
                                    </td>
                                    <td className={"h-auto"}>
                                        <button className="btn btn-danger bi-trash-fill mt-2" onClick={() => {
                                            setEliminando(true);
                                            setRutaAEditar(permiso[0]);
                                        }} disabled={permisoProtected || !permisoParaEditarOBorrar}></button>
                                    </td>
                                </tr>
                                <tr className="h-auto" key={index + 100}>
                                    <td>Departamentos</td>
                                    <td>
                                        {permisoGetTexto || ''}
                                    </td>
                                    <td>
                                        {permisoPostTexto || ''}
                                    </td>
                                    <td>
                                        {permisoDeleteTexto || ''}
                                    </td>
                                    <td>
                                        <button className="btn btn-primary bi-pencil-fill"
                                                disabled={permisoProtected || !permisoParaEditarOBorrar}
                                                onClick={() => {
                                                    setRutaAEditar(permiso[0])
                                                    setEditando(true)
                                                }
                                                }></button>
                                    </td>
                                </tr>
                            </>
                        )
                    }) : (<tr>
                        <td>No hay permisos disponibles</td>
                    </tr>)}
                    </tbody>
                </table>
            </>) : (<h2>No tienes acceso a la configuración</h2>)}


        </div>
    )
}

function parseToText(perm, listaDepartamentos) {
    if (perm == undefined) return 'N/A';
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
        }
    }
}
