import React, { useState } from 'react';
import { NuevaSolicitudForm } from "../components/NuevaSolicitudForm.jsx";
import { TablaSolicitudes } from "../components/TablaSolicitudes.jsx";
import '../../public/styles/mainPages.css';

/**
 *
 * Muestra el panel principal de gestion de solicitudes.
 *
 * @returns {React.JSX.Element}
 * @author Eneas Menendez
 * @version 1.0.0
 * @constructor
 */
export function Solicitudes() {

  const [registroVisible, setRegistroVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleNuevaSolicitud() {
    setRefreshKey(prevKey => prevKey + 1);
    setRegistroVisible(false);
  }

  return (
    <div className="d-flex flex-column card w-100 h-100 empleados-container">

      <div className="d-flex flex-column align-items-start justify-content-center gap-2 w-100 p-4">

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 mb-4 gap-3">

          <div>
            <h2 className="fw-bold mb-1">
              Gestión de solicitudes
            </h2>

            <p className="text-muted mb-0">
              Administrar y revisar las solicitudes registradas por los empleados.
            </p>
          </div>

        </div>

        <div className="d-flex gap-2 align-items-start justify-content-start top-productos">

          <button
            className={"btn " + (registroVisible ? 'btn-danger' : 'btn-primary')}
            onClick={() => setRegistroVisible(!registroVisible)}
          >
            {registroVisible ? 'Cerrar formulario' : 'Nueva solicitud'}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setRefreshKey(prevKey => prevKey + 1)}
          >
            Refrescar panel
          </button>

        </div>

        {
          registroVisible
            ? (
              <NuevaSolicitudForm
                funcionDeCierreDeFormulario={setRegistroVisible}
                handleNuevaSolicitud={handleNuevaSolicitud}
              />
            )
            : null
        }

      </div>

      <hr />

      <div className="d-flex flex-column gap-2 w-100 p-4 justify-content-center overflow-scroll">

        <TablaSolicitudes key={refreshKey} />

      </div>

    </div>
  )
}
