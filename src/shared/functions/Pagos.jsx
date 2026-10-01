// Pago en línea con Wompi (Web Checkout).
// El backend calcula el monto y firma los datos (POST publico/reservas/{codigo}/pago); aquí solo se arma
// la URL del checkout y se redirige. Wompi devuelve al viajero al backend (publico/pagos/retorno), que lo
// reenvía a /pago/resultado?id={transacción} (Wompi no acepta redirect-url con localhost).
import jwtAxios from '../../@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '../../@crema/redux/helpers/createCrudSlice';

export const irAPagarConWompi = async ({ codigo, correo }) => {
  try {
    const { data } = await jwtAxios.post(`publico/reservas/${encodeURIComponent(codigo)}/pago`, { correo });
    const parametros = new URLSearchParams();
    Object.entries(data.parametros).forEach(([clave, valor]) => parametros.append(clave, valor));
    window.location.assign(`${data.url}?${parametros.toString()}`);
  } catch (error) {
    throw new Error(extraerMensajeError(error));
  }
};
