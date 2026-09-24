import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/documentosProveedorTuristico/documentosProveedorTuristicoSlice';
import DocumentoProveedorForm from './DocumentoProveedorForm';

const validationSchema = yup.object({
  tipo_documento: yup.string().required('Requerido').max(100, 'Máximo 100 caracteres'),
  nombre_archivo: yup.string().required('Requerido').max(255, 'Máximo 255 caracteres'),
  ruta_archivo: yup.string().required('Requerido').url('Debe ser una URL válida').max(255, 'Máximo 255 caracteres'),
  estado: yup.string().required('Requerido'),
  motivo_rechazo: yup.string().when('estado', {
    is: 'rechazado',
    then: (schema) => schema.required('Indique el motivo del rechazo'),
    otherwise: (schema) => schema.nullable(),
  }),
});

const DocumentoProveedorCreador = (props) => {
  const { documento, proveedorId, accion, handleOnClose, updateColeccion, titulo } = props;

  const initialValues = (registro) => ({
    id: registro?.id ?? '',
    proveedor_id: registro?.proveedor_id ?? Number(proveedorId),
    tipo_documento: registro?.tipo_documento ?? '',
    nombre_archivo: registro?.nombre_archivo ?? '',
    ruta_archivo: registro?.ruta_archivo ?? '',
    fecha_vencimiento: registro?.fecha_vencimiento ?? '',
    estado: registro?.estado ?? 'pendiente',
    motivo_rechazo: registro?.motivo_rechazo ?? '',
  });

  return (
    <AppCrudDialog
      stateKey='documentosProveedorTuristico'
      registroId={documento}
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
        <DocumentoProveedorForm
          values={values}
          accion={accion}
          titulo={titulo}
          handleOnClose={handleOnClose}
          saving={saving}
        />
      )}
    </AppCrudDialog>
  );
};

DocumentoProveedorCreador.propTypes = {
  documento: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  proveedorId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default DocumentoProveedorCreador;
