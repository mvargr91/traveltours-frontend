// Tarjeta de reserva del detalle. Se puede reservar sin cuenta:
//  - Con sesión: slice de reservas (onCreate); el backend fuerza usuario y proveedor según el token.
//  - Sin sesión: POST publico/reservas; el backend calcula el valor y devuelve el código para consultarla.
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { onCreate as onCrearReserva } from '@crema/redux/features/reservas/reservasSlice';
import { onCreate as onCrearReservaInvitado } from '@crema/redux/features/portalReservas/portalReservasSlice';
import MyTextField from '../../../shared/components/MyTextField';
import { aHoraCorta, esPagoEnLinea, formatoMoneda } from '../../../shared/constants/Turismo';
import { RUTAS_PORTAL } from '../../../shared/constants/RutasPortal';
import { irAPagarConWompi } from '../../../shared/functions/Pagos';

const validacionContacto = yup.object({
  nombre: yup.string().required('Requerido').max(150),
  correo: yup.string().required('Requerido').email('Correo inválido'),
  telefono: yup.string().required('Requerido').max(30).matches(/^[+]?[0-9\s-]*$/, 'Teléfono inválido'),
  observaciones: yup.string().max(1000, 'Máximo 1000 caracteres'),
});

// Descuento de la promoción vigente sobre el total.
export const calcularTotal = (precio, personas, promocion) => {
  const subtotal = Number(precio || 0) * Number(personas || 0);
  if (!promocion) return { subtotal, descuento: 0, total: subtotal };
  const descuento = promocion.tipo_descuento === 'porcentaje'
    ? Math.round((subtotal * Number(promocion.valor_descuento)) / 100)
    : Math.min(Number(promocion.valor_descuento), subtotal);
  return { subtotal, descuento, total: subtotal - descuento };
};

// Pantalla final de la reserva: el código es lo único que necesita el viajero para consultarla.
// Si la experiencia es de pago en línea, lleva de una vez al checkout de Wompi (con reintento manual).
const ReservaConfirmada = ({ reserva, onCerrar }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  const pendientePago = reserva.estado === 'pendiente_pago';

  const copiar = () => {
    navigator.clipboard?.writeText(reserva.codigo_reserva).then(() => setCopiado(true)).catch(() => {});
  };

  const pagar = () => {
    setPagando(true);
    setErrorPago('');
    irAPagarConWompi({ codigo: reserva.codigo_reserva, correo: reserva.correo }).catch((error) => {
      setPagando(false);
      setErrorPago(error.message);
    });
  };

  useEffect(() => {
    if (pendientePago) pagar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
        <CheckCircleRoundedIcon color='success' sx={{ fontSize: 64 }} />
        {pendientePago ? (
          <>
            <Typography variant='h3' sx={{ mt: 1 }}>¡Cupo separado!</Typography>
            <Typography color='text.secondary' sx={{ mt: 1 }}>
              {pagando
                ? 'Te estamos llevando a Wompi para pagar de forma segura…'
                : 'Paga en línea para confirmar tu reserva.'}
            </Typography>
            {pagando && <LinearProgress sx={{ mt: 2 }} />}
            {errorPago && <Alert severity='warning' sx={{ mt: 2, textAlign: 'left' }}>{errorPago}</Alert>}
          </>
        ) : (
          <>
            <Typography variant='h3' sx={{ mt: 1 }}>¡Solicitud enviada!</Typography>
            <Typography color='text.secondary' sx={{ mt: 1 }}>
              {reserva.proveedor_nombre} revisará tu reserva y te contactará a <b>{reserva.correo}</b>.
            </Typography>
          </>
        )}

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            border: `1px dashed ${theme.palette.primary.main}`,
            bgcolor: alpha(theme.palette.primary.main, 0.06),
          }}
        >
          <Typography variant='caption' color='text.secondary'>Tu código de reserva</Typography>
          <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
            <Typography variant='h2' sx={{ letterSpacing: 1, fontFamily: 'monospace' }}>
              {reserva.codigo_reserva}
            </Typography>
            <Tooltip title={copiado ? '¡Copiado!' : 'Copiar código'}>
              <IconButton size='small' onClick={copiar} aria-label='Copiar código'>
                <ContentCopyIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography variant='caption' color='text.secondary'>Guárdalo para consultar el estado.</Typography>
        </Box>

        <Stack direction='row' spacing={1} justifyContent='center' flexWrap='wrap' useFlexGap sx={{ mt: 2 }}>
          <Chip icon={<CalendarMonthIcon />} label={`${reserva.fecha} · ${aHoraCorta(reserva.hora_inicio)}`} />
          <Chip icon={<GroupsIcon />} label={`${reserva.cantidad_personas} persona(s)`} />
          <Chip color='primary' variant='outlined' label={formatoMoneda(reserva.valor_total)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCerrar} disabled={pagando}>Cerrar</Button>
        {pendientePago ? (
          <Button variant='contained' startIcon={<CreditCardIcon />} onClick={pagar} disabled={pagando}>
            Pagar ahora
          </Button>
        ) : (
          <Button
            variant='contained'
            onClick={() =>
              navigate(`${RUTAS_PORTAL.consultarReserva}?codigo=${reserva.codigo_reserva}`, {
                state: { correo: reserva.correo },
              })
            }
          >
            Ver estado
          </Button>
        )}
      </DialogActions>
    </>
  );
};

