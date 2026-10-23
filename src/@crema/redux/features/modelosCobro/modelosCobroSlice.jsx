// src/@crema/redux/features/modelosCobro/modelosCobroSlice.jsx
// Finanzas: modelo de cobro de cada proveedor (suscripción, comisión o mixto). Solo administración.
import { createCrudSlice } from '../../helpers/createCrudSlice';

const { slice, thunks } = createCrudSlice({
  name: 'modelosCobro',
  endpoint: 'modelos-cobro',
});

export const { onGetColeccion } = thunks;

export const { resetError, resetActual, resetColeccion } = slice.actions;
export default slice.reducer;
