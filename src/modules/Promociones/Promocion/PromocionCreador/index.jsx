import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/promociones/promocionesSlice';
import { aRadio } from '../../../../shared/constants/Turismo';
import { fechaFinPosterior, numeroRequerido } from '../../../../shared/functions/ValidacionesYup';
import PromocionForm from './PromocionForm';

const validationSchema = yup.object({
  nombre: yup.string().required('Requerido').max(150, 'Máximo 150 caracteres'),
  tipo_descuento: yup.string().required('Requerido'),
  valor_descuento: numeroRequerido()
    .min(0.01, 'Debe ser mayor a 0')
    .when('tipo_descuento', {
      is: 'porcentaje',
      then: (schema) => schema.max(100, 'Máximo 100 %'),
    }),
  fecha_inicio: yup.string().required('Requerido').nullable(),
  fecha_fin: fechaFinPosterior(),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  nombre: registro?.nombre ?? '',
  descripcion: registro?.descripcion ?? '',
  tipo_descuento: registro?.tipo_descuento ?? 'porcentaje',
  valor_descuento: registro?.valor_descuento ?? '',
  fecha_inicio: registro?.fecha_inicio ?? '',
  fecha_fin: registro?.fecha_fin ?? '',
  estado: aRadio(registro?.estado),
});

const PromocionCreador = ({ promocion, accion, handleOnClose, updateColeccion, titulo }) => (
  <AppCrudDialog
    stateKey='promociones'
    registroId={promocion}
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
      <PromocionForm
        values={values}
        accion={accion}
        titulo={titulo}
        handleOnClose={handleOnClose}
        saving={saving}
      />
    )}
  </AppCrudDialog>
);

PromocionCreador.propTypes = {
  promocion: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default PromocionCreador;
