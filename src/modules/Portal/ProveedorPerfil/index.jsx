// Perfil público de un proveedor (GET publico/proveedores/{id}) con sus experiencias publicadas.
// Muestra el contacto y las redes del negocio; el NIT no es público.
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Rating,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import PlaceIcon from '@mui/icons-material/Place';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { onGetColeccion as onGetExperiencias } from '@crema/redux/features/portalExperiencias/portalExperienciasSlice';
import { useApariencia, useTextos } from '@crema/context/AppContextProvider/AparienciaContextProvider';
import ExperienceCard from '../../../shared/components/Portal/ExperienceCard';
import ContactoProveedor from '../../../shared/components/Portal/ContactoProveedor';
import { GrillaCargando, TituloSeccion } from '../../../shared/components/Portal/Secciones';
import { RUTAS_PORTAL } from '../../../shared/constants/RutasPortal';

const ProveedorPerfil = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const t = useTextos('proveedor');
  const { marca } = useApariencia().apariencia;
  const { rows: experiencias, loading } = useSelector((state) => state.portalExperiencias);
  const [proveedor, setProveedor] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    jwtAxios
      .get(`publico/proveedores/${encodeURIComponent(id)}`)
      .then(({ data }) => vigente && setProveedor(data))
      .catch(() => vigente && setProveedor(null))
      .finally(() => vigente && setCargando(false));
    dispatch(onGetExperiencias({ rowsPerPage: 24, filtros: { proveedor: id } }));
    return () => {
      vigente = false;
    };
  }, [dispatch, id]);

  if (cargando) {
    return (
      <Container maxWidth='lg' sx={{ py: 5 }}>
        <Skeleton variant='rounded' height={200} />
      </Container>
    );
  }

  if (!proveedor) {
    return (
      <Container maxWidth='md' sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant='h2'>{t('noDisponibleTitulo')}</Typography>
        <Typography color='text.secondary' sx={{ my: 2 }}>{t('noDisponibleTexto')}</Typography>
        <Button variant='contained' component={RouterLink} to={RUTAS_PORTAL.tours}>{t('verExperiencias')}</Button>
      </Container>
    );
  }

  const verificado = proveedor.estado_verificacion === 'aprobado';

  return (
    <Container maxWidth='lg' sx={{ py: 5 }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
          <Avatar sx={{ width: 88, height: 88, fontSize: '2.2rem', bgcolor: 'primary.main' }}>
            {proveedor.nombre_comercial.trim().charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction='row' spacing={1} alignItems='center' sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Typography variant='h1' sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>{proveedor.nombre_comercial}</Typography>
              {verificado && <Chip icon={<VerifiedIcon />} label={t('verificado')} color='primary' size='small' />}
            </Stack>
            <Stack direction='row' spacing={2} alignItems='center' sx={{ mt: 1, flexWrap: 'wrap', gap: 1, color: 'text.secondary' }}>
              {proveedor.destino_nombre && (
                <Stack direction='row' spacing={0.5} alignItems='center'>
                  <PlaceIcon fontSize='small' />
                  <Typography variant='body2'>{proveedor.destino_nombre}</Typography>
                </Stack>
              )}
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <Rating value={Number(proveedor.calificacion_promedio) || 0} precision={0.5} readOnly size='small' />
                <Typography variant='body2'>{proveedor.calificacion_promedio ?? '—'} {t('resenas', { n: proveedor.total_resenas })}</Typography>
              </Stack>
              <Typography variant='body2'>{t('experiencias', { n: proveedor.total_experiencias })}</Typography>
              {proveedor.fecha_registro && (
                <Typography variant='body2'>{t('desde', { marca: marca.nombre, año: String(proveedor.fecha_registro).substring(0, 4) })}</Typography>
              )}
              {proveedor.rnt && <Typography variant='body2'>{t('rnt', { rnt: proveedor.rnt })}</Typography>}
            </Stack>
          </Box>
        </Stack>
        <ContactoProveedor
          telefono={proveedor.telefono}
          correo={proveedor.correo}
          sitioWeb={proveedor.sitio_web}
          instagram={proveedor.instagram}
          facebook={proveedor.facebook}
          sx={{ mt: 2 }}
        />
        {proveedor.descripcion && (
          <Typography sx={{ mt: 3, whiteSpace: 'pre-line' }}>{proveedor.descripcion}</Typography>
        )}
      </Paper>

      <TituloSeccion titulo={t('susExperiencias', { proveedor: proveedor.nombre_comercial })} />
      {loading ? (
        <GrillaCargando />
      ) : experiencias.length === 0 ? (
        <Typography color='text.secondary'>{t('sinExperiencias')}</Typography>
      ) : (
        <Grid container spacing={3}>
          {experiencias.map((exp) => (
            <Grid item xs={12} sm={6} md={3} key={exp.id}>
              <ExperienceCard experiencia={exp} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProveedorPerfil;
