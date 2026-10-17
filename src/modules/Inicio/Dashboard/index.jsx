// Inicio > Dashboard (GET v1/dashboard). El backend decide el alcance: el proveedor ve solo su negocio y la
// administración toda la plataforma, más lo que espera su revisión.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Rating,
  Skeleton,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TourIcon from '@mui/icons-material/Tour';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaidIcon from '@mui/icons-material/Paid';
import StarIcon from '@mui/icons-material/Star';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DescriptionIcon from '@mui/icons-material/Description';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import { ESTADOS_RESERVA, aHoraCorta, colorDe, formatoMoneda, nombreDe } from '../../../shared/constants/Turismo';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const nombreMes = (mes) => {
  const [anio, numero] = String(mes).split('-');
  return `${MESES[Number(numero) - 1] ?? numero} ${String(anio).slice(2)}`;
};

// Tarjeta de indicador: número grande, etiqueta y, si tiene destino, lleva a la pantalla correspondiente.
export const Indicador = ({ titulo, valor, detalle, icono: Icono, color = 'primary.main', onClick }) => {
  const contenido = (
    <Box sx={{ p: 4, display: 'flex', gap: 3, alignItems: 'center' }}>
      <Box sx={{ width: 48, height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color, flexShrink: 0 }}>
        <Icono />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>{valor}</Typography>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>{titulo}</Typography>
        {detalle && <Typography variant='caption' sx={{ color: 'text.secondary' }}>{detalle}</Typography>}
      </Box>
    </Box>
  );
  return <Card sx={{ height: '100%' }}>{onClick ? <CardActionArea onClick={onClick} sx={{ height: '100%' }}>{contenido}</CardActionArea> : contenido}</Card>;
};

