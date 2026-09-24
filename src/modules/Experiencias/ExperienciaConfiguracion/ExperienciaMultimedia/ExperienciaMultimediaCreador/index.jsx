import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { Box } from '@mui/material';
import AppCrudDialog from '../../../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../../shared/components/MyTextField';
import MyRadioField from '../../../../../shared/components/MyRadioField';
import MySelectField from '../../../../../shared/components/MySelectField';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../../@crema/redux/features/experienciaMultimedia/experienciaMultimediaSlice';
import { OPCIONES_ESTADO, TIPOS_MULTIMEDIA, aRadio } from '../../../../../shared/constants/Turismo';
import { enteroOpcional } from '../../../../../shared/functions/ValidacionesYup';
import { creadorPropTypes } from '../../propTypes';

const validationSchema = yup.object({
  tipo: yup.string().required('Requerido'),
  ruta_archivo: yup.string().required('Requerido').url('Debe ser una URL válida').max(255, 'Máximo 255 caracteres'),
  titulo: yup.string().max(150, 'Máximo 150 caracteres').nullable(),
  texto_alternativo: yup.string().max(255, 'Máximo 255 caracteres').nullable(),
  orden: enteroOpcional(),
});

const ExperienciaMultimediaCreador = (props) => {
  const { multimedia, experienciaId, accion, handleOnClose, updateColeccion, titulo } = props;
  const disabled = accion === 'ver';

  const initialValues = (registro) => ({
    id: registro?.id ?? '',
    experiencia_id: registro?.experiencia_id ?? Number(experienciaId),
    tipo: registro?.tipo ?? 'foto',
    ruta_archivo: registro?.ruta_archivo ?? '',
    titulo: registro?.titulo ?? '',
    texto_alternativo: registro?.texto_alternativo ?? '',
    orden: registro?.orden ?? 0,
    estado: aRadio(registro?.estado),
  });

  return (
    <AppCrudDialog
      stateKey='experienciaMultimedia'
      registroId={multimedia}
      accion={accion}
      handleOnClose={handleOnClose}
      updateColeccion={updateColeccion}
      onShow={onShow}
      onCreate={onCreate}
      onUpdate={onUpdate}
      resetActual={resetActual}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ values, saving }) => (
        <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
          <MySelectField fullWidth variant='standard' label='Tipo' name='tipo' options={TIPOS_MULTIMEDIA} disabled={disabled} required />
          <MyTextField fullWidth label='Orden' name='orden' type='number' disabled={disabled} />
          <MyTextField className='campo-completo' fullWidth label='URL del Archivo' name='ruta_archivo' disabled={disabled} required />
          {values.tipo === 'foto' && values.ruta_archivo && (
            <Box className='campo-completo' textAlign='center'>
              <img src={values.ruta_archivo} alt={values.texto_alternativo} style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 4 }} />
            </Box>
          )}
          <MyTextField fullWidth label='Título' name='titulo' disabled={disabled} />
          <MyTextField fullWidth label='Texto Alternativo (accesibilidad/SEO)' name='texto_alternativo' disabled={disabled} />
          <MyRadioField label='Estado' name='estado' disabled={disabled} options={OPCIONES_ESTADO} />
        </AppCrudForm>
      )}
    </AppCrudDialog>
  );
};

ExperienciaMultimediaCreador.propTypes = {
  ...creadorPropTypes,
  multimedia: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ExperienciaMultimediaCreador;
