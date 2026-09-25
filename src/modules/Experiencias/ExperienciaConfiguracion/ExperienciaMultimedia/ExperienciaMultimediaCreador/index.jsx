import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../../shared/components/MyTextField';
import MyRadioField from '../../../../../shared/components/MyRadioField';
import MySelectField from '../../../../../shared/components/MySelectField';
import MyFileField, { validarArchivo } from '../../../../../shared/components/MyFileField';
import { esUrlExterna } from '../../../../../shared/functions/Archivos';
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
  // Se sube un archivo o, para videos, se pega un enlace (YouTube, Vimeo...).
  ruta_archivo: yup.string().max(255, 'Máximo 255 caracteres').nullable(),
  enlace: yup.string().url('Debe ser una URL válida (https://...)').nullable(),
  archivo: yup.mixed().when('tipo', ([tipo], esquema) =>
    validarArchivo(tipo === 'video' ? 'video' : 'imagen', (valores) => !valores.ruta_archivo && !valores.enlace)),
  titulo: yup.string().max(150, 'Máximo 150 caracteres').nullable(),
  texto_alternativo: yup.string().max(255, 'Máximo 255 caracteres').nullable(),
  orden: enteroOpcional(),
});

// El enlace externo reemplaza la ruta; si se sube un archivo, el backend lo guarda y reemplaza la ruta.
const transformarAntesDeEnviar = ({ enlace, ...valores }) => ({
  ...valores,
  ruta_archivo: valores.archivo ? valores.ruta_archivo : enlace || valores.ruta_archivo,
});

const ExperienciaMultimediaCreador = (props) => {
  const { multimedia, experienciaId, accion, handleOnClose, updateColeccion, titulo } = props;
  const disabled = accion === 'ver';

  const initialValues = (registro) => ({
    id: registro?.id ?? '',
    experiencia_id: registro?.experiencia_id ?? Number(experienciaId),
    tipo: registro?.tipo ?? 'foto',
    // Lo guardado puede ser un archivo en storage o una URL externa.
    ruta_archivo: esUrlExterna(registro?.ruta_archivo) ? '' : registro?.ruta_archivo ?? '',
    enlace: esUrlExterna(registro?.ruta_archivo) ? registro.ruta_archivo : '',
    archivo: null,
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
      transformarAntesDeEnviar={transformarAntesDeEnviar}
    >
      {({ values, saving }) => (
        <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
          <MySelectField fullWidth variant='standard' label='Tipo' name='tipo' options={TIPOS_MULTIMEDIA} disabled={disabled} required />
          <MyTextField fullWidth label='Orden' name='orden' type='number' disabled={disabled} />
          <MyFileField
            className='campo-completo'
            label={values.tipo === 'video' ? 'Archivo de video' : 'Foto'}
            tipo={values.tipo === 'video' ? 'video' : 'imagen'}
            rutaActual={values.ruta_archivo}
            disabled={disabled}
          />
          {values.tipo === 'video' && (
            <MyTextField className='campo-completo' fullWidth label='O pega el enlace del video (YouTube, Vimeo...)' name='enlace' placeholder='https://' disabled={disabled} />
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
