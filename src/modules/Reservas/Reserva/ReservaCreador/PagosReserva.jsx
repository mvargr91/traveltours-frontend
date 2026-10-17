// Pagos de una reserva en el panel: los que entraron por la pasarela y los recibidos por fuera del portal
// (efectivo, transferencia, datáfono), que aquí se registran y se anulan. Lleva lo pagado y el saldo.
// Con el permiso "Reembolsar" (administración) registra además el dinero devuelto al viajero.
// POST reservas/{id}/pagos · POST reservas/{id}/reembolsos · PUT reservas/{id}/pagos/{pago}/anular:
// todos devuelven la reserva actualizada.
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddCardIcon from '@mui/icons-material/AddCard';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import BlockIcon from '@mui/icons-material/Block';
import Swal from 'sweetalert2';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import usePermisosOpcion from '../../../../shared/hooks/usePermisosOpcion';
import {
  CONCEPTOS_PAGO,
  MEDIOS_PAGO_MANUAL,
  formatoMoneda,
  hoy,
  medioDePago,
  nombreDe,
} from '../../../../shared/constants/Turismo';

const SIN_PAGOS = ['rechazada', 'cancelada'];

// Textos del diálogo según lo que se registra.
const FORMULARIOS = {
  pago: {
    titulo: 'Registrar pago',
    ayuda: 'Pago recibido por fuera del portal. El viajero recibirá un correo con lo pagado y el saldo.',
    fecha: 'Fecha del pago',
    url: (id) => `reservas/${id}/pagos`,
  },
  reembolso: {
    titulo: 'Registrar reembolso',
    ayuda: 'Registra el dinero que ya le devolviste al viajero (transferencia, efectivo…). No cambia el estado de la reserva: si corresponde, cancélala aparte. El viajero recibirá un correo.',
    fecha: 'Fecha del reembolso',
    url: (id) => `reservas/${id}/reembolsos`,
  },
};

const extraer = (r) => ({ pagos: r.pagos ?? [], valor_pagado: r.valor_pagado, valor_reembolsado: r.valor_reembolsado, estado: r.estado });

