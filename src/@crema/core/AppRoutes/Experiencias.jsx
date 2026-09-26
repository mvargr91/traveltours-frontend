import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const Experiencia = React.lazy(() => import('../../../modules/Experiencias/Experiencia'));
const ExperienciaPagina = React.lazy(() => import('../../../modules/Experiencias/Experiencia/ExperienciaPagina'));
const ExperienciaConfiguracion = React.lazy(() => import('../../../modules/Experiencias/ExperienciaConfiguracion'));

export const experienciasConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/experiencias',
    element: <Experiencia route={{ auth: authRole, path: '/experiencias' }} />,
  },
  // Formulario en ruta propia (es largo para un modal); hereda los permisos de la opción padre.
  {
    permittedRole: RoutePermittedRole.User,
    path: '/experiencias/crear',
    element: <ExperienciaPagina accion='crear' route={{ auth: authRole, path: '/experiencias' }} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/experiencias/:experiencia_id/editar',
    element: <ExperienciaPagina accion='editar' route={{ auth: authRole, path: '/experiencias' }} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/experiencias/:experiencia_id/ver',
    element: <ExperienciaPagina accion='ver' route={{ auth: authRole, path: '/experiencias' }} />,
  },
  {
    // Pantalla hija: hereda los permisos de la opción padre.
    permittedRole: RoutePermittedRole.User,
    path: '/experiencias/:experiencia_id/configuracion',
    element: <ExperienciaConfiguracion route={{ auth: authRole, path: '/experiencias' }} />,
  },
];
