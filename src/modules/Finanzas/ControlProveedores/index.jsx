// Finanzas > Control de proveedores (solo administración): qué proveedores revisar y por qué.
// Una fila por proveedor con reservas sin finalizar, cancelaciones, deuda, mora, pasarela y modelo de cobro.
// Los que tienen alertas van primero. Clic en un proveedor abre su modelo de cobro.
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  LinearProgress,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import { formatoMoneda } from '../../../shared/constants/Turismo';

const sombra = { boxShadow: '0px 0px 5px 2px rgb(0 0 0 / 8%)' };

const NIVELES = {
  alto: { label: 'Revisar', color: 'error' },
  medio: { label: 'Atención', color: 'warning' },
  ok: { label: 'En orden', color: 'success' },
};

const PASARELAS = {
  activa: { label: 'Activa', color: 'success' },
  pendiente: { label: 'Pendiente', color: 'warning' },
  inactiva: { label: 'Inactiva', color: 'default' },
  sin_pasarela: { label: 'Sin pasarela', color: 'default' },
};

const Cifra = ({ titulo, valor, detalle, alerta }) => (
  <Card sx={{ flex: '1 1 170px', ...sombra }}>
    <CardContent>
      <Typography variant='body2' color='text.secondary'>
        {titulo}
      </Typography>
      <Typography variant='h3' sx={{ fontWeight: 'bold', color: alerta ? 'error.main' : 'text.primary' }}>
        {valor}
      </Typography>
      {detalle && (
        <Typography variant='caption' color='text.secondary'>
          {detalle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

Cifra.propTypes = {
  titulo: PropTypes.string.isRequired,
  valor: PropTypes.node,
  detalle: PropTypes.string,
  alerta: PropTypes.bool,
};

const ControlProveedores = ({ route }) => {
  const navigate = useNavigate();
  const { titulo } = usePermisosOpcion(route.path);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [soloAlertas, setSoloAlertas] = useState(true);
  const [buscar, setBuscar] = useState('');

  useEffect(() => {
    jwtAxios
      .get('control-proveedores')
      .then(({ data }) => setDatos(data))
      .catch((e) => setError(extraerMensajeError(e)));
  }, []);

  const filas = useMemo(() => {
    const texto = buscar.trim().toLowerCase();
    return (datos?.proveedores ?? []).filter(
      (p) => (!soloAlertas || p.nivel !== 'ok') && (!texto || p.proveedor_nombre.toLowerCase().includes(texto)),
    );
  }, [datos, soloAlertas, buscar]);

  if (error) return <Alert severity='error'>{error}</Alert>;
  if (!datos) return <LinearProgress />;

  const { resumen: r, parametros } = datos;

  return (
    <Box sx={{ p: '20px' }}>
      <Typography variant='h2' sx={{ fontWeight: 'bold' }}>
        {titulo || 'Control de proveedores'}
      </Typography>
      <Typography color='text.secondary' sx={{ mb: 3 }}>
        Qué proveedores revisar para que las comisiones y los cobros estén al día. Cancelaciones y tasa sobre los últimos{' '}
        {parametros.dias_ventana} días.
      </Typography>

      <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Cifra titulo='Proveedores para revisar' valor={`${r.con_alertas} de ${r.proveedores}`} alerta={r.con_alertas > 0} />
        <Cifra
          titulo='Reservas sin finalizar'
          valor={r.reservas_sin_cerrar}
          detalle='Aceptadas con el tour ya pasado'
          alerta={r.reservas_sin_cerrar > 0}
        />
        <Cifra
          titulo='Canceladas tarde'
          valor={r.canceladas_tarde}
          detalle='El día del tour o después'
          alerta={r.canceladas_tarde > 0}
        />
        <Cifra
          titulo='Saldo por cobrar'
          valor={formatoMoneda(r.saldo_por_pagar)}
          detalle={`${r.liquidaciones_vencidas} liquidación(es) vencida(s)`}
          alerta={r.liquidaciones_vencidas > 0}
        />
        <Cifra titulo='En mora' valor={r.en_mora} detalle='Experiencias ocultas del portal' alerta={r.en_mora > 0} />
      </Stack>

      <Alert severity='info' sx={{ mb: 3 }}>
        {parametros.dias_autofinalizar > 0
          ? `Las reservas aceptadas se finalizan solas ${parametros.dias_autofinalizar} día(s) después del tour (y generan su comisión).`
          : 'El cierre automático de reservas está apagado: las reservas aceptadas solo se finalizan a mano.'}{' '}
        Se alerta una tasa de cancelación desde el {parametros.tasa_cancelacion_alerta} %. Puedes cambiarlo en Parametrización &gt;
        Parámetros (RESERVAS_DIAS_AUTOFINALIZAR, CONTROL_TASA_CANCELACION_ALERTA, CONTROL_RESUMEN_SEMANAL).
      </Alert>

      <Card sx={sombra}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, alignItems: { sm: 'center' } }}>
            <TextField
              variant='standard'
              label='Buscar proveedor'
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              sx={{ minWidth: 260 }}
            />
            <FormControlLabel
              control={<Switch checked={soloAlertas} onChange={(e) => setSoloAlertas(e.target.checked)} />}
              label='Solo los que tienen alertas'
            />
          </Stack>

          {filas.length === 0 ? (
            <Typography color='text.secondary' sx={{ py: 3 }}>
              {soloAlertas ? 'Ningún proveedor tiene alertas. 🎉' : 'No hay proveedores con ese nombre.'}
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ '& th': { whiteSpace: 'nowrap' } }}>
                    <TableCell>Proveedor</TableCell>
                    <TableCell>Alertas</TableCell>
                    <TableCell align='right'>Reservas</TableCell>
                    <TableCell align='right'>Cancelación</TableCell>
                    <TableCell align='right'>Por liquidar</TableCell>
                    <TableCell align='right'>Saldo por pagar</TableCell>
                    <TableCell>Pasarela</TableCell>
                    <TableCell>Modelo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filas.map((p) => (
                    <TableRow
                      key={p.id}
                      hover
                      sx={{ cursor: 'pointer', verticalAlign: 'top' }}
                      onClick={() => navigate(`/modelos-cobro/${p.id}`)}
                    >
                      <TableCell sx={{ minWidth: 180 }}>
                        <Typography sx={{ fontWeight: 600 }}>{p.proveedor_nombre}</Typography>
                        <Chip size='small' label={NIVELES[p.nivel].label} color={NIVELES[p.nivel].color} sx={{ mt: 0.5 }} />
                        {!p.activo && <Chip size='small' label='Inactivo' sx={{ mt: 0.5, ml: 0.5 }} />}
                      </TableCell>
                      <TableCell sx={{ minWidth: 260 }}>
                        {p.alertas.length === 0
                          ? '—'
                          : p.alertas.map((a) => (
                              <Typography
                                key={a.texto}
                                variant='body2'
                                sx={{ color: a.nivel === 'alto' ? 'error.main' : 'warning.dark' }}
                              >
                                • {a.texto}
                              </Typography>
                            ))}
                      </TableCell>
                      <TableCell align='right'>
                        <Tooltip title={`${p.finalizadas} finalizada(s) de ${p.reservas_periodo} en ${parametros.dias_ventana} días`}>
                          <span>
                            {p.finalizadas} / {p.reservas_periodo}
                          </span>
                        </Tooltip>
                        <Typography variant='caption' display='block' color='text.secondary'>
                          Ventas {formatoMoneda(p.ventas_periodo)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{ color: p.tasa_cancelacion >= parametros.tasa_cancelacion_alerta ? 'warning.dark' : undefined }}
                      >
                        {p.tasa_cancelacion} %
                        <Typography variant='caption' display='block' color='text.secondary'>
                          {p.canceladas} cancelada(s)
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>{formatoMoneda(p.comisiones_pendientes)}</TableCell>
                      <TableCell align='right' sx={{ color: p.liquidaciones_vencidas ? 'error.main' : undefined }}>
                        {formatoMoneda(p.saldo_por_pagar)}
                      </TableCell>
                      <TableCell>
                        <Chip size='small' variant='outlined' label={PASARELAS[p.pasarela]?.label ?? p.pasarela} color={PASARELAS[p.pasarela]?.color} />
                      </TableCell>
                      <TableCell>{p.modelo_nombre}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

ControlProveedores.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default ControlProveedores;
