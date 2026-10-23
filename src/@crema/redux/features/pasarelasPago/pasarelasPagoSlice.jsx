// src/@crema/redux/features/pasarelasPago/pasarelasPagoSlice.jsx
// Finanzas: pasarela de pago (Wompi / Mercado Pago) con la que cada proveedor cobra en línea.
import { createCrudSlice } from '../../helpers/createCrudSlice';

const { slice, thunks } = createCrudSlice({
  name: 'pasarelasPago',
  endpoint: 'pasarelas-pago',
  acciones: { onProbar: 'probar', onCambiarEstado: 'estado' },
});

export const { onGetColeccion, onShow, onCreate, onUpdate, onDelete, onProbar, onCambiarEstado } = thunks;

export const { resetError, resetActual, resetColeccion } = slice.actions;
export default slice.reducer;
