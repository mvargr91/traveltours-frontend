// Inicio > Reportes (GET v1/reportes): estadísticas de reservas y transacciones por rango de fechas.
// Cada tabla se puede descargar en CSV (se abre en Excel).
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaidIcon from '@mui/icons-material/Paid';
import GroupsIcon from '@mui/icons-material/Groups';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import { Indicador, nombreMes } from '../Dashboard';
import {
  CONCEPTOS_PAGO,
  ESTADOS_RESERVA,
  colorDe,
  formatoMoneda,
  hoy,
  medioDePago,
  nombreDe,
} from '../../../shared/constants/Turismo';
import useProveedorSesion from '../../../shared/hooks/useProveedorSesion';

const inicioDeAnio = () => `${hoy().slice(0, 4)}-01-01`;

// Columnas de las tablas agrupadas (por experiencia, proveedor, destino o mes).
const COLUMNAS_GRUPO = [
  { id: 'reservas', label: 'Reservas', numero: true },
  { id: 'personas', label: 'Personas', numero: true },
  { id: 'vendido', label: 'Vendido', moneda: true },
  { id: 'pagado', label: 'Pagado', moneda: true },
  { id: 'reembolsado', label: 'Reembolsado', moneda: true },
];

const COLUMNAS_TRANSACCIONES = [
  { id: 'fecha', label: 'Fecha' },
  { id: 'codigo_reserva', label: 'Reserva' },
  { id: 'viajero', label: 'Viajero' },
  { id: 'experiencia_nombre', label: 'Experiencia' },
  { id: 'proveedor_nombre', label: 'Proveedor' },
  { id: 'medio', label: 'Medio', valor: (t) => medioDePago(t) },
  { id: 'concepto', label: 'Concepto', valor: (t) => nombreDe(CONCEPTOS_PAGO, t.concepto) },
  { id: 'estado', label: 'Estado', valor: (t) => (t.estado === 'anulado' ? 'Anulado' : 'Aplicado') },
  { id: 'valor', label: 'Valor', moneda: true, valor: (t) => (t.concepto === 'reembolso' ? -Number(t.valor) : Number(t.valor)) },
  { id: 'referencia', label: 'Referencia' },
  { id: 'registrado_por', label: 'Registró', valor: (t) => t.registrado_por ?? 'Pago en línea' },
];

const valorDe = (fila, col) => (col.valor ? col.valor(fila) : fila[col.id]);

