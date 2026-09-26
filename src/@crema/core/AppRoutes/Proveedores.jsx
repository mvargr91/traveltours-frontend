import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const ProveedorTuristico = React.lazy(() => import('../../../modules/Proveedores/ProveedorTuristico'));
const ProveedorTuristicoPagina = React.lazy(() => import('../../../modules/Proveedores/ProveedorTuristico/ProveedorTuristicoPagina'));
const DocumentoProveedor = React.lazy(() => import('../../../modules/Proveedores/DocumentoProveedor'));

export const proveedoresConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/proveedores-turisticos',
    element: <ProveedorTuristico route={{ auth: authRole, path: '/proveedores-turisticos' }} />,
  },
  // Formulario en ruta propia (es largo para un modal); hereda los permisos de la opción padre.
  {
    permittedRole: RoutePermittedRole.User,
    path: '/proveedores-turisticos/crear',
    element: <ProveedorTuristicoPagina accion='crear' route={{ auth: authRole, path: '/proveedores-turisticos' }} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/proveedores-turisticos/:proveedor_id/editar',
    element: <ProveedorTuristicoPagina accion='editar' route={{ auth: authRole, path: '/proveedores-turisticos' }} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/proveedores-turisticos/:proveedor_id/ver',
    element: <ProveedorTuristicoPagina accion='ver' route={{ auth: authRole, path: '/proveedores-turisticos' }} />,
  },
  {
    // Pantalla hija: hereda los permisos de la opción padre.
    permittedRole: RoutePermittedRole.User,
    path: '/proveedores-turisticos/:proveedor_id/documentos',
    element: <DocumentoProveedor route={{ auth: authRole, path: '/proveedores-turisticos' }} />,
  },
];
