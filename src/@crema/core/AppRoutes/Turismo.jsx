import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const Destino = React.lazy(() => import('../../../modules/Turismo/Destino'));
const Categoria = React.lazy(() => import('../../../modules/Turismo/Categoria'));
const Caracteristica = React.lazy(() => import('../../../modules/Turismo/Caracteristica'));
const Cupon = React.lazy(() => import('../../../modules/Turismo/Cupon'));

export const turismoConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/destinos',
    element: <Destino route={{ auth: authRole, path: '/destinos' }} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/categorias',
    element: <Categoria route={{ auth: authRole, path: '/categorias' }} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/caracteristicas',
    element: <Caracteristica route={{ auth: authRole, path: '/caracteristicas' }} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/cupones',
    element: <Cupon route={{ auth: authRole, path: '/cupones' }} />,
  },
];
