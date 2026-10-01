// src/@crema/redux/features/portalReservas/portalReservasSlice.jsx
// Portal: reserva sin cuenta (invitado).
// POST v1/publico/reservas — sin autenticación; el backend calcula el valor y valida los cupos.
// GET  v1/publico/reservas/{codigo}?correo= — consulta del estado (ver ConsultarReserva).
import { createCrudSlice } from '../../helpers/createCrudSlice';

const { slice, thunks } = createCrudSlice({
  name: 'portalReservas',
  endpoint: 'publico/reservas',
});

export const { onCreate } = thunks;

export const { resetError, resetActual } = slice.actions;
export default slice.reducer;
