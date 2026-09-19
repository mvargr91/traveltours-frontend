import React, { useEffect, useState } from 'react';
import { Box, Button, Input, Typography } from '@mui/material';
import { Form, useFormikContext } from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import AppScrollbar from '@crema/components/AppScrollbar';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Fonts } from '../../../../shared/constants/AppEnums';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import MyTextField from '../../../../shared/components/MyTextField';
import PropTypes from 'prop-types';

const useStyles = makeStyles(() => ({
  bottomsGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: '20px',
    gap: '10px',
    paddingRight: '20px',
    position: 'sticky',
    left: 0,
    bottom: 0,
  },
  myTextField: {
    width: '100%',
    marginBottom: 5,
    height: '60px',
  },
  pointer: {
    cursor: 'pointer',
  },
  uploadBox: {
    border: '1px dashed #9e9e9e',
    borderRadius: 4,
    padding: 24,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
}));

const ProyectoFotoForm = (props) => {
  const theme = useTheme();
  const { handleOnClose, accion, initialValues, titulo, proyectos } = props;
  const classes = useStyles(props);

  const [disabled, setDisabled] = useState(false);
  const [archivoNombre, setArchivoNombre] = useState('');

  // Formik
  const {
    setFieldValue,
    setFieldTouched,
    errors,
    touched,
    values,
  } = useFormikContext();

  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') {
      setDisabled(true);
    }
  }, [initialValues.estado, accion]);

  const handleFileChange = (event) => {
    const file = event.currentTarget.files && event.currentTarget.files[0];
    setFieldTouched('archivo', true, false); // para que dispare validación
    if (file) {
      setArchivoNombre(file.name);
      // este es el campo que espera el backend: 'archivo'
      setFieldValue('archivo', file);
    } else {
      setArchivoNombre('');
      setFieldValue('archivo', null);
    }
  };

  const hasErrorArchivo = Boolean(touched.archivo && errors.archivo);

  // Si estás editando y en BD ya tienes un archivo, puedes mostrar su nombre:
  const nombreArchivoActual = initialValues?.nombre_archivo_foto || initialValues?.archivo || '';

  return (
    <Form noValidate autoComplete='off'>
      <AppScrollbar style={{ maxHeight: 600 }}>
        <Box py={5} px={{ xs: 5, lg: 8, xl: 10 }}>
          <Box
            component='h6'
            mb={{ xs: 4, xl: 6 }}
            fontSize={20}
            fontWeight={Fonts.MEDIUM}
          >
            {titulo}
          </Box>

          <Box px={{ md: 5, lg: 8, xl: 10 }}>
            {/* Proyecto / Código */}
            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
              }}
            >
              <FormikAutocomplete
                options={proyectos}
                sx={{
                  [theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                }}
                name='id_proyecto'
                inputValue={initialValues.id_proyecto}
                label='Proyecto'
                InputLabelProps={{
                  shrink: true,
                }}
                disabled
                className={classes.myTextField}
                variant='standard'
                fullWidth
              />

              <MyTextField
                className={classes.myTextField}
                label='Código'
                name='codigo_proyecto'
                disabled
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>

            {/* Tipo / Ciudad */}
            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
              }}
            >
              <MyTextField
                className={classes.myTextField}
                label='Tipo'
                name='tipo_proyecto'
                disabled
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <MyTextField
                className={classes.myTextField}
                label='Ciudad'
                name='ciudad_proyecto'
                disabled
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>

            {/* Nombre foto */}
            <MyTextField
              sx={{
                [theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },
              }}
              className={classes.myTextField}
              label='Nombre foto'
              name='nombre_foto'
              disabled={disabled}
              required
            />

            {/* Input real de archivo (oculto) */}
            <Input
              id='archivoFoto'
              name='archivo'
              type='file'
              inputProps={{ accept: 'image/*' }}
              sx={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={disabled}
            />

            {/* Área visible para arrastrar / hacer clic */}
            <label htmlFor='archivoFoto' style={{ width: '100%' }}>
              <Box
                className={classes.uploadBox}
                sx={
                  hasErrorArchivo
                    ? { borderColor: theme.palette.error.main }
                    : {}
                }
              >
                <Typography variant='body2' sx={{ mb: 1 }}>
                  Arrastra una imagen aquí o haz clic para seleccionar.
                </Typography>
                <Typography variant='caption' display='block' sx={{ mb: 2 }}>
                  Formatos permitidos: JPG, PNG, WEBP. Tamaño máximo: 5MB.
                </Typography>
                  Seleccionar imagen
                

                {archivoNombre && (
                  <Typography variant='caption' display='block' sx={{ mt: 2 }}>
                    Archivo seleccionado: <strong>{archivoNombre}</strong>
                  </Typography>
                )}

                {!archivoNombre && nombreArchivoActual && (
                  <Typography variant='caption' display='block' sx={{ mt: 2 }}>
                    Archivo actual: <strong>{nombreArchivoActual}</strong>
                  </Typography>
                )}

                {hasErrorArchivo && (
                  <Typography
                    variant='caption'
                    display='block'
                    sx={{ mt: 1, color: theme.palette.error.main }}
                  >
                    {errors.archivo}
                  </Typography>
                )}
              </Box>
            </label>
          </Box>
        </Box>
      </AppScrollbar>

      <Box className={classes.bottomsGroup}>
        {accion !== 'ver' ? (
          <Button
            sx={{
              paddingLeft: 15,
              paddingRight: 15,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.colorHovers,
                cursor: 'pointer',
              },
              backgroundColor: theme.palette.primary.main,
            }}
            variant='contained'
            type='submit'
          >
            <IntlMessages id='boton.submit' />
          </Button>
        ) : null}

        <Button
          sx={{
            paddingLeft: 15,
            paddingRight: 15,
            color: 'white !important',
            '&:hover': {
              backgroundColor: theme.palette.colorHovers,
              cursor: 'pointer',
            },
            backgroundColor: theme.palette.secondary.light,
          }}
          onClick={handleOnClose}
        >
          <IntlMessages id='boton.cancel' />
        </Button>
      </Box>
    </Form>
  );
};

ProyectoFotoForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  titulo: PropTypes.string.isRequired,
  proyectos: PropTypes.array,
};

export default ProyectoFotoForm;
