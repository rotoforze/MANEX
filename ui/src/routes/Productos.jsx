import React, { useState } from 'react';
import { NuevoProductoForm } from "../components/NewProduct.jsx";
import { TablaProductos } from "../components/TablaProductos.jsx";
import '../../public/styles/empleados.css';

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

    function handleNuevoRegistro() {
        setRefreshKey(prevKey => prevKey + 1);
        setRegistroVisible(false);
    }

    return (
        <div className="d-flex flex-column card w-100 h-100 empleados-container">

            <div className={"d-flex flex-column align-items-center justify-content-center gap-2 w-100 p-4"}>

                <h4>Acciones</h4>

                <div className={"d-flex gap-2 align-items-start justify-content-start top-productos"}>

                    <button
                        className={"btn " + (registroVisible ? 'btn-danger' : 'btn-primary')}
                        onClick={() => {

                            // muestra el componente de registro
                            setRegistroVisible(!registroVisible);

                        }}>

                        {
                            registroVisible
                                ? 'Cerrar formulario'
                                : 'Nuevo producto'
                        }

                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setRefreshKey(prevKey => prevKey + 1);
                        }}>

                        Refrescar panel

                    </button>

                </div>

                {
                    registroVisible
                        ? (
                            <NuevoProductoForm
                                funcionDeCierreDeFormulario={setRegistroVisible}
                                handleNuevoProducto={handleNuevoRegistro}
                            />
                        )
                        : null
                }

            </div>

            <hr />

            <div className={"d-flex flex-column gap-2 w-100 p-4 justify-content-center overflow-scroll"}>

                <TablaProductos key={refreshKey} />

            </div>

        </div>
    )
}