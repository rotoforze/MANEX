import React, {useState} from 'react';
import {NavbarConfigProfileLogout} from "../components/NavbarConfigProfileLogout.jsx";
import {TablePermisos} from "../components/Permisos/TablePermisos.jsx";
import '../../public/styles/mainPages.css';

export const Configuration = () => {
    return (<NavbarConfigProfileLogout>
        <TablePermisos />
    </NavbarConfigProfileLogout>)
}

const FormularioPermisos = ({ruta, metodo, permisos, onGuardar, onEliminar}) => {

    const [valor, setValor] = useState(permisos.join(','));

    return (

        <div className="d-flex flex-column card w-100 h-100 empleados-container">

            <label>
                <strong>{metodo}</strong>

            </label>

            <input className="form-control" value={valor} onChange={(e) => setValor(e.target.value)}/>

            <div className="mt-2 d-flex gap-2">

                <button className="btn btn-primary" onClick={() => onGuardar(ruta, metodo, valor)}>Guardar</button>

                <button className="btn btn-danger" onClick={() => onEliminar(ruta, metodo)}>Eliminar</button>

            </div>

        </div>)
}