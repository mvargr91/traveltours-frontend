// Wompi devuelve aquí al viajero después del checkout: /pago/resultado?id={transacción}&env=test.
// El backend consulta la transacción en Wompi y aplica el pago (no depende de que el webhook llegue primero).
// Si sigue pendiente (ej. PSE en proceso) se vuelve a consultar unas veces.
import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import { aHoraCorta, formatoMoneda } from '../../../shared/constants/Turismo';
import { RUTAS_PORTAL } from '../../../shared/constants/RutasPortal';

const REINTENTOS = 6;
const ESPERA_MS = 5000;

const RESULTADOS = {
  APPROVED: {
    icono: <CheckCircleRoundedIcon color='success' sx={{ fontSize: 72 }} />,
    titulo: '¡Pago aprobado!',
    texto: 'Tu reserva quedó confirmada. Te enviamos los detalles por correo.',
  },
  PENDING: {
    icono: <HourglassTopRoundedIcon color='warning' sx={{ fontSize: 72 }} />,
    titulo: 'Pago en proceso',
    texto: 'Tu banco aún no confirma el pago. Te avisaremos por correo apenas se apruebe.',
  },
  DECLINED: {
    icono: <CancelRoundedIcon color='error' sx={{ fontSize: 72 }} />,
    titulo: 'Pago rechazado',
    texto: 'El pago no se pudo completar. Tu cupo sigue separado: puedes intentarlo de nuevo.',
  },
  VOIDED: {
    icono: <CancelRoundedIcon color='error' sx={{ fontSize: 72 }} />,
    titulo: 'Pago anulado',
    texto: 'La transacción fue anulada. Puedes intentarlo de nuevo desde tu reserva.',
  },
  ERROR: {
    icono: <CancelRoundedIcon color='error' sx={{ fontSize: 72 }} />,
    titulo: 'No se pudo procesar el pago',
    texto: 'Hubo un error con el medio de pago. Puedes intentarlo de nuevo desde tu reserva.',
  },
};

const ResultadoPago = () => {
  const [searchParams] = useSearchParams();
  const transaccionId = searchParams.get('id');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const intentos = useRef(0);

  useEffect(() => {
    if (!transaccionId) {
      setError('No recibimos la información del pago.');
      return undefined;
    }
    let temporizador;
    const consultar = () => {
      intentos.current += 1;
      jwtAxios
        .get(`publico/pagos/transaccion/${encodeURIComponent(transaccionId)}`)
        .then(({ data }) => {
          setResultado(data);
          if (data.estado_pago === 'PENDING' && intentos.current < REINTENTOS) {
            temporizador = setTimeout(consultar, ESPERA_MS);
          }
        })
        .catch((e) => setError(extraerMensajeError(e)));
    };
    consultar();
    return () => clearTimeout(temporizador);
  }, [transaccionId]);

  const info = RESULTADOS[resultado?.estado_pago] ?? RESULTADOS.PENDING;
  const reserva = resultado?.reserva;

  return (
    <Container maxWidth='sm' sx={{ py: 6 }}>
      <Paper sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
        {error && <Alert severity='warning'>{error}</Alert>}
        {!error && !resultado && (
          <Stack alignItems='center' spacing={2} sx={{ py: 4 }}>
            <CircularProgress />
            <Typography color='text.secondary'>Confirmando tu pago con Wompi…</Typography>
          </Stack>
        )}
        {resultado && (
          <>
            {info.icono}
            <Typography variant='h2' sx={{ mt: 1 }}>{info.titulo}</Typography>
            <Typography color='text.secondary' sx={{ mt: 1 }}>{info.texto}</Typography>

            {reserva && (
              <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Typography fontWeight={700}>{reserva.experiencia_nombre}</Typography>
                <Typography variant='caption' color='text.secondary' sx={{ fontFamily: 'monospace' }}>
                  {reserva.codigo_reserva}
                </Typography>
                <Stack direction='row' spacing={1} justifyContent='center' flexWrap='wrap' useFlexGap sx={{ mt: 1.5 }}>
                  <Chip size='small' icon={<CalendarMonthIcon />} label={`${reserva.fecha} · ${aHoraCorta(reserva.hora_inicio)}`} />
                  <Chip size='small' icon={<GroupsIcon />} label={`${reserva.cantidad_personas} persona(s)`} />
                  <Chip size='small' color='primary' variant='outlined' label={formatoMoneda(reserva.valor_total)} />
                </Stack>
              </Box>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent='center' sx={{ mt: 3 }}>
              {reserva && (
                <Button
                  variant='contained'
                  component={RouterLink}
                  to={`${RUTAS_PORTAL.consultarReserva}?codigo=${reserva.codigo_reserva}`}
                  state={{ correo: reserva.correo }}
                >
                  {resultado.estado_pago === 'APPROVED' || resultado.estado_pago === 'PENDING' ? 'Ver mi reserva' : 'Intentar de nuevo'}
                </Button>
              )}
              <Button component={RouterLink} to={RUTAS_PORTAL.tours}>Seguir explorando</Button>
            </Stack>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ResultadoPago;
