import React from 'react'
import {
  Box,
  Paper,
  Stack,
  Typography,
  Divider,
} from '@mui/material'
import { MainNav } from '../components/MainNav'
import { useUsers } from '../context/UserContext.jsx'

/**
 *
 * Dashboard principal de control de empresa.
 *
 * Este componente actúa como pantalla inicial tras el inicio de sesión
 * y muestra información general en función de los permisos del usuario.
 *
 * @returns {React.JSX.Element}
 * @author Eneas Menéndez
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
    { id: 'usuarios', titulo: 'Gestión de usuarios' },
    { id: 'productos', titulo: 'Gestión de productos' },
    { id: 'pedidos', titulo: 'Gestión de pedidos' },
    { id: 'informes', titulo: 'Informes generales' },
  ]

  // Filtrado de apartados en función de los permisos disponibles
  const apartadosPermitidos = apartadosDashboard.filter((apartado) =>
    permisosUsuario.includes(apartado.id),
  )

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex' }}>
      {/* Menú lateral */}
      <MainNav />

      {/* Área principal del dashboard */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
        <Stack spacing={3}>

          {/* Cabecera principal */}
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.92) 100%)',
              color: '#f8fafc',
            }}
          >
            <Stack spacing={1}>
              <Typography variant="overline">
                Panel de control
              </Typography>

              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Inicio
              </Typography>

              <Typography sx={{ maxWidth: 600, opacity: 0.85 }}>
                Vista general de la aplicación tras iniciar sesión.
                El contenido mostrado depende del tipo de usuario.
              </Typography>
            </Stack>
          </Paper>

          {/* Apartados visibles según permisos */}
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Apartados disponibles
              </Typography>

              <Divider />

              {apartadosPermitidos.length > 0 ? (
                <Stack spacing={1}>
                  {apartadosPermitidos.map((apartadoPermitido) => (
                    <Typography key={apartadoPermitido.id}>
                      • {apartadoPermitido.titulo}
                    </Typography>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No hay apartados disponibles para este usuario.
                </Typography>
              )}
            </Stack>
          </Paper>

        </Stack>
      </Box>
    </Box>
  )
}
``