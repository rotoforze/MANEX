import React, { useState } from 'react';
import { TablaIncidencias } from '../components/TablaIndicencias.jsx';
import { NuevaIncidenciaForm } from "../components/NuevaIncidenciaForm.jsx";
import '../../public/styles/mainPages.css';

/**
 *
 * Dashboard principal para el control de incidencias.
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.0.0
 * @constructor
 */
export function Incidencias() {

  const [registroVisible, setRegistroVisible] = useState(false);
  const [tipoIncidencia, setTipoIncidencia] = useState('general');
  const [refreshKey, setRefreshKey] = useState(0);

  function handleNuevaIncidencia() {
    setRefreshKey(prevKey => prevKey + 1);
    setRegistroVisible(false);
  }

  return (

    <div className="d-flex flex-column card w-100 h-100 empleados-container">

      <div className={"d-flex flex-column align-items-start justify-content-center gap-2 w-100 p-4"}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 mb-4 gap-3">

          <div>

            <h2 className="fw-bold mb-1">
              Gestión de incidencias
            </h2>

            <p className="text-muted mb-0">
              Administrar y revisar las incidencias reportadas por los empleados.
            </p>

          </div>

        </div>

        <div className={"d-flex gap-2 align-items-start justify-content-start top-productos"}>

          <button
            className={`btn ${tipoIncidencia === 'general'
              ? 'btn-primary'
              : 'btn-outline-primary'
              }`}
            onClick={() => setTipoIncidencia('general')}
          >

            <i className="bi bi-exclamation-circle me-2"></i>

            Generales

          </button>

          <button
            className={`btn ${tipoIncidencia === 'it'
              ? 'btn-primary'
              : 'btn-outline-primary'
              }`}
            onClick={() => setTipoIncidencia('it')}
          >

            <i className="bi bi-pc-display-horizontal me-2"></i>

            IT

          </button>

          <button
            className={`btn ${tipoIncidencia === 'inventario'
              ? 'btn-primary'
              : 'btn-outline-primary'
              }`}
            onClick={() => setTipoIncidencia('inventario')}
          >

            <i className="bi bi-box-seam me-2"></i>

            Inventario

          </button>
          <button className={"btn " + (registroVisible ? 'btn-danger' : 'btn-primary')} onClick={() => {
            // muestra el componente de registro
            setRegistroVisible(!registroVisible);

          }}> {registroVisible ? 'Cerrar formulario' : 'Nueva incidencia'}
          
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {

              setRefreshKey(prevKey => prevKey + 1);

            }}
          >

            Refrescar panel

          </button>

        </div>

        {
          registroVisible
            ? (
              <NuevaIncidenciaForm
                funcionDeCierreDeFormulario={setRegistroVisible}
                handleNuevaIncidencia={handleNuevaIncidencia}
                tipoIncidencia={tipoIncidencia}
              />
            )
            : null
        }

      </div>

      <hr />

      <div className={"d-flex flex-column gap-2 w-100 p-4 justify-content-center overflow-scroll"}>

        <TablaIncidencias
          key={refreshKey}
          tipoIncidencia={tipoIncidencia}
        />

      </div>

    </div>
  );
}
