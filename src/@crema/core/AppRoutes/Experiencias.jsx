import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const Experiencia = React.lazy(() => import('../../../modules/Experiencias/Experiencia'));
const ExperienciaConfiguracion = React.lazy(() => import('../../../modules/Experiencias/ExperienciaConfiguracion'));

export const experienciasConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/experiencias',
    element: <Experiencia route={{ auth: authRole, path: '/experiencias' }} />,
  },
  {
    // Pantalla hija: hereda los permisos de la opción padre.
    permittedRole: RoutePermittedRole.User,
    path: '/experiencias/:experiencia_id/configuracion',
    element: <ExperienciaConfiguracion route={{ auth: authRole, path: '/experiencias' }} />,
  },
];
