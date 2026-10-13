// Pagos de una reserva en el panel: los que entraron por la pasarela y los recibidos por fuera del portal
// (efectivo, transferencia, datáfono), que aquí se registran y se anulan. Lleva lo pagado y el saldo.
// POST reservas/{id}/pagos · PUT reservas/{id}/pagos/{pago}/anular: ambos devuelven la reserva actualizada.
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
import BlockIcon from '@mui/icons-material/Block';
import Swal from 'sweetalert2';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import {
  CONCEPTOS_PAGO,
  MEDIOS_PAGO_MANUAL,
  formatoMoneda,
  hoy,
  medioDePago,
  nombreDe,
} from '../../../../shared/constants/Turismo';

const SIN_PAGOS = ['rechazada', 'cancelada'];

const PagosReserva = ({ reserva, soloLectura }) => {
  const theme = useTheme();
  // Lo que cambia con cada pago; arranca con lo que trae la reserva y se actualiza con cada respuesta.
  const [datos, setDatos] = useState({ pagos: reserva.pagos ?? [], valor_pagado: reserva.valor_pagado, estado: reserva.estado });
  const [formulario, setFormulario] = useState(null); // { valor, fecha_pago, metodo_pago, nota }
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  const total = Number(reserva.valor_total) || 0;
  const pagado = Number(datos.valor_pagado) || 0;
  const saldo = Math.max(0, total - pagado);
  const puedeRegistrar = !soloLectura && saldo > 0 && !SIN_PAGOS.includes(datos.estado);

  const aplicar = (respuesta) => {
    const actualizada = respuesta.datos;
    setDatos({ pagos: actualizada.pagos ?? [], valor_pagado: actualizada.valor_pagado, estado: actualizada.estado });
    setMensaje({ tipo: 'success', texto: respuesta.mensajes?.[0] });
  };

  const registrar = async () => {
    setGuardando(true);
    try {
      const { data } = await jwtAxios.post(`reservas/${reserva.id}/pagos`, formulario);
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
      title: 'Anular pago',
      text: `¿Anular el pago de ${formatoMoneda(pago.valor)} del ${pago.fecha}? Dejará de contar en lo pagado.`,
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

  const valorInvalido = formulario && !(Number(formulario.valor) > 0 && Number(formulario.valor) <= saldo);
  const cambiar = (campo) => (e) => setFormulario({ ...formulario, [campo]: e.target.value });

  return (
    <Box>
      <Stack direction='row' alignItems='center' sx={{ flexWrap: 'wrap', gap: 3, mb: 2 }}>
        <Typography>Total: <strong>{formatoMoneda(total)}</strong></Typography>
        <Typography>Pagado: <strong>{formatoMoneda(pagado)}</strong></Typography>
        <Typography color={saldo > 0 ? 'error.main' : 'success.main'}>Saldo: <strong>{formatoMoneda(saldo)}</strong></Typography>
        {puedeRegistrar && (
          <Button
            variant='contained'
            size='small'
            startIcon={<AddCardIcon />}
            sx={{ ml: 'auto' }}
            onClick={() => setFormulario({ valor: saldo, fecha_pago: hoy(), metodo_pago: 'efectivo', nota: '' })}
          >
            Registrar pago
          </Button>
        )}
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
              return (
                <TableRow key={pago.id} sx={{ opacity: anulado ? 0.55 : 1 }}>
                  <TableCell>{pago.fecha}</TableCell>
                  <TableCell>{medioDePago(pago)}</TableCell>
                  <TableCell>{nombreDe(CONCEPTOS_PAGO, pago.concepto)}</TableCell>
                  <TableCell align='right' sx={{ textDecoration: anulado ? 'line-through' : 'none' }}>{formatoMoneda(pago.valor)}</TableCell>
                  <TableCell>{pago.registrado_por ?? 'Pago en línea'}</TableCell>
                  <TableCell>{pago.nota}</TableCell>
                  <TableCell align='right'>
                    {anulado ? (
                      <Chip size='small' label={`Anulado por ${pago.anulado_por ?? '—'}`} />
                    ) : (
                      !soloLectura && pago.pasarela === 'manual' && (
                        <Tooltip title='Anular pago'>
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
            <DialogTitle>Registrar pago</DialogTitle>
            <DialogContent>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Pago recibido por fuera del portal. El viajero recibirá un correo con lo pagado y el saldo.
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label='Valor'
                  type='number'
                  required
                  value={formulario.valor}
                  onChange={cambiar('valor')}
                  error={valorInvalido}
                  helperText={`Saldo de la reserva: ${formatoMoneda(saldo)}`}
                />
                <TextField
                  label='Fecha del pago'
                  type='date'
                  required
                  value={formulario.fecha_pago}
                  onChange={cambiar('fecha_pago')}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: hoy() }}
                />
                <TextField select label='Medio de pago' required value={formulario.metodo_pago} onChange={cambiar('metodo_pago')}>
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
                {guardando ? 'Registrando…' : 'Registrar pago'}
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
