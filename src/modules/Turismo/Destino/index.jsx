import React from 'react';
import PropTypes from 'prop-types';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/destinos/destinosSlice';
import { colorActivo, valorActivo, valorSiNo } from '../../../shared/constants/Turismo';
import DestinoCreador from './DestinoCreador';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'ciudad', typeHead: 'string', label: 'Ciudad', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'departamento', typeHead: 'string', label: 'Departamento', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'destacado', typeHead: 'string', label: 'Destacado', value: valorSiNo, align: 'left', mostrarInicio: true },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const filtrosConfig = [{ name: 'nombre', label: 'Nombre', type: 'text' }];

const Destino = ({ route }) => {
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();

  return (
    <>
      <AppCrudTable
        stateKey='destinos'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Destino'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
      />
      {formulario && (
        <DestinoCreador
          destino={formulario.id}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo={titulo}
        />
      )}
    </>
  );
};

Destino.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Destino;
