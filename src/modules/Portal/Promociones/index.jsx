import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { onGetColeccion } from '@crema/redux/features/portalPromociones/portalPromocionesSlice';
import ExperienceCard from '../../../shared/components/Portal/ExperienceCard';
import { GrillaCargando, TituloSeccion } from '../../../shared/components/Portal/Secciones';
import { formatoMoneda } from '../../../shared/constants/Turismo';
import { useApariencia, useTextos } from '@crema/context/AppContextProvider/AparienciaContextProvider';

const etiquetaDescuento = (p, t) =>
  p.tipo_descuento === 'porcentaje'
    ? t('descuentoPorcentaje', { valor: Number(p.valor_descuento) })
    : t('descuentoValor', { valor: formatoMoneda(p.valor_descuento) });

const Promociones = () => {
  const dispatch = useDispatch();
  const { gradienteFranja } = useApariencia().apariencia;
  const t = useTextos('promociones');
  const { rows: promociones, loading } = useSelector((state) => state.portalPromociones);

  useEffect(() => {
    dispatch(onGetColeccion());
  }, [dispatch]);

  return (
    <Container maxWidth='lg' sx={{ py: 5 }}>
      <TituloSeccion titulo={t('titulo')} subtitulo={t('subtitulo')} />
      {loading && <GrillaCargando />}
      {!loading && promociones.length === 0 && (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant='h4'>{t('sinPromociones')}</Typography>
        </Paper>
      )}
      <Stack spacing={5}>
        {promociones.map((promo) => (
          <Box key={promo.id}>
            <Paper sx={{ p: 3, mb: 2.5, borderTop: '4px solid transparent', borderImage: `${gradienteFranja} 1` }}>
              <Stack direction='row' spacing={2} alignItems='center' sx={{ flexWrap: 'wrap', gap: 1 }}>
                <LocalOfferIcon color='secondary' />
                <Typography variant='h3'>{promo.nombre}</Typography>
                <Chip color='secondary' label={etiquetaDescuento(promo, t)} />
                <Typography variant='body2' color='text.secondary' sx={{ ml: 'auto !important' }}>
                  {t('vigencia', { inicio: promo.fecha_inicio, fin: promo.fecha_fin })}
                </Typography>
              </Stack>
              {promo.descripcion && <Typography color='text.secondary' sx={{ mt: 1 }}>{promo.descripcion}</Typography>}
            </Paper>
            <Grid container spacing={3}>
              {promo.experiencias.map((exp) => (
                <Grid item xs={12} sm={6} md={3} key={exp.id}>
                  <ExperienceCard experiencia={{ ...exp, promocion_id: promo.id }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Stack>
    </Container>
  );
};

export default Promociones;
