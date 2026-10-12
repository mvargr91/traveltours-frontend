import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Link, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useApariencia } from '@crema/context/AppContextProvider/AparienciaContextProvider';
import { useEnlacesPortal } from '../PortalHeader';
import { RUTAS_PORTAL } from '../../../constants/RutasPortal';

const Columna = ({ titulo, children }) => (
  <Grid item xs={6} md={3}>
    <Typography variant='subtitle2' sx={{ color: '#fff', mb: 1.5, fontWeight: 700 }}>
      {titulo}
    </Typography>
    <Stack spacing={1}>{children}</Stack>
  </Grid>
);

const enlaceSx = { color: 'rgba(255,255,255,0.75)', '&:hover': { color: '#fff' } };

const PortalFooter = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { apariencia } = useApariencia();
  const { marca, portal } = apariencia;
  const enlaces = useEnlacesPortal();
  // "Eslogan. Texto del pie." sin puntos duplicados.
  const descripcion = [marca.eslogan, marca.pie].map((t) => t.trim().replace(/\.$/, '')).filter(Boolean).join('. ');

  return (
    <Box
      component='footer'
      sx={{
        bgcolor: isDark ? portal.oscuro.pie : portal.claro.pie,
        color: 'rgba(255,255,255,0.75)',
        mt: 8,
        transition: 'background-color 0.3s ease',
      }}
    >
    {portal.mostrarFranja && <Box sx={{ height: 4, background: apariencia.gradienteFranja }} />}
    <Container maxWidth='lg' sx={{ py: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          {/* Fondo oscuro: variante con el "+" en blanco */}
          <Box component='img' src={apariencia.logos.oscuro} alt={marca.nombre} sx={{ height: 64, mb: 1.5 }} />
          {descripcion && <Typography variant='body2'>{descripcion}.</Typography>}
        </Grid>
        <Columna titulo='Explorar'>
          {enlaces.filter((e) => e.to !== '/').map((e) => (
            <Link key={e.to} component={RouterLink} to={e.to} underline='none' sx={enlaceSx}>
              {e.label}
            </Link>
          ))}
        </Columna>
        <Columna titulo='Proveedores'>
          <Link component={RouterLink} to={`${RUTAS_PORTAL.registro}?tipo=proveedor`} underline='none' sx={enlaceSx}>
            Registra tu negocio
          </Link>
          <Link component={RouterLink} to='/signin' underline='none' sx={enlaceSx}>
            Portal de proveedores
          </Link>
          <Typography variant='body2'>Verificamos cada negocio antes de publicar sus experiencias.</Typography>
        </Columna>
        <Columna titulo='Tu cuenta'>
          <Link component={RouterLink} to={RUTAS_PORTAL.registro} underline='none' sx={enlaceSx}>
            Crear cuenta
          </Link>
          <Link component={RouterLink} to='/signin' underline='none' sx={enlaceSx}>
            Ingresar
          </Link>
          <Link component={RouterLink} to='/mis-reservas' underline='none' sx={enlaceSx}>
            Mis reservas
          </Link>
          <Link component={RouterLink} to={RUTAS_PORTAL.consultarReserva} underline='none' sx={enlaceSx}>
            Consultar reserva
          </Link>
          <Link component={RouterLink} to='/mis-favoritos' underline='none' sx={enlaceSx}>
            Mis favoritos
          </Link>
        </Columna>
      </Grid>
      <Typography variant='caption' component='p' sx={{ mt: 5, textAlign: 'center' }}>
        © {new Date().getFullYear()} {marca.nombre}. Todos los derechos reservados.
      </Typography>
    </Container>
  </Box>
  );
};

export default PortalFooter;
