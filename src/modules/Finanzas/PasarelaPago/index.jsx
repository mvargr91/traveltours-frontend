// Finanzas > Pasarelas de pago: la cuenta de Wompi o Mercado Pago con la que cada proveedor cobra en línea.
// El administrador ve todas (incluida la de la plataforma); el proveedor solo la suya (filtro fijo).
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import jwtAxios from '@crema/services/auth/jwt-auth';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import useProveedorSesion, { conProveedorPropio } from '../../../shared/hooks/useProveedorSesion';
import {
  onGetColeccion,
  onDelete,
  onProbar,
  onCambiarEstado,
} from '../../../@crema/redux/features/pasarelasPago/pasarelasPagoSlice';
import { onGetColeccionLigera as onGetProveedores } from '../../../@crema/redux/features/proveedoresTuristicos/proveedoresTuristicosSlice';
import { ESTADOS_PASARELA } from '../../../shared/constants/Finanzas';
import { colorDe } from '../../../shared/constants/Turismo';
import PasarelaPagoCreador from './PasarelaPagoCreador';

const cells = [
  {
    id: 'proveedor_nombre',
    typeHead: 'string',
    label: 'Proveedor',
    value: (v, row) => (row.es_plataforma ? `${v} (plataforma)` : v),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  { id: 'pasarela_nombre', typeHead: 'string', label: 'Pasarela', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'ambiente_nombre', typeHead: 'string', label: 'Ambiente', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
  {
    id: 'estado_nombre',
    typeHead: 'string',
    label: 'Estado',
    value: (v) => v,
    cellColor: (_v, row) => colorDe(ESTADOS_PASARELA, row?.estado),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  { id: 'comercio_nombre', typeHead: 'string', label: 'Comercio', value: (v) => v ?? '', align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'verificada_en', typeHead: 'string', label: 'Verificada', value: (v) => v ?? '', align: 'left', mostrarInicio: false, ordenable: false },
  {
    id: 'ultimo_error',
    typeHead: 'string',
    label: 'Último error',
    value: (v) => v ?? '',
    cellColor: (v) => (v ? 'red' : ''),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  ...auditCells.map((c) => ({ ...c, ordenable: false })),
];

const PasarelaPago = ({ route }) => {
  const dispatch = useDispatch();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } = useCrudModulo();
  const proveedoresLigera = useSelector((state) => state.proveedoresTuristicos.coleccionLigera);
  const { proveedor } = useProveedorSesion();
  // Pasarelas disponibles y sus campos (llaves que pide cada una).
  const [catalogo, setCatalogo] = useState(null);

  useEffect(() => {
    dispatch(onGetProveedores());
    jwtAxios.get('pasarelas-pago/catalogo').then(({ data }) => setCatalogo(data)).catch(() => setCatalogo(null));
  }, [dispatch]);

  const proveedores = conProveedorPropio(
    proveedoresLigera.map((p) => ({ id: p.id, nombre: p.nombre_comercial ?? p.nombre })),
    proveedor,
  );

  const filtrosConfig = [
    { name: 'proveedor_id', label: 'Proveedor', type: 'select', options: proveedores, fijo: proveedor?.id },
    { name: 'pasarela', label: 'Pasarela', type: 'select', options: catalogo?.pasarelas ?? [] },
    { name: 'estado', label: 'Estado', type: 'select', options: ESTADOS_PASARELA },
  ];

  const accionesExtra = [
    {
      titulo: 'Probar conexión',
      icono: NetworkCheckIcon,
      permiso: 'Modificar',
      onClick: (row) => dispatch(onProbar({ params: { id: row.id }, updateColeccion })),
    },
    {
      titulo: 'Activar',
      icono: ToggleOffIcon,
      permiso: 'Modificar',
      color: 'green',
      visible: (row) => row.estado !== 'activa' && Boolean(row.verificada_en),
      onClick: (row) => dispatch(onCambiarEstado({ params: { id: row.id, estado: 'activa' }, updateColeccion })),
    },
    {
      titulo: 'Desactivar',
      icono: ToggleOnIcon,
      permiso: 'Modificar',
      color: 'red',
      visible: (row) => row.estado === 'activa',
      onClick: (row) => dispatch(onCambiarEstado({ params: { id: row.id, estado: 'inactiva' }, updateColeccion })),
    },
  ];

  return (
    <>
      <AppCrudTable
        stateKey='pasarelasPago'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        subtitulo={
          proveedor
            ? 'Conecta tu cuenta de Wompi o Mercado Pago para que los viajeros paguen en línea tus experiencias. El dinero llega directo a tu cuenta. Sin pasarela activa, tus experiencias se reservan y el viajero te paga a ti.'
            : 'Cuenta de Wompi o Mercado Pago de cada proveedor. La de la plataforma cobra los tours propios y las liquidaciones de los proveedores.'
        }
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Pasarela de pago'
        refreshKey={refreshKey}
        defaultOrderBy=''
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
        accionesExtra={accionesExtra}
      />
      {formulario && catalogo && (
        <PasarelaPagoCreador
          cuenta={formulario.id}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo={titulo}
          catalogo={catalogo}
          proveedores={proveedores}
          proveedorPropio={proveedor}
        />
      )}
    </>
  );
};

PasarelaPago.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default PasarelaPago;
