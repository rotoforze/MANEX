import {useEffect, useState} from "react";
import {useUsers} from "../context/UserContext.jsx";

/**
 * Muestra en formato tabla los empleados recibidos
 *
 * @author Alex Bernardos Gil
 * @version 1.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export function TablaEmpleados() {

    const [listaEmpleados, setListaEmpleados] = useState({});
    const {user} = useUsers();

    useEffect(() => {
        try {
            fetch(import.meta.env.VITE_BACKEND_EMPLEADO,
                {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json', 'token': user?.token, 'pagina': 0, 'cantidad': 10}
                })
                .then((response) => response.json()
                ).then((data) => {
                    console.log(data)
                if (data) setListaEmpleados(data?.data)
            });
        } catch (e) {
            console.error(e);
        }
    }, [])

    return (
        <table className="table table-striped">
            <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">Nombre</th>
                <th scope="col">Apellido</th>
                <th scope="col">Email</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Fecha de nacimiento</th>
                <th scope="col">Fecha de alta</th>
                <th scope="col">Departamento</th>
                <th scope="col">Contrato</th>
                <th scope="col">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {listaEmpleados.length > 0 ?
                listaEmpleados.map((user) => (
                        <tr key={user?.ID}>
                            <th scope="row">{user?.ID}</th>
                            <td>{user?.Nombre}</td>
                            <td>{user?.Apellidos}</td>
                            <td>{user?.email}</td>
                            <td>{user?.telefono}</td>
                            <td>{user?.fecha_nacimiento}</td>
                            <td>{user?.fecha_alta}</td>
                            <td>{user?.ID_DEPARTAMENTO}</td>
                            <td>{user?.ID_CONTRATO}</td>
                            <td className={"d-flex gap-2"}>
                                <button className="btn btn-primary">E</button>
                                <button className="btn btn-danger">X</button>
                            </td>
                        </tr>
                    )
                ) : 'No hay empleados.'
            }
            </tbody>
        </table>
    )
}