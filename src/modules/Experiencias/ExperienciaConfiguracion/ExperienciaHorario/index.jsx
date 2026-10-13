import React from 'react';
import { Alert } from '@mui/material';
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
  {
    id: 'vigente_desde',
    typeHead: 'string',
    label: 'Temporada',
    value: (v, row) => (v || row.vigente_hasta ? `${v ?? '…'} a ${row.vigente_hasta ?? '…'}` : 'Todo el año'),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
];

const ExperienciaHorario = ({ experienciaId, permisos, urlAyuda }) => {
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();

  return (
    <>
      <Alert severity='info' sx={{ mb: 3 }}>
        Con cada horario activo el sistema crea solo las fechas de los próximos días en la pestaña de disponibilidad, con
        los cupos de la capacidad del horario (o la capacidad máxima de la experiencia si se deja vacía). Para un día
        puntual sin salida, cancela esa fecha en la disponibilidad. Si el tour es de temporada (por ejemplo solo noviembre
        y diciembre), pon las fechas de la temporada en el horario: se crean todas de una vez para venderlas con anticipación.
      </Alert>
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
