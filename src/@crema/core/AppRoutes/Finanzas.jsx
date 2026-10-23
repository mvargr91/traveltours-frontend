import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const PasarelaPago = React.lazy(() => import('../../../modules/Finanzas/PasarelaPago'));
const ModeloCobro = React.lazy(() => import('../../../modules/Finanzas/ModeloCobro'));
const DetalleModelo = React.lazy(() => import('../../../modules/Finanzas/ModeloCobro/DetalleModelo'));
const Liquidacion = React.lazy(() => import('../../../modules/Finanzas/Liquidacion'));
const DetalleLiquidacion = React.lazy(() => import('../../../modules/Finanzas/Liquidacion/DetalleLiquidacion'));
const ResultadoPagoLiquidacion = React.lazy(() => import('../../../modules/Finanzas/Liquidacion/ResultadoPagoLiquidacion'));

// Finanzas: pasarela de pago de cada proveedor y cobro de la plataforma (modelos de cobro y liquidaciones).
// Los detalles heredan los permisos de la opción padre (el backend los exige en cada endpoint).
export const finanzasConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/pasarelas-pago',
    element: <PasarelaPago route={{ auth: authRole, path: '/pasarelas-pago' }} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/modelos-cobro',
    element: <ModeloCobro route={{ auth: authRole, path: '/modelos-cobro' }} />,
  },
  { permittedRole: RoutePermittedRole.User, path: '/modelos-cobro/:id', element: <DetalleModelo /> },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/liquidaciones',
    element: <Liquidacion route={{ auth: authRole, path: '/liquidaciones' }} />,
  },
  { permittedRole: RoutePermittedRole.User, path: '/liquidaciones/:id/ver', element: <DetalleLiquidacion /> },
  // Vuelta del checkout de la pasarela de la plataforma al pagar una liquidación.
  { permittedRole: RoutePermittedRole.User, path: '/liquidaciones/pago', element: <ResultadoPagoLiquidacion /> },
];
