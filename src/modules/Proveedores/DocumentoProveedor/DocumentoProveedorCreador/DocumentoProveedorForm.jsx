import React from 'react';
import PropTypes from 'prop-types';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyFileField from '../../../../shared/components/MyFileField';
import MyTextField from '../../../../shared/components/MyTextField';
import MySelectField from '../../../../shared/components/MySelectField';
import MyDatePicker from '../../../../shared/components/MyDatePicker';
import {
  ESTADOS_DOCUMENTO,
  TIPOS_DOCUMENTO_PROVEEDOR,
} from '../../../../shared/constants/Turismo';

const DocumentoProveedorForm = ({ values, accion, titulo, handleOnClose, saving }) => {
  const disabled = accion === 'ver';

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      <MySelectField fullWidth variant='standard' label='Tipo de Documento' name='tipo_documento' options={TIPOS_DOCUMENTO_PROVEEDOR} disabled={disabled} required />
      <MyFileField className='campo-completo' label='Documento' tipo='documento' rutaActual={values.nombre_archivo || values.ruta_archivo} disabled={disabled} />
      <MyDatePicker label='Fecha de Vencimiento' name='fecha_vencimiento' disabled={disabled} />
      <MySelectField fullWidth variant='standard' label='Estado' name='estado' options={ESTADOS_DOCUMENTO} disabled={disabled} required />
      {values.estado === 'rechazado' && (
        <MyTextField className='campo-completo' fullWidth multiline minRows={2} label='Motivo del Rechazo' name='motivo_rechazo' disabled={disabled} required />
      )}
    </AppCrudForm>
  );
};

DocumentoProveedorForm.propTypes = {
  values: PropTypes.object.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default DocumentoProveedorForm;
