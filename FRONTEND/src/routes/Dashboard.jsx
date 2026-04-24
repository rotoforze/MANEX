import React from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { MainNav } from '../components/MainNav'
import { useUsers } from '../context/UserContext.jsx'

const datosResumenDashboard = [
  {
    titulo: 'Dato 1',
    valor: '12',
    descripcion: 'Ejemplo de contratos activos.',
  },
  {
    titulo: 'Dato 2',
    valor: '4',
    descripcion: 'Ejemplo de incidencias abiertas.',
  },
]

const apartadosDashboard = [
  {
    id: 'contrato',
    titulo: 'Contrato',
    grupo: 'Gestion de personal',
    descripcionGrupo: 'Apartados base para la gestion diaria del personal.',
  },
  {
    id: 'departamento',
    titulo: 'Departamento',
    grupo: 'Gestion de personal',
    descripcionGrupo: 'Apartados base para la gestion diaria del personal.',
  },
  {
    id: 'empleado',
    titulo: 'Empleado',
    grupo: 'Gestion de personal',
    descripcionGrupo: 'Apartados base para la gestion diaria del personal.',
  },
  {
    id: 'usuario',
    titulo: 'Usuario',
    grupo: 'Gestion de personal',
    descripcionGrupo: 'Apartados base para la gestion diaria del personal.',
  },
  {
    id: 'fichajes',
    titulo: 'Fichajes',
    grupo: 'Control horario y ausencias',
    descripcionGrupo: 'Apartados utiles para revisar asistencia y permisos.',
  },
  {
    id: 'solicitud_vacaciones',
    titulo: 'Solicitud vacaciones',
    grupo: 'Control horario y ausencias',
    descripcionGrupo: 'Apartados utiles para revisar asistencia y permisos.',
  },
  {
    id: 'incidencia',
    titulo: 'Incidencia',
    grupo: 'Incidencias e inventario',
    descripcionGrupo: 'Apartados para registrar y consultar incidencias.',
  },
  {
    id: 'incidencia_inventario',
    titulo: 'Incidencia inventario',
    grupo: 'Incidencias e inventario',
    descripcionGrupo: 'Apartados para registrar y consultar incidencias.',
  },
  {
    id: 'incidencia_it',
    titulo: 'Incidencia IT',
    grupo: 'Incidencias e inventario',
    descripcionGrupo: 'Apartados para registrar y consultar incidencias.',
  },
  {
    id: 'inventario',
    titulo: 'Inventario',
    grupo: 'Incidencias e inventario',
    descripcionGrupo: 'Apartados para registrar y consultar incidencias.',
  },
  {
    id: 'envia_una',
    titulo: 'Envia una',
    grupo: 'Comunicacion interna',
    descripcionGrupo: 'Apartado sencillo para pruebas de avisos o mensajes.',
  },
]

const gruposBaseDashboard = [
  {
    titulo: 'Gestion de personal',
    descripcion: 'Apartados base para la gestion diaria del personal.',
  },
  {
    titulo: 'Control horario y ausencias',
    descripcion: 'Apartados utiles para revisar asistencia y permisos.',
  },
  {
    titulo: 'Incidencias e inventario',
    descripcion: 'Apartados para registrar y consultar incidencias.',
  },
  {
    titulo: 'Comunicacion interna',
    descripcion: 'Apartado sencillo para pruebas de avisos o mensajes.',
  },
]

