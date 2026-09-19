import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const Inversiones = React.lazy(() => import('../../../modules/Inversiones/Inversiones')); 
const InversionCreador = React.lazy(() => import('../../../modules/Inversiones/Inversiones/InversionCreador')); 
const InversionEditor = React.lazy(() => import('../../../modules/Inversiones/Inversiones/InversionEditor')); 
const PlanDetallado = React.lazy(() => import('../../../modules/Inversiones/PlanDetallado')); 
const ProyectoInversiones = React.lazy(() => import('../../../modules/Inversiones/ProyectoInversiones')); 
const ProgramacionInversiones = React.lazy(() => import('../../../modules/Inversiones/ProgramacionInversiones')); 
const Pagos = React.lazy(() => import('../../../modules/Inversiones/Pagos')); 
const ProyectoPlanInversion = React.lazy(() => import('../../../modules/Inversiones/ProyectoPlanInversion')); 
const ProyectoPlanInversionCreador  = React.lazy(() => import('../../../modules/Inversiones/ProyectoPlanInversion/ProyectoPlanInversionCreador')); 
const ProyectoPlanInversionEditor = React.lazy(() => import('../../../modules/Inversiones/ProyectoPlanInversion/ProyectoPlanInversionEditor')); 

export const inversionConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/inversiones',
    element: <Inversiones route={{auth: authRole, path: '/inversiones'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    exact: true,
    path: '/inversiones/:accion',
    element: <InversionCreador route={{  auth: authRole, path: '/inversiones'}} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    exact: true,
    path: '/inversiones/:accion/:id',
    element: <InversionEditor route={{  auth: authRole, path: '/inversiones'}} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/plan-detallado/:inversion_id',
    element: <PlanDetallado route={{auth: authRole, path: '/plan-detallado'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/proyecto-inversiones/:inversion_id',
    element: <ProyectoInversiones route={{auth: authRole, path: '/proyecto-inversiones'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/programacion-inversiones',
    element: <ProgramacionInversiones route={{auth: authRole, path: '/programacion-inversiones'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/pagos',
    element: <Pagos route={{auth: authRole, path: '/pagos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/proyectos-plan-inversiones',
    element: <ProyectoPlanInversion route={{auth: authRole, path: '/proyectos-plan-inversiones'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    exact: true,
    path: '/proyectos-plan-inversiones/:accion',
    element: <ProyectoPlanInversionCreador route={{auth: authRole, path: '/proyectos-plan-inversiones'}} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    exact: true,
    path: '/proyectos-plan-inversiones/:accion/:id_inversionista/:id_proyecto',
    element: <ProyectoPlanInversionEditor route={{auth: authRole, path: '/proyectos-plan-inversiones'}} />,
  },
];