// CSV con ";" y BOM: Excel en español lo abre con columnas y tildes correctas.
const descargarCsv = (nombre, columnas, filas) => {
  const celda = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lineas = [
    columnas.map((c) => celda(c.label)).join(';'),
    ...filas.map((f) => columnas.map((c) => celda(valorDe(f, c))).join(';')),
  ];
  const url = URL.createObjectURL(new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${nombre}.csv`;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const TablaDatos = ({ columnas, filas, primera, archivo, vacio = 'Sin datos en el periodo.' }) => {
  const todas = primera ? [primera, ...columnas] : columnas;
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button size='small' startIcon={<DownloadIcon />} disabled={!filas.length} onClick={() => descargarCsv(archivo, todas, filas)}>
          Descargar CSV
        </Button>
      </Box>
      {filas.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>{vacio}</Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table size='small' stickyHeader>
            <TableHead>
              <TableRow>
                {todas.map((c) => (
                  <TableCell key={c.id} align={c.numero || c.moneda ? 'right' : 'left'}>{c.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((f, i) => (
                <TableRow key={f.id ?? i} hover>
                  {todas.map((c) => {
                    const v = valorDe(f, c);
                    return (
                      <TableCell key={c.id} align={c.numero || c.moneda ? 'right' : 'left'} sx={{ whiteSpace: 'nowrap' }}>
                        {c.render ? c.render(f) : c.moneda ? formatoMoneda(v) : v ?? '—'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

const Reportes = () => {
  const theme = useTheme();
  const { proveedor } = useProveedorSesion();
  const [filtros, setFiltros] = useState({ desde: inicioDeAnio(), hasta: hoy(), fecha_base: 'creacion', proveedor_id: '', destino_id: '' });
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('experiencia');
  const [proveedores, setProveedores] = useState([]);
  const [destinos, setDestinos] = useState([]);

  useEffect(() => {
    jwtAxios.get('proveedores-turisticos', { params: { ligera: 1 } }).then(({ data }) => setProveedores(data)).catch(() => {});
    jwtAxios.get('destinos', { params: { ligera: 1 } }).then(({ data }) => setDestinos(Array.isArray(data) ? data : data.datos ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    setError(null);
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''));
    jwtAxios
      .get('reportes', { params })
      .then(({ data }) => setDatos(data))
      .catch((e) => setError(extraerMensajeError(e)))
      .finally(() => setCargando(false));
  }, [filtros]);

  const cambiar = (campo) => (e) => setFiltros({ ...filtros, [campo]: e.target.value });
  const r = datos?.resumen;
  const rango = `${filtros.desde}_${filtros.hasta}`;
  const conPorProveedor = datos && datos.por_proveedor.length > 0;

  const tablas = {
    experiencia: { label: 'Por experiencia', filas: datos?.por_experiencia ?? [], primera: { id: 'nombre', label: 'Experiencia' } },
    ...(conPorProveedor ? { proveedor: { label: 'Por proveedor', filas: datos.por_proveedor, primera: { id: 'nombre', label: 'Proveedor' } } } : {}),
    destino: { label: 'Por destino', filas: datos?.por_destino ?? [], primera: { id: 'nombre', label: 'Destino', valor: (f) => f.nombre ?? 'Sin destino' } },
    mes: { label: 'Por mes', filas: datos?.por_mes ?? [], primera: { id: 'mes', label: 'Mes', valor: (f) => nombreMes(f.mes) } },
    estado: {
      label: 'Por estado',
      filas: datos?.por_estado ?? [],
      primera: {
        id: 'estado',
        label: 'Estado',
        valor: (f) => nombreDe(ESTADOS_RESERVA, f.estado),
        render: (f) => <Chip size='small' label={nombreDe(ESTADOS_RESERVA, f.estado)} sx={{ color: '#fff', bgcolor: colorDe(ESTADOS_RESERVA, f.estado) || 'grey.600' }} />,
      },
      columnas: [{ id: 'reservas', label: 'Reservas', numero: true }, { id: 'valor', label: 'Valor', moneda: true }],
    },
    transacciones: { label: 'Transacciones', filas: datos?.transacciones ?? [], columnas: COLUMNAS_TRANSACCIONES },
  };
  const actual = tablas[tab] ?? tablas.experiencia;

  return (
    <Box>
      <Typography component='h1' variant='h2' sx={{ mb: 4 }}>Reportes</Typography>

      <Card sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={6} md={2}>
            <TextField label='Desde' type='date' fullWidth size='small' value={filtros.desde} onChange={cambiar('desde')} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField label='Hasta' type='date' fullWidth size='small' value={filtros.hasta} onChange={cambiar('hasta')} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select label='Fechas de' fullWidth size='small' value={filtros.fecha_base} onChange={cambiar('fecha_base')}>
              <MenuItem value='creacion'>Cuando se hizo la reserva</MenuItem>
              <MenuItem value='servicio'>Cuando se realiza el tour</MenuItem>
            </TextField>
          </Grid>
          {proveedor ? (
            // El proveedor solo ve su negocio (el backend lo fuerza): se muestra fijo.
            <Grid item xs={12} md={3}>
              <TextField label='Proveedor' fullWidth size='small' value={proveedor.nombre} disabled />
            </Grid>
          ) : proveedores.length > 1 && (
            <Grid item xs={12} md={3}>
              <TextField select label='Proveedor' fullWidth size='small' value={filtros.proveedor_id} onChange={cambiar('proveedor_id')}>
                <MenuItem value=''>Todos</MenuItem>
                {proveedores.map((p) => <MenuItem key={p.id} value={p.id}>{p.nombre_comercial}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          <Grid item xs={12} md={2}>
            <TextField select label='Destino' fullWidth size='small' value={filtros.destino_id} onChange={cambiar('destino_id')}>
              <MenuItem value=''>Todos</MenuItem>
              {destinos.map((d) => <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {cargando && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity='error' sx={{ mb: 4 }}>{error}</Alert>}

      {r && (
        <>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Indicador titulo='Vendido (confirmadas)' valor={formatoMoneda(r.vendido)} detalle={`Ticket promedio: ${formatoMoneda(r.ticket_promedio)}`} icono={ReceiptLongIcon} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Indicador
                titulo='Ingresos netos (pagos − reembolsos)'
                valor={formatoMoneda(r.ingresos_netos)}
                detalle={`Reembolsado: ${formatoMoneda(r.reembolsado)} · Por cobrar: ${formatoMoneda(r.saldo_por_cobrar)}`}
                icono={PaidIcon}
                color='success.main'
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Indicador titulo='Reservas confirmadas' valor={r.reservas_confirmadas} detalle={`${r.reservas} en total · ${r.personas} persona(s)`} icono={GroupsIcon} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Indicador titulo='Canceladas o rechazadas' valor={r.cancelaciones} icono={EventBusyIcon} color='error.main' />
            </Grid>
          </Grid>

          <Card sx={{ p: 4, mb: 4 }}>
            <Typography variant='h4' sx={{ fontWeight: 600, mb: 2 }}>Vendido por mes</Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={datos.por_mes.map((m) => ({ ...m, vendido: Number(m.vendido) }))} margin={{ top: 8, right: 8, left: 24, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey='mes' tickFormatter={nombreMes} tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: theme.palette.action.hover }}
                    labelFormatter={nombreMes}
                    formatter={(v, _n, item) => [`${formatoMoneda(v)} · ${item.payload.reservas} reserva(s)`, 'Vendido']}
                    contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}
                  />
                  <Bar dataKey='vendido' fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>

          <Card sx={{ p: 4 }}>
            <Tabs value={tab in tablas ? tab : 'experiencia'} onChange={(_, v) => setTab(v)} variant='scrollable' allowScrollButtonsMobile sx={{ mb: 2 }}>
              {Object.entries(tablas).map(([id, t]) => <Tab key={id} value={id} label={t.label} sx={{ textTransform: 'none' }} />)}
            </Tabs>
            {tab === 'transacciones' && (
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Pagos en línea, pagos manuales y reembolsos por su fecha de pago (máximo 2.000). Los reembolsos van en negativo.
              </Typography>
            )}
            <TablaDatos
              columnas={actual.columnas ?? COLUMNAS_GRUPO}
              filas={actual.filas}
              primera={actual.primera}
              archivo={`reporte-${tab}-${rango}`}
            />
          </Card>
        </>
      )}
    </Box>
  );
};

export default Reportes;
