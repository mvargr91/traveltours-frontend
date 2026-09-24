import React from 'react';
import PropTypes from 'prop-types';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import MySelectField from '../../../../shared/components/MySelectField';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyDatePicker from '../../../../shared/components/MyDatePicker';
import { OPCIONES_ESTADO, TIPOS_DESCUENTO } from '../../../../shared/constants/Turismo';

const CuponForm = ({ values, accion, titulo, handleOnClose, saving }) => {
  const disabled = accion === 'ver';

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      <MyTextField autoFocus fullWidth label='Nombre' name='nombre' disabled={disabled} required />
      <MySelectField fullWidth variant='standard' label='Tipo de Descuento' name='tipo' options={TIPOS_DESCUENTO} disabled={disabled} required />
      {values.tipo === 'porcentaje' ? (
        <MyTextField fullWidth label='Descuento (%)' name='descuento' type='number' inputProps={{ min: 0, max: 100, step: '0.01' }} disabled={disabled} required />
      ) : (
        <MyCurrencyField fullWidth label='Valor del Descuento' name='valor' disabled={disabled} required />
      )}
      <MyTextField fullWidth label='Cantidad Disponible (vacío = ilimitado)' name='cantidad' type='number' disabled={disabled} />
      <MyDatePicker label='Fecha Inicio *' name='fecha_inicio' disabled={disabled} />
      <MyDatePicker label='Fecha Fin *' name='fecha_fin' disabled={disabled} />
      <MyTextField className='campo-completo' fullWidth multiline minRows={2} label='Descripción' name='descripcion' disabled={disabled} />
      <MyRadioField label='Estado' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
    </AppCrudForm>
  );
};

CuponForm.propTypes = {
  values: PropTypes.object.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default CuponForm;
