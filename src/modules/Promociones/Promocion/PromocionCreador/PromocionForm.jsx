import React from 'react';
import PropTypes from 'prop-types';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import MySelectField from '../../../../shared/components/MySelectField';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyDatePicker from '../../../../shared/components/MyDatePicker';
import { OPCIONES_ESTADO, TIPOS_DESCUENTO } from '../../../../shared/constants/Turismo';

const PromocionForm = ({ values, accion, titulo, handleOnClose, saving }) => {
  const disabled = accion === 'ver';

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      <MyTextField className='campo-completo' autoFocus fullWidth label='Nombre' name='nombre' disabled={disabled} required />
      <MySelectField fullWidth variant='standard' label='Tipo de Descuento' name='tipo_descuento' options={TIPOS_DESCUENTO} disabled={disabled} required />
      {values.tipo_descuento === 'porcentaje' ? (
        <MyTextField fullWidth label='Descuento (%)' name='valor_descuento' type='number' inputProps={{ min: 0, max: 100, step: '0.01' }} disabled={disabled} required />
      ) : (
        <MyCurrencyField fullWidth label='Valor del Descuento' name='valor_descuento' disabled={disabled} required />
      )}
      <MyDatePicker label='Fecha Inicio *' name='fecha_inicio' disabled={disabled} />
      <MyDatePicker label='Fecha Fin *' name='fecha_fin' disabled={disabled} />
      <MyTextField className='campo-completo' fullWidth multiline minRows={3} label='Descripción' name='descripcion' disabled={disabled} />
      <MyRadioField label='Estado' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
    </AppCrudForm>
  );
};

PromocionForm.propTypes = {
  values: PropTypes.object.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default PromocionForm;
