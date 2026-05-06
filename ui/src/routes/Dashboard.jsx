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
    </div>
  )
}
