import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/destinos/destinosSlice';
import { aRadio } from '../../../../shared/constants/Turismo';
import { numeroOpcional, slugRequerido } from '../../../../shared/functions/ValidacionesYup';
import DestinoForm from './DestinoForm';

const validationSchema = yup.object({
  nombre: yup.string().required('Requerido').max(128, 'Máximo 128 caracteres'),
  slug: slugRequerido(150),
  latitud: numeroOpcional().min(-90, 'Mínimo -90').max(90, 'Máximo 90'),
  longitud: numeroOpcional().min(-180, 'Mínimo -180').max(180, 'Máximo 180'),
  imagen: yup.string().url('Debe ser una URL válida').nullable(),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  nombre: registro?.nombre ?? '',
  slug: registro?.slug ?? '',
  pais: registro?.pais ?? 'Colombia',
  departamento: registro?.departamento ?? '',
  ciudad: registro?.ciudad ?? '',
  descripcion: registro?.descripcion ?? '',
  imagen: registro?.imagen ?? '',
  latitud: registro?.latitud ?? '',
  longitud: registro?.longitud ?? '',
  destacado: aRadio(registro?.destacado, '0'),
  estado: aRadio(registro?.estado),
});

const DestinoCreador = ({ destino, accion, handleOnClose, updateColeccion, titulo }) => (
  <AppCrudDialog
    stateKey='destinos'
    registroId={destino}
    accion={accion}
    handleOnClose={handleOnClose}
    updateColeccion={updateColeccion}
    onShow={onShow}
    onCreate={onCreate}
    onUpdate={onUpdate}
    resetActual={resetActual}
    initialValues={initialValues}
    validationSchema={validationSchema}
    maxWidth='md'
  >
    {({ values, setFieldValue, saving }) => (
      <DestinoForm
        values={values}
        setFieldValue={setFieldValue}
        accion={accion}
        titulo={titulo}
        handleOnClose={handleOnClose}
        saving={saving}
      />
    )}
  </AppCrudDialog>
);

DestinoCreador.propTypes = {
  destino: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default DestinoCreador;
