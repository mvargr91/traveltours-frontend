import React from 'react';
import { matchPath } from 'react-router-dom';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';
import { PORTAL_HABILITADO, RUTAS_PORTAL } from '../../../shared/constants/RutasPortal';

const Home = React.lazy(() => import('../../../modules/Portal/Home'));
const Experiencias = React.lazy(() => import('../../../modules/Portal/Experiencias'));
const ExperienciaDetalle = React.lazy(() => import('../../../modules/Portal/ExperienciaDetalle'));
const Destinos = React.lazy(() => import('../../../modules/Portal/Destinos'));
const Promociones = React.lazy(() => import('../../../modules/Portal/Promociones'));
const Registro = React.lazy(() => import('../../../modules/Portal/Registro'));
const MisReservas = React.lazy(() => import('../../../modules/Cuenta/MisReservas'));
const MisFavoritos = React.lazy(() => import('../../../modules/Cuenta/MisFavoritos'));

// Rutas anónimas: visibles con o sin sesión, se pintan dentro de PublicLayout.
export const portalRoutes = PORTAL_HABILITADO
  ? [
      { path: RUTAS_PORTAL.inicio, element: <Home /> },
      { path: RUTAS_PORTAL.tours, element: <Experiencias /> },
      { path: RUTAS_PORTAL.tour(':slug'), element: <ExperienciaDetalle /> },
      { path: RUTAS_PORTAL.destinos, element: <Destinos /> },
      { path: RUTAS_PORTAL.promociones, element: <Promociones /> },
      { path: RUTAS_PORTAL.registro, element: <Registro /> },
    ]
  : [];

export const esRutaPortal = (pathname) =>
  portalRoutes.some((ruta) => matchPath({ path: ruta.path, end: true }, pathname));

// Área del cliente dentro del panel (menú "Mi Cuenta" según permisos del rol Cliente).
export const cuentaConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/mis-reservas',
    element: <MisReservas route={{ auth: authRole, path: '/mis-reservas' }} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/mis-favoritos',
    element: <MisFavoritos route={{ auth: authRole, path: '/mis-favoritos' }} />,
  },
];
