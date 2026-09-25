import React from 'react';
import AppCrudTable from '../../../../shared/components/AppCrudTable';
import useCrudModulo from '../../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
} from '../../../../@crema/redux/features/experienciaCaracteristicas/experienciaCaracteristicasSlice';
import { valorSiNo } from '../../../../shared/constants/Turismo';
import { pestanaPropTypes } from '../propTypes';
import ExperienciaCaracteristicaCreador from './ExperienciaCaracteristicaCreador';

const cells = [
  { id: 'caracteristica_nombre', typeHead: 'string', label: 'Característica', value: (v) => v, align: 'left', mostrarInicio: true },
  {
    id: 'incluida',
    typeHead: 'string',
    label: 'Incluida',
    value: valorSiNo,
    cellColor: (v) => (valorSiNo(v) === 'Sí' ? 'green' : '#FE8500'),
    align: 'left',
    mostrarInicio: true,
  },
];

const ExperienciaCaracteristica = ({ experienciaId, permisos, urlAyuda }) => {
  const { formulario, abrirCrear, abrirEditar, cerrar, refreshKey, updateColeccion } = useCrudModulo();

  return (
    <>
      <AppCrudTable
        stateKey='experienciaCaracteristicas'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosFijos={{ experiencia_id: experienciaId }}
        paginado={false}
        titulo='Características'
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Característica'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
      />
      {formulario && (
        <ExperienciaCaracteristicaCreador
          registro={formulario.row}
          experienciaId={experienciaId}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo='Característica de la Experiencia'
        />
      )}
    </>
  );
};

ExperienciaCaracteristica.propTypes = pestanaPropTypes;

export default ExperienciaCaracteristica;