const estilosDashboard = {
  contenedorPrincipal: {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #f7f8fa 0%, #eef1f5 100%)',
  },
  areaContenido: {
    p: { xs: 2, md: 4 },
  },
  cabecera: {
    p: { xs: 3, md: 4 },
    borderRadius: 4,
    color: '#f8fafc',
    background:
      'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.92) 100%)',
    border: '1px solid rgba(148,163,184,0.18)',
    boxShadow: '0 24px 50px rgba(15, 23, 42, 0.18)',
  },
  tarjetaResumen: {
    p: 3,
    borderRadius: 4,
    border: '1px solid #d7dee7',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
    backgroundColor: '#ffffff',
  },
  tarjetaGrupo: {
    p: 3,
    borderRadius: 4,
    border: '1px solid #d7dee7',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
    backgroundColor: '#ffffff',
    height: '100%',
  },
  tabla: {
    borderRadius: 4,
    border: '1px solid #d7dee7',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
}

/**
 *
 * Dashboard principal de control de empresa para pruebas funcionales.
 *
 * @returns {React.JSX.Element}
 * @author Eneas Menéndez
 * @version 1.0.1
 * @constructor
 */
export const Dashboard = () => {
  const { user } = useUsers()
  const permisosUsuario = user?.permisos || []

  const apartadosPermitidos = apartadosDashboard.filter((apartadoDashboard) =>
    permisosUsuario.includes(apartadoDashboard.id),
  )

  const gruposDashboard = gruposBaseDashboard
    .map((grupoBaseDashboard) => {
      const apartadosGrupo = apartadosPermitidos.filter(
        (apartadoDashboard) => apartadoDashboard.grupo === grupoBaseDashboard.titulo,
      )

      return {
        ...grupoBaseDashboard,
        apartados: apartadosGrupo,
      }
    })
    .filter((grupoDashboard) => grupoDashboard.apartados.length > 0)

  const filasEjemploTabla = apartadosPermitidos.slice(0, 2).map((apartadoPermitido) => ({
    apartado: apartadoPermitido.titulo,
    datoPrincipal: 'Dato 1',
    datoSecundario: 'Dato 2',
  }))

  return (
    <Box sx={estilosDashboard.contenedorPrincipal}>
      <MainNav />

      <Box component="main" sx={estilosDashboard.areaContenido}>
        <Stack spacing={3}>
          <Paper sx={estilosDashboard.cabecera}>
            <Stack spacing={2}>
              <Typography variant="overline" sx={{ letterSpacing: 2 }}>
                Panel de control empresarial
              </Typography>

              <Typography
                variant="h3"
                sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '2.6rem' } }}
              >
                Dashboard general de MANEX
              </Typography>

              <Typography sx={{ maxWidth: 760, color: 'rgba(248, 250, 252, 0.84)' }}>
                Vista sencilla para probar componentes, rutas y estructura general
                del proyecto con Material UI y React Router.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  variant="contained"
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    backgroundColor: '#e2e8f0',
                    color: '#0f172a',
                    '&:hover': { backgroundColor: '#cbd5e1' },
                  }}
                >
                  Ver dashboard
                </Button>

                <Button
                  component={RouterLink}
                  to="/dashboard"
                  variant="outlined"
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    color: '#f8fafc',
                    borderColor: 'rgba(248, 250, 252, 0.4)',
                    '&:hover': { borderColor: '#f8fafc' },
                  }}
                >
                  Probar apartados
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3,
            }}
          >
            {datosResumenDashboard.map((datoResumen) => (
              <Paper key={datoResumen.titulo} sx={estilosDashboard.tarjetaResumen}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    {datoResumen.titulo}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {datoResumen.valor}
                  </Typography>
                  <Typography color="text.secondary">
                    {datoResumen.descripcion}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Box>

          <Paper sx={estilosDashboard.tarjetaResumen}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Apartados principales
                </Typography>
                <Typography color="text.secondary">
                  Se han agrupado las tablas de la base de datos en bloques faciles
                  de revisar dentro del dashboard.
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                {gruposDashboard.map((grupoDashboard) => (
                  <Paper key={grupoDashboard.titulo} sx={estilosDashboard.tarjetaGrupo}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: '#0f172a' }}
                        >
                          {grupoDashboard.titulo}
                        </Typography>
                        <Typography color="text.secondary">
                          {grupoDashboard.descripcion}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {grupoDashboard.apartados.map((apartado) => (
                          <Chip
                            key={apartado.id}
                            label={apartado.titulo}
                            sx={{
                              backgroundColor: '#e8edf3',
                              color: '#233143',
                              fontWeight: 600,
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Box>
            </Stack>
          </Paper>

          <Paper sx={estilosDashboard.tarjetaResumen}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Tabla de ejemplo
                </Typography>
                <Typography color="text.secondary">
                  Datos simples para comprobar maquetacion y renderizado segun
                  permisos del usuario.
                </Typography>
              </Box>

              <TableContainer sx={estilosDashboard.tabla}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#e8edf3' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Apartado</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Dato principal</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Dato secundario</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filasEjemploTabla.map((filaEjemplo) => (
                      <TableRow key={filaEjemplo.apartado}>
                        <TableCell>{filaEjemplo.apartado}</TableCell>
                        <TableCell>{filaEjemplo.datoPrincipal}</TableCell>
                        <TableCell>{filaEjemplo.datoSecundario}</TableCell>
                      </TableRow>
                    ))}
                    {filasEjemploTabla.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          No hay apartados disponibles para este usuario.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  )
}
