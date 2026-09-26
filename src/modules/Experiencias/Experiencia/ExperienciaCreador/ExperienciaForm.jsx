import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Chip, Divider } from '@mui/material';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import MySelectField from '../../../../shared/components/MySelectField';
import PreciosExperiencia from '../../../../shared/components/PreciosExperiencia';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import {
  ESTADOS_EXPERIENCIA,
  IDIOMAS,
  OPCIONES_SI_NO,
  formatoMoneda,
  nombreDe,
} from '../../../../shared/constants/Turismo';
import { useSlugAutomatico } from '../../../../shared/functions/ValidacionesYup';

const ExperienciaForm = (props) => {
  const { values, setFieldValue, registro, accion, titulo, handleOnClose, saving, destinos, proveedores } = props;
  const disabled = accion === 'ver';
  useSlugAutomatico({ accion, nombre: values.nombre, setFieldValue });

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      {registro && (
        <Alert className='campo-completo' severity='info'>
          Estado actual: <strong>{nombreDe(ESTADOS_EXPERIENCIA, registro.estado)}</strong>
          {registro.categorias?.length > 0 && (
            <> — Categorías: {registro.categorias.map((c) => <Chip key={c.id} size='small' label={c.nombre} sx={{ ml: 1 }} />)}</>
          )}
        </Alert>
      )}

      <FormikAutocomplete name='proveedor_id' label='Proveedor *' options={proveedores} disabled={disabled} textFieldProps={{ variant: 'standard' }} />
      <FormikAutocomplete name='destino_id' label='Destino *' options={destinos} disabled={disabled} textFieldProps={{ variant: 'standard' }} />
      <MyTextField autoFocus fullWidth label='Nombre' name='nombre' disabled={disabled} required />
      <MyTextField fullWidth label='Slug' name='slug' disabled={disabled} required />
      <MySelectField fullWidth variant='standard' label='Idioma' name='idioma' options={IDIOMAS} disabled={disabled} ninguno />
      <MyTextField fullWidth label='Duración' name='duracion' placeholder='Ej: 4 horas, 2 días' disabled={disabled} />
      <MyTextField fullWidth label='Capacidad Máxima' name='capacidad_maxima' type='number' disabled={disabled} />

      <Divider className='campo-completo'>Precios</Divider>
      {registro?.precio_desde && (
        <Alert className='campo-completo' severity='success' sx={{ bgcolor: 'rgba(0,161,204,0.08)', color: 'text.primary' }}>
          Precio desde actual (el menor valor de adulto activo): <strong>{formatoMoneda(registro.precio_desde)}</strong>
        </Alert>
      )}
      <PreciosExperiencia disabled={disabled} />

      <Divider className='campo-completo'>Ubicación</Divider>
      <MyTextField fullWidth label='Punto de Encuentro' name='punto_encuentro' disabled={disabled} />
      <MyTextField fullWidth label='Dirección' name='direccion' disabled={disabled} />
      <MyTextField fullWidth label='Latitud' name='latitud' type='number' disabled={disabled} />
      <MyTextField fullWidth label='Longitud' name='longitud' type='number' disabled={disabled} />

      <Divider className='campo-completo'>Contenido</Divider>
      <MyTextField className='campo-completo' fullWidth multiline minRows={3} label='Descripción' name='descripcion' disabled={disabled} />
      <MyTextField fullWidth multiline minRows={3} label='Incluye' name='incluye' placeholder='Un ítem por línea' disabled={disabled} />
      <MyTextField fullWidth multiline minRows={3} label='No Incluye' name='no_incluye' placeholder='Un ítem por línea' disabled={disabled} />

      <MyRadioField label='Destacada' name='destacada' disabled={disabled} options={OPCIONES_SI_NO} />
      <MyRadioField label='Verificada' name='verificada' disabled={disabled} options={OPCIONES_SI_NO} />
    </AppCrudForm>
  );
};

ExperienciaForm.propTypes = {
  values: PropTypes.object.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  registro: PropTypes.object,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  destinos: PropTypes.array.isRequired,
  proveedores: PropTypes.array.isRequired,
};

export default ExperienciaForm;
