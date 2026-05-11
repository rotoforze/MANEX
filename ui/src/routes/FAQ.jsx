import React from 'react'
import { Link } from 'react-router-dom'

/**
 *
 * Ayuda para iniciar sesion
 *
 * @returns {React.JSX.Element}
 * @author Eneas de la Rosa Menendez Pedrosa
 * @version 1.0.0
 * @constructor
 */

export const FAQ = () => {

    return (
        <main className="faq-page d-flex align-items-center justify-content-center min-vh-100 px-3 py-4">
            <section className="card faq-card shadow-lg border-0 w-100">
                <div className="card-body p-4 p-md-5">
                    <div className="text-center mb-4">
                        <div className="faq-icon d-inline-flex align-items-center justify-content-center rounded-circle mb-3">
                            <i className="bi bi-question-circle-fill" aria-hidden="true"></i>
                        </div>

                        <h1 className="h3 fw-bold mb-2">
                            Ayuda para iniciar sesion
                        </h1>
                    </div>
                    <div className="support-card border rounded-3 p-3 p-md-4 mt-4">
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                            <div className="d-flex align-items-start gap-3">
                                <div className="support-icon d-inline-flex align-items-center justify-content-center rounded-circle">
                                    <i className="bi bi-headset" aria-hidden="true"></i>
                                </div>

                                <div>
                                    <h2 className="h5 fw-bold mb-1">
                                        Contactar con soporte
                                    </h2>

                                    <p className="text-muted mb-0">
                                        Solicita ayuda para cambiar tu contrasena o recuperar el acceso a tu cuenta.
                                    </p>
                                </div>
                            </div>

                            <a
                                className="btn btn-outline-primary">
                                <i className="bi bi-envelope me-2" aria-hidden="true"></i>
                                Escribir a soporte
                            </a>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center mt-4">
                        <Link className="btn btn-primary" to="/">
                            <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>
                            Volver al login
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
