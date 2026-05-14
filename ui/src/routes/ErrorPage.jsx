import React from 'react'
import { Link, useNavigate, useRouteError } from 'react-router-dom'

/**
 *
 * Pantalla de error bootstrap
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.0.0
 * @constructor
 */

export const ErrorPage = () => {
  const error = useRouteError()
  const navigate = useNavigate()
  const status = error?.status || 500
  const mensaje = error?.statusText || error?.message || 'No se ha podido completar la operación.'

  return (
    <div className="error-page d-flex align-items-center justify-content-center w-100 h-100 p-4">
      <div className="card error-card shadow-sm text-center">
        <div className="card-body p-4 p-md-5">
          <div className="error-icon d-inline-flex align-items-center justify-content-center rounded-circle mb-4">
            <i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          </div>

          <h1 className="h3 fw-bold mb-3">
            Algo no ha ido bien
          </h1>

          <p className="text-muted mb-4">
            {mensaje}
          </p>

          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>
              Volver
            </button>

            <Link className="btn btn-primary" to="/dashboard">
              <i className="bi bi-house-door me-2" aria-hidden="true"></i>
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
