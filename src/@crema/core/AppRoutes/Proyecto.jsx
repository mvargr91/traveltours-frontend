import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';


const Proyecto = React.lazy(() => import('../../../modules/Proyectos/Proyecto')); 
const DocumentoProyecto = React.lazy(() => import('../../../modules/Proyectos/DocumentoProyecto')); 
const FotoProyecto = React.lazy(() => import('../../../modules/Proyectos/FotoProyecto')); 
const DesembolsoPorProyecto = React.lazy(() => import('../../../modules/Proyectos/DesembolsoPorProyecto')); 
const ActividadPorProyecto = React.lazy(() => import('../../../modules/Proyectos/ActividadPorProyecto'));
const AvanceProyectos = React.lazy(() => import('../../../modules/Proyectos/AvanceProyectos'));
const ActividadPorProyectoEjecutadas = React.lazy(() => import('../../../modules/Proyectos/ActividadPorProyectoEjecutadas'));
const ConceptoPorProyecto = React.lazy(() => import('../../../modules/Proyectos/ConceptoPorProyecto'));
const SimulacionPorProyecto = React.lazy(() => import('../../../modules/Proyectos/SimulacionPorProyecto'));
const SimulacionPorProyectoCreador = React.lazy(() => import('../../../modules/Proyectos/SimulacionPorProyecto/SimulacionPorProyectoCreador'));
const SimulacionPorProyectoEditor = React.lazy(() => import('../../../modules/Proyectos/SimulacionPorProyecto/SimulacionPorProyectoEditor'));
const SimulacionPorProyectoVisualizar = React.lazy(() => import('../../../modules/Proyectos/SimulacionPorProyecto/SimulacionPorProyectoVisualizar'));
// Inversionista
const SimulacionPorInversionista = React.lazy(() => import('../../../modules/Proyectos/SimulacionPorInversionista'));
const SimulacionPorInversionistaCreador = React.lazy(() => import('../../../modules/Proyectos/SimulacionPorInversionista/SimulacionPorInversionistaCreador'));
const SimulacionPorInversionistaEditor = React.lazy(() => import('../../../modules/Proyectos/SimulacionPorInversionista/SimulacionPorInversionistaEditor'));
const SimulacionPorInversionistaVisualizar = React.lazy(() => import('../../../modules/Proyectos/SimulacionPorInversionista/SimulacionPorInversionistaVisualizar'));


export const proyectoConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/proyectos',
    element: <Proyecto route={{auth: authRole, path: '/proyectos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/documentos-proyectos/:proyecto_id',
    element: <DocumentoProyecto route={{auth: authRole, path: '/proyectos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/proyectos-fotos/:proyecto_id',
    element: <FotoProyecto route={{auth: authRole, path: '/proyectos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User, 
    path: '/proyectos-desembolsos/:proyecto_id',
    element: <DesembolsoPorProyecto route={{auth: authRole, path: '/proyectos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/actividades-por-proyectos/:proyecto_id',
    element: <ActividadPorProyecto route={{auth: authRole, path: '/proyectos'}}/>,
  },
  {
    exact: true,
    permittedRole: RoutePermittedRole.User,
    path: '/avances-proyectos',
    element: <AvanceProyectos route={{auth: authRole, path: '/avances-proyectos'}}/>,
  },
  {
    exact: true,
    permittedRole: RoutePermittedRole.User,
    path: '/avances-proyectos/:proyecto_id',
    element: <ActividadPorProyectoEjecutadas route={{auth: authRole, path: '/avances-proyectos'}} />,
  },
  {
    exact: true,
    permittedRole: RoutePermittedRole.User,
    path: '/valores-conceptos-por-proyectos',
    element: <ConceptoPorProyecto route={{auth: authRole, path: '/valores-conceptos-por-proyectos'}} />,
  },
  {
    exact: true,
    permittedRole: RoutePermittedRole.User,
    path: '/simulaciones-por-proyectos/:proyecto_id',
    element: <SimulacionPorProyecto route={{auth: authRole, path: '/proyectos'}}/>,
  },
  {
    exact: true,
    permittedRole: RoutePermittedRole.User,
    path: '/simulaciones-por-proyectos/ver/:proyecto_id/:id',
    element: <SimulacionPorProyectoVisualizar route={{auth: authRole, path: '/proyectos'}}/>,
  },
  {
    exact: true,
    permittedRole: RoutePermittedRole.User,
    path: '/simulaciones-por-proyectos/:accion/:proyecto_id',
    element: <SimulacionPorProyectoCreador route={{auth: authRole, path: '/proyectos'}}/>,
  },
  {
    exact: true,
    permittedRole: RoutePermittedRole.User,
    path: '/simulaciones-por-proyectos/:accion/:proyecto_id/:id',
    element: <SimulacionPorProyectoEditor route={{auth: authRole, path: '/proyectos'}}/>,
  },
  {
    exact: true,
    permittedRole: RoutePermittedRole.User,
    path: '/simulaciones-por-inversionista/:id_simulacion/:proyecto_id/:modelo',
    element: <SimulacionPorInversionista route={{auth: authRole, path: '/proyectos'}}/>,
  },
    {
    exact: true,
    permittedRole: RoutePermittedRole.User,
    path: '/simulaciones-por-inversionista/ver/:id_simulacion/:proyecto_id/:id',
    element: <SimulacionPorInversionistaVisualizar route={{auth: authRole, path: '/proyectos'}}/>,
  },
  {
    exact: true,
    permittedRole: RoutePermittedRole.User,
    path: '/simulaciones-por-inversionista/crear/:id_simulacion/:proyecto_id',
    element: <SimulacionPorInversionistaCreador route={{auth: authRole, path: '/proyectos'}}/>,
  },
  {
    exact: true,
    permittedRole: RoutePermittedRole.User,
    path: '/simulaciones-por-inversionista/editar/:id_simulacion/:proyecto_id/:id',
    element: <SimulacionPorInversionistaEditor route={{auth: authRole, path: '/proyectos'}}/>,
  },
];
