import React from 'react';
import AppCrudTable from '../../../../shared/components/AppCrudTable';
import useCrudModulo from '../../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
} from '../../../../@crema/redux/features/experienciaHorarios/experienciaHorariosSlice';
import {
  DIAS_SEMANA,
  aHoraCorta,
  colorActivo,
  nombreDe,
  valorActivo,
} from '../../../../shared/constants/Turismo';
import { pestanaPropTypes } from '../propTypes';
import ExperienciaHorarioCreador from './ExperienciaHorarioCreador';

const cells = [
  { id: 'dia_semana', typeHead: 'string', label: 'Día', value: (v) => nombreDe(DIAS_SEMANA, v), align: 'left', mostrarInicio: true },
  { id: 'hora_inicio', typeHead: 'string', label: 'Hora Inicio', value: aHoraCorta, align: 'left', mostrarInicio: true },
  { id: 'hora_fin', typeHead: 'string', label: 'Hora Fin', value: aHoraCorta, align: 'left', mostrarInicio: true },
  { id: 'capacidad', typeHead: 'numeric', label: 'Capacidad', value: (v) => v, align: 'right', mostrarInicio: true },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
];

const ExperienciaHorario = ({ experienciaId, permisos, urlAyuda }) => {
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();

  return (
    <>
      <AppCrudTable
        stateKey='experienciaHorarios'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosFijos={{ experiencia_id: experienciaId }}
        paginado={false}
        titulo='Horarios Semanales'
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Horario'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
      />
      {formulario && (
        <ExperienciaHorarioCreador
          horario={formulario.id}
          experienciaId={experienciaId}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo='Horario'
        />
      )}
    </>
  );
};

ExperienciaHorario.propTypes = pestanaPropTypes;

export default ExperienciaHorario;
