import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useAuthMethod } from '@crema/hooks/AuthHooks';
import { logoutUser } from '@crema/redux/features/auth/authSlice';
import { useThemeContext } from '@crema/context/AppContextProvider/ThemeContextProvider';
import { MARCA, gradienteArcoiris } from '../../../constants/Marca';
import { RUTAS_PORTAL, RUTA_MI_CUENTA } from '../../../constants/RutasPortal';
import AppThemeModeSwitcher from '@crema/components/AppThemeModeSwitcher';

export const ENLACES_PORTAL = [
  { label: 'Inicio', to: RUTAS_PORTAL.inicio, color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
  { label: 'Tours', to: RUTAS_PORTAL.tours, color: '#f97316', bgcolor: 'rgba(249, 115, 22, 0.1)' },
  { label: 'Destinos', to: RUTAS_PORTAL.destinos, color: '#eab308', bgcolor: 'rgba(234, 179, 8, 0.1)' },
  { label: 'Promociones', to: RUTAS_PORTAL.promociones, color: '#22c55e', bgcolor: 'rgba(34, 197, 94, 0.1)' },
  { label: 'Mapa', to: RUTAS_PORTAL.mapa, color: '#06b6d4', bgcolor: 'rgba(6, 182, 212, 0.1)' },
];

// Primera opción del menú según los permisos del rol (misma regla que usa AppLayout tras el login).
export const urlPanelDe = (user) => user?.usuario?.permisos?.[0]?.opciones?.[0]?.url ?? '/signin';

const PortalHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout } = useAuthMethod();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { themeMode } = useThemeContext();
  const [menuMovil, setMenuMovil] = useState(false);

  const logoSrc = themeMode === 'dark' ? MARCA.logos.oscuro : MARCA.logos.principal;

  const salir = () => {
    dispatch(logoutUser(navigate));
    logout();
  };

  const acciones = isAuthenticated ? (
    <>
      <Button variant='outlined' startIcon={<DashboardIcon />} onClick={() => navigate(urlPanelDe(user))}>
        Mi panel
      </Button>
      <IconButton onClick={() => navigate(RUTA_MI_CUENTA)} title='Mi cuenta' aria-label='Mi cuenta'>
        <ManageAccountsIcon />
      </IconButton>
      <AppThemeModeSwitcher />
      <IconButton onClick={salir} title='Cerrar sesión'>
        <LogoutIcon />
      </IconButton>
    </>
  ) : (
    <>
      <Button color='inherit' onClick={() => navigate(RUTAS_PORTAL.registro)}>
        Crear cuenta
      </Button>
      <Button variant='contained' startIcon={<LoginIcon />} onClick={() => navigate('/signin')}>
        Ingresar
      </Button>
      <AppThemeModeSwitcher />
    </>
  );

  return (
    <AppBar position='sticky' color='inherit' elevation={0} sx={{ bgcolor: 'background.paper', transition: 'background-color 0.3s ease' }}>
      <Box sx={{ height: 4, background: gradienteArcoiris }} />
      <Container maxWidth='lg'>
        <Toolbar disableGutters sx={{ gap: 2, minHeight: { xs: 64, md: 76 } }}>
          <Box component={NavLink} to='/' sx={{ display: 'flex', alignItems: 'center', mr: 'auto' }}>
            <Box component='img' src={logoSrc} alt={MARCA.nombre} sx={{ height: { xs: 44, md: 56 } }} />
          </Box>

          <Box component='nav' sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {ENLACES_PORTAL.map((enlace) => (
              <Button
                key={enlace.to}
                component={NavLink}
                to={enlace.to}
                end={enlace.to === '/'}
                color='inherit'
                sx={{
                  '&.active': { color: enlace.color, bgcolor: enlace.bgcolor },
                  '&:hover': { color: enlace.color, bgcolor: enlace.bgcolor },
                }}
              >
                {enlace.label}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>{acciones}</Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5 }}>
            <AppThemeModeSwitcher size='small' />
            <IconButton onClick={() => setMenuMovil(true)} aria-label='Abrir menú'>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Drawer anchor='right' open={menuMovil} onClose={() => setMenuMovil(false)}>
        <Box sx={{ width: 280, p: 2 }} role='presentation' onClick={() => setMenuMovil(false)}>
          <Box component='img' src={logoSrc} alt={MARCA.nombre} sx={{ height: 48, mb: 2 }} />
          <List>
            {ENLACES_PORTAL.map((enlace) => (
              <ListItemButton key={enlace.to} component={NavLink} to={enlace.to}>
                <ListItemText primary={enlace.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {acciones}
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default PortalHeader;
