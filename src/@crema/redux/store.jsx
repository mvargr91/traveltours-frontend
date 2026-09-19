import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import usuariosReducer from './features/usuarios/usuariosSlice';
import commonReducer from './features/cammon/commonSlice' 
import rolesReducer from  './features/rol/rolesSlice';
import modulosReducer from  './features/modulo/moduloSlice';
import opcionSistemaReducer from  './features/opcionSistema/opcionSistemaSlice';
import permisosReducer  from  './features/permiso/permisoSlice';
import aplicacionesReducer  from  './features/aplicacion/aplicacionSlice';
import auditoriasReducer  from  './features/auditorias/auditoriasSlice';
import parametroConstantesReducer from './features/parametroConstante/parametroConstanteSlice';
import parametroCorreosReducer from './features/parametroCorreo/parametroCorreoSlice';
import ciudadesReducer from './features/ciudades/ciudadesSlice';
import tiposProyectosReducer from './features/tipoProyecto/tiposProyectosSlice';
import sectoresProyectosReducer from './features/sectorProyecto/sectoresProyectosSlice';
import listasDocumentosReducer from './features/ListaDocumento/listaDocumentosSlice';
import companiasReducer from './features/Compania/companiasSlice';
import companiasDocumentosReducer from './features/companiaDocumento/companiaDocumentosSlice';
import gestoresReducer from './features/gestor/gestoresSlice';
import gestoresDocumentosReducer from './features/gestorDocumento/gestorDocumentosSlice';
import categoriasInversionesReducer from './features/categoriaInversion/categoriaInversionesSlice';
import proyectosReducer from './features/Proyecto/proyectosSlice';
import proyectosDocumentosReducer from './features/proyectoDocumento/proyectoDocumentosSlice';
import proyectosFotosReducer from './features/proyectoFoto/proyectoFotosSlice';
import inversionistasReducer from './features/inversionista/inversionistasSlice';
import inversionistasDocumentosReducer from './features/inversionistaDocumento/inversionistaDocumentosSlice';
import inversionistasContactosReducer from './features/inversionistaContacto/inversionistaContactosSlice';
import inversionistasContactosLegalesReducer from './features/inversionistaContactoLegal/inversionistaContactosLegalesSlice';
import inversionReducer from './features/inversion/inversionSlice';
import planDetalladoReducer from './features/planDetallado/planDetalladoSlice';
import inversionProyectoReducer from './features/inversionProyecto/inversionProyectoSlice';
import copiaSeguridadReducer from './features/copiaSeguridad/copiaSeguridadSlice';
import envioExtractoReducer from './features/envioExtracto/envioExtractoSlice';
import descargaPortafolioReducer from './features/descargaPortafolio/descargaPortafolioSlice';
import consultaProxPagosReducer from './features/consultaProxPagos/consultaProxPagosSlice';
import vehiculoInversionReducer from './features/VehiculoInversion/vehiculoInversionSlice';
import etapaProyectoReducer from './features/etapaProyecto/etapaProyectoSlice';
import actividadProyectoReducer from './features/actividadProyecto/actividadProyectoSlice';
import condicionesPlazoReducer from './features/condicionesPlazo/condicionesPlazoSlice';
import conceptoProyectoReducer from './features/conceptoProyecto/conceptoProyectoSlice';
import parametroMensualReducer from './features/parametroMensual/parametroMensualSlice';
import actividadPorProyectoReducer from './features/actividadPorProyecto/actividadPorProyectoSlice';
import conceptoPorProyectoReducer from './features/conceptoPorProyecto/conceptoPorProyectoSlice';
import comunidadEnergeticaReducer from './features/comunidadEnergetica/comunidadEnergeticaSlice';
import bancosReducer from './features/bancos/bancosSlice';
import proveedoresReducer from './features/Proveedor/proveedoresSlice';
import proveedoresDocumentosReducer from './features/proveedorDocumento/proveedorDocumentosSlice';
import precioProyectadoReducer from './features/precioProyectado/precioProyectadoSlice';
import simulacionPorProyectoReducer from './features/simulacionPorProyecto/simulacionPorProyectoSlice';
import proyectoDesembolsoReducer from './features/proyectoDesembolso/proyectoDesembolsoSlice';
import nivelConsumoReducer from './features/nivelConsumo/nivelConsumoSlice';
import proyectoPlanInversionReducer from './features/proyectoPlanInversion/proyectoPlanInversionSlice';
import descuentoTarifaReducer from './features/descuentoTarifa/descuentoTarifaSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    usuarios: usuariosReducer,
    common: commonReducer,
    roles: rolesReducer,
    modulos: modulosReducer,
    opcionSistema: opcionSistemaReducer,
    permisos: permisosReducer,
    aplicaciones: aplicacionesReducer,
    auditorias: auditoriasReducer,
    parametroConstantes: parametroConstantesReducer,
    parametroCorreos: parametroCorreosReducer,
    ciudades: ciudadesReducer,
    tiposProyectos: tiposProyectosReducer,
    sectoresProyectos: sectoresProyectosReducer,
    listasDocumentos: listasDocumentosReducer,
    companias: companiasReducer,
    companiasDocumento: companiasDocumentosReducer,
    gestores: gestoresReducer,
    gestoresDocumento: gestoresDocumentosReducer,
    categoriasInversiones: categoriasInversionesReducer,
    proyectos: proyectosReducer,
    proyectosDocumento: proyectosDocumentosReducer,
    proyectoFoto: proyectosFotosReducer,
    inversionistas: inversionistasReducer,
    inversionistasDocumento: inversionistasDocumentosReducer,
    inversionistasContacto: inversionistasContactosReducer,
    inversionistasContactoLegal: inversionistasContactosLegalesReducer,
    vehiculoInversion: vehiculoInversionReducer,
    etapaProyecto: etapaProyectoReducer,
    inversiones: inversionReducer,
    planDetallado: planDetalladoReducer,
    inversionProyecto: inversionProyectoReducer,
    copiaSeguridad: copiaSeguridadReducer,
    envioExtracto: envioExtractoReducer,
    descargaPortafolio: descargaPortafolioReducer,
    consultaProxPagos: consultaProxPagosReducer,
    actividadProyecto: actividadProyectoReducer,
    condicionesPlazo: condicionesPlazoReducer,
    conceptoProyecto:  conceptoProyectoReducer,
    parametroMensual: parametroMensualReducer,
    actividadPorProyecto: actividadPorProyectoReducer,
    conceptoPorProyecto: conceptoPorProyectoReducer,
    comunidadEnergetica: comunidadEnergeticaReducer,
    bancos: bancosReducer,
    proveedores: proveedoresReducer,
    proveedoresDocumento: proveedoresDocumentosReducer,
    precioProyectado: precioProyectadoReducer,
    simulacionPorProyecto: simulacionPorProyectoReducer,
    proyectoPlanInversion: proyectoPlanInversionReducer,
    nivelConsumo: nivelConsumoReducer,
    proyectoDesembolso: proyectoDesembolsoReducer, 
    descuentoTarifa: descuentoTarifaReducer,
  },
});

export default store;
