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
import BotonWhatsApp from '../../../shared/components/Portal/BotonWhatsApp';
import { aHoraCorta, descuentoCupon, esPagoEnLinea, formatoMoneda, rangoFechas, valorPorPersona } from '../../../shared/constants/Turismo';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import CalendarioFechas from './CalendarioFechas';
import { RUTAS_PORTAL } from '../../../shared/constants/RutasPortal';
import { irAPagar } from '../../../shared/functions/Pagos';
import { useTextos } from '@crema/context/AppContextProvider/AparienciaContextProvider';
import { conNegrita } from '../../../shared/constants/TextosPortal';

// c: textos comunes de formularios (useTextos('comunes')).
const validacionContacto = (c) =>
  yup.object({
    nombre: yup.string().required(c('requerido')).max(150),
    correo: yup.string().required(c('requerido')).email(c('correoInvalido')),
    telefono: yup.string().required(c('requerido')).max(30).matches(/^[+]?[0-9\s-]*$/, c('telefonoInvalido')),
    observaciones: yup.string().max(1000, c('maximo', { n: 1000 })),
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
// Si la experiencia es de pago en línea, lleva de una vez al checkout de la pasarela (con reintento manual).
const ReservaConfirmada = ({ reserva, dias, fechaFin, porcentajeAbono, onCerrar }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTextos('reserva');
  const [copiado, setCopiado] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  const pendientePago = reserva.estado === 'pendiente_pago';
  // Con abono el viajero elige cuánto pagar; sin abono se va directo al checkout. El monto real lo fija el backend.
  const abono = pendientePago && porcentajeAbono ? Math.round((Number(reserva.valor_total) * porcentajeAbono) / 100) : 0;

  const copiar = () => {
    navigator.clipboard?.writeText(reserva.codigo_reserva).then(() => setCopiado(true)).catch(() => {});
  };

  const pagar = (concepto = 'total') => {
    setPagando(true);
    setErrorPago('');
    irAPagar({ codigo: reserva.codigo_reserva, correo: reserva.correo, concepto }).catch((error) => {
      setPagando(false);
      setErrorPago(error.message);
    });
  };

  useEffect(() => {
    if (pendientePago && !abono) pagar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
        <CheckCircleRoundedIcon color='success' sx={{ fontSize: 64 }} />
        {pendientePago ? (
          <>
            <Typography variant='h3' sx={{ mt: 1 }}>{t('cupoSeparado')}</Typography>
            <Typography color='text.secondary' sx={{ mt: 1 }}>
              {t(pagando ? 'llevandoPasarela' : abono ? 'eligePago' : 'pagaParaConfirmar')}
            </Typography>
            {pagando && <LinearProgress sx={{ mt: 2 }} />}
            {errorPago && <Alert severity='warning' sx={{ mt: 2, textAlign: 'left' }}>{errorPago}</Alert>}
          </>
        ) : (
          <>
            <Typography variant='h3' sx={{ mt: 1 }}>{t('solicitudEnviada')}</Typography>
            <Typography color='text.secondary' sx={{ mt: 1 }}>
              {conNegrita(t('proveedorContactara', { proveedor: reserva.proveedor_nombre, correo: reserva.correo }))}
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
          <Typography variant='caption' color='text.secondary'>{t('tuCodigo')}</Typography>
          <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
            <Typography variant='h2' sx={{ letterSpacing: 1, fontFamily: 'monospace' }}>
              {reserva.codigo_reserva}
            </Typography>
            <Tooltip title={t(copiado ? 'copiado' : 'copiar')}>
              <IconButton size='small' onClick={copiar} aria-label={t('copiar')}>
                <ContentCopyIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography variant='caption' color='text.secondary'>{t('guardalo')}</Typography>
        </Box>

        <Stack direction='row' spacing={1} justifyContent='center' flexWrap='wrap' useFlexGap sx={{ mt: 2 }}>
          <Chip icon={<CalendarMonthIcon />} label={`${rangoFechas(reserva.fecha, dias, fechaFin)} · ${aHoraCorta(reserva.hora_inicio)}`} />
          <Chip icon={<GroupsIcon />} label={t('resumenPersonas', { n: reserva.cantidad_personas })} />
          <Chip color='primary' variant='outlined' label={formatoMoneda(reserva.valor_total)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onCerrar} disabled={pagando}>{t('cerrar')}</Button>
        {pendientePago && abono ? (
          <>
            <Button variant='outlined' onClick={() => pagar('abono')} disabled={pagando}>
              {t('pagarAbono', { valor: formatoMoneda(abono) })}
            </Button>
            <Button variant='contained' startIcon={<CreditCardIcon />} onClick={() => pagar('total')} disabled={pagando}>
              {t('pagarTotal', { valor: formatoMoneda(reserva.valor_total) })}
            </Button>
          </>
        ) : pendientePago ? (
          <Button variant='contained' startIcon={<CreditCardIcon />} onClick={() => pagar()} disabled={pagando}>
            {t('pagarAhora')}
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
            {t('verEstado')}
          </Button>
        )}
      </DialogActions>
    </>
  );
};

ReservaConfirmada.propTypes = {
  reserva: PropTypes.object.isRequired,
  dias: PropTypes.number,
  fechaFin: PropTypes.string,
  porcentajeAbono: PropTypes.number,
  onCerrar: PropTypes.func.isRequired,
};

const ReservaWidget = ({ experiencia }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTextos('reserva');
  const c = useTextos('comunes');
  const validacion = useMemo(() => validacionContacto(c), [c]);
  const pantallaChica = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const guardandoCliente = useSelector((state) => state.reservas.saving);
  const guardandoInvitado = useSelector((state) => state.portalReservas.saving);
  const [disponibilidadId, setDisponibilidadId] = useState(experiencia.disponibilidad[0]?.id ?? '');
  const [personas, setPersonas] = useState(1);
  const [confirmando, setConfirmando] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [mostrarCupon, setMostrarCupon] = useState(false);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cupon, setCupon] = useState(null);
  const [errorCupon, setErrorCupon] = useState('');
  const [validandoCupon, setValidandoCupon] = useState(false);

  const pagoEnLinea = esPagoEnLinea(experiencia);
  const dias = Number(experiencia.duracion_dias) || undefined;
  const porcentajeAbono = (pagoEnLinea && Number(experiencia.porcentaje_abono)) || undefined;
  const disponibilidad = experiencia.disponibilidad.find((d) => d.id === disponibilidadId);
  const maxPersonas = disponibilidad?.cupos_disponibles ?? experiencia.capacidad_maxima ?? 20;
  // El valor por persona depende del tamaño del grupo (1 persona puede pagar más que un grupo).
  const valorPersona = useMemo(
    () => valorPorPersona(experiencia.precios, personas, experiencia.precio_desde),
    [experiencia, personas],
  );
  const { subtotal, descuento, total: totalConPromocion } = useMemo(
    () => calcularTotal(valorPersona, personas, experiencia.promocion),
    [valorPersona, personas, experiencia.promocion],
  );
  // El cupón se aplica sobre lo que queda después de la promoción (igual que el backend, que es quien
  // vuelve a validar el cupón y fija el valor al crear la reserva).
  const descuentoDelCupon = descuentoCupon(cupon, totalConPromocion);
  const total = totalConPromocion - descuentoDelCupon;

  const aplicarCupon = () => {
    const codigo = codigoCupon.trim();
    if (!codigo) return;
    setValidandoCupon(true);
    setErrorCupon('');
    jwtAxios
      .get('publico/cupones/validar', { params: { codigo, experiencia_id: experiencia.id, personas } })
      .then(({ data }) => setCupon(data.datos.cupon))
      .catch((e) => {
        setCupon(null);
        setErrorCupon(extraerMensajeError(e));
      })
      .finally(() => setValidandoCupon(false));
  };

  const quitarCupon = () => {
    setCupon(null);
    setCodigoCupon('');
    setErrorCupon('');
  };

  const cerrar = () => {
    setConfirmando(false);
    setReservaConfirmada(null);
  };

  // Con sesión: va a "Mis reservas", salvo pago en línea, que muestra la confirmación y lleva al checkout.
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
          codigo_cupon: cupon?.codigo ?? null,
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
          codigo_cupon: cupon?.codigo ?? null,
        },
      }),
    )
      .unwrap()
      .then(setReservaConfirmada)
      .catch(() => {}); // El error ya se muestra con el mensaje global.
  };

  return (
    <Paper sx={{ p: 3, position: { md: 'sticky' }, top: { md: 100 } }}>
      <Typography variant='caption' color='text.secondary'>{t('desde')}</Typography>
      <Typography variant='h2' color='primary.main'>
        {formatoMoneda(experiencia.precio_desde)}
        <Typography component='span' color='text.secondary'> {t('porPersona')}</Typography>
      </Typography>
      {experiencia.promocion && (
        <Alert severity='success' sx={{ mt: 1 }}>
          {experiencia.promocion.tipo_descuento === 'porcentaje'
            ? t('promoPorcentaje', {
                nombre: experiencia.promocion.nombre,
                valor: Number(experiencia.promocion.valor_descuento),
                fecha: experiencia.promocion.fecha_fin,
              })
            : t('promoValor', {
                nombre: experiencia.promocion.nombre,
                valor: formatoMoneda(experiencia.promocion.valor_descuento),
                fecha: experiencia.promocion.fecha_fin,
              })}
        </Alert>
      )}

      <Stack spacing={2} sx={{ mt: 2.5 }}>
        {experiencia.disponibilidad.length > 0 ? (
          <CalendarioFechas
            disponibilidad={experiencia.disponibilidad}
            value={disponibilidadId}
            onChange={setDisponibilidadId}
            duracionDias={dias}
          />
        ) : (
          <Alert severity='info'>{t('sinFechas')}</Alert>
        )}
        <TextField
          type='number'
          label={t('personas')}
          value={personas}
          inputProps={{ min: 1, max: maxPersonas }}
          onChange={(e) => setPersonas(Math.max(1, Math.min(maxPersonas, Number(e.target.value) || 1)))}
        />
      </Stack>

      <Box sx={{ mt: 2.5 }}>
        <Stack direction='row' justifyContent='space-between'>
          <Typography color='text.secondary'>{formatoMoneda(valorPersona)} × {personas}</Typography>
          <Typography>{formatoMoneda(subtotal)}</Typography>
        </Stack>
        {descuento > 0 && (
          <Stack direction='row' justifyContent='space-between' sx={{ color: 'success.main' }}>
            <Typography>{t('descuento')}</Typography>
            <Typography>- {formatoMoneda(descuento)}</Typography>
          </Stack>
        )}
        {descuentoDelCupon > 0 && (
          <Stack direction='row' justifyContent='space-between' sx={{ color: 'success.main' }}>
            <Typography>{t('cuponResumen', { codigo: cupon.codigo })}</Typography>
            <Typography>- {formatoMoneda(descuentoDelCupon)}</Typography>
          </Stack>
        )}
        <Divider sx={{ my: 1 }} />
        <Stack direction='row' justifyContent='space-between'>
          <Typography fontWeight={700}>{t('totalEstimado')}</Typography>
          <Typography fontWeight={700}>{formatoMoneda(total)}</Typography>
        </Stack>
      </Box>

      <Box sx={{ mt: 2 }}>
        {cupon ? (
          <Stack direction='row' alignItems='center' spacing={1}>
            <Chip color='success' label={cupon.codigo} onDelete={quitarCupon} />
            <Button size='small' onClick={quitarCupon}>{t('cuponQuitar')}</Button>
          </Stack>
        ) : mostrarCupon ? (
          <Stack direction='row' spacing={1} alignItems='flex-start'>
            <TextField
              size='small'
              fullWidth
              label={t('cuponCampo')}
              value={codigoCupon}
              onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && aplicarCupon()}
              error={Boolean(errorCupon)}
              helperText={errorCupon || ' '}
              inputProps={{ maxLength: 40 }}
            />
            <Button variant='outlined' onClick={aplicarCupon} disabled={validandoCupon || !codigoCupon.trim()} sx={{ height: 40 }}>
              {t('cuponAplicar')}
            </Button>
          </Stack>
        ) : (
          <Link component='button' variant='body2' onClick={() => setMostrarCupon(true)}>
            {t('cuponPregunta')}
          </Link>
        )}
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
        {t(pagoEnLinea ? 'reservarPagar' : 'reservarAhora')}
      </Button>
      <Typography variant='caption' color='text.secondary' component='p' sx={{ mt: 1, textAlign: 'center' }}>
        {pagoEnLinea && t('notaPagoEnLinea')}
        {porcentajeAbono && ` ${t('notaAbono', { porcentaje: porcentajeAbono, valor: formatoMoneda(Math.round((total * porcentajeAbono) / 100)) })}`}
        {!pagoEnLinea && isAuthenticated && t('notaConCuenta')}
        {!pagoEnLinea && !isAuthenticated && t('notaSinCuenta')}
      </Typography>
      <BotonWhatsApp experiencia={experiencia} disponibilidad={disponibilidad} personas={personas} sx={{ mt: 1.5 }} />

      <Dialog open={confirmando} onClose={cerrar} maxWidth='xs' fullWidth fullScreen={pantallaChica}>
        {reservaConfirmada ? (
          <ReservaConfirmada reserva={reservaConfirmada} dias={dias} fechaFin={disponibilidad?.fecha_fin ?? undefined} porcentajeAbono={porcentajeAbono} onCerrar={cerrar} />
        ) : (
          <Formik
            initialValues={{
              nombre: user?.usuario?.nombre ?? '',
              correo: user?.usuario?.correo_electronico ?? '',
              telefono: user?.usuario?.telefono ?? '',
              observaciones: '',
            }}
            validationSchema={validacion}
            onSubmit={isAuthenticated ? enviarCliente : enviarInvitado}
          >
            <Form noValidate>
              <DialogTitle>{t('dialogoTitulo')}</DialogTitle>
              <DialogContent>
                <Box sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                  <Typography fontWeight={700}>{experiencia.nombre}</Typography>
                  <Stack direction='row' justifyContent='space-between' sx={{ mt: 0.5 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {rangoFechas(disponibilidad?.fecha, dias, disponibilidad?.fecha_fin)} · {aHoraCorta(disponibilidad?.hora_inicio)} · {t('resumenPersonas', { n: personas })}
                    </Typography>
                    <Typography variant='body2' fontWeight={700}>{formatoMoneda(total)}</Typography>
                  </Stack>
                </Box>
                <Stack spacing={2}>
                  <MyTextField name='nombre' label={t('nombre')} fullWidth required autoComplete='name' />
                  <MyTextField name='correo' label={t('correo')} type='email' fullWidth required autoComplete='email' />
                  <MyTextField name='telefono' label={t('telefono')} fullWidth required autoComplete='tel' />
                  <MyTextField name='observaciones' label={t('observaciones')} fullWidth multiline minRows={2} />
                </Stack>
                {!isAuthenticated && (
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                    {t('yaTienesCuenta')}{' '}
                    <Link component={RouterLink} to={`/signin?redirect=${RUTAS_PORTAL.tour(experiencia.slug)}`}>
                      {t('ingresa')}
                    </Link>{' '}
                    {t('paraVerla')}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={cerrar}>{t('cancelar')}</Button>
                <Button type='submit' variant='contained' disabled={guardandoCliente || guardandoInvitado}>
                  {t(pagoEnLinea ? 'reservarPagar' : 'confirmar')}
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
