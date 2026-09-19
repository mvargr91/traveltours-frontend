import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const EnvioExtracto = React.lazy(() => import('../../../modules/Consultas/EnvioExtracto'));
const DescargaPortafolio = React.lazy(() => import('../../../modules/Consultas/DescargaPortafolio'));
const ConsultaProxPagos = React.lazy(() => import('../../../modules/Consultas/ConsultaProxPagos'));
const InversionesProyectos = React.lazy(() => import('../../../modules/Consultas/InversionesProyectos'));
const PlanDetalladoProyecto = React.lazy(() => import('../../../modules/Consultas/PlanDetalladoProyecto'));
const PlanDetallado = React.lazy(() => import('../../../modules/Consultas/PlanDetallado'));
const PlanDetalladoEditor = React.lazy(() => import('../../../modules/Consultas/PlanDetallado/PlanDetalladoEditor'));
const ConsultaHcaPagos = React.lazy(() => import('../../../modules/Consultas/ConsultaHcaPagos'));

export const consultaConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/envio-extractos-inversiones',
    element: <EnvioExtracto  route={{auth: authRole, path: '/envio-extractos-inversiones'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/portafolio-inversiones',
    element: <DescargaPortafolio  route={{auth: authRole, path: '/portafolio-inversiones'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/consulta-proximos-pagos',
    element: <ConsultaProxPagos  route={{auth: authRole, path: '/consulta-proximos-pagos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/consulta-inversiones-proyectos',
    element: <InversionesProyectos  route={{auth: authRole, path: '/consulta-inversiones-proyectos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/plan-detallado-proyecto/:inversion_id/:id_proyecto',
    element: <PlanDetalladoProyecto  route={{auth: authRole, path: '/plan-detallado-proyecto'}}/>,
  },
    {
    permittedRole: RoutePermittedRole.User,
    path: '/consulta-plan-detallado',
    element: <PlanDetallado  route={{auth: authRole, path: '/consulta-plan-detallado'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    exact: true,
    path: '/consulta-plan-detallado/:accion/:id',
    element: <PlanDetalladoEditor route={{  auth: authRole, path: '/consulta-plan-detallado'}} />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/consulta-hca-pagos',
    element: <ConsultaHcaPagos  route={{auth: authRole, path: '/consulta-hca-pagos'}}/>,
  },
];
