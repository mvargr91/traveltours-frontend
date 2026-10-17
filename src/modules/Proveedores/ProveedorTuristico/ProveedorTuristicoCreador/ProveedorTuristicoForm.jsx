import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Box } from '@mui/material';
import AppCrudForm, { SeccionForm } from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import MySelectField from '../../../../shared/components/MySelectField';
import FotosProveedor from '../../../../shared/components/FotosProveedor';
import SelectorCategorias from '../../../../shared/components/SelectorCategorias';
import MyRadioField from '../../../../shared/components/MyRadioField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import {
  ESTADOS_VERIFICACION,
  OPCIONES_ESTADO,
  TIPOS_CUENTA,
  TIPOS_SERVICIO,
  nombreDe,
} from '../../../../shared/constants/Turismo';

const severidadVerificacion = { aprobado: 'success', rechazado: 'error', pendiente: 'warning' };

const ProveedorTuristicoForm = (props) => {
  const { values, setFieldValue, registro, accion, titulo, handleOnClose, saving, destinos, usuariosProveedor, categorias } = props;
  const disabled = accion === 'ver';

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      {registro?.estado_verificacion && (
        <Alert className='campo-completo' severity={severidadVerificacion[registro.estado_verificacion] ?? 'info'}>
          Verificación: <strong>{nombreDe(ESTADOS_VERIFICACION, registro.estado_verificacion)}</strong>
          {registro.observaciones_verificacion ? ` — ${registro.observaciones_verificacion}` : ''}
        </Alert>
      )}

      <SeccionForm titulo='Datos del negocio' />
      <MyTextField autoFocus fullWidth label='Nombre Comercial' name='nombre_comercial' disabled={disabled} required />
      <MyTextField fullWidth label='Razón Social' name='razon_social' disabled={disabled} />
      <MyTextField fullWidth label='NIT' name='nit' disabled={disabled} />
      <MyTextField fullWidth label='Registro Nacional de Turismo (RNT)' name='rnt' disabled={disabled} />
      <MySelectField fullWidth variant='standard' label='Tipo de servicio' name='tipo_servicio' options={TIPOS_SERVICIO} disabled={disabled} ninguno />
      <Box className='campo-completo'>
        <SelectorCategorias
          categorias={categorias}
          value={values.categorias}
          onChange={(ids) => setFieldValue('categorias', ids)}
          disabled={disabled}
          label='Categorías del proveedor'
        />
      </Box>
      <MyTextField className='campo-completo' fullWidth multiline minRows={3} label='Descripción' name='descripcion' disabled={disabled} />

      <SeccionForm titulo='Contacto y ubicación' />
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

      <SeccionForm titulo='Web y redes sociales' />
      <MyTextField className='campo-tercio' fullWidth label='Sitio Web' name='sitio_web' disabled={disabled} />
      <MyTextField className='campo-tercio' fullWidth label='Instagram' name='instagram' disabled={disabled} />
      <MyTextField className='campo-tercio' fullWidth label='Facebook' name='facebook' disabled={disabled} />

      <SeccionForm titulo='Datos para recibir pagos' />
      <MyTextField fullWidth label='Banco o entidad' name='banco' disabled={disabled} />
      <MySelectField fullWidth variant='standard' label='Tipo de cuenta' name='tipo_cuenta' options={TIPOS_CUENTA} disabled={disabled} ninguno />
      <MyTextField fullWidth label='Número de cuenta' name='numero_cuenta' disabled={disabled} />
      <MyTextField fullWidth label='Titular de la cuenta' name='titular_cuenta' disabled={disabled} />
      <MyTextField fullWidth label='Documento o NIT del titular' name='documento_titular' disabled={disabled} />

      {registro?.id && (
        <>
          <SeccionForm titulo='Logo y fotos' />
          <Box className='campo-completo'>
            <FotosProveedor base={`proveedores-turisticos/${registro.id}`} logo={registro.logo} fotos={registro.fotos} soloLectura={disabled} />
          </Box>
        </>
      )}

      <SeccionForm titulo='Acceso al panel y estado' />
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
      <MyRadioField className='campo-completo' label='Estado' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
    </AppCrudForm>
  );
};

ProveedorTuristicoForm.propTypes = {
  values: PropTypes.object.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  categorias: PropTypes.array.isRequired,
  registro: PropTypes.object,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  destinos: PropTypes.array.isRequired,
  usuariosProveedor: PropTypes.array.isRequired,
};

export default ProveedorTuristicoForm;
