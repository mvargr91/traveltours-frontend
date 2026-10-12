// La pasarela devuelve aquí al viajero después del checkout: /pago/resultado?id={transacción}&pasarela={pasarela}.
// El backend consulta la transacción en la pasarela y aplica el pago (no depende de que el webhook llegue primero).
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
import { useTextos } from '@crema/context/AppContextProvider/AparienciaContextProvider';

const REINTENTOS = 6;
const ESPERA_MS = 5000;

// Icono de cada estado del pago. Título y texto son editables: claves "{estado}Titulo" y "{estado}Texto".
const ICONOS = {
  aprobado: <CheckCircleRoundedIcon color='success' sx={{ fontSize: 72 }} />,
  pendiente: <HourglassTopRoundedIcon color='warning' sx={{ fontSize: 72 }} />,
  rechazado: <CancelRoundedIcon color='error' sx={{ fontSize: 72 }} />,
  anulado: <CancelRoundedIcon color='error' sx={{ fontSize: 72 }} />,
  error: <CancelRoundedIcon color='error' sx={{ fontSize: 72 }} />,
};

const ResultadoPago = () => {
  const [searchParams] = useSearchParams();
  const t = useTextos('pago');
  const transaccionId = searchParams.get('id');
  const pasarela = searchParams.get('pasarela');
  const [resultado, setResultado] = useState(null);
  const [errorConsulta, setError] = useState('');
  const intentos = useRef(0);
  const error = transaccionId ? errorConsulta : t('sinInformacion');

  useEffect(() => {
    if (!transaccionId) return undefined;
    let temporizador;
    const consultar = () => {
      intentos.current += 1;
      jwtAxios
        .get(`publico/pagos/transaccion/${encodeURIComponent(transaccionId)}`, { params: pasarela ? { pasarela } : {} })
        .then(({ data }) => {
          setResultado(data);
          if (data.estado_pago === 'pendiente' && intentos.current < REINTENTOS) {
            temporizador = setTimeout(consultar, ESPERA_MS);
          }
        })
        .catch((e) => setError(extraerMensajeError(e)));
    };
    consultar();
    return () => clearTimeout(temporizador);
  }, [transaccionId, pasarela]);

  const estado = ICONOS[resultado?.estado_pago] ? resultado.estado_pago : 'pendiente';
  const reserva = resultado?.reserva;

  return (
    <Container maxWidth='sm' sx={{ py: 6 }}>
      <Paper sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
        {error && <Alert severity='warning'>{error}</Alert>}
        {!error && !resultado && (
          <Stack alignItems='center' spacing={2} sx={{ py: 4 }}>
            <CircularProgress />
            <Typography color='text.secondary'>{t('confirmando')}</Typography>
          </Stack>
        )}
        {resultado && (
          <>
            {ICONOS[estado]}
            <Typography variant='h2' sx={{ mt: 1 }}>{t(`${estado}Titulo`)}</Typography>
            <Typography color='text.secondary' sx={{ mt: 1 }}>{t(`${estado}Texto`)}</Typography>

            {reserva && (
              <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Typography fontWeight={700}>{reserva.experiencia_nombre}</Typography>
                <Typography variant='caption' color='text.secondary' sx={{ fontFamily: 'monospace' }}>
                  {reserva.codigo_reserva}
                </Typography>
                <Stack direction='row' spacing={1} justifyContent='center' flexWrap='wrap' useFlexGap sx={{ mt: 1.5 }}>
                  <Chip size='small' icon={<CalendarMonthIcon />} label={`${reserva.fecha} · ${aHoraCorta(reserva.hora_inicio)}`} />
                  <Chip size='small' icon={<GroupsIcon />} label={t('personas', { n: reserva.cantidad_personas })} />
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
                  {t(resultado.estado_pago === 'aprobado' || resultado.estado_pago === 'pendiente' ? 'verReserva' : 'reintentar')}
                </Button>
              )}
              <Button component={RouterLink} to={RUTAS_PORTAL.tours}>{t('seguir')}</Button>
            </Stack>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ResultadoPago;
