// Calendario de la tarjeta de reserva: solo se pueden elegir los días con cupos. Si el día tiene varias
// salidas se elige la hora; con una sola queda elegida. Devuelve el id de la disponibilidad.
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Box, MenuItem, TextField, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { aHoraCorta, fechaRegreso } from '../../../shared/constants/Turismo';
import { useTextos } from '@crema/context/AppContextProvider/AparienciaContextProvider';

const CalendarioFechas = ({ disponibilidad, value, onChange, duracionDias }) => {
  const t = useTextos('reserva');
  // fecha -> salidas de ese día (ya vienen ordenadas por fecha y hora).
  const porFecha = useMemo(
    () =>
      disponibilidad.reduce((mapa, salida) => {
        (mapa[salida.fecha] ??= []).push(salida);
        return mapa;
      }, {}),
    [disponibilidad],
  );
  const fechas = Object.keys(porFecha);
  const elegida = disponibilidad.find((d) => d.id === value);
  const salidas = elegida ? porFecha[elegida.fecha] : [];
  const regreso = fechaRegreso(elegida?.fecha, duracionDias, elegida?.fecha_fin);

  return (
    <Box>
      <Typography variant='subtitle2' color='text.secondary'>{t('elegirFecha')}</Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es'>
        <DateCalendar
          views={['day']}
          value={elegida ? dayjs(elegida.fecha) : null}
          referenceDate={dayjs(fechas[0])}
          minDate={dayjs(fechas[0])}
          maxDate={dayjs(fechas[fechas.length - 1])}
          shouldDisableDate={(dia) => !porFecha[dia.format('YYYY-MM-DD')]}
          onChange={(dia) => onChange(porFecha[dia.format('YYYY-MM-DD')]?.[0]?.id ?? '')}
          sx={{ width: '100%', maxWidth: 320, height: 'auto', maxHeight: 340, mx: 'auto' }}
        />
      </LocalizationProvider>

      {salidas.length > 1 ? (
        <TextField select fullWidth size='small' label={t('hora')} value={value} onChange={(e) => onChange(e.target.value)}>
          {salidas.map((salida) => (
            <MenuItem key={salida.id} value={salida.id}>
              {aHoraCorta(salida.hora_inicio)} {t('cupos', { n: salida.cupos_disponibles })}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        elegida && (
          <Typography fontWeight={600}>
            {elegida.fecha} · {aHoraCorta(elegida.hora_inicio)}{' '}
            <Typography component='span' variant='body2' color='text.secondary'>{t('cupos', { n: elegida.cupos_disponibles })}</Typography>
          </Typography>
        )
      )}
      {regreso && <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>{t('regreso', { fecha: regreso })}</Typography>}
    </Box>
  );
};

CalendarioFechas.propTypes = {
  disponibilidad: PropTypes.array.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  duracionDias: PropTypes.number,
};

export default CalendarioFechas;
