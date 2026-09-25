import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@mui/material/Icon';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/caracteristicas/caracteristicasSlice';
import { colorActivo, valorActivo } from '../../../shared/constants/Turismo';
import CaracteristicaCreador from './CaracteristicaCreador';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'icono', typeHead: 'string', label: 'Icono', value: (v) => (v ? <Icon fontSize='small'>{v}</Icon> : ''), align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const filtrosConfig = [{ name: 'nombre', label: 'Nombre', type: 'text' }];

const Caracteristica = ({ route }) => {
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();

  return (
    <>
      <AppCrudTable
        stateKey='caracteristicas'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Característica'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
      />
      {formulario && (
        <CaracteristicaCreador
          caracteristica={formulario.id}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo={titulo}
        />
      )}
    </>
  );
};

Caracteristica.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Caracteristica;
