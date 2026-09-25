import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/cupones/cuponesSlice';
import { aRadio } from '../../../../shared/constants/Turismo';
import {
  enteroOpcional,
  fechaFinPosterior,
  numeroOpcional,
} from '../../../../shared/functions/ValidacionesYup';
import CuponForm from './CuponForm';

const validationSchema = yup.object({
  tipo: yup.string().required('Requerido'),
  nombre: yup.string().required('Requerido').max(150, 'Máximo 150 caracteres'),
  cantidad: enteroOpcional().min(1, 'Mínimo 1'),
  descuento: numeroOpcional().when('tipo', {
    is: 'porcentaje',
    then: (schema) => schema.required('Requerido').min(0.01, 'Mayor a 0').max(100, 'Máximo 100'),
  }),
  valor: numeroOpcional().when('tipo', {
    is: 'valor_fijo',
    then: (schema) => schema.required('Requerido').min(1, 'Mayor a 0'),
  }),
  fecha_inicio: yup.string().required('Requerido').nullable(),
  fecha_fin: fechaFinPosterior(),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  tipo: registro?.tipo ?? 'porcentaje',
  nombre: registro?.nombre ?? '',
  descripcion: registro?.descripcion ?? '',
  cantidad: registro?.cantidad ?? '',
  descuento: registro?.descuento ?? '',
  valor: registro?.valor ?? '',
  fecha_inicio: registro?.fecha_inicio ?? '',
  fecha_fin: registro?.fecha_fin ?? '',
  estado: aRadio(registro?.estado),
});

// Solo se envía el campo que corresponde al tipo de descuento.
const transformarAntesDeEnviar = (data) => ({
  ...data,
  descuento: data.tipo === 'porcentaje' ? data.descuento : null,
  valor: data.tipo === 'valor_fijo' ? data.valor : null,
});

const CuponCreador = ({ cupon, accion, handleOnClose, updateColeccion, titulo }) => (
  <AppCrudDialog
    stateKey='cupones'
    registroId={cupon}
    accion={accion}
    handleOnClose={handleOnClose}
    updateColeccion={updateColeccion}
    onShow={onShow}
    onCreate={onCreate}
    onUpdate={onUpdate}
    resetActual={resetActual}
    initialValues={initialValues}
    validationSchema={validationSchema}
    transformarAntesDeEnviar={transformarAntesDeEnviar}
  >
    {({ values, saving }) => (
      <CuponForm
        values={values}
        accion={accion}
        titulo={titulo}
        handleOnClose={handleOnClose}
        saving={saving}
      />
    )}
  </AppCrudDialog>
);

CuponCreador.propTypes = {
  cupon: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default CuponCreador;
