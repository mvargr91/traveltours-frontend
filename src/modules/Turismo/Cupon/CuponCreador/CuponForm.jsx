import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Autocomplete, TextField } from '@mui/material';
import jwtAxios from '@crema/services/auth/jwt-auth';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import MySelectField from '../../../../shared/components/MySelectField';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyDatePicker from '../../../../shared/components/MyDatePicker';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import { OPCIONES_ESTADO, TIPOS_DESCUENTO } from '../../../../shared/constants/Turismo';

const CuponForm = ({ values, setFieldValue, registro, accion, titulo, handleOnClose, saving, proveedores, proveedorPropio }) => {
  const disabled = accion === 'ver';
  const [experiencias, setExperiencias] = useState([]);

  // Experiencias a las que se puede limitar el cupón: las del proveedor elegido (o todas si es de la plataforma).
  useEffect(() => {
    const params = { ligera: 1, todas: 1, ...(values.proveedor_id ? { proveedor_id: values.proveedor_id } : {}) };
    jwtAxios.get('experiencias', { params }).then(({ data }) => setExperiencias(data)).catch(() => setExperiencias([]));
  }, [values.proveedor_id]);

  // Al cambiar de proveedor se quitan las experiencias que no son suyas.
  useEffect(() => {
    if (!values.proveedor_id || !experiencias.length) return;
    const validas = values.experiencias.filter((id) => experiencias.some((e) => e.id === id));
    if (validas.length !== values.experiencias.length) setFieldValue('experiencias', validas);
  }, [experiencias]); // eslint-disable-line react-hooks/exhaustive-deps

  const seleccionadas = experiencias.filter((e) => values.experiencias.includes(e.id));

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      {registro && (
        <Alert className='campo-completo' severity='info'>
          Usos: <strong>{registro.usos}</strong>
          {registro.cantidad ? ` de ${registro.cantidad}` : ' (ilimitado)'} — las reservas canceladas o rechazadas no cuentan.
        </Alert>
      )}
      <MyTextField
        autoFocus
        fullWidth
        label='Código'
        name='codigo'
        placeholder='Ej: VERANO10'
        helperText='Lo que escribe el viajero al reservar. Letras, números, - y _'
        inputProps={{ style: { textTransform: 'uppercase' } }}
        disabled={disabled}
        required
      />
      <MyTextField fullWidth label='Nombre' name='nombre' disabled={disabled} required />
      <FormikAutocomplete
        name='proveedor_id'
        label={proveedorPropio ? 'Proveedor' : 'Proveedor (vacío = cupón de la plataforma)'}
        options={proveedores}
        disabled={disabled || !!proveedorPropio}
        textFieldProps={{ variant: 'standard' }}
      />
      <Autocomplete
        multiple
        options={experiencias}
        value={seleccionadas}
        getOptionLabel={(e) => e.nombre}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        onChange={(_, nuevas) => setFieldValue('experiencias', nuevas.map((e) => e.id))}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            variant='standard'
            label='Experiencias'
            helperText={values.proveedor_id ? 'Vacío = todas las experiencias del proveedor' : 'Vacío = todas las experiencias'}
          />
        )}
      />
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
  setFieldValue: PropTypes.func.isRequired,
  registro: PropTypes.object,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  proveedores: PropTypes.array.isRequired,
  proveedorPropio: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), nombre: PropTypes.string }),
};

export default CuponForm;
