// Consulta de una reserva hecha sin cuenta: código + correo (GET publico/reservas/{codigo}?correo=).
// El código llega por query string desde la confirmación; el correo por el state de la navegación.
import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useSearchParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { Alert, Box, Button, Chip, Container, Divider, Link, Paper, Stack, Typography } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import MyTextField from '../../../shared/components/MyTextField';
import { TituloSeccion } from '../../../shared/components/Portal/Secciones';
import { ESTADOS_RESERVA, aHoraCorta, colorDe, formatoMoneda, nombreDe } from '../../../shared/constants/Turismo';
import { RUTAS_PORTAL } from '../../../shared/constants/RutasPortal';
import { irAPagar } from '../../../shared/functions/Pagos';
import { useTextos } from '@crema/context/AppContextProvider/AparienciaContextProvider';

// c: textos comunes de formularios (useTextos('comunes')).
const crearValidacion = (c) =>
  yup.object({
    codigo: yup.string().trim().required(c('requerido')).max(30),
    correo: yup.string().trim().required(c('requerido')).email(c('correoInvalido')),
  });

// Estado de la reserva -> clave de su mensaje en los textos editables.
const MENSAJE_ESTADO = {
  pendiente: 'estadoPendiente',
  pendiente_pago: 'estadoPendientePago',
  aceptada: 'estadoAceptada',
  rechazada: 'estadoRechazada',
  cancelada: 'estadoCancelada',
  finalizada: 'estadoFinalizada',
};

const Fila = ({ etiqueta, valor }) =>
  valor ? (
    <Stack direction='row' justifyContent='space-between' spacing={2}>
      <Typography color='text.secondary'>{etiqueta}</Typography>
      <Typography textAlign='right'>{valor}</Typography>
    </Stack>
  ) : null;

const ConsultarReserva = () => {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const t = useTextos('consulta');
  const c = useTextos('comunes');
  const validacion = useMemo(() => crearValidacion(c), [c]);
  const [reserva, setReserva] = useState(null);
  const [error, setError] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  const pagar = () => {
    setPagando(true);
    setErrorPago('');
    irAPagar({ codigo: reserva.codigo_reserva, correo: reserva.correo }).catch((e) => {
      setPagando(false);
      setErrorPago(e.message);
    });
  };

  const initialValues = { codigo: searchParams.get('codigo') ?? '', correo: state?.correo ?? '' };

  const buscar = ({ codigo, correo }) => {
    setBuscando(true);
    setError('');
    jwtAxios
      .get(`publico/reservas/${encodeURIComponent(codigo.trim())}`, { params: { correo: correo.trim() } })
      .then(({ data }) => setReserva(data))
      .catch((e) => {
        setReserva(null);
        setError(extraerMensajeError(e));
      })
      .finally(() => setBuscando(false));
  };

  // Desde la confirmación ya vienen los dos datos: se consulta de una vez.
  useEffect(() => {
    if (initialValues.codigo && initialValues.correo) buscar(initialValues);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container maxWidth='sm' sx={{ py: 5 }}>
      <TituloSeccion titulo={t('titulo')} subtitulo={t('subtitulo')} />

      <Paper sx={{ p: 3 }}>
        <Formik initialValues={initialValues} validationSchema={validacion} onSubmit={buscar}>
          <Form noValidate>
            <Stack spacing={2}>
              <MyTextField name='codigo' label={t('codigo')} placeholder={t('codigoPlaceholder')} fullWidth required />
              <MyTextField name='correo' label={t('correo')} type='email' fullWidth required autoComplete='email' />
              <Button type='submit' variant='contained' size='large' disabled={buscando}>
                {t(buscando ? 'buscando' : 'consultar')}
              </Button>
            </Stack>
          </Form>
        </Formik>
        {error && <Alert severity='warning' sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {reserva && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Stack direction='row' alignItems='center' spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <ConfirmationNumberIcon color='primary' />
            <Typography variant='h4' sx={{ fontFamily: 'monospace' }}>{reserva.codigo_reserva}</Typography>
            <Chip
              label={nombreDe(ESTADOS_RESERVA, reserva.estado)}
              sx={{ ml: 'auto !important', color: '#fff', bgcolor: colorDe(ESTADOS_RESERVA, reserva.estado) }}
            />
          </Stack>
          {MENSAJE_ESTADO[reserva.estado] && (
            <Typography color='text.secondary' sx={{ mt: 1.5 }}>{t(MENSAJE_ESTADO[reserva.estado])}</Typography>
          )}
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1}>
            <Fila
              etiqueta={t('experiencia')}
              valor={
                <Link component={RouterLink} to={RUTAS_PORTAL.tour(reserva.experiencia_slug)}>
                  {reserva.experiencia_nombre}
                </Link>
              }
            />
            <Fila etiqueta={t('fecha')} valor={`${reserva.fecha} · ${aHoraCorta(reserva.hora_inicio)}`} />
            <Fila etiqueta={t('personas')} valor={reserva.cantidad_personas} />
            <Fila etiqueta={t('titular')} valor={reserva.nombre} />
            <Fila etiqueta={t('puntoEncuentro')} valor={reserva.punto_encuentro} />
            <Fila etiqueta={t('proveedor')} valor={reserva.proveedor_nombre} />
            <Fila etiqueta={t('contactoProveedor')} valor={reserva.proveedor_telefono} />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction='row' justifyContent='space-between'>
            <Typography fontWeight={700}>{t('total')}</Typography>
            <Typography fontWeight={700}>{formatoMoneda(reserva.valor_total)}</Typography>
          </Stack>
          {reserva.estado === 'pendiente_pago' && (
            <>
              <Button
                fullWidth
                size='large'
                variant='contained'
                startIcon={<CreditCardIcon />}
                sx={{ mt: 2.5 }}
                disabled={pagando}
                onClick={pagar}
              >
                {t(pagando ? 'llevandoPasarela' : 'pagarAhora')}
              </Button>
              {errorPago && <Alert severity='warning' sx={{ mt: 2 }}>{errorPago}</Alert>}
            </>
          )}
        </Paper>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary'>
          {t('quieresCuenta')}{' '}
          <Link component={RouterLink} to={RUTAS_PORTAL.registro}>{t('creaCuenta')}</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default ConsultarReserva;
