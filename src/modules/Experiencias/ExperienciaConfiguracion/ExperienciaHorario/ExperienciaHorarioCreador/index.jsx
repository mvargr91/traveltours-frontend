import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../../shared/components/MyTextField';
import MyRadioField from '../../../../../shared/components/MyRadioField';
import MySelectField from '../../../../../shared/components/MySelectField';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../../@crema/redux/features/experienciaHorarios/experienciaHorariosSlice';
import {
  DIAS_SEMANA,
  OPCIONES_ESTADO,
  aHoraCorta,
  aRadio,
} from '../../../../../shared/constants/Turismo';
import { enteroOpcional } from '../../../../../shared/functions/ValidacionesYup';
import { creadorPropTypes } from '../../propTypes';

const validationSchema = yup.object({
  dia_semana: yup.number().typeError('Requerido').required('Requerido'),
  hora_inicio: yup.string().required('Requerido'),
  hora_fin: yup
    .string()
    .required('Requerido')
    .test('hora-fin', 'Debe ser posterior a la hora de inicio', function (valor) {
      const { hora_inicio: inicio } = this.parent;
      return !valor || !inicio || valor > inicio;
    }),
  capacidad: enteroOpcional().min(1, 'Mínimo 1'),
});

const ExperienciaHorarioCreador = (props) => {
  const { horario, experienciaId, accion, handleOnClose, updateColeccion, titulo } = props;
  const disabled = accion === 'ver';

  const initialValues = (registro) => ({
    id: registro?.id ?? '',
    experiencia_id: registro?.experiencia_id ?? Number(experienciaId),
    dia_semana: registro?.dia_semana ?? '',
    // El backend valida H:i; MySQL devuelve HH:mm:ss.
    hora_inicio: aHoraCorta(registro?.hora_inicio),
    hora_fin: aHoraCorta(registro?.hora_fin),
    capacidad: registro?.capacidad ?? '',
    estado: aRadio(registro?.estado),
  });

  return (
    <AppCrudDialog
      stateKey='experienciaHorarios'
      registroId={horario}
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
          <MySelectField fullWidth variant='standard' label='Día de la Semana' name='dia_semana' options={DIAS_SEMANA} disabled={disabled} required />
          <MyTextField fullWidth label='Capacidad' name='capacidad' type='number' disabled={disabled} />
          <MyTextField fullWidth label='Hora Inicio' name='hora_inicio' type='time' InputLabelProps={{ shrink: true }} disabled={disabled} required />
          <MyTextField fullWidth label='Hora Fin' name='hora_fin' type='time' InputLabelProps={{ shrink: true }} disabled={disabled} required />
          <MyRadioField label='Estado' name='estado' disabled={disabled} options={OPCIONES_ESTADO} />
        </AppCrudForm>
      )}
    </AppCrudDialog>
  );
};

ExperienciaHorarioCreador.propTypes = {
  ...creadorPropTypes,
  horario: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ExperienciaHorarioCreador;
