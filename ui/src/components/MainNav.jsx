import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box
} from '@mui/material'

import HomeIcon from '@mui/icons-material/Home'
import PeopleIcon from '@mui/icons-material/People'
import InventoryIcon from '@mui/icons-material/Inventory'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'

/**
 *
 * Menú lateral de navegación.
 *
 * La visibilidad de las opciones depende del nivel de permisos
 * del usuario que haya iniciado sesión.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @contributor Eneas Menéndez
 * @version 1.1.0
 * @constructor
 */
export const MainNav = () => {

  // Usuario simulado para el control de permisos
  const usuarioActual = {
    id: 1,
    nivelPermisos: 2 // 1 = usuario normal, 2 = administrador
  }

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        '& .MuiDrawer-paper': {
          width: 240,
          backgroundColor: '#111827',
          color: '#ffffff',
          borderRight: 'none'
        }
      }}
    >
      {/* Cabecera del menú lateral */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          MANEX
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          Gestión empresarial
        </Typography>
      </Box>

      {/* Opciones principales */}
      <List>

        {/* Opción visible para todos los usuarios */}
        <ListItem button component={NavLink} to="/dashboard">
          <ListItemIcon sx={{ color: '#ffffff' }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Inicio" />
        </ListItem>

        {/* Opciones solo visibles para administradores */}
        {usuarioActual.nivelPermisos === 2 && (
          <>
            <ListItem button component={NavLink} to="/gestion-usuarios">
              <ListItemIcon sx={{ color: '#ffffff' }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Usuarios" />
            </ListItem>

            <ListItem button component={NavLink} to="/gestion-productos">
              <ListItemIcon sx={{ color: '#ffffff' }}>
                <InventoryIcon />
              </ListItemIcon>
              <ListItemText primary="Productos" />
            </ListItem>

            <ListItem button component={NavLink} to="/gestion-pedidos">
              <ListItemIcon sx={{ color: '#ffffff' }}>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="Pedidos" />
            </ListItem>

            <ListItem button component={NavLink} to="/informes">
              <ListItemIcon sx={{ color: '#ffffff' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Informes" />
            </ListItem>
          </>
        )}
      </List>

      {/* Espaciador para empujar las opciones inferiores */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Opciones inferiores */}
      <List>
        <ListItem button component={NavLink} to="/mi-cuenta">
          <ListItemIcon sx={{ color: '#ffffff' }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </ListItem>
      </List>
    </Drawer>
  )
}