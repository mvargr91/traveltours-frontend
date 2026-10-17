// Calificar una reserva finalizada (crear) o editar una reseña propia. Al guardar queda pendiente de moderación.
//   POST v1/resenas { reserva_id, calificacion, comentario } · PUT v1/resenas/{id} { calificacion, comentario }
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  TextField,
  Typography,
} from '@mui/material';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';

const ETIQUETAS = { 1: 'Muy mala', 2: 'Mala', 3: 'Regular', 4: 'Buena', 5: 'Excelente' };
const MAX_COMENTARIO = 2000;

const ResenaDialog = ({ abierto, reserva, resena, onClose, onGuardado }) => {
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [hover, setHover] = useState(-1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (abierto) {
      setCalificacion(Number(resena?.calificacion) || 0);
      setComentario(resena?.comentario ?? '');
      setError(null);
    }
  }, [abierto, resena]);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const { data } = resena
        ? await jwtAxios.put(`resenas/${resena.id}`, { calificacion, comentario: comentario || null })
        : await jwtAxios.post('resenas', { reserva_id: reserva.id, calificacion, comentario: comentario || null });
      onGuardado?.(data.mensajes?.[0]);
    } catch (e) {
      setError(extraerMensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const experiencia = resena?.experiencia_nombre ?? reserva?.experiencia_nombre;

  return (
    <Dialog open={abierto} onClose={() => !guardando && onClose()} maxWidth='sm' fullWidth>
      <DialogTitle>{resena ? 'Editar mi reseña' : 'Califica tu experiencia'}</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontWeight: 600 }}>{experiencia}</Typography>
        {reserva && (
          <Typography variant='body2' color='text.secondary'>
            Reserva {reserva.codigo_reserva} · {reserva.fecha}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
          <Rating
            value={calificacion}
            size='large'
            onChange={(_, valor) => setCalificacion(valor ?? 0)}
            onChangeActive={(_, valor) => setHover(valor)}
          />
          <Typography color='text.secondary'>{ETIQUETAS[hover !== -1 ? hover : calificacion] ?? 'Elige de 1 a 5 estrellas'}</Typography>
        </Box>
        <TextField
          label='Cuéntanos cómo te fue (opcional)'
          multiline
          minRows={4}
          fullWidth
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          inputProps={{ maxLength: MAX_COMENTARIO }}
          helperText={`${comentario.length}/${MAX_COMENTARIO}`}
        />
        <Typography variant='caption' color='text.secondary'>
          Tu reseña se publicará en la experiencia después de que nuestro equipo la revise.
          {resena && ' Al editarla vuelve a revisión.'}
        </Typography>
        {error && <Alert severity='error' sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button variant='contained' onClick={guardar} disabled={guardando || calificacion < 1}>
          {guardando ? 'Guardando…' : resena ? 'Guardar cambios' : 'Publicar reseña'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ResenaDialog.propTypes = {
  abierto: PropTypes.bool.isRequired,
  reserva: PropTypes.object,
  resena: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onGuardado: PropTypes.func,
};

export default ResenaDialog;
