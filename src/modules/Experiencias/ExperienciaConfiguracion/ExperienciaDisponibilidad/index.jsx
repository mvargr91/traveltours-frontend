import React from 'react';
import AppCrudTable from '../../../../shared/components/AppCrudTable';
import useCrudModulo from '../../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
} from '../../../../@crema/redux/features/experienciaDisponibilidad/experienciaDisponibilidadSlice';
import {
  ESTADOS_DISPONIBILIDAD,
  aHoraCorta,
  colorDe,
  nombreDe,
} from '../../../../shared/constants/Turismo';
import { pestanaPropTypes } from '../propTypes';
import ExperienciaDisponibilidadCreador from './ExperienciaDisponibilidadCreador';

const cells = [
  { id: 'fecha', typeHead: 'string', label: 'Fecha', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'hora_inicio', typeHead: 'string', label: 'Hora Inicio', value: aHoraCorta, align: 'left', mostrarInicio: true },
  { id: 'hora_fin', typeHead: 'string', label: 'Hora Fin', value: aHoraCorta, align: 'left', mostrarInicio: true },
  { id: 'capacidad', typeHead: 'numeric', label: 'Capacidad', value: (v) => v, align: 'right', mostrarInicio: true },
  { id: 'cupos_disponibles', typeHead: 'numeric', label: 'Cupos Disponibles', value: (v) => v, align: 'right', mostrarInicio: true },
  {
    id: 'estado',
    typeHead: 'string',
    label: 'Estado',
    value: (v) => nombreDe(ESTADOS_DISPONIBILIDAD, v),
    cellColor: (v) => colorDe(ESTADOS_DISPONIBILIDAD, v),
    align: 'left',
    mostrarInicio: true,
  },
];

const filtrosConfig = [
  { name: 'fecha_desde', label: 'Desde', type: 'date' },
  { name: 'fecha_hasta', label: 'Hasta', type: 'date' },
];

const ExperienciaDisponibilidad = ({ experienciaId, permisos, urlAyuda }) => {
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();

  return (
    <>
      <AppCrudTable
        stateKey='experienciaDisponibilidad'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        filtrosFijos={{ experiencia_id: experienciaId }}
        paginado={false}
        titulo='Disponibilidad por Fecha'
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Disponibilidad'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
      />
      {formulario && (
        <ExperienciaDisponibilidadCreador
          disponibilidad={formulario.id}
          experienciaId={experienciaId}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo='Disponibilidad'
        />
      )}
    </>
  );
};

ExperienciaDisponibilidad.propTypes = pestanaPropTypes;

export default ExperienciaDisponibilidad;
