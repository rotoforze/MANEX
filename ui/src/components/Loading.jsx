import React from 'react'

/**
 * Componente que muestra un mensaje de cargando.
 *
 * @author Alex Bernardos Gil
 * @version 1.0.0
 * @returns {React.JSX.Element}
 * @constructor
 */
export const Loading = () => {
    return (
        <div className={"w-100 h-100"}>
            <div className="loading card shadow-sm" role="status" aria-live="polite">
                <div className="card-body d-flex align-items-center gap-3">
                    <div className="spinner-border text-primary loading-spinner" aria-hidden="true"></div>

                    <div className="text-start">
                        <p className="fw-semibold mb-0">Cargando</p>
                        <small className="text-muted">Preparando la información...</small>
                    </div>
                </div>
            </div>
        </div>
    )
}
