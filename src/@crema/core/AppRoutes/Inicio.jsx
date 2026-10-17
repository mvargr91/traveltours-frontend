import React from 'react';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const Dashboard = React.lazy(() => import('../../../modules/Inicio/Dashboard'));
const Reportes = React.lazy(() => import('../../../modules/Inicio/Reportes'));

// Menú "Inicio": las url coinciden con las opciones del sistema (TurismoMenuSeeder). El backend exige
// ListarDashboard / ListarReporte y decide el alcance (el proveedor solo ve su negocio).
export const inicioConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/reportes',
    element: <Reportes />,
  },
];
