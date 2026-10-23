// src/@crema/redux/features/liquidaciones/liquidacionesSlice.jsx
// Finanzas: liquidaciones (cobro mensual de la plataforma a cada proveedor).
import { createCrudSlice } from '../../helpers/createCrudSlice';

const { slice, thunks } = createCrudSlice({
  name: 'liquidaciones',
  endpoint: 'liquidaciones',
});

export const { onGetColeccion, onDelete } = thunks;

export const { resetError, resetActual, resetColeccion } = slice.actions;
export default slice.reducer;