const PagosReserva = ({ reserva, soloLectura }) => {
  const theme = useTheme();
  // Lo que cambia con cada pago; arranca con lo que trae la reserva y se actualiza con cada respuesta.
  const { permisos } = usePermisosOpcion('/reservas');
  const puedeReembolsar = permisos.includes('Reembolsar');
  const [datos, setDatos] = useState(() => extraer(reserva));
  const [formulario, setFormulario] = useState(null); // { tipo: 'pago' | 'reembolso', valor, fecha_pago, metodo_pago, nota }
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  const total = Number(reserva.valor_total) || 0;
  const pagado = Number(datos.valor_pagado) || 0;
  const saldo = Math.max(0, total - pagado);
  const reembolsado = Number(datos.valor_reembolsado) || 0;
  const reembolsable = Math.max(0, pagado - reembolsado);
  const puedeRegistrar = !soloLectura && saldo > 0 && !SIN_PAGOS.includes(datos.estado);
  const puedeRegistrarReembolso = !soloLectura && puedeReembolsar && reembolsable > 0;

  const aplicar = (respuesta) => {
    setDatos(extraer(respuesta.datos));
    setMensaje({ tipo: 'success', texto: respuesta.mensajes?.[0] });
  };

  const registrar = async () => {
    setGuardando(true);
    try {
      const { tipo, ...campos } = formulario;
      const { data } = await jwtAxios.post(FORMULARIOS[tipo].url(reserva.id), campos);
      aplicar(data);
      setFormulario(null);
    } catch (e) {
      setMensaje({ tipo: 'error', texto: extraerMensajeError(e) });
    } finally {
      setGuardando(false);
    }
  };

  const anular = async (pago) => {
    const { isConfirmed } = await Swal.fire({
      title: pago.concepto === 'reembolso' ? 'Anular reembolso' : 'Anular pago',
      text: pago.concepto === 'reembolso'
        ? `¿Anular el reembolso de ${formatoMoneda(pago.valor)} del ${pago.fecha}? Dejará de contar en lo reembolsado.`
        : `¿Anular el pago de ${formatoMoneda(pago.valor)} del ${pago.fecha}? Dejará de contar en lo pagado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'No',
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
    });
    if (!isConfirmed) return;
    try {
      const { data } = await jwtAxios.put(`reservas/${reserva.id}/pagos/${pago.id}/anular`);
      aplicar(data);
    } catch (e) {
      setMensaje({ tipo: 'error', texto: extraerMensajeError(e) });
    }
  };

  const maximo = formulario?.tipo === 'reembolso' ? reembolsable : saldo;
  const valorInvalido = formulario && !(Number(formulario.valor) > 0 && Number(formulario.valor) <= maximo);
  const textos = formulario ? FORMULARIOS[formulario.tipo] : null;
  const abrir = (tipo, valor) =>
    setFormulario({ tipo, valor, fecha_pago: hoy(), metodo_pago: tipo === 'reembolso' ? 'transferencia' : 'efectivo', nota: '' });
  const cambiar = (campo) => (e) => setFormulario({ ...formulario, [campo]: e.target.value });

  return (
    <Box>
      <Stack direction='row' alignItems='center' sx={{ flexWrap: 'wrap', gap: 3, mb: 2 }}>
        <Typography>Total: <strong>{formatoMoneda(total)}</strong></Typography>
        <Typography>Pagado: <strong>{formatoMoneda(pagado)}</strong></Typography>
        <Typography color={saldo > 0 ? 'error.main' : 'success.main'}>Saldo: <strong>{formatoMoneda(saldo)}</strong></Typography>
        {reembolsado > 0 && <Typography color='warning.main'>Reembolsado: <strong>{formatoMoneda(reembolsado)}</strong></Typography>}
        <Stack direction='row' spacing={1} sx={{ ml: 'auto' }}>
          {puedeRegistrarReembolso && (
            <Button variant='outlined' size='small' color='warning' startIcon={<CurrencyExchangeIcon />} onClick={() => abrir('reembolso', reembolsable)}>
              Registrar reembolso
            </Button>
          )}
          {puedeRegistrar && (
            <Button variant='contained' size='small' startIcon={<AddCardIcon />} onClick={() => abrir('pago', saldo)}>
              Registrar pago
            </Button>
          )}
        </Stack>
      </Stack>

      {mensaje && <Alert severity={mensaje.tipo} onClose={() => setMensaje(null)} sx={{ mb: 2 }}>{mensaje.texto}</Alert>}

      {datos.pagos.length === 0 ? (
        <Typography color='text.secondary'>Aún no hay pagos registrados en esta reserva.</Typography>
      ) : (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Medio</TableCell>
              <TableCell>Concepto</TableCell>
              <TableCell align='right'>Valor</TableCell>
              <TableCell>Registró</TableCell>
              <TableCell>Nota</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {datos.pagos.map((pago) => {
              const anulado = pago.estado === 'anulado';
              const esReembolso = pago.concepto === 'reembolso';
              const puedeAnular = !soloLectura && pago.pasarela === 'manual' && (!esReembolso || puedeReembolsar);
              return (
                <TableRow key={pago.id} sx={{ opacity: anulado ? 0.55 : 1, bgcolor: esReembolso ? 'rgba(254,133,0,0.06)' : undefined }}>
                  <TableCell>{pago.fecha}</TableCell>
                  <TableCell>{medioDePago(pago)}</TableCell>
                  <TableCell>{nombreDe(CONCEPTOS_PAGO, pago.concepto)}</TableCell>
                  <TableCell align='right' sx={{ textDecoration: anulado ? 'line-through' : 'none', color: esReembolso ? 'warning.main' : undefined }}>
                    {esReembolso ? `− ${formatoMoneda(pago.valor)}` : formatoMoneda(pago.valor)}
                  </TableCell>
                  <TableCell>{pago.registrado_por ?? 'Pago en línea'}</TableCell>
                  <TableCell>{pago.nota}</TableCell>
                  <TableCell align='right'>
                    {anulado ? (
                      <Chip size='small' label={`Anulado por ${pago.anulado_por ?? '—'}`} />
                    ) : (
                      puedeAnular && (
                        <Tooltip title={esReembolso ? 'Anular reembolso' : 'Anular pago'}>
                          <IconButton size='small' color='error' onClick={() => anular(pago)}>
                            <BlockIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      )
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Dialog open={Boolean(formulario)} onClose={() => !guardando && setFormulario(null)} maxWidth='xs' fullWidth>
        {formulario && (
          <>
            <DialogTitle>{textos.titulo}</DialogTitle>
            <DialogContent>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {textos.ayuda}
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label='Valor'
                  type='number'
                  required
                  value={formulario.valor}
                  onChange={cambiar('valor')}
                  error={valorInvalido}
                  helperText={formulario.tipo === 'reembolso' ? `Máximo a reembolsar: ${formatoMoneda(reembolsable)}` : `Saldo de la reserva: ${formatoMoneda(saldo)}`}
                />
                <TextField
                  label={textos.fecha}
                  type='date'
                  required
                  value={formulario.fecha_pago}
                  onChange={cambiar('fecha_pago')}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: hoy() }}
                />
                <TextField select label={formulario.tipo === 'reembolso' ? 'Medio del reembolso' : 'Medio de pago'} required value={formulario.metodo_pago} onChange={cambiar('metodo_pago')}>
                  {MEDIOS_PAGO_MANUAL.map((medio) => <MenuItem key={medio.id} value={medio.id}>{medio.nombre}</MenuItem>)}
                </TextField>
                <TextField
                  label='Referencia o nota'
                  value={formulario.nota}
                  onChange={cambiar('nota')}
                  inputProps={{ maxLength: 255 }}
                  placeholder='Ej: comprobante 12345, recibido por Ana'
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setFormulario(null)} disabled={guardando}>Cancelar</Button>
              <Button variant='contained' onClick={registrar} disabled={guardando || valorInvalido || !formulario.fecha_pago}>
                {guardando ? 'Registrando…' : textos.titulo}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

PagosReserva.propTypes = {
  reserva: PropTypes.object.isRequired,
  soloLectura: PropTypes.bool,
};

export default PagosReserva;
