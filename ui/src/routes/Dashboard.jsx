import React from 'react'
import { useUsers } from '../context/UserContext.jsx'

/**
 *
 * Dashboard principal de control de empresa.
 *
 * Este componente actua como pantalla inicial tras el inicio de sesion
 * y muestra informacion general en funcion de los permisos del usuario.
 *
 * @returns {React.JSX.Element}
 * @author Eneas Menendez
 * @version 1.0.0
 * @constructor
 */
export const Dashboard = () => {
  const { user } = useUsers()

  // Permisos del usuario obtenidos desde el contexto
  const permisosUsuario = user?.permisos || []

  /**
   * No contienen datos reales, solo estructura visual.
   */
  const apartadosDashboard = [
    { id: 'usuarios', titulo: 'Gestion de usuarios' },
    { id: 'productos', titulo: 'Gestion de productos' },
    { id: 'pedidos', titulo: 'Gestion de pedidos' },
    { id: 'informes', titulo: 'Informes generales' },
  ]

  // Filtrado de apartados en funcion de los permisos disponibles
  const apartadosPermitidos = apartadosDashboard.filter((apartado) =>
    permisosUsuario.includes(apartado.id),
  )

  return (
    <div className="dashboard-shell d-flex min-vh-100">
      {/* Area principal del dashboard */}
      <main className="dashboard-main flex-grow-1 p-3 p-md-4">
        <div className="d-grid gap-4">

          {/* Cabecera principal */}
          <section className="dashboard-hero rounded-3 p-4 text-white shadow-sm">
            <div className="d-grid gap-2">
              <span className="text-uppercase small fw-semibold opacity-75">
                Panel de control
              </span>

              <h1 className="h2 fw-bold mb-0">
                Inicio
              </h1>

              <p className="mb-0 dashboard-hero-copy">
                Vista general de la aplicacion tras iniciar sesion.
                El contenido mostrado depende del tipo de usuario.
              </p>
            </div>
          </section>

          {/* Apartados visibles segun permisos */}
          <section className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-3">
                Apartados disponibles
              </h2>

              <hr className="my-3" />

              {apartadosPermitidos.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {apartadosPermitidos.map((apartadoPermitido) => (
                    <li
                      className="list-group-item px-0"
                      key={apartadoPermitido.id}
                    >
                      {apartadoPermitido.titulo}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-secondary mb-0">
                  No hay apartados disponibles para este usuario.
                </p>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
