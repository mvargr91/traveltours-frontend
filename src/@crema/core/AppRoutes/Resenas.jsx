import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const Resena = React.lazy(() => import('../../../modules/Resenas/Resena'));

export const resenasConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/resenas',
    element: <Resena route={{ auth: authRole, path: '/resenas' }} />,
  },
];