ReservaConfirmada.propTypes = {
  reserva: PropTypes.object.isRequired,
  onCerrar: PropTypes.func.isRequired,
};

const ReservaWidget = ({ experiencia }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const pantallaChica = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const guardandoCliente = useSelector((state) => state.reservas.saving);
  const guardandoInvitado = useSelector((state) => state.portalReservas.saving);
  const [disponibilidadId, setDisponibilidadId] = useState(experiencia.disponibilidad[0]?.id ?? '');
  const [personas, setPersonas] = useState(1);
  const [confirmando, setConfirmando] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);

  const pagoEnLinea = esPagoEnLinea(experiencia);
  const disponibilidad = experiencia.disponibilidad.find((d) => d.id === disponibilidadId);
  const maxPersonas = disponibilidad?.cupos_disponibles ?? experiencia.capacidad_maxima ?? 20;
  const { subtotal, descuento, total } = useMemo(
    () => calcularTotal(experiencia.precio_desde, personas, experiencia.promocion),
    [experiencia, personas],
  );

  const cerrar = () => {
    setConfirmando(false);
    setReservaConfirmada(null);
  };

  // Con sesión: va a "Mis reservas", salvo pago en línea, que muestra la confirmación y lleva a Wompi.
  const enviarCliente = (contacto) => {
    dispatch(
      onCrearReserva({
        params: {
          ...contacto,
          usuario_id: user?.usuario?.id,
          experiencia_id: experiencia.id,
          proveedor_id: experiencia.proveedor_id,
          disponibilidad_id: disponibilidad?.id ?? null,
          fecha: disponibilidad?.fecha,
          hora_inicio: aHoraCorta(disponibilidad?.hora_inicio),
          cantidad_personas: personas,
          cantidad_chicos: 0,
          idioma: experiencia.idioma,
          valor_total: total,
        },
      }),
    )
      .unwrap()
      .then((reserva) => {
        if (reserva?.estado === 'pendiente_pago') {
          setReservaConfirmada(reserva);
        } else {
          cerrar();
          navigate('/mis-reservas');
        }
      })
      .catch(() => {}); // El error ya se muestra con el mensaje global.
  };

  const enviarInvitado = (contacto) => {
    dispatch(
      onCrearReservaInvitado({
        params: {
          ...contacto,
          experiencia_id: experiencia.id,
          disponibilidad_id: disponibilidad?.id,
          cantidad_personas: personas,
        },
      }),
    )
      .unwrap()
      .then(setReservaConfirmada)
      .catch(() => {}); // El error ya se muestra con el mensaje global.
  };

  return (
    <Paper sx={{ p: 3, position: { md: 'sticky' }, top: { md: 100 } }}>
      <Typography variant='caption' color='text.secondary'>Desde</Typography>
      <Typography variant='h2' color='primary.main'>
        {formatoMoneda(experiencia.precio_desde)}
        <Typography component='span' color='text.secondary'> / persona</Typography>
      </Typography>
      {experiencia.promocion && (
        <Alert severity='success' sx={{ mt: 1 }}>
          {experiencia.promocion.nombre}:{' '}
          {experiencia.promocion.tipo_descuento === 'porcentaje'
            ? `${Number(experiencia.promocion.valor_descuento)}% de descuento`
            : `${formatoMoneda(experiencia.promocion.valor_descuento)} de descuento`}{' '}
          hasta {experiencia.promocion.fecha_fin}
        </Alert>
      )}

      <Stack spacing={2} sx={{ mt: 2.5 }}>
        {experiencia.disponibilidad.length > 0 ? (
          <TextField select label='Fecha y hora' value={disponibilidadId} onChange={(e) => setDisponibilidadId(e.target.value)}>
            {experiencia.disponibilidad.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.fecha} · {aHoraCorta(d.hora_inicio)} ({d.cupos_disponibles} cupos)
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <Alert severity='info'>No hay fechas publicadas. Pronto el proveedor abrirá nuevos cupos.</Alert>
        )}
        <TextField
          type='number'
          label='Personas'
          value={personas}
          inputProps={{ min: 1, max: maxPersonas }}
          onChange={(e) => setPersonas(Math.max(1, Math.min(maxPersonas, Number(e.target.value) || 1)))}
        />
      </Stack>

      <Box sx={{ mt: 2.5 }}>
        <Stack direction='row' justifyContent='space-between'>
          <Typography color='text.secondary'>{formatoMoneda(experiencia.precio_desde)} × {personas}</Typography>
          <Typography>{formatoMoneda(subtotal)}</Typography>
        </Stack>
        {descuento > 0 && (
          <Stack direction='row' justifyContent='space-between' sx={{ color: 'success.main' }}>
            <Typography>Descuento</Typography>
            <Typography>- {formatoMoneda(descuento)}</Typography>
          </Stack>
        )}
        <Divider sx={{ my: 1 }} />
        <Stack direction='row' justifyContent='space-between'>
          <Typography fontWeight={700}>Total estimado</Typography>
          <Typography fontWeight={700}>{formatoMoneda(total)}</Typography>
        </Stack>
      </Box>

      <Button
        fullWidth
        size='large'
        variant='contained'
        startIcon={pagoEnLinea ? <CreditCardIcon /> : <EventAvailableIcon />}
        sx={{ mt: 2.5 }}
        disabled={!disponibilidad}
        onClick={() => setConfirmando(true)}
      >
        {pagoEnLinea ? 'Reservar y pagar' : 'Reservar ahora'}
      </Button>
      <Typography variant='caption' color='text.secondary' component='p' sx={{ mt: 1, textAlign: 'center' }}>
        {pagoEnLinea && 'Pago en línea: tu reserva se confirma al pagar.'}
        {!pagoEnLinea && isAuthenticated && 'El proveedor confirmará tu reserva. Podrás verla en “Mis reservas”.'}
        {!pagoEnLinea && !isAuthenticated && 'Sin registro y sin pago ahora. El proveedor confirmará tu reserva.'}
      </Typography>

      <Dialog open={confirmando} onClose={cerrar} maxWidth='xs' fullWidth fullScreen={pantallaChica}>
        {reservaConfirmada ? (
          <ReservaConfirmada reserva={reservaConfirmada} onCerrar={cerrar} />
        ) : (
          <Formik
            initialValues={{
              nombre: user?.usuario?.nombre ?? '',
              correo: user?.usuario?.correo_electronico ?? '',
              telefono: user?.usuario?.telefono ?? '',
              observaciones: '',
            }}
            validationSchema={validacionContacto}
            onSubmit={isAuthenticated ? enviarCliente : enviarInvitado}
          >
            <Form noValidate>
              <DialogTitle>Completa tu reserva</DialogTitle>
              <DialogContent>
                <Box sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                  <Typography fontWeight={700}>{experiencia.nombre}</Typography>
                  <Stack direction='row' justifyContent='space-between' sx={{ mt: 0.5 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {disponibilidad?.fecha} · {aHoraCorta(disponibilidad?.hora_inicio)} · {personas} persona(s)
                    </Typography>
                    <Typography variant='body2' fontWeight={700}>{formatoMoneda(total)}</Typography>
                  </Stack>
                </Box>
                <Stack spacing={2}>
                  <MyTextField name='nombre' label='Nombre completo' fullWidth required autoComplete='name' />
                  <MyTextField name='correo' label='Correo' type='email' fullWidth required autoComplete='email' />
                  <MyTextField name='telefono' label='Teléfono / WhatsApp' fullWidth required autoComplete='tel' />
                  <MyTextField name='observaciones' label='Comentarios para el proveedor (opcional)' fullWidth multiline minRows={2} />
                </Stack>
                {!isAuthenticated && (
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                    ¿Ya tienes cuenta?{' '}
                    <Link component={RouterLink} to={`/signin?redirect=${RUTAS_PORTAL.tour(experiencia.slug)}`}>
                      Ingresa
                    </Link>{' '}
                    para verla luego en “Mis reservas”.
                  </Typography>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={cerrar}>Cancelar</Button>
                <Button type='submit' variant='contained' disabled={guardandoCliente || guardandoInvitado}>
                  {pagoEnLinea ? 'Reservar y pagar' : 'Confirmar reserva'}
                </Button>
              </DialogActions>
            </Form>
          </Formik>
        )}
      </Dialog>
    </Paper>
  );
};

ReservaWidget.propTypes = {
  experiencia: PropTypes.object.isRequired,
};

export default ReservaWidget;
