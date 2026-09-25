import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const ProveedorTuristico = React.lazy(() => import('../../../modules/Proveedores/ProveedorTuristico'));
const DocumentoProveedor = React.lazy(() => import('../../../modules/Proveedores/DocumentoProveedor'));

export const proveedoresConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/proveedores-turisticos',
    element: <ProveedorTuristico route={{ auth: authRole, path: '/proveedores-turisticos' }} />,
  },
  {
    // Pantalla hija: hereda los permisos de la opción padre.
    permittedRole: RoutePermittedRole.User,
    path: '/proveedores-turisticos/:proveedor_id/documentos',
    element: <DocumentoProveedor route={{ auth: authRole, path: '/proveedores-turisticos' }} />,
  },
];
