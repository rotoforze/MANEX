import React, { useEffect, useState } from 'react';
import { useUsers } from "../context/UserContext.jsx";
import { NavbarConfigProfileLogout } from "../components/NavbarConfigProfileLogout.jsx";

export const Configuration = () => {

    const { user } = useUsers();

    const [permisos, setPermisos] = useState({});

    useEffect(() => {

        fetch('http://localhost:80/permisos', {
            method: 'GET',
            headers: {'token': user.token}
 })
            .then(res => res.json())
            .then(data => {
            setPermisos(data);
            });

    }, []);

    const guardar = async (ruta, metodo,permisosTexto) => {

        const permisosArray = permisosTexto
            .split(',')
            .map(p => p.trim());

        await fetch('http://localhost:80/permisos', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'token': user.token
            },

            body: JSON.stringify({
                ruta,
                metodo,
                permisos: permisosArray
            })
        });

        alert('Guardado');
    }

    const eliminar = async (ruta,metodo) => {

        await fetch('http://localhost:80/permisos', {

            method: 'DELETE',

            headers: {
                'Content-Type': 'application/json',
                'token': user.token
            },

            body: JSON.stringify({
                ruta,
                metodo
            })
        });

        const nuevosPermisos = { ...permisos };

        delete nuevosPermisos[ruta][metodo];

        setPermisos(nuevosPermisos);
    }

    if (user.department !== 9) {

        return (
            <NavbarConfigProfileLogout>

                <h3> No autorizado</h3>

            </NavbarConfigProfileLogout>
        );
    }

    return (
        <NavbarConfigProfileLogout>

            <div>

                <h2>Gestión de permisos</h2>
                {
                    Object.entries(permisos).map(
                        ([ruta, metodos]) => (

                            <div key={ruta}className="mb-5 border p-3">

                                <h4>{ruta}</h4>

                                {
                                    Object.entries(metodos).map(
                                        ([metodo, permisosMetodo]) => (

                                            <FormularioPermisos
                                                key={metodo}
                                                ruta={ruta}
                                                metodo={metodo}
                                                permisos={permisosMetodo}
                                                onGuardar={guardar}
                                                onEliminar={eliminar}
                                            />
                                        ))
                                }

                            </div>
                        ))
                }

            </div>

        </NavbarConfigProfileLogout>
    )
}

const FormularioPermisos = ({ruta,metodo,permisos,onGuardar,onEliminar}) => {

    const [valor, setValor] = useState(
        permisos.join(',')
    );

    return (

        <div className="mb-3">

            <label>
                <strong>{metodo}</strong>

            </label>

            <input className="form-control" value={valor} onChange={(e) => setValor(e.target.value)}/>

            <div className="mt-2 d-flex gap-2">

                <button className="btn btn-primary" onClick={() => onGuardar(ruta,metodo,valor) }>Guardar</button>

                <button className="btn btn-danger" onClick={() => onEliminar( ruta, metodo)}>Eliminar</button>

            </div>

        </div>
    )
}