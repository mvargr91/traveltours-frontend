// Modelo de cobro de un proveedor: resumen, formulario para cambiarlo desde un mes y el historial.
// POST modelos-cobro crea o reemplaza el modelo de ese mes; DELETE modelos-cobro/{id} quita un mes aún sin liquidar.
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Radio,
  RadioGroup,
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
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import usePermisosOpcion from '../../../../shared/hooks/usePermisosOpcion';
import { formatoMoneda } from '../../../../shared/constants/Turismo';
import { TIPOS_COBRO, mesActual, mesSiguiente, resumenModelo } from '../../../../shared/constants/Finanzas';
import ResumenCobro from '../../ResumenCobro';

const RUTA = '/modelos-cobro';
const sombra = { boxShadow: '0px 0px 5px 2px rgb(0 0 0 / 8%)' };

const formularioVacio = (modelo) => ({
  tipo: modelo?.tipo ?? 'comision',
  valor_mensual: modelo?.valor_mensual || '',
  porcentaje_comision: modelo?.porcentaje_comision || '',
  // Con modelo vigente el cambio aplica desde el mes siguiente; sin modelo, desde este mes.
  desde: modelo ? mesSiguiente() : mesActual(),
  observaciones: '',
});

const DetalleModelo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { permisos } = usePermisosOpcion(RUTA);
  const puedeModificar = permisos.includes('Modificar');
  const [datos, setDatos] = useState(null);
  const [formulario, setFormulario] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }
  const [error, setError] = useState('');

  const cargar = useCallback(
    () =>
      jwtAxios
        .get(`modelos-cobro/${id}`)
        .then(({ data }) => {
          setDatos(data);
          setFormulario((actual) => actual ?? formularioVacio(data.resumen?.modelo));
        })
        .catch((e) => setError(extraerMensajeError(e))),
    [id],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (error) return <Alert severity='error'>{error}</Alert>;
  if (!datos || !formulario) return <LinearProgress />;

  const cambiar = (campo) => (e) => setFormulario({ ...formulario, [campo]: e.target.value });
  const conSuscripcion = formulario.tipo !== 'comision';
  const conComision = formulario.tipo !== 'suscripcion';
  const invalido =
    !formulario.desde ||
    (conSuscripcion && !(Number(formulario.valor_mensual) > 0)) ||
    (conComision && !(Number(formulario.porcentaje_comision) > 0 && Number(formulario.porcentaje_comision) <= 100));

  const guardar = async () => {
    setGuardando(true);
    try {
      const { data } = await jwtAxios.post('modelos-cobro', { ...formulario, proveedor_id: Number(id) });
      setMensaje({ tipo: 'success', texto: data.mensajes?.[0] });
      setFormulario({ ...formulario, observaciones: '' });
      cargar();
    } catch (e) {
      setMensaje({ tipo: 'error', texto: extraerMensajeError(e) });
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (modelo) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Eliminar modelo',
      text: `¿Quitar el modelo desde ${modelo.desde_nombre}? Volverá a aplicar el modelo anterior.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
    });
    if (!isConfirmed) return;
    try {
      const { data } = await jwtAxios.delete(`modelos-cobro/${modelo.id}`);
      setMensaje({ tipo: 'success', texto: data.mensajes?.[0] });
      cargar();
    } catch (e) {
      setMensaje({ tipo: 'error', texto: extraerMensajeError(e) });
    }
  };

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Tooltip title='Volver'>
          <IconButton onClick={() => navigate(RUTA)}>
            <ArrowBackIosIcon />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant='h2' sx={{ fontWeight: 'bold' }}>
            {datos.proveedor_nombre}
          </Typography>
          <Typography color='text.secondary'>Modelo de cobro de la plataforma a este proveedor</Typography>
        </Box>
      </Box>

      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mb: 2 }} onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}

      <ResumenCobro resumen={datos.resumen} />

      {puedeModificar && (
        <Card sx={{ mb: 3, ...sombra }}>
          <CardContent>
            <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
              Cambiar modelo de cobro
            </Typography>
            <RadioGroup value={formulario.tipo} onChange={cambiar('tipo')} sx={{ mb: 2 }}>
              {TIPOS_COBRO.map((tipo) => (
                <FormControlLabel
                  key={tipo.id}
                  value={tipo.id}
                  control={<Radio />}
                  label={
                    <span>
                      <strong>{tipo.nombre}</strong> — {tipo.descripcion}
                    </span>
                  }
                />
              ))}
            </RadioGroup>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {conSuscripcion && (
                <TextField
                  variant='standard'
                  label='Valor mensual (sin IVA)'
                  type='number'
                  value={formulario.valor_mensual}
                  onChange={cambiar('valor_mensual')}
                  helperText={formulario.valor_mensual ? formatoMoneda(formulario.valor_mensual) : 'Ej: 99000'}
                  inputProps={{ min: 1 }}
                />
              )}
              {conComision && (
                <TextField
                  variant='standard'
                  label='Comisión (%)'
                  type='number'
                  value={formulario.porcentaje_comision}
                  onChange={cambiar('porcentaje_comision')}
                  helperText='Sobre el valor de cada reserva finalizada (menos reembolsos).'
                  inputProps={{ min: 0.01, max: 100, step: 0.5 }}
                />
              )}
              <TextField
                variant='standard'
                label='Aplica desde'
                type='month'
                value={formulario.desde}
                onChange={cambiar('desde')}
                InputLabelProps={{ shrink: true }}
                helperText='Los meses ya liquidados no se pueden cambiar.'
              />
              <TextField
                variant='standard'
                label='Observaciones'
                value={formulario.observaciones}
                onChange={cambiar('observaciones')}
                sx={{ gridColumn: { md: 'span 3' } }}
                inputProps={{ maxLength: 500 }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant='contained' disabled={invalido || guardando} onClick={guardar}>
                {guardando ? 'Guardando…' : 'Guardar modelo'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={sombra}>
        <CardContent>
          <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
            Historial
          </Typography>
          {datos.historial.length === 0 ? (
            <Typography color='text.secondary'>Este proveedor aún no tiene modelo de cobro.</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Desde</TableCell>
                    <TableCell>Modelo</TableCell>
                    <TableCell>Cobro</TableCell>
                    <TableCell>Observaciones</TableCell>
                    <TableCell>Modificado por</TableCell>
                    {puedeModificar && <TableCell />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datos.historial.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{m.desde_nombre}</TableCell>
                      <TableCell>{m.tipo_nombre}</TableCell>
                      <TableCell>{resumenModelo(m, formatoMoneda)}</TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>{m.observaciones}</TableCell>
                      <TableCell>
                        {m.usuario_modificacion_nombre}
                        <Typography variant='caption' display='block' color='text.secondary'>
                          {m.fecha_modificacion}
                        </Typography>
                      </TableCell>
                      {puedeModificar && (
                        <TableCell align='right'>
                          <Tooltip title='Eliminar'>
                            <IconButton size='small' onClick={() => eliminar(m)}>
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
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

export default DetalleModelo;
