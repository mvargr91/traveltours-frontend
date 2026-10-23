// Detalle de una liquidación: totales, comisiones por reserva, pagos y acciones.
//  - Administración: recalcular / emitir / eliminar (borrador), registrar y anular pagos, reabrir o anular (emitida).
//  - Proveedor: pagar en línea el saldo con la pasarela de la plataforma.
// Todas las acciones devuelven la liquidación actualizada.
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
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
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import BlockIcon from '@mui/icons-material/Block';
import PaymentIcon from '@mui/icons-material/Payment';
import Swal from 'sweetalert2';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import usePermisosOpcion from '../../../../shared/hooks/usePermisosOpcion';
import useProveedorSesion from '../../../../shared/hooks/useProveedorSesion';
import { ESTADOS_RESERVA, formatoMoneda, hoy, medioDePago, nombreDe } from '../../../../shared/constants/Turismo';
import { MEDIOS_PAGO_LIQUIDACION, colorLiquidacion, nombrePeriodo } from '../../../../shared/constants/Finanzas';

const RUTA = '/liquidaciones';
const sombra = { boxShadow: '0px 0px 5px 2px rgb(0 0 0 / 8%)' };
const porcentaje = (v) => `${Number(v)} %`;

// Diálogos con campos: emitir (factura y observaciones), anular (motivo) y registrar pago.
const DIALOGOS = {
  emitir: {
    titulo: 'Emitir liquidación',
    ayuda: 'El proveedor recibirá un correo con la liquidación y la podrá pagar en línea. Después de emitida no se recalcula: los cambios en sus reservas quedan como ajuste en la siguiente.',
    boton: 'Emitir',
  },
  anular: {
    titulo: 'Anular liquidación',
    ayuda: 'No se le cobrará al proveedor y sus comisiones no pasan a la siguiente liquidación. Para corregirla, usa "Volver a borrador".',
    boton: 'Anular',
  },
  pago: {
    titulo: 'Registrar pago',
    ayuda: 'Pago recibido por fuera del portal (transferencia, consignación…). Con el total cubierto, la liquidación queda pagada.',
    boton: 'Registrar',
  },
};

const DetalleLiquidacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { permisos } = usePermisosOpcion(RUTA);
  const { esProveedor } = useProveedorSesion();
  const puedeModificar = permisos.includes('Modificar');
  const puedeCrear = permisos.includes('Crear');
  const [liquidacion, setLiquidacion] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }
  const [dialogo, setDialogo] = useState(null); // { tipo, ...campos }
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(
    () =>
      jwtAxios
        .get(`liquidaciones/${id}`)
        .then(({ data }) => setLiquidacion(data))
        .catch((e) => setError(extraerMensajeError(e))),
    [id],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (error) return <Alert severity='error'>{error}</Alert>;
  if (!liquidacion) return <LinearProgress />;

  const swal = { background: theme.palette.background.default, color: theme.palette.text.primary };

  // Ejecuta la acción y aplica la liquidación que devuelve (null si se eliminó).
  const ejecutar = async (peticion) => {
    setOcupado(true);
    try {
      const { data } = await peticion();
      if (!data.datos) {
        navigate(RUTA);
        return;
      }
      setLiquidacion((actual) => ({ ...actual, ...data.datos }));
      setMensaje({ tipo: 'success', texto: data.mensajes?.[0] });
      setDialogo(null);
    } catch (e) {
      const texto = extraerMensajeError(e);
      if (dialogo) setDialogo({ ...dialogo, error: texto });
      else setMensaje({ tipo: 'error', texto });
    } finally {
      setOcupado(false);
    }
  };

  const confirmar = async (titulo, texto, peticion, boton = 'Sí') => {
    const { isConfirmed } = await Swal.fire({
      ...swal,
      title: titulo,
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: boton,
      cancelButtonText: 'No',
    });
    if (isConfirmed) ejecutar(peticion);
  };

  const enviarDialogo = () => {
    const { tipo, error: _error, ...campos } = dialogo;
    const url = { emitir: `liquidaciones/${id}/emitir`, anular: `liquidaciones/${id}/anular`, pago: `liquidaciones/${id}/pagos` }[tipo];
    ejecutar(() => (tipo === 'pago' ? jwtAxios.post(url, campos) : jwtAxios.put(url, campos)));
  };

  const pagarEnLinea = async () => {
    setOcupado(true);
    try {
      const { data } = await jwtAxios.post(`liquidaciones/${id}/pago`);
      window.location.assign(data.url);
    } catch (e) {
      setMensaje({ tipo: 'error', texto: extraerMensajeError(e) });
      setOcupado(false);
    }
  };

  const l = liquidacion;
  const borrador = l.estado === 'borrador';
  const emitida = l.estado === 'emitida';
  const sinPagos = Number(l.valor_pagado) <= 0;
  const cambiar = (campo) => (e) => setDialogo({ ...dialogo, [campo]: e.target.value });
  const textos = dialogo ? DIALOGOS[dialogo.tipo] : null;
  const dialogoInvalido =
    dialogo &&
    ((dialogo.tipo === 'anular' && !dialogo.motivo?.trim()) ||
      (dialogo.tipo === 'pago' && !(Number(dialogo.valor) > 0 && Number(dialogo.valor) <= Number(l.saldo))));

  const filas = [
    ['Modelo', `${l.tipo_modelo_nombre}`],
    ['Suscripción del mes', Number(l.valor_suscripcion) > 0 ? formatoMoneda(l.valor_suscripcion) : null],
    ['Ventas liquidadas', Number(l.total_comisiones) !== 0 ? formatoMoneda(l.total_ventas) : null],
    [`Comisiones (${porcentaje(l.porcentaje_comision)})`, Number(l.total_comisiones) !== 0 ? formatoMoneda(l.total_comisiones) : null],
    ['Subtotal', formatoMoneda(l.subtotal)],
    [`IVA (${porcentaje(l.porcentaje_iva)})`, formatoMoneda(l.valor_iva)],
  ].filter(([, valor]) => valor !== null);

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Tooltip title='Volver'>
          <IconButton onClick={() => navigate(RUTA)}>
            <ArrowBackIosIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }}>
          <Typography variant='h2' sx={{ fontWeight: 'bold' }}>
            {l.codigo}{' '}
            <Chip label={l.estado_nombre} sx={{ ml: 1, color: '#fff', backgroundColor: colorLiquidacion(l) }} />
          </Typography>
          <Typography color='text.secondary' sx={{ textTransform: 'capitalize' }}>
            {l.proveedor_nombre} · {nombrePeriodo(l.periodo)}
          </Typography>
        </Box>
        <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {borrador && puedeCrear && (
            <Button variant='outlined' disabled={ocupado} onClick={() => ejecutar(() => jwtAxios.put(`liquidaciones/${id}/recalcular`))}>
              Recalcular
            </Button>
          )}
          {borrador && puedeCrear && (
            <Button
              variant='outlined'
              color='error'
              disabled={ocupado}
              onClick={() =>
                confirmar('Eliminar borrador', 'Sus comisiones pasan a la siguiente liquidación.', () => jwtAxios.delete(`liquidaciones/${id}`), 'Sí, eliminar')
              }
            >
              Eliminar
            </Button>
          )}
          {borrador && puedeModificar && (
            <Button variant='contained' disabled={ocupado} onClick={() => setDialogo({ tipo: 'emitir', factura_numero: l.factura_numero ?? '', observaciones: l.observaciones ?? '' })}>
              Emitir
            </Button>
          )}
          {emitida && sinPagos && puedeModificar && (
            <Button
              variant='outlined'
              disabled={ocupado}
              onClick={() =>
                confirmar('Volver a borrador', 'La liquidación se recalcula y deberás emitirla de nuevo.', () => jwtAxios.put(`liquidaciones/${id}/reabrir`))
              }
            >
              Volver a borrador
            </Button>
          )}
          {(borrador || emitida) && sinPagos && puedeModificar && (
            <Button variant='outlined' color='error' disabled={ocupado} onClick={() => setDialogo({ tipo: 'anular', motivo: '' })}>
              Anular
            </Button>
          )}
          {emitida && puedeModificar && Number(l.saldo) > 0 && (
            <Button
              variant='outlined'
              disabled={ocupado}
              onClick={() => setDialogo({ tipo: 'pago', valor: l.saldo, metodo_pago: 'transferencia', fecha_pago: hoy(), nota: '' })}
            >
              Registrar pago
            </Button>
          )}
          {l.pago_en_linea_disponible && (esProveedor || !puedeModificar) && (
            <Button variant='contained' startIcon={<PaymentIcon />} disabled={ocupado} onClick={pagarEnLinea}>
              Pagar {formatoMoneda(l.saldo)} en línea
            </Button>
          )}
        </Stack>
      </Box>

      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mb: 2 }} onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}
      {l.vencida && (
        <Alert severity='error' sx={{ mb: 2 }}>
          Venció el {l.fecha_vencimiento}. {esProveedor ? 'Págala para que tus experiencias sigan visibles en el portal.' : ''}
        </Alert>
      )}

      <Card sx={{ mb: 3, ...sombra }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
            <Table size='small'>
              <TableBody>
                {filas.map(([etiqueta, valor]) => (
                  <TableRow key={etiqueta}>
                    <TableCell sx={{ color: 'text.secondary' }}>{etiqueta}</TableCell>
                    <TableCell align='right'>{valor}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: 16 }}>Total</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold', fontSize: 16 }}>
                    {formatoMoneda(l.total)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary' }}>Pagado</TableCell>
                  <TableCell align='right'>{formatoMoneda(l.valor_pagado)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Saldo</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold', color: Number(l.saldo) > 0 ? 'error.main' : 'success.main' }}>
                    {formatoMoneda(l.saldo)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Table size='small'>
              <TableBody>
                {[
                  ['Emitida', l.fecha_emision],
                  ['Vence', l.fecha_vencimiento],
                  ['Pagada', l.fecha_pago],
                  ['Factura electrónica', l.factura_numero],
                  ['Observaciones', l.observaciones],
                ].map(([etiqueta, valor]) => (
                  <TableRow key={etiqueta}>
                    <TableCell sx={{ color: 'text.secondary', verticalAlign: 'top' }}>{etiqueta}</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-line' }}>{valor || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, ...sombra }}>
        <CardContent>
          <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
            Comisiones por reserva
          </Typography>
          {l.comisiones.length === 0 ? (
            <Typography color='text.secondary'>Esta liquidación no tiene comisiones (solo suscripción).</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Reserva</TableCell>
                    <TableCell>Experiencia</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align='right'>Base</TableCell>
                    <TableCell align='right'>%</TableCell>
                    <TableCell align='right'>Comisión</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {l.comisiones.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        {c.codigo_reserva}
                        {c.tipo === 'ajuste' && <Chip size='small' label='Ajuste' color='warning' sx={{ ml: 1 }} />}
                        {c.descripcion && (
                          <Typography variant='caption' display='block' color='text.secondary'>
                            {c.descripcion}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{c.experiencia_nombre ?? '—'}</TableCell>
                      <TableCell>{c.fecha ?? c.periodo}</TableCell>
                      <TableCell>{c.reserva_estado ? nombreDe(ESTADOS_RESERVA, c.reserva_estado) : 'Eliminada'}</TableCell>
                      <TableCell align='right'>{formatoMoneda(c.base)}</TableCell>
                      <TableCell align='right'>{porcentaje(c.porcentaje)}</TableCell>
                      <TableCell align='right' sx={{ color: Number(c.valor) < 0 ? 'success.main' : undefined }}>
                        {formatoMoneda(c.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={sombra}>
        <CardContent>
          <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
            Pagos
          </Typography>
          {l.pagos.length === 0 ? (
            <Typography color='text.secondary'>Sin pagos registrados.</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Medio</TableCell>
                    <TableCell align='right'>Valor</TableCell>
                    {!esProveedor && <TableCell>Nota</TableCell>}
                    {!esProveedor && <TableCell>Registrado por</TableCell>}
                    {puedeModificar && <TableCell />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {l.pagos.map((p) => {
                    const anulado = p.estado === 'anulado';
                    return (
                      <TableRow key={p.id} sx={anulado ? { '& td': { color: 'text.disabled', textDecoration: 'line-through' } } : undefined}>
                        <TableCell>{p.fecha}</TableCell>
                        <TableCell>{p.pasarela === 'manual' ? nombreDe(MEDIOS_PAGO_LIQUIDACION, p.metodo_pago) : medioDePago(p)}</TableCell>
                        <TableCell align='right'>{formatoMoneda(p.valor)}</TableCell>
                        {!esProveedor && <TableCell>{p.nota}</TableCell>}
                        {!esProveedor && <TableCell>{anulado ? `Anulado por ${p.anulado_por}` : p.registrado_por}</TableCell>}
                        {puedeModificar && (
                          <TableCell align='right'>
                            {p.pasarela === 'manual' && !anulado && (
                              <Tooltip title='Anular pago'>
                                <IconButton
                                  size='small'
                                  onClick={() =>
                                    confirmar(
                                      'Anular pago',
                                      `¿Anular el pago de ${formatoMoneda(p.valor)} del ${p.fecha}?`,
                                      () => jwtAxios.put(`liquidaciones/${id}/pagos/${p.id}/anular`),
                                      'Sí, anular',
                                    )
                                  }
                                >
                                  <BlockIcon fontSize='small' />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      {dialogo && (
        <Dialog open onClose={() => setDialogo(null)} maxWidth='sm' fullWidth>
          <DialogTitle>{textos.titulo}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <Alert severity='info'>{textos.ayuda}</Alert>
              {dialogo.error && <Alert severity='error'>{dialogo.error}</Alert>}
              {dialogo.tipo === 'emitir' && (
                <>
                  <TextField
                    variant='standard'
                    label='Número de factura electrónica'
                    value={dialogo.factura_numero}
                    onChange={cambiar('factura_numero')}
                    helperText='Opcional: la factura que emitiste al proveedor por esta liquidación.'
                    inputProps={{ maxLength: 50 }}
                  />
                  <TextField variant='standard' label='Observaciones' multiline minRows={2} value={dialogo.observaciones} onChange={cambiar('observaciones')} />
                </>
              )}
              {dialogo.tipo === 'anular' && (
                <TextField variant='standard' label='Motivo *' multiline minRows={2} value={dialogo.motivo} onChange={cambiar('motivo')} inputProps={{ maxLength: 500 }} />
              )}
              {dialogo.tipo === 'pago' && (
                <>
                  <TextField
                    variant='standard'
                    label='Valor'
                    type='number'
                    value={dialogo.valor}
                    onChange={cambiar('valor')}
                    helperText={`Saldo: ${formatoMoneda(l.saldo)}`}
                  />
                  <TextField select variant='standard' label='Medio' value={dialogo.metodo_pago} onChange={cambiar('metodo_pago')}>
                    {MEDIOS_PAGO_LIQUIDACION.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    variant='standard'
                    label='Fecha del pago'
                    type='date'
                    value={dialogo.fecha_pago}
                    onChange={cambiar('fecha_pago')}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: hoy() }}
                  />
                  <TextField variant='standard' label='Nota' value={dialogo.nota} onChange={cambiar('nota')} inputProps={{ maxLength: 255 }} />
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogo(null)}>Cancelar</Button>
            <Button
              variant='contained'
              color={dialogo.tipo === 'anular' ? 'error' : 'primary'}
              disabled={ocupado || dialogoInvalido}
              onClick={enviarDialogo}
            >
              {textos.boton}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default DetalleLiquidacion;
