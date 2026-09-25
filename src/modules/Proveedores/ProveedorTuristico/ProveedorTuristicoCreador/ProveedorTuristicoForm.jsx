import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@mui/material';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import {
  ESTADOS_VERIFICACION,
  OPCIONES_ESTADO,
  nombreDe,
} from '../../../../shared/constants/Turismo';

const severidadVerificacion = { aprobado: 'success', rechazado: 'error', pendiente: 'warning' };

const ProveedorTuristicoForm = (props) => {
  const { registro, accion, titulo, handleOnClose, saving, destinos, usuariosProveedor } = props;
  const disabled = accion === 'ver';

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      {registro?.estado_verificacion && (
        <Alert className='campo-completo' severity={severidadVerificacion[registro.estado_verificacion] ?? 'info'}>
          Verificación: <strong>{nombreDe(ESTADOS_VERIFICACION, registro.estado_verificacion)}</strong>
          {registro.observaciones_verificacion ? ` — ${registro.observaciones_verificacion}` : ''}
        </Alert>
      )}
      <MyTextField autoFocus fullWidth label='Nombre Comercial' name='nombre_comercial' disabled={disabled} required />
      <MyTextField fullWidth label='Razón Social' name='razon_social' disabled={disabled} />
      <MyTextField fullWidth label='NIT' name='nit' disabled={disabled} />
      <MyTextField fullWidth label='Registro Nacional de Turismo (RNT)' name='rnt' disabled={disabled} />
      <MyTextField fullWidth label='Teléfono' name='telefono' disabled={disabled} />
      <MyTextField fullWidth label='Correo' name='correo' type='email' disabled={disabled} />
      <FormikAutocomplete
        name='destino_id'
        label='Destino'
        options={destinos}
        disabled={disabled}
        textFieldProps={{ variant: 'standard' }}
      />
      <MyTextField fullWidth label='Dirección' name='direccion' disabled={disabled} />
      <FormikAutocomplete
        className='campo-completo'
        name='usuario_id'
        label='Cuenta de acceso al panel (usuario con rol Proveedor)'
        options={usuariosProveedor}
        disabled={disabled}
        textFieldProps={{
          variant: 'standard',
          helperText: 'Con esta cuenta el proveedor gestiona sus experiencias y reservas. Crea el usuario en Seguridad > Usuarios con el rol Proveedor.',
        }}
      />
      <MyTextField fullWidth label='Sitio Web' name='sitio_web' disabled={disabled} />
      <MyTextField fullWidth label='Instagram' name='instagram' disabled={disabled} />
      <MyTextField fullWidth label='Facebook' name='facebook' disabled={disabled} />
      <MyTextField className='campo-completo' fullWidth multiline minRows={3} label='Descripción' name='descripcion' disabled={disabled} />
      <MyRadioField label='Estado' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
    </AppCrudForm>
  );
};

ProveedorTuristicoForm.propTypes = {
  registro: PropTypes.object,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  destinos: PropTypes.array.isRequired,
  usuariosProveedor: PropTypes.array.isRequired,
};

export default ProveedorTuristicoForm;
