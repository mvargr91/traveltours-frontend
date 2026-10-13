// src/@crema/redux/features/portalCaracteristicas/portalCaracteristicasSlice.jsx
// Portal: características que incluye alguna experiencia publicada (filtro del listado).
// Endpoints sin autenticación (v1/publico/*).
import { createCrudSlice } from '../../helpers/createCrudSlice';

const { slice, thunks } = createCrudSlice({
  name: 'portalCaracteristicas',
  endpoint: 'publico/caracteristicas',
});

export const { onGetColeccion, onShow } = thunks;

export const { resetError, resetActual, resetColeccion } = slice.actions;
export default slice.reducer;
