import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@mui/material/Icon';
import InputAdornment from '@mui/material/InputAdornment';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import { OPCIONES_ESTADO } from '../../../../shared/constants/Turismo';

const CaracteristicaForm = ({ values, accion, titulo, handleOnClose, saving }) => {
  const disabled = accion === 'ver';

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      <MyTextField autoFocus fullWidth label='Nombre' name='nombre' disabled={disabled} required />
      <MyTextField
        fullWidth
        label='Icono (Material Icons)'
        name='icono'
        placeholder='wifi, restaurant, pool...'
        disabled={disabled}
        InputProps={{
          endAdornment: values.icono ? (
            <InputAdornment position='end'>
              <Icon>{values.icono}</Icon>
            </InputAdornment>
          ) : null,
        }}
      />
      <MyRadioField label='Estado' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
    </AppCrudForm>
  );
};

CaracteristicaForm.propTypes = {
  values: PropTypes.object.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default CaracteristicaForm;
