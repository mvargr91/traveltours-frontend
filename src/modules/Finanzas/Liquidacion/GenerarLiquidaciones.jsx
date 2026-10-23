// Genera (o recalcula) los borradores de un mes terminado, para todos los proveedores o uno.
// POST liquidaciones/generar. Las ya emitidas no se tocan.
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import { showMessage } from '@crema/redux/features/cammon/commonSlice';
import { mesActual, mesAnterior } from '../../../shared/constants/Finanzas';

const GenerarLiquidaciones = ({ proveedores, handleOnClose, onGenerado }) => {
  const dispatch = useDispatch();
  const [periodo, setPeriodo] = useState(mesAnterior());
  const [proveedor, setProveedor] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const generar = async () => {
    setGuardando(true);
    setError('');
    try {
      const { data } = await jwtAxios.post('liquidaciones/generar', { periodo, proveedor_id: proveedor?.id ?? null });
      dispatch(showMessage(data.mensajes));
      onGenerado();
    } catch (e) {
      setError(extraerMensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open onClose={handleOnClose} maxWidth='sm' fullWidth>
      <DialogTitle>Generar liquidaciones</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Alert severity='info'>
            Crea un borrador por proveedor con la suscripción del mes y las comisiones de las reservas finalizadas hasta ese mes que
            aún no se han cobrado. Si ya hay un borrador, se recalcula; las emitidas no cambian.
          </Alert>
          {error && <Alert severity='error'>{error}</Alert>}
          <TextField
            variant='standard'
            label='Mes'
            type='month'
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: mesAnterior() }}
            helperText='Solo meses terminados.'
          />
          <Autocomplete
            options={proveedores}
            value={proveedor}
            onChange={(_e, valor) => setProveedor(valor)}
            getOptionLabel={(o) => o?.nombre ?? ''}
            isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
            renderInput={(params) => <TextField {...params} variant='standard' label='Proveedor (vacío = todos)' />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOnClose}>Cancelar</Button>
        <Button variant='contained' disabled={!periodo || periodo >= mesActual() || guardando} onClick={generar}>
          {guardando ? 'Generando…' : 'Generar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

GenerarLiquidaciones.propTypes = {
  proveedores: PropTypes.array.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  onGenerado: PropTypes.func.isRequired,
};

export default GenerarLiquidaciones;
