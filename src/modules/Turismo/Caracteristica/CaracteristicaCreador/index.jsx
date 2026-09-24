import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/caracteristicas/caracteristicasSlice';
import { aRadio } from '../../../../shared/constants/Turismo';
import CaracteristicaForm from './CaracteristicaForm';

const validationSchema = yup.object({
  nombre: yup.string().required('Requerido').max(128, 'Máximo 128 caracteres'),
  icono: yup.string().max(100, 'Máximo 100 caracteres').nullable(),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  nombre: registro?.nombre ?? '',
  icono: registro?.icono ?? '',
  estado: aRadio(registro?.estado),
});

const CaracteristicaCreador = ({ caracteristica, accion, handleOnClose, updateColeccion, titulo }) => (
  <AppCrudDialog
    stateKey='caracteristicas'
    registroId={caracteristica}
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
    {({ values, saving }) => (
      <CaracteristicaForm
        values={values}
        accion={accion}
        titulo={titulo}
        handleOnClose={handleOnClose}
        saving={saving}
      />
    )}
  </AppCrudDialog>
);

CaracteristicaCreador.propTypes = {
  caracteristica: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default CaracteristicaCreador;
