import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AppCrudForm, { SeccionForm } from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import MySelectField from '../../../../shared/components/MySelectField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import { ESTADOS_PASARELA } from '../../../../shared/constants/Finanzas';
import { nombreDe } from '../../../../shared/constants/Turismo';

// Dónde saca el proveedor sus llaves y qué hace con la URL de eventos.
const INSTRUCCIONES = {
  wompi: {
    llaves: 'En el panel de comercios de Wompi, entra a Desarrolladores: ahí están la llave pública, la privada y los secretos de integridad y de eventos. Las de pruebas (sandbox) y las de producción son distintas.',
    eventos: 'Copia esta URL en el panel de Wompi > Desarrolladores > URL de eventos (del mismo ambiente). Así los pagos se confirman aunque el viajero cierre el navegador.',
  },
  mercadopago: {
    llaves: 'En Mercado Pago, entra a Tus integraciones > tu aplicación > Credenciales y copia el access token (de prueba o de producción).',
    eventos: 'No hace falta configurarla: va en cada pago. Si configuras webhooks en Mercado Pago, usa esta URL y escribe la clave secreta arriba.',
  },
};

const PasarelaPagoForm = ({ values, registro, catalogo, proveedores, proveedorPropio, accion, titulo, handleOnClose, saving }) => {
  const disabled = accion === 'ver';
  const [copiado, setCopiado] = useState(false);
  const pasarela = catalogo.pasarelas.find((p) => p.id === values.pasarela);
  const instrucciones = INSTRUCCIONES[values.pasarela];
  // Cambiar de pasarela descarta las llaves guardadas: hay que escribir las nuevas.
  const mismaPasarela = registro?.pasarela === values.pasarela;

  const copiar = () => {
    navigator.clipboard?.writeText(registro.url_eventos).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      {registro && (
        <Alert
          className='campo-completo'
          severity={registro.estado === 'activa' ? 'success' : registro.estado === 'inactiva' ? 'warning' : 'info'}
        >
          Estado: <strong>{nombreDe(ESTADOS_PASARELA, registro.estado)}</strong>
          {registro.comercio_nombre && <> · Comercio: <strong>{registro.comercio_nombre}</strong></>}
          {registro.verificada_en && <> · Verificada el {registro.verificada_en}</>}
          {registro.ultimo_error && <><br />Último error: {registro.ultimo_error}</>}
        </Alert>
      )}

      <FormikAutocomplete
        name='proveedor_id'
        label='Proveedor *'
        options={proveedores}
        disabled={disabled || !!proveedorPropio || Boolean(registro)}
        textFieldProps={{ variant: 'standard' }}
      />
      <MySelectField fullWidth variant='standard' label='Pasarela *' name='pasarela' options={catalogo.pasarelas} disabled={disabled} />
      <MySelectField fullWidth variant='standard' label='Ambiente *' name='ambiente' options={catalogo.ambientes} disabled={disabled} />

      <SeccionForm titulo={`Credenciales de ${pasarela?.nombre ?? 'la pasarela'}`} />
      {instrucciones && !disabled && (
        <Alert className='campo-completo' severity='info'>
          {instrucciones.llaves}
        </Alert>
      )}
      {(pasarela?.campos ?? []).map((campo) => {
        const guardada = mismaPasarela && registro?.credenciales_guardadas?.includes(campo.nombre);
        return (
          <MyTextField
            key={campo.nombre}
            className='campo-completo'
            fullWidth
            label={campo.etiqueta}
            name={`credenciales.${campo.nombre}`}
            type={campo.secreto ? 'password' : 'text'}
            autoComplete='new-password'
            placeholder={guardada && campo.secreto ? '•••••••• (guardada)' : undefined}
            InputLabelProps={guardada && campo.secreto ? { shrink: true } : undefined}
            required={campo.requerido && !guardada}
            helperText={guardada && campo.secreto ? 'Guardada. Déjala vacía para conservarla o escribe una nueva.' : campo.ayuda}
            disabled={disabled}
          />
        );
      })}
      {!disabled && (
        <>
          <Alert className='campo-completo' severity='warning'>
            Al guardar se prueba la conexión con {pasarela?.nombre ?? 'la pasarela'}: si las llaves funcionan, la pasarela queda activa y
            las experiencias con pago en línea se cobran en esta cuenta. Cada cambio se avisa por correo al proveedor y a la administración.
          </Alert>
          <MyTextField
            className='campo-completo'
            fullWidth
            label='Tu contraseña'
            name='clave_confirmacion'
            type='password'
            autoComplete='current-password'
            required
            helperText='Por seguridad, confirma tu contraseña para guardar las llaves.'
          />
        </>
      )}

      {registro?.url_eventos && (
        <>
          <SeccionForm titulo='Confirmación automática de pagos' />
          <TextField
            className='campo-completo'
            fullWidth
            variant='standard'
            label='URL de eventos'
            value={registro.url_eventos}
            helperText={instrucciones?.eventos}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title={copiado ? 'Copiada' : 'Copiar'}>
                    <IconButton size='small' onClick={copiar}>
                      <ContentCopyIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </>
      )}
    </AppCrudForm>
  );
};

PasarelaPagoForm.propTypes = {
  values: PropTypes.object.isRequired,
  registro: PropTypes.object,
  catalogo: PropTypes.object.isRequired,
  proveedores: PropTypes.array.isRequired,
  proveedorPropio: PropTypes.object,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default PasarelaPagoForm;
