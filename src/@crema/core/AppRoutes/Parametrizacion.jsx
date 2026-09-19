import React from 'react';
import { authRole } from '@crema/constants/AppConst';
import { RoutePermittedRole } from '@crema/constants/AppEnums';

const ParametroConstante = React.lazy(() => import('../../../modules/Parametrizacion/ParametroConstante')); 
const ParametroCorreo = React.lazy(() => import('../../../modules/Parametrizacion/ParametroCorreo')); 
const Ciudad = React.lazy(() => import('../../../modules/Parametrizacion/Ciudad')); 
const TipoProyecto = React.lazy(() => import('../../../modules/Parametrizacion/TipoProyecto')); 
const SectorProyecto = React.lazy(() => import('../../../modules/Parametrizacion/SectoresProyecto')); 
const ListaDocumento = React.lazy(() => import('../../../modules/Parametrizacion/ListaDocumento')); 
const Compania = React.lazy(() => import('../../../modules/Parametrizacion/Compania')); 
const DocumentoCompania = React.lazy(() => import('../../../modules/Parametrizacion/DocumentoCompania')); 
const Gestores = React.lazy(() => import('../../../modules/Parametrizacion/Gestores')); 
const DocumentoGestor = React.lazy(() => import('../../../modules/Parametrizacion/DocumentoGestor')); 
const CategoriaInversion = React.lazy(() => import('../../../modules/Parametrizacion/CategoriaInversion')); 
const Inversionista = React.lazy(() => import('../../../modules/Parametrizacion/Inversionista')); 
const DocumentoInversionista = React.lazy(() => import('../../../modules/Parametrizacion/DocumentoInversionista')); 
const ContactoInversionista = React.lazy(() => import('../../../modules/Parametrizacion/ContactoInversionista')); 
const ContactoLegalInversionista = React.lazy(() => import('../../../modules/Parametrizacion/ContactoLegalInversionista')); 
const VehiculoInversion = React.lazy(() => import('../../../modules/Parametrizacion/VehiculoInversion')); 
const EtapaProyecto = React.lazy(() => import('../../../modules/Parametrizacion/EtapaProyecto')); 
const ActividadProyecto = React.lazy(() => import('../../../modules/Parametrizacion/ActividadProyecto')); 
const CondicionesPlazo = React.lazy(() => import('../../../modules/Parametrizacion/CondicionesPlazo'));
const ConceptoProyecto = React.lazy(() => import('../../../modules/Parametrizacion/ConceptoProyecto'));
const ParametroMensual = React.lazy(() => import('../../../modules/Parametrizacion/ParametroMensual'));
const ComunidadEnergetica = React.lazy(() => import('../../../modules/Parametrizacion/ComunidadEnergetica'));
const Banco = React.lazy(() => import('../../../modules/Parametrizacion/Banco')); 
const Proveedor = React.lazy(() => import('../../../modules/Parametrizacion/Proveedor')); 
const DocumentoProveedor = React.lazy(() => import('../../../modules/Parametrizacion/DocumentoProveedor')); 
const PrecioProyectado = React.lazy(() => import('../../../modules/Parametrizacion/PrecioProyectado')); 
const NivelConsumo = React.lazy(() => import('../../../modules/Parametrizacion/NivelConsumo')); 
const DescuentoTarifa = React.lazy(() => import('../../../modules/Parametrizacion/DescuentoTarifa/DescuentoTarifaCreador')); 

export const parametrizacionConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/parametros-constantes',
    element: <ParametroConstante route={{auth: authRole, path: '/parametros-constantes'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/parametros-correo',
    element: <ParametroCorreo route={{auth: authRole, path: '/parametros-correo'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/ciudades',
    element: <Ciudad route={{auth: authRole, path: '/ciudades'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/tipos-proyectos',
    element: <TipoProyecto route={{auth: authRole, path: '/tipos-proyectos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/sectores-proyectos',
    element: <SectorProyecto route={{auth: authRole, path: '/sectores-proyectos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/listas-documentos',
    element: <ListaDocumento route={{auth: authRole, path: '/listas-documentos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/companias',
    element: <Compania route={{auth: authRole, path: '/companias'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/documentos-companias/:compania_id',
    element: <DocumentoCompania route={{auth: authRole, path: '/documentos-companias'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/gestores',
    element: <Gestores route={{auth: authRole, path: '/gestores'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/documentos-gestores/:gestor_id',
    element: <DocumentoGestor route={{auth: authRole, path: '/gestores'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/tipos-inversiones',
    element: <CategoriaInversion route={{auth: authRole, path: '/tipos-inversiones'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/inversionistas',
    element: <Inversionista route={{auth: authRole, path: '/inversionistas'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/documentos-inversionistas/:inversionista_id',
    element: <DocumentoInversionista route={{auth: authRole, path: '/inversionistas'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/contactos-inversionistas/:inversionista_id',
    element: <ContactoInversionista route={{auth: authRole, path: '/inversionistas'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/contactos-legales-inversionistas/:inversionista_id',
    element: <ContactoLegalInversionista route={{auth: authRole, path: '/inversionistas'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/vehiculos-inversion',
    element: <VehiculoInversion route={{auth: authRole, path: '/vehiculos-inversion'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/etapas-proyectos',
    element: <EtapaProyecto route={{auth: authRole, path: '/etapas-proyectos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/actividades-proyectos',
    element: <ActividadProyecto route={{auth: authRole, path: '/actividades-proyectos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/condiciones-plazo',
    element: <CondicionesPlazo route={{auth: authRole, path: '/condiciones-plazo'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/conceptos-proyectos',
    element: <ConceptoProyecto route={{auth: authRole, path: '/conceptos-proyectos'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/parametros-mensuales',
    element: <ParametroMensual route={{auth: authRole, path: '/parametros-mensuales'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/comunidades-energeticas',
    element: <ComunidadEnergetica route={{auth: authRole, path: '/comunidades-energeticas'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/bancos',
    element: <Banco route={{auth: authRole, path: '/bancos'}}/>,
  },
    {
    permittedRole: RoutePermittedRole.User,
    path: '/proveedores',
    element: <Proveedor route={{auth: authRole, path: '/proveedores'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/documentos-proveedores/:proveedor_id',
    element: <DocumentoProveedor route={{auth: authRole, path: '/proveedores'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/precios-proyectados',
    element: <PrecioProyectado route={{auth: authRole, path: '/precios-proyectados'}}/>,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/niveles-consumos',
    element: <NivelConsumo route={{auth: authRole, path: '/niveles-consumos'}}/>,
  },
    {
    permittedRole: RoutePermittedRole.User,
    path: '/descuentos-tarifas',
    element: <DescuentoTarifa route={{auth: authRole, path: '/descuentos-tarifas'}}/>,
  },
];
