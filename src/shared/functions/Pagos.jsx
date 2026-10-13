// Pago en línea con la pasarela de la instalación (Wompi, Mercado Pago…).
// El backend calcula el monto y arma la URL del checkout (POST publico/reservas/{codigo}/pago); aquí solo
// se redirige. La pasarela devuelve al viajero al backend (publico/pagos/{pasarela}/retorno), que lo
// reenvía a /pago/resultado?id={transacción}&pasarela={pasarela}.
import jwtAxios from '../../@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '../../@crema/redux/helpers/createCrudSlice';

// concepto: 'total' | 'abono' | 'saldo'. Sin concepto se paga todo lo pendiente.
export const irAPagar = async ({ codigo, correo, concepto }) => {
  try {
    const { data } = await jwtAxios.post(`publico/reservas/${encodeURIComponent(codigo)}/pago`, { correo, concepto });
    window.location.assign(data.url);
  } catch (error) {
    throw new Error(extraerMensajeError(error));
  }
};