const Bloque = ({ titulo, children, accion }) => (
  <Card sx={{ p: 4, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography variant='h4' sx={{ fontWeight: 600, flex: 1 }}>{titulo}</Typography>
      {accion}
    </Box>
    {children}
  </Card>
);

const EstadoChip = ({ estado }) => (
  <Chip size='small' label={nombreDe(ESTADOS_RESERVA, estado)} sx={{ color: '#fff', bgcolor: colorDe(ESTADOS_RESERVA, estado) || 'grey.600' }} />
);

const ListaReservas = ({ filas, vacio, onVer }) =>
  filas.length === 0 ? (
    <Typography variant='body2' color='text.secondary'>{vacio}</Typography>
  ) : (
    <List dense disablePadding>
      {filas.map((r) => (
        <ListItem key={r.id} disableGutters divider button onClick={() => onVer(r)} secondaryAction={<EstadoChip estado={r.estado} />}>
          <ListItemText
            primary={`${r.experiencia_nombre} · ${r.cantidad_personas} pers.`}
            secondary={`${r.fecha} ${aHoraCorta(r.hora_inicio)} · ${r.nombre} · ${r.codigo_reserva}`}
            sx={{ pr: 12 }}
          />
        </ListItem>
      ))}
    </List>
  );

// Barra de una sola serie: reservas por mes; el valor vendido va en el tooltip (no en un segundo eje).
const TooltipMes = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const fila = payload[0].payload;
  return (
    <Card sx={{ px: 2, py: 1.5 }}>
      <Typography variant='body2' sx={{ fontWeight: 600 }}>{nombreMes(fila.mes)}</Typography>
      <Typography variant='body2'>{fila.reservas} reserva(s)</Typography>
      <Typography variant='body2' color='text.secondary'>{formatoMoneda(fila.valor)}</Typography>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    jwtAxios
      .get('dashboard')
      .then(({ data }) => setDatos(data))
      .catch((e) => setError(extraerMensajeError(e)));
  }, []);

  if (error) return <Alert severity='error'>{error}</Alert>;
  if (!datos) {
    return (
      <Grid container spacing={4}>
        {[...Array(8)].map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant='rounded' height={104} /></Grid>
        ))}
      </Grid>
    );
  }

  const { indicadores: ind, alcance } = datos;
  const esPlataforma = alcance === 'plataforma';
  const verReserva = (r) => navigate(`/reservas/${r.id}/ver`);
  const totalPorEstado = datos.reservas_por_estado.reduce((suma, e) => suma + Number(e.total), 0) || 1;

  return (
    <Box>
      <Typography component='h1' variant='h2' sx={{ mb: 1 }}>Dashboard</Typography>
      <Typography color='text.secondary' sx={{ mb: 5 }}>
        {esPlataforma ? 'Resumen de toda la plataforma.' : 'Resumen de tu negocio.'}
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Indicador
            titulo='Experiencias publicadas'
            valor={ind.experiencias_publicadas}
            detalle={`${ind.experiencias_en_revision} en revisión · ${ind.experiencias_borrador} en borrador`}
            icono={TourIcon}
            onClick={() => navigate('/experiencias')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Indicador
            titulo='Solicitudes pendientes'
            valor={ind.reservas_pendientes}
            detalle='Por aceptar o pendientes de pago'
            icono={PendingActionsIcon}
            color='#FE8500'
            onClick={() => navigate('/reservas')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Indicador
            titulo='Reservas confirmadas'
            valor={ind.reservas_confirmadas}
            detalle={`Próximas · ${ind.reservas_mes} reserva(s) este mes`}
            icono={EventAvailableIcon}
            color='success.main'
            onClick={() => navigate('/reservas')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Indicador
            titulo='Ingresos del mes'
            valor={formatoMoneda(ind.ingresos_mes)}
            detalle={`Por cobrar: ${formatoMoneda(ind.saldo_por_cobrar)}`}
            icono={PaidIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Indicador
            titulo='Calificación promedio'
            valor={ind.calificacion_promedio ?? '—'}
            detalle={`${ind.total_resenas} reseña(s) publicadas`}
            icono={StarIcon}
            color='#FFB400'
            onClick={() => navigate('/resenas')}
          />
        </Grid>
        {esPlataforma && (
          <>
            <Grid item xs={12} sm={6} lg={3}>
              <Indicador
                titulo='Proveedores por verificar'
                valor={ind.proveedores_pendientes}
                detalle={`${ind.proveedores_activos} activos · ${ind.clientes} viajeros registrados`}
                icono={StorefrontIcon}
                color='#FE8500'
                onClick={() => navigate('/proveedores-turisticos')}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Indicador titulo='Documentos por revisar' valor={ind.documentos_pendientes} icono={DescriptionIcon} color='#FE8500' onClick={() => navigate('/proveedores-turisticos')} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Indicador titulo='Reseñas por moderar' valor={ind.resenas_pendientes} icono={RateReviewIcon} color='#FE8500' onClick={() => navigate('/resenas')} />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Bloque titulo='Reservas por mes'>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={datos.reservas_por_mes} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey='mes' tickFormatter={nombreMes} tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <Tooltip content={<TooltipMes />} cursor={{ fill: theme.palette.action.hover }} />
                  <Bar dataKey='reservas' fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant='caption' color='text.secondary'>Sin contar rechazadas ni canceladas. Pasa el mouse sobre una barra para ver el valor.</Typography>
          </Bloque>
        </Grid>
        <Grid item xs={12} md={4}>
          <Bloque titulo='Reservas por estado'>
            {datos.reservas_por_estado.length === 0 && <Typography variant='body2' color='text.secondary'>Aún no hay reservas.</Typography>}
            {datos.reservas_por_estado.map((e) => (
              <Box key={e.estado} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2'>{nombreDe(ESTADOS_RESERVA, e.estado)}</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{e.total}</Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${(Number(e.total) / totalPorEstado) * 100}%`, bgcolor: colorDe(ESTADOS_RESERVA, e.estado) || 'grey.500' }} />
                </Box>
              </Box>
            ))}
          </Bloque>
        </Grid>

        <Grid item xs={12} md={6}>
          <Bloque titulo='Próximas reservas'>
            <ListaReservas filas={datos.proximas_reservas} vacio='No hay reservas próximas.' onVer={verReserva} />
          </Bloque>
        </Grid>
        <Grid item xs={12} md={6}>
          <Bloque titulo='Solicitudes por responder'>
            <ListaReservas filas={datos.solicitudes_pendientes} vacio='No hay solicitudes pendientes. ¡Todo al día!' onVer={verReserva} />
          </Bloque>
        </Grid>

        <Grid item xs={12} md={6}>
          <Bloque titulo='Experiencias más reservadas (90 días)'>
            {datos.top_experiencias.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>Sin reservas confirmadas en los últimos 90 días.</Typography>
            ) : (
              <List dense disablePadding>
                {datos.top_experiencias.map((x, i) => (
                  <ListItem key={x.id} disableGutters divider>
                    <ListItemText primary={`${i + 1}. ${x.nombre}`} secondary={`${x.reservas} reserva(s) · ${x.personas} persona(s) · ${formatoMoneda(x.valor)}`} />
                  </ListItem>
                ))}
              </List>
            )}
          </Bloque>
        </Grid>
        <Grid item xs={12} md={6}>
          <Bloque titulo={esPlataforma ? 'Reseñas recientes' : 'Últimas reseñas de tus experiencias'}>
            {datos.resenas_recientes.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>Aún no hay reseñas.</Typography>
            ) : (
              <List dense disablePadding>
                {datos.resenas_recientes.map((r) => (
                  <ListItem key={r.id} disableGutters divider alignItems='flex-start'>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Rating value={Number(r.calificacion)} readOnly size='small' />
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>{r.experiencia_nombre}</Typography>
                          {esPlataforma && r.estado !== 'aprobada' && <Chip size='small' variant='outlined' label={r.estado} />}
                        </Box>
                      }
                      secondary={`${r.comentario ?? ''} — ${r.usuario_nombre ?? 'Viajero'}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Bloque>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
