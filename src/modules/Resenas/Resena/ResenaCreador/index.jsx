import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/resenas/resenasSlice';
import ResenaForm from './ResenaForm';

const validationSchema = yup.object({
  calificacion: yup.number().required('Requerido').min(1, 'Mínimo 1').max(5, 'Máximo 5'),
  estado: yup.string().required('Requerido'),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  calificacion: registro?.calificacion ?? 5,
  comentario: registro?.comentario ?? '',
  estado: registro?.estado ?? 'pendiente',
});

const ResenaCreador = (props) => {
  const { resena, experienciaNombre, accion, handleOnClose, updateColeccion, titulo } = props;

  return (
    <AppCrudDialog
      stateKey='resenas'
      registroId={resena}
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
      {({ values, setFieldValue, registro, saving }) => (
        <ResenaForm
          values={values}
          setFieldValue={setFieldValue}
          registro={registro}
          experienciaNombre={experienciaNombre}
          accion={accion}
          titulo={titulo}
          handleOnClose={handleOnClose}
          saving={saving}
        />
      )}
    </AppCrudDialog>
  );
};

ResenaCreador.propTypes = {
  resena: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  experienciaNombre: PropTypes.string,
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default ResenaCreador;
