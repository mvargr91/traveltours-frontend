import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import FolderIcon from '@mui/icons-material/Folder';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import AppEstadoDialog from '../../../shared/components/AppEstadoDialog';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
  onVerificar,
} from '../../../@crema/redux/features/proveedoresTuristicos/proveedoresTuristicosSlice';
import {
  ESTADOS_VERIFICACION,
  colorActivo,
  colorDe,
  nombreDe,
  valorActivo,
} from '../../../shared/constants/Turismo';
import ProveedorTuristicoCreador from './ProveedorTuristicoCreador';

const cells = [
  { id: 'nombre_comercial', typeHead: 'string', label: 'Nombre Comercial', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'nit', typeHead: 'string', label: 'NIT', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'destino_nombre', typeHead: 'string', label: 'Destino', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'telefono', typeHead: 'string', label: 'Teléfono', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'correo', typeHead: 'string', label: 'Correo', value: (v) => v, align: 'left', mostrarInicio: false, ordenable: false },
  { id: 'rnt', typeHead: 'string', label: 'RNT', value: (v) => v, align: 'left', mostrarInicio: false, ordenable: false },
  {
    id: 'usuario_id',
    typeHead: 'string',
    label: 'Acceso al Panel',
    value: (v) => (v ? 'Vinculado' : 'Sin cuenta'),
    cellColor: (v) => (v ? 'green' : '#FE8500'),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  {
    id: 'estado_verificacion',
    typeHead: 'string',
    label: 'Verificación',
    value: (v) => nombreDe(ESTADOS_VERIFICACION, v),
    cellColor: (v) => colorDe(ESTADOS_VERIFICACION, v),
    align: 'left',
    mostrarInicio: true,
  },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const filtrosConfig = [{ name: 'nombre', label: 'Nombre Comercial', type: 'text' }];

const ProveedorTuristico = ({ route }) => {
  const navigate = useNavigate();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();
  const [proveedorAVerificar, setProveedorAVerificar] = useState(null);

  const accionesExtra = [
    {
      titulo: 'Verificar',
      icono: VerifiedUserIcon,
      permiso: 'Modificar',
      onClick: setProveedorAVerificar,
    },
    {
      titulo: 'Documentos',
      icono: FolderIcon,
      permiso: 'Listar',
      onClick: (row) => navigate(`/proveedores-turisticos/${row.id}/documentos`),
    },
  ];

  return (
    <>
      <AppCrudTable
        stateKey='proveedoresTuristicos'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Proveedor'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
        accionesExtra={accionesExtra}
      />
      {formulario && (
        <ProveedorTuristicoCreador
          proveedor={formulario.id}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo={titulo}
        />
      )}
      {proveedorAVerificar && (
        <AppEstadoDialog
          stateKey='proveedoresTuristicos'
          titulo={`Verificar: ${proveedorAVerificar.nombre_comercial}`}
          registro={proveedorAVerificar}
          campo='estado_verificacion'
          etiqueta='Estado de Verificación'
          opciones={ESTADOS_VERIFICACION}
          campoObservaciones='observaciones_verificacion'
          etiquetaObservaciones='Observaciones de Verificación'
          thunk={onVerificar}
          handleOnClose={() => setProveedorAVerificar(null)}
          updateColeccion={updateColeccion}
        />
      )}
    </>
  );
};

ProveedorTuristico.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default ProveedorTuristico;
