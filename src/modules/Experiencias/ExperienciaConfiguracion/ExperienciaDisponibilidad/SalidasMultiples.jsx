// Crea varias salidas de un tour en un solo paso (POST experiencia-disponibilidad/lote). En el calendario se
// marca cada salida: con "días por salida" un clic arma el rango completo (ej. del 9 al 12); con la fecha
// final a mano, el primer clic es la salida y el segundo el regreso. Las salidas pueden tocarse o cruzarse
// (del 13 al 16 y del 16 al 19). Todas quedan con la misma hora y capacidad.
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';

const FORMATO = 'YYYY-MM-DD';
const MAX_SALIDAS = 200;

// Día del calendario: resalta los días de cada salida (más fuerte la salida y el regreso) y la salida a medio marcar.
const Dia = ({ day, salidas, inicio, ...props }) => {
  const fecha = day.format(FORMATO);
  const extremo = salidas.some((s) => s.fecha === fecha || s.fecha_fin === fecha);
  const dentro = salidas.some((s) => fecha >= s.fecha && fecha <= s.fecha_fin);
  return (
    <PickersDay
      {...props}
      day={day}
      selected={false}
      sx={(theme) => ({
        ...(dentro && { bgcolor: alpha(theme.palette.primary.main, 0.2), borderRadius: 0 }),
        ...(extremo && {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: '50%',
          '&:hover, &:focus': { bgcolor: 'primary.dark' },
        }),
        ...(inicio === fecha && { border: `2px dashed ${theme.palette.primary.main}` }),
      })}
    />
  );
};
Dia.propTypes = {
  day: PropTypes.object.isRequired,
  salidas: PropTypes.array.isRequired,
  inicio: PropTypes.string,
};

const SalidasMultiples = ({ experienciaId, duracionDias, capacidad, onClose, onCreadas }) => {
  const [salidas, setSalidas] = useState([]); // [{ fecha, fecha_fin }]
  const [inicio, setInicio] = useState(null); // salida a medio marcar (fecha final a mano)
  const [dias, setDias] = useState(duracionDias);
  const [manual, setManual] = useState(false);
  const [datos, setDatos] = useState({ hora_inicio: '08:00', hora_fin: '', capacidad });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const ordenadas = useMemo(() => [...salidas].sort((a, b) => a.fecha.localeCompare(b.fecha)), [salidas]);

  const agregar = (fecha, fechaFin) => {
    setSalidas((actuales) =>
      actuales.some((s) => s.fecha === fecha) || actuales.length >= MAX_SALIDAS
        ? actuales
        : [...actuales, { fecha, fecha_fin: fechaFin }],
    );
  };

  const alElegir = (dia) => {
    const fecha = dia.format(FORMATO);
    setError('');
    if (!manual) {
      agregar(fecha, dia.add(Math.max(1, Number(dias) || 1) - 1, 'day').format(FORMATO));
    } else if (!inicio || fecha < inicio) {
      setInicio(fecha);
    } else {
      agregar(inicio, fecha);
      setInicio(null);
    }
  };

  const crear = async () => {
    setGuardando(true);
    setError('');
    try {
      const { data } = await jwtAxios.post('experiencia-disponibilidad/lote', {
        experiencia_id: Number(experienciaId),
        hora_inicio: datos.hora_inicio,
        hora_fin: datos.hora_fin || null,
        capacidad: Number(datos.capacidad),
        salidas: ordenadas,
      });
      onCreadas(data.mensajes?.[0]);
      onClose();
    } catch (e) {
      setError(extraerMensajeError(e));
      setGuardando(false);
    }
  };

  const etiqueta = (s) =>
    s.fecha === s.fecha_fin
      ? dayjs(s.fecha).locale('es').format('D MMM YYYY')
      : `${dayjs(s.fecha).locale('es').format('D MMM')} → ${dayjs(s.fecha_fin).locale('es').format('D MMM YYYY')}`;
  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value });
  const incompleto = salidas.length === 0 || !datos.hora_inicio || !(Number(datos.capacidad) > 0);

  return (
    <Dialog open onClose={() => !guardando && onClose()} maxWidth='md' fullWidth>
      <DialogTitle>Agregar varias salidas</DialogTitle>
      <DialogContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ flexShrink: 0 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es'>
              <DateCalendar
                views={['day']}
                value={null}
                disablePast
                onChange={alElegir}
                slots={{ day: Dia }}
                slotProps={{ day: { salidas, inicio } }}
              />
            </LocalizationProvider>
            <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 320 }}>
              {manual
                ? inicio
                  ? 'Ahora haz clic en el día de regreso.'
                  : 'Haz clic en el día de salida y luego en el de regreso.'
                : 'Haz clic en el día de salida de cada tour; el regreso se calcula con los días por salida.'}
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction='row' spacing={2} alignItems='center' sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <TextField
                label='Días por salida'
                type='number'
                size='small'
                sx={{ width: 150 }}
                value={dias}
                disabled={manual}
                inputProps={{ min: 1, max: 60 }}
                onChange={(e) => setDias(e.target.value)}
              />
              <FormControlLabel
                control={<Switch checked={manual} onChange={(e) => { setManual(e.target.checked); setInicio(null); }} />}
                label='Elegir el regreso a mano'
              />
            </Stack>
            <Stack direction='row' spacing={2}>
              <TextField label='Hora de salida' type='time' size='small' required fullWidth value={datos.hora_inicio} onChange={cambiar('hora_inicio')} InputLabelProps={{ shrink: true }} />
              <TextField label='Hora fin' type='time' size='small' fullWidth value={datos.hora_fin} onChange={cambiar('hora_fin')} InputLabelProps={{ shrink: true }} />
              <TextField label='Cupos por salida' type='number' size='small' required fullWidth value={datos.capacidad} onChange={cambiar('capacidad')} inputProps={{ min: 1 }} />
            </Stack>

            <Typography fontWeight={600}>Salidas marcadas: {salidas.length}</Typography>
            {salidas.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>Aún no has marcado ninguna salida en el calendario.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 220, overflowY: 'auto' }}>
                {ordenadas.map((s) => (
                  <Chip key={s.fecha} label={etiqueta(s)} onDelete={() => setSalidas(salidas.filter((x) => x.fecha !== s.fecha))} />
                ))}
              </Box>
            )}
            {error && <Alert severity='error'>{error}</Alert>}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button variant='contained' onClick={crear} disabled={guardando || incompleto}>
          {guardando ? 'Creando…' : `Crear ${salidas.length || ''} salida(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SalidasMultiples.propTypes = {
  experienciaId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  duracionDias: PropTypes.number,
  capacidad: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onClose: PropTypes.func.isRequired,
  onCreadas: PropTypes.func.isRequired,
};

export default SalidasMultiples;
