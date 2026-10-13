// Historial de estados de una reserva (reserva_historial), del más antiguo al más reciente.
// Al viajero no le llega quién hizo cada cambio; en el panel sí (usuario_nombre).
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Typography } from '@mui/material';
import { ESTADOS_RESERVA, colorDe, nombreDe } from '../../constants/Turismo';

const HistorialReserva = ({ historial }) => (
  <Stack spacing={1.5}>
    {historial.map((cambio, i) => (
      <Stack key={`${cambio.fecha}-${i}`} direction='row' spacing={1.5} alignItems='flex-start'>
        <Box sx={{ mt: 0.75, width: 10, height: 10, flexShrink: 0, borderRadius: '50%', bgcolor: colorDe(ESTADOS_RESERVA, cambio.estado) }} />
        <Box>
          <Typography fontWeight={600}>{nombreDe(ESTADOS_RESERVA, cambio.estado)}</Typography>
          <Typography variant='body2' color='text.secondary'>
            {String(cambio.fecha ?? '').substring(0, 16)}
            {cambio.usuario_nombre ? ` · ${cambio.usuario_nombre}` : ''}
          </Typography>
        </Box>
      </Stack>
    ))}
  </Stack>
);

HistorialReserva.propTypes = {
  historial: PropTypes.arrayOf(
    PropTypes.shape({
      estado: PropTypes.string.isRequired,
      fecha: PropTypes.string,
      usuario_nombre: PropTypes.string,
    }),
  ).isRequired,
};

export default HistorialReserva;
