import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const Reserva = React.lazy(() => import('../../../modules/Reservas/Reserva'));
const AcompananteReserva = React.lazy(() => import('../../../modules/Reservas/AcompananteReserva'));

export const reservasConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/reservas',
    element: <Reserva route={{ auth: authRole, path: '/reservas' }} />,
  },
  {
    // Pantalla hija: hereda los permisos de la opción padre.
    permittedRole: RoutePermittedRole.User,
    path: '/reservas/:reserva_id/acompanantes',
    element: <AcompananteReserva route={{ auth: authRole, path: '/reservas' }} />,
  },
];
