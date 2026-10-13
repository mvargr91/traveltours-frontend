import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Grid, Icon, IconButton, Link, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import XIcon from '@mui/icons-material/X';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import PlaceIcon from '@mui/icons-material/Place';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useApariencia, useTextos } from '@crema/context/AppContextProvider/AparienciaContextProvider';
import { useEnlacesPortal } from '../PortalHeader';
import { RUTAS_PORTAL } from '../../../constants/RutasPortal';
import { REDES_SOCIALES } from '../../../constants/Apariencia';
import { useWhatsApp } from '../BotonWhatsApp';

const Columna = ({ titulo, children }) => (
  <Grid item xs={6} md={3}>
    <Typography variant='subtitle2' sx={{ color: '#fff', mb: 1.5, fontWeight: 700 }}>
      {titulo}
    </Typography>
    <Stack spacing={1}>{children}</Stack>
  </Grid>
);

const enlaceSx = { color: 'rgba(255,255,255,0.75)', '&:hover': { color: '#fff' } };

const ICONOS_REDES = {
  facebook: <FacebookIcon />,
  instagram: <InstagramIcon />,
  tiktok: <Icon>tiktok</Icon>,
  youtube: <YouTubeIcon />,
  x: <XIcon />,
};

const DatoContacto = ({ icono: Icono, href, children }) => (
  <Stack direction='row' spacing={1} alignItems='center'>
    <Icono sx={{ fontSize: 18 }} />
    {href ? (
      <Link href={href} underline='none' variant='body2' sx={enlaceSx}>{children}</Link>
    ) : (
      <Typography variant='body2'>{children}</Typography>
    )}
  </Stack>
);

const PortalFooter = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { apariencia } = useApariencia();
  const { marca, portal, contacto } = apariencia;
  const whatsapp = useWhatsApp();
  const redes = REDES_SOCIALES.filter(([red]) => contacto[red]);
  // Botón de contacto: WhatsApp si hay número; si no, el correo.
  const urlContacto = whatsapp.disponible
    ? whatsapp.enlace('mensajeGeneral')
    : contacto.correo ? `mailto:${contacto.correo}` : null;
  const enlaces = useEnlacesPortal();
  const t = useTextos('pie');
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
          <Stack spacing={1} sx={{ mt: 2 }}>
            {contacto.correo && <DatoContacto icono={MailOutlineIcon} href={`mailto:${contacto.correo}`}>{contacto.correo}</DatoContacto>}
            {contacto.telefono && <DatoContacto icono={PhoneIcon} href={`tel:${contacto.telefono.replace(/[^+\d]/g, '')}`}>{contacto.telefono}</DatoContacto>}
            {contacto.direccion && <DatoContacto icono={PlaceIcon}>{contacto.direccion}</DatoContacto>}
          </Stack>
          {redes.length > 0 && (
            <Stack direction='row' spacing={0.5} sx={{ mt: 1.5, ml: -1 }}>
              {redes.map(([red, nombre]) => (
                <IconButton key={red} href={contacto[red]} target='_blank' rel='noopener noreferrer' aria-label={nombre} title={nombre} sx={enlaceSx}>
                  {ICONOS_REDES[red]}
                </IconButton>
              ))}
            </Stack>
          )}
          {urlContacto && (
            <Button
              variant='outlined'
              size='small'
              href={urlContacto}
              target='_blank'
              rel='noopener noreferrer'
              startIcon={whatsapp.disponible ? <WhatsAppIcon /> : <MailOutlineIcon />}
              sx={{ mt: 2, color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}
            >
              {t('contacto')}
            </Button>
          )}
        </Grid>
        <Columna titulo={t('explorar')}>
          {enlaces.filter((e) => e.to !== '/').map((e) => (
            <Link key={e.to} component={RouterLink} to={e.to} underline='none' sx={enlaceSx}>
              {e.label}
            </Link>
          ))}
        </Columna>
        <Columna titulo={t('proveedores')}>
          <Link component={RouterLink} to={`${RUTAS_PORTAL.registro}?tipo=proveedor`} underline='none' sx={enlaceSx}>
            {t('registraNegocio')}
          </Link>
          <Link component={RouterLink} to='/signin' underline='none' sx={enlaceSx}>
            {t('portalProveedores')}
          </Link>
          <Typography variant='body2'>{t('notaProveedores')}</Typography>
        </Columna>
        <Columna titulo={t('tuCuenta')}>
          <Link component={RouterLink} to={RUTAS_PORTAL.registro} underline='none' sx={enlaceSx}>
            {t('crearCuenta')}
          </Link>
          <Link component={RouterLink} to='/signin' underline='none' sx={enlaceSx}>
            {t('ingresar')}
          </Link>
          <Link component={RouterLink} to='/mis-reservas' underline='none' sx={enlaceSx}>
            {t('misReservas')}
          </Link>
          <Link component={RouterLink} to={RUTAS_PORTAL.consultarReserva} underline='none' sx={enlaceSx}>
            {t('consultarReserva')}
          </Link>
          <Link component={RouterLink} to='/mis-favoritos' underline='none' sx={enlaceSx}>
            {t('misFavoritos')}
          </Link>
        </Columna>
      </Grid>
      <Typography variant='caption' component='p' sx={{ mt: 5, textAlign: 'center' }}>
        {t('derechos', { año: new Date().getFullYear(), marca: marca.nombre })}
      </Typography>
    </Container>
  </Box>
  );
};

export default PortalFooter;
