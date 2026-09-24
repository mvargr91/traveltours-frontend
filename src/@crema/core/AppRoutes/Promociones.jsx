import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const Promocion = React.lazy(() => import('../../../modules/Promociones/Promocion'));
const PromocionExperiencia = React.lazy(() => import('../../../modules/Promociones/PromocionExperiencia'));

export const promocionesConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/promociones',
    element: <Promocion route={{ auth: authRole, path: '/promociones' }} />,
  },
  {
    // Pantalla hija: hereda los permisos de la opción padre.
    permittedRole: RoutePermittedRole.User,
    path: '/promociones/:promocion_id/experiencias',
    element: <PromocionExperiencia route={{ auth: authRole, path: '/promociones' }} />,
  },
];
