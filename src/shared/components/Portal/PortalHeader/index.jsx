import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Icon,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useAuthMethod } from '@crema/hooks/AuthHooks';
import { logoutUser } from '@crema/redux/features/auth/authSlice';
import { useThemeContext } from '@crema/context/AppContextProvider/ThemeContextProvider';
import { useApariencia, useTextos } from '@crema/context/AppContextProvider/AparienciaContextProvider';
import { RUTAS_MENU_PORTAL } from '../../../constants/Apariencia';
import { RUTAS_PORTAL, RUTA_MI_CUENTA } from '../../../constants/RutasPortal';
import AppThemeModeSwitcher from '@crema/components/AppThemeModeSwitcher';
import GoogleTranslate from '../GoogleTranslate';

// Enlaces visibles del menú del portal (etiqueta, color, icono y orden según Apariencia).
export const useEnlacesPortal = () => {
  const { menu } = useApariencia().apariencia.portal;
  return useMemo(
    () =>
      menu
        .filter((enlace) => enlace.visible)
        .map((enlace) => ({
          label: enlace.etiqueta,
          to: RUTAS_MENU_PORTAL[enlace.clave],
          color: enlace.color,
          bgcolor: alpha(enlace.color, 0.1),
          icono: enlace.icono,
        })),
    [menu],
  );
};

// Primera opción del menú según los permisos del rol (misma regla que usa AppLayout tras el login).
export const urlPanelDe = (user) => user?.usuario?.permisos?.[0]?.opciones?.[0]?.url ?? '/signin';

const PortalHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout } = useAuthMethod();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { themeMode } = useThemeContext();
  const { apariencia } = useApariencia();
  const enlaces = useEnlacesPortal();
  const t = useTextos('encabezado');
  const [menuMovil, setMenuMovil] = useState(false);

  const logoSrc = themeMode === 'dark' ? apariencia.logos.oscuro : apariencia.logos.principal;

  const salir = () => {
    dispatch(logoutUser(navigate));
    logout();
  };

  const acciones = isAuthenticated ? (
    <>
      <Button variant='outlined' startIcon={<DashboardIcon />} onClick={() => navigate(urlPanelDe(user))}>
        {t('miPanel')}
      </Button>
      <IconButton onClick={() => navigate(RUTA_MI_CUENTA)} title={t('miCuenta')} aria-label={t('miCuenta')}>
        <ManageAccountsIcon />
      </IconButton>
      <GoogleTranslate />
      <AppThemeModeSwitcher />
      <IconButton onClick={salir} title={t('cerrarSesion')}>
        <LogoutIcon />
      </IconButton>
    </>
  ) : (
    <>
      <Button color='inherit' onClick={() => navigate(RUTAS_PORTAL.registro)}>
        {t('crearCuenta')}
      </Button>
      <Button variant='contained' startIcon={<LoginIcon />} onClick={() => navigate('/signin')}>
        {t('ingresar')}
      </Button>
      <GoogleTranslate />
      <AppThemeModeSwitcher />
    </>
  );

  return (
    <AppBar position='sticky' color='inherit' elevation={0} sx={{ bgcolor: 'background.paper', transition: 'background-color 0.3s ease' }}>
      {apariencia.portal.mostrarFranja && <Box sx={{ height: 4, background: apariencia.gradienteFranja }} />}
      <Container maxWidth='lg'>
        <Toolbar disableGutters sx={{ gap: 2, minHeight: { xs: 64, md: 76 } }}>
          <Box component={NavLink} to='/' sx={{ display: 'flex', alignItems: 'center', mr: 'auto' }}>
            <Box component='img' src={logoSrc} alt={apariencia.marca.nombre} sx={{ height: { xs: 44, md: 56 } }} />
          </Box>

          <Box component='nav' sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {enlaces.map((enlace) => (
              <Button
                key={enlace.to}
                component={NavLink}
                to={enlace.to}
                end={enlace.to === '/'}
                color='inherit'
                startIcon={enlace.icono ? <Icon>{enlace.icono}</Icon> : null}
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
            <GoogleTranslate size='small' />
            <AppThemeModeSwitcher size='small' />
            <IconButton onClick={() => setMenuMovil(true)} aria-label={t('abrirMenu')}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Drawer anchor='right' open={menuMovil} onClose={() => setMenuMovil(false)}>
        <Box sx={{ width: 280, p: 2 }} role='presentation' onClick={() => setMenuMovil(false)}>
          <Box component='img' src={logoSrc} alt={apariencia.marca.nombre} sx={{ height: 48, mb: 2 }} />
          <List>
            {enlaces.map((enlace) => (
              <ListItemButton key={enlace.to} component={NavLink} to={enlace.to}>
                {enlace.icono && (
                  <ListItemIcon sx={{ minWidth: 36, color: enlace.color }}>
                    <Icon>{enlace.icono}</Icon>
                  </ListItemIcon>
                )}
                <ListItemText primary={enlace.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {isAuthenticated ? (
              <>
                <Button variant='outlined' startIcon={<DashboardIcon />} onClick={() => navigate(urlPanelDe(user))}>
                  {t('miPanel')}
                </Button>
                <Button
                  variant='outlined'
                  color='inherit'
                  startIcon={<ManageAccountsIcon />}
                  onClick={() => navigate(RUTA_MI_CUENTA)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('miCuenta')}
                </Button>
                <GoogleTranslate showLabel />
                <AppThemeModeSwitcher showLabel />
                <Button
                  variant='outlined'
                  color='error'
                  startIcon={<LogoutIcon />}
                  onClick={salir}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('cerrarSesion')}
                </Button>
              </>
            ) : (
              <>
                <Button color='inherit' onClick={() => navigate(RUTAS_PORTAL.registro)}>
                  {t('crearCuenta')}
                </Button>
                <Button variant='contained' startIcon={<LoginIcon />} onClick={() => navigate('/signin')}>
                  {t('ingresar')}
                </Button>
                <GoogleTranslate showLabel />
                <AppThemeModeSwitcher showLabel />
              </>
            )}
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default PortalHeader;
