import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../../shared/components/MyTextField';
import MySelectField from '../../../../../shared/components/MySelectField';
import MyDatePicker from '../../../../../shared/components/MyDatePicker';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../../@crema/redux/features/experienciaDisponibilidad/experienciaDisponibilidadSlice';
import { ESTADOS_DISPONIBILIDAD, aHoraCorta } from '../../../../../shared/constants/Turismo';
import { enteroOpcional, enteroRequerido } from '../../../../../shared/functions/ValidacionesYup';
import { creadorPropTypes } from '../../propTypes';

const validationSchema = yup.object({
  fecha: yup.string().required('Requerido').nullable(),
  hora_inicio: yup.string().required('Requerido'),
  hora_fin: yup
    .string()
    .nullable()
    .test('hora-fin', 'Debe ser posterior a la hora de inicio', function (valor) {
      const { hora_inicio: inicio } = this.parent;
      return !valor || !inicio || valor > inicio;
    }),
  capacidad: enteroRequerido().min(1, 'Mínimo 1'),
  cupos_disponibles: enteroOpcional()
    .min(0, 'No puede ser negativo')
    .test('cupos', 'No puede superar la capacidad', function (valor) {
      const { capacidad } = this.parent;
      return valor === null || valor === undefined || !capacidad || valor <= capacidad;
    }),
});

const ExperienciaDisponibilidadCreador = (props) => {
  const { disponibilidad, experienciaId, accion, handleOnClose, updateColeccion, titulo } = props;
  const disabled = accion === 'ver';

  const initialValues = (registro) => ({
    id: registro?.id ?? '',
    experiencia_id: registro?.experiencia_id ?? Number(experienciaId),
    fecha: registro?.fecha ?? '',
    hora_inicio: aHoraCorta(registro?.hora_inicio),
    hora_fin: aHoraCorta(registro?.hora_fin),
    capacidad: registro?.capacidad ?? '',
    cupos_disponibles: registro?.cupos_disponibles ?? '',
    estado: registro?.estado ?? 'disponible',
  });

  return (
    <AppCrudDialog
      stateKey='experienciaDisponibilidad'
      registroId={disponibilidad}
      accion={accion}
      handleOnClose={handleOnClose}
      updateColeccion={updateColeccion}
      onShow={onShow}
      onCreate={onCreate}
      onUpdate={onUpdate}
      resetActual={resetActual}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ saving }) => (
        <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
          <MyDatePicker label='Fecha *' name='fecha' disabled={disabled} />
          <MySelectField fullWidth variant='standard' label='Estado' name='estado' options={ESTADOS_DISPONIBILIDAD} disabled={disabled} />
          <MyTextField fullWidth label='Hora Inicio' name='hora_inicio' type='time' InputLabelProps={{ shrink: true }} disabled={disabled} required />
          <MyTextField fullWidth label='Hora Fin' name='hora_fin' type='time' InputLabelProps={{ shrink: true }} disabled={disabled} />
          <MyTextField fullWidth label='Capacidad' name='capacidad' type='number' disabled={disabled} required />
          <MyTextField fullWidth label='Cupos Disponibles (vacío = capacidad)' name='cupos_disponibles' type='number' disabled={disabled} />
        </AppCrudForm>
      )}
    </AppCrudDialog>
  );
};

ExperienciaDisponibilidadCreador.propTypes = {
  ...creadorPropTypes,
  disponibilidad: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ExperienciaDisponibilidadCreador;
