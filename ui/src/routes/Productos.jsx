import React, { useState } from 'react';
import { NuevoProductoForm } from "../components/Productos/NewProduct.jsx";
import { TablaProductos } from "../components/Productos/TablaProductos.jsx";
import '../../public/styles/mainPages.css';
import {useUsers} from "../context/UserContext.jsx";

/**
 *
 * Muestra una lista de productos y un formulario para añadir nuevos productos.
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menéndez Pedrosa
 * @version 1.0.0
 * @constructor
 */
export function Productos() {

    const [registroVisible, setRegistroVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { tengoPermiso } = useUsers();

    function handleNuevoRegistro() {
        setRefreshKey(prevKey => prevKey + 1);
        setRegistroVisible(false);
    }

    return (
        <div className="d-flex flex-column card w-100 empleados-container">

            <div className={"d-flex flex-column align-items-start justify-content-center gap-2 w-100 p-4"}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 mb-4 gap-3">

                    <div>
                        <h2 className="fw-bold mb-1">
                            Gestión de productos
                        </h2>

                        <p className="text-muted mb-0">
                            Administrar y revisar la información de los productos.
                        </p>
                    </div>

                </div>

                <div className="d-flex gap-2 align-items-start justify-content-start top-accion">
                    <button
                        className={"btn top-accion-btn " + (registroVisible ? 'btn-danger' : 'btn-primary')}
                        onClick={() => setRegistroVisible(!registroVisible)}
                        disabled={!tengoPermiso('/productos', 'POST')}
                    >
                        {registroVisible ? 'Cerrar formulario' : 'Nuevo producto'}
                    </button>
                    <button
                        className="btn btn-primary top-accion-btn"
                        onClick={() => setRefreshKey(prevKey => prevKey + 1)}
                    >
                        Refrescar panel
                    </button>
                </div>

                {
                    registroVisible
                        ? (
                            <NuevoProductoForm
                                funcionDeCierreDeFormulario={() => setRegistroVisible(false)}
                                handleNuevoProducto={handleNuevoRegistro}
                            />
                        )
                        : null
                }

            </div>

            <hr />

            <div className="d-flex flex-column gap-2 w-100 p-4 justify-content-center overflow-auto">

                <TablaProductos key={refreshKey} />

            </div>

        </div>
    )
}