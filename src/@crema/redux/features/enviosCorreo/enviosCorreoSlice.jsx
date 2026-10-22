// src/@crema/redux/features/enviosCorreo/enviosCorreoSlice.jsx
// Marketing: envíos de correo a los clientes de un proveedor y su avance por destinatario.
import { createCrudSlice } from '../../helpers/createCrudSlice';

const { slice, thunks } = createCrudSlice({
  name: 'enviosCorreo',
  endpoint: 'envios-correo',
});

export const { onGetColeccion, onShow } = thunks;

export const { resetError, resetActual, resetColeccion } = slice.actions;
export default slice.reducer;
