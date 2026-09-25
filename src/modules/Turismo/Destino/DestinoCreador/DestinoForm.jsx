import React from 'react';
import PropTypes from 'prop-types';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyFileField from '../../../../shared/components/MyFileField';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import { OPCIONES_ESTADO, OPCIONES_SI_NO } from '../../../../shared/constants/Turismo';
import { useSlugAutomatico } from '../../../../shared/functions/ValidacionesYup';

const DestinoForm = ({ values, setFieldValue, accion, titulo, handleOnClose, saving }) => {
  const disabled = accion === 'ver';
  useSlugAutomatico({ accion, nombre: values.nombre, setFieldValue });

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      <MyTextField autoFocus fullWidth label='Nombre' name='nombre' disabled={disabled} required />
      <MyTextField fullWidth label='Slug' name='slug' disabled={disabled} required />
      <MyTextField fullWidth label='País' name='pais' disabled={disabled} />
      <MyTextField fullWidth label='Departamento' name='departamento' disabled={disabled} />
      <MyTextField fullWidth label='Ciudad' name='ciudad' disabled={disabled} />
      <MyFileField className='campo-completo' label='Imagen' tipo='imagen' rutaActual={values.imagen} disabled={disabled} />
      <MyTextField fullWidth label='Latitud' name='latitud' type='number' disabled={disabled} />
      <MyTextField fullWidth label='Longitud' name='longitud' type='number' disabled={disabled} />
      <MyTextField className='campo-completo' fullWidth multiline minRows={3} label='Descripción' name='descripcion' disabled={disabled} />
      <MyRadioField label='Destacado' name='destacado' disabled={disabled} options={OPCIONES_SI_NO} />
      <MyRadioField label='Estado' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
    </AppCrudForm>
  );
};

DestinoForm.propTypes = {
  values: PropTypes.object.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default DestinoForm;
