// Finanzas: pasarelas de pago de los proveedores y cobro de la plataforma (modelos de cobro y liquidaciones).
// Los ids coinciden con CuentaPasarela y CobroProveedores en el backend.
import { nombreDe } from './Turismo';

export const ESTADOS_PASARELA = [
  { id: 'pendiente', nombre: 'Pendiente de verificar', color: '#F9A825' },
  { id: 'activa', nombre: 'Activa', color: 'green' },
  { id: 'inactiva', nombre: 'Inactiva', color: 'red' },
];

export const TIPOS_COBRO = [
  { id: 'suscripcion', nombre: 'Suscripción mensual', descripcion: 'Un valor fijo cada mes, sin importar lo que venda.' },
  { id: 'comision', nombre: 'Comisión por venta', descripcion: 'Un porcentaje de cada reserva finalizada.' },
  { id: 'mixto', nombre: 'Suscripción + comisión', descripcion: 'Un valor fijo mensual más un porcentaje de cada reserva finalizada.' },
];

export const ESTADOS_LIQUIDACION = [
  { id: 'borrador', nombre: 'Borrador', color: '#757575' },
  { id: 'emitida', nombre: 'Emitida', color: '#FE8500' },
  { id: 'vencida', nombre: 'Vencida', color: '#D32F2F' },
  { id: 'pagada', nombre: 'Pagada', color: '#2E7D32' },
  { id: 'anulada', nombre: 'Anulada', color: '#3B3838' },
];

// Estado para mostrar: una emitida con la fecha de vencimiento pasada se ve como "Vencida".
export const estadoLiquidacion = (liquidacion) => (liquidacion?.vencida ? 'vencida' : liquidacion?.estado);
export const colorLiquidacion = (liquidacion) =>
  ESTADOS_LIQUIDACION.find((e) => e.id === estadoLiquidacion(liquidacion))?.color ?? '';

// Ids = CobroProveedores::MEDIOS_MANUALES.
export const MEDIOS_PAGO_LIQUIDACION = [
  { id: 'transferencia', nombre: 'Transferencia' },
  { id: 'consignacion', nombre: 'Consignación' },
  { id: 'efectivo', nombre: 'Efectivo' },
  { id: 'otro', nombre: 'Otro' },
];

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// '2026-10' -> 'octubre de 2026'
export const nombrePeriodo = (periodo) => {
  if (!periodo) return '';
  const [anio, mes] = String(periodo).split('-');
  return `${MESES[Number(mes) - 1] ?? mes} de ${anio}`;
};

const aPeriodo = (fecha) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
export const mesActual = () => aPeriodo(new Date());
export const mesSiguiente = () => {
  const fecha = new Date();
  return aPeriodo(new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1));
};
export const mesAnterior = () => {
  const fecha = new Date();
  return aPeriodo(new Date(fecha.getFullYear(), fecha.getMonth() - 1, 1));
};

// "10 %" o "Suscripción de $ 99.000" según el modelo.
export const resumenModelo = (modelo, formatoMoneda) => {
  if (!modelo) return 'Sin modelo de cobro';
  const porcentaje = `${Number(modelo.porcentaje_comision)} %`;
  if (modelo.tipo === 'suscripcion') return `${formatoMoneda(modelo.valor_mensual)} al mes`;
  if (modelo.tipo === 'comision') return `${porcentaje} por venta`;
  return `${formatoMoneda(modelo.valor_mensual)} al mes + ${porcentaje} por venta`;
};

export const nombreTipoCobro = (tipo) => (tipo ? nombreDe(TIPOS_COBRO, tipo) : 'Sin modelo');
