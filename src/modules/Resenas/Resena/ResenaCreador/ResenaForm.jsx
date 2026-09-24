import React from 'react';
import PropTypes from 'prop-types';
import { Box, FormLabel, ImageList, ImageListItem, Rating, Typography } from '@mui/material';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import MySelectField from '../../../../shared/components/MySelectField';
import { ESTADOS_RESENA } from '../../../../shared/constants/Turismo';

const ResenaForm = (props) => {
  const { values, setFieldValue, registro, experienciaNombre, accion, titulo, handleOnClose, saving } = props;
  const disabled = accion === 'ver';
  const multimedia = registro?.multimedia ?? [];

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      {experienciaNombre && (
        <Typography className='campo-completo' variant='subtitle1' color='text.secondary'>
          Experiencia: <strong>{experienciaNombre}</strong>
        </Typography>
      )}
      <Box>
        <FormLabel>Calificación</FormLabel>
        <Rating
          name='calificacion'
          value={Number(values.calificacion) || 0}
          onChange={(e, nuevo) => setFieldValue('calificacion', nuevo ?? 1)}
          readOnly={disabled}
          sx={{ display: 'flex', mt: 1 }}
        />
      </Box>
      <MySelectField fullWidth variant='standard' label='Estado de Moderación' name='estado' options={ESTADOS_RESENA} disabled={disabled} required />
      <MyTextField className='campo-completo' fullWidth multiline minRows={4} label='Comentario' name='comentario' disabled={disabled} />
      {multimedia.length > 0 && (
        <Box className='campo-completo'>
          <FormLabel>Fotos adjuntas por el cliente</FormLabel>
          <ImageList cols={4} rowHeight={100} sx={{ mt: 1 }}>
            {multimedia.map((archivo) => (
              <ImageListItem key={archivo.id}>
                <a href={archivo.ruta_archivo} target='_blank' rel='noopener noreferrer'>
                  <img
                    src={archivo.ruta_archivo}
                    alt='Adjunto de la reseña'
                    loading='lazy'
                    style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                  />
                </a>
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      )}
    </AppCrudForm>
  );
};

ResenaForm.propTypes = {
  values: PropTypes.object.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  registro: PropTypes.object,
  experienciaNombre: PropTypes.string,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default ResenaForm;
