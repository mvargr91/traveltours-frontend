import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppCrudDialog from '../../../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../../../shared/components/AppCrudForm';
import FormikAutocomplete from '../../../../../shared/components/FormikAutocomplete';
import MyRadioField from '../../../../../shared/components/MyRadioField';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../../@crema/redux/features/experienciaCaracteristicas/experienciaCaracteristicasSlice';
import { onGetColeccionLigera as onGetCaracteristicas } from '../../../../../@crema/redux/features/caracteristicas/caracteristicasSlice';
import { aRadio } from '../../../../../shared/constants/Turismo';
import { creadorPropTypes } from '../../propTypes';

const OPCIONES_INCLUIDA = [
  { value: '1', label: 'Incluida' },
  { value: '0', label: 'No incluida' },
];

const validationSchema = yup.object({
  caracteristica_id: yup.string().required('Requerido'),
  incluida: yup.string().required('Requerido'),
});

const ExperienciaCaracteristicaCreador = (props) => {
  const { registro, experienciaId, accion, handleOnClose, updateColeccion, titulo } = props;
  const dispatch = useDispatch();
  const caracteristicas = useSelector((state) => state.caracteristicas.coleccionLigera);
  const asignadas = useSelector((state) => state.experienciaCaracteristicas.rows);

  useEffect(() => {
    dispatch(onGetCaracteristicas());
  }, [dispatch]);

  // En creación se ocultan las ya asignadas; en edición solo cambia "incluida".
  const idsAsignados = new Set(asignadas.map((row) => row.caracteristica_id));
  const opciones =
    accion === 'crear'
      ? caracteristicas.filter((c) => !idsAsignados.has(c.id))
      : [{ id: registro?.caracteristica_id, nombre: registro?.caracteristica_nombre }];

  const initialValues = (actual) => ({
    id: actual?.id ?? '',
    experiencia_id: Number(experienciaId),
    caracteristica_id: actual?.caracteristica_id ?? '',
    incluida: aRadio(actual?.incluida),
  });

  return (
    <AppCrudDialog
      stateKey='experienciaCaracteristicas'
      registroId={registro?.id}
      registroInicial={registro}
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
          <FormikAutocomplete
            className='campo-completo'
            name='caracteristica_id'
            label='Característica *'
            options={opciones}
            disabled={accion !== 'crear'}
            textFieldProps={{ variant: 'standard' }}
          />
          <MyRadioField label='¿Incluida en la experiencia?' name='incluida' options={OPCIONES_INCLUIDA} disabled={accion === 'ver'} />
        </AppCrudForm>
      )}
    </AppCrudDialog>
  );
};

ExperienciaCaracteristicaCreador.propTypes = {
  ...creadorPropTypes,
  registro: PropTypes.object,
};

export default ExperienciaCaracteristicaCreador;
