import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Input } from '@mui/material';
import { Form } from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import AppScrollbar from '@crema/components/AppScrollbar';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Fonts } from '../../../../shared/constants/AppEnums';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyCurrencyFieldPotencia from '../../../../shared/components/MyCurrencyFieldPotencia';
import MyDateField from '../../../../shared/components/MyDateField';
import MyCurrencyFieldMoneda from '../../../../shared/components/MyCurrencyFieldMoneda';
import MyCurrencyFieldNumeroDecimal from '../../../../shared/components/MyCurrencyFieldNumeroDecimal';
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { TIPO_DOCUMENTO, TIPO_COMUNIDAD_ENERGETICA } from '../../../../shared/constants/ListaValores';
import PropTypes from 'prop-types';

const options = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
];

const customConfig = {
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'fontColor',
    'fontSize',
    '|',
    'link',
    'bulletedList',
    'numberedList',
    'blockQuote'
  ],
  placeholder: 'Escribe algo aquí...',
  contentsCss: [
    'body { color: #ff0000 !important; font-family: Arial, sans-serif; }', // Configuración de color rojo
  ],
  fontColor: {
    colors: [
      { color: '#ff0000', label: 'Red' },
    ],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
  },
};




const useStyles = makeStyles((theme) => ({
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
  widthFull: {
    width: '100%',
  },
  pointer: {
    cursor: 'pointer',
  },
}));

const ComunidadEnergeticaForm = (props) => {
  const theme = useTheme();
  const { handleOnClose, accion, initialValues, titulo,values  } = props;

  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') {
      setDisabled(true);
    }
  }, [initialValues.estado, accion]);

  const classes = useStyles(props);

  return (
    <Form className='' noValidate autoComplete='off'>
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

          <Box px = {{md: 5, lg: 8, xl: 10}}>
                  <MyTextField 
                    sx={{[theme.breakpoints.up('xl')]: {
                      marginBottom: 5,
                    },}}
                     className = {classes.myTextField} 
                     label = 'Nombre' 
                     name = 'nombre' 
                     disabled = {disabled}
                     required 
                  />
                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2,1fr)',
                    }} 
                  >
                  <MyCurrencyField 
                    maxDigits={20}
                    sx={{[theme.breakpoints.up('xl')]: {
                      marginBottom: 5,
                    },paddingRight: 4}}
                    className = {classes.myTextField} 
                    label = 'Resolución registro' 
                    name = 'numero_resolucion' 
                    disabled = {disabled}
                    required
                  />
                  <MyDateField
                      name="fecha_resolucion"
                      label="Fecha resolucion"
                      disabled={disabled}
                      required
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          '& .MuiInputBase-input': {
                            border: 'none',
                            borderBottom: '1px solid #ccc',
                            borderRadius: 0,
                            '&:focus': {
                              borderBottom: '1px solid #000',
                            },                            
                          },
                          '& .MuiInput-root': {
                            '&:before': {
                              borderBottom: '1px solid #ccc',
                            },
                            '&:after': {
                              borderBottom: '1px solid #000', 
                            },
                            '&.Mui-disabled:before': {
                              borderBottom: '1px solid #ddd !important', 
                            },
                          },
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: theme.palette.text.disabled,
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2,1fr)',
                    }} 
                  >                  
                     <MyCurrencyField 
                      maxDigits={20}
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },paddingRight: 4}}
                      className = {classes.myTextField} 
                      label = 'NURIN' 
                      name = 'nurin' 
                      disabled = {disabled}
                      required
                    />
                    <FormikAutocomplete            
                      options={
                        accion !== 'ver'
                          ? TIPO_COMUNIDAD_ENERGETICA.filter((item) => item.estado === 1)
                          : TIPO_COMUNIDAD_ENERGETICA
                      }
                      name='tipo_comunidad'
                      inputValue={initialValues.ciudad_id}
                      label='Tipo *'
                      disabled={disabled}            
                      className={classes.myTextField}
                      variant='standard'
                      fullWidth
                      required
                    /> 
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2,1fr)',
                    }} 
                  >
                    <MyTextField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },paddingRight: 4,}}
                      className = {classes.myTextField} 
                      label = 'Comercializador' 
                      name = 'nombre_comercializador' 
                      disabled = {disabled}                       
                    />
                    <MyTextField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },}}
                      className = {classes.myTextField} 
                      label = 'Operador' 
                      name = 'nombre_operador' 
                      disabled = {disabled}
                    />
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2,1fr)',
                    }} 
                  >
                    <MyTextField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },paddingRight: 4,}}
                      className = {classes.myTextField} 
                      label = 'Registro Comunidad Energética ' 
                      name = 'numero_registro_comunidad' 
                      disabled = {disabled}                     
                    />
                  </Box>
                  <Box
                    component='h6'
                    mb={{ xs: 4, xl: 6 }}
                    fontSize={16}
                    fontWeight={Fonts.MEDIUM}
                  >
                    {'Representante principal'}
                  </Box>                  
                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(1,1fr)',
                    }} 
                  >
                    <MyTextField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },paddingRight: 4,}}
                      className = {classes.myTextField} 
                      label = 'Nombre' 
                      name = 'nombre_rep_principal' 
                      disabled = {disabled}
                      required 
                    />
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2,1fr)',
                    }} 
                  >
                   
                    <FormikAutocomplete            
                      options={
                        accion !== 'ver'
                          ? TIPO_DOCUMENTO.filter((item) => item.estado === 1)
                          : TIPO_DOCUMENTO
                      }
                      name='tipo_documento_rep_ppal'
                      sx={{ paddingRight: 4,}}
                      inputValue={initialValues.ciudad_id}
                      label='Tipo documento *'
                      disabled={disabled}            
                      className={classes.myTextField}
                      variant='standard'
                      fullWidth
                      required
                    /> 
                     <MyCurrencyField 
                      maxDigits={20}
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },}}
                      className = {classes.myTextField} 
                      label = 'Número documento' 
                      name = 'numero_documento_rep_ppal' 
                      disabled = {disabled}
                      required
                    />
                  </Box>
                  <Box
                    component='h6'
                    mb={{ xs: 4, xl: 6 }}
                    fontSize={16}
                    fontWeight={Fonts.MEDIUM}
                  >
                    {'Representante legal'}                  
                    <Box
                      sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(1,1fr)',
                      }} 
                    >
                      <MyTextField 
                        sx={{[theme.breakpoints.up('xl')]: {
                          marginBottom: 5,
                        },}}
                        className = {classes.myTextField} 
                        label = 'Nombre' 
                        name = 'nombre_rep_legal' 
                        disabled = {disabled}
                        required 
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2,1fr)',
                      }} 
                    >
                      
                      <FormikAutocomplete            
                        options={
                          accion !== 'ver'
                            ? TIPO_DOCUMENTO.filter((item) => item.estado === 1)
                            : TIPO_DOCUMENTO
                        }
                        name='tipo_documento_rep_legal'
                        sx={{ paddingRight: 4,}}
                        inputValue={initialValues.ciudad_id}
                        label='Tipo Documento *'
                        disabled={disabled}            
                        className={classes.myTextField}
                        variant='standard'
                        fullWidth
                        required
                      /> 
                      <MyCurrencyField 
                        maxDigits={20}
                        sx={{[theme.breakpoints.up('xl')]: {
                          marginBottom: 5,
                        },}}
                        className = {classes.myTextField} 
                        label = 'Número documento' 
                        name = 'numero_documento_rep_legal' 
                        disabled = {disabled}
                        required
                      />   
                      
                                       
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2,1fr)',
                      }} 
                    >
                      <MyCurrencyField 
                        maxDigits={20}
                        sx={{[theme.breakpoints.up('xl')]: {
                          marginBottom: 5,
                        },paddingRight: 4,}}
                        className = {classes.myTextField} 
                        label = 'Teléfono' 
                        name = 'telefono_rep_legal' 
                        disabled = {disabled}
                        required
                      />  
                      <MyTextField 
                        sx={{[theme.breakpoints.up('xl')]: {
                          marginBottom: 5,
                        },}}
                        className = {classes.myTextField} 
                        label = 'Correo Electrónico' 
                        name = 'email_rep_legal' 
                        disabled = {disabled}
                        required 
                      />
                    </Box>
                  </Box>
                  <Box
                    component='h6'
                    mb={{ xs: 4, xl: 6 }}
                    fontSize={16}
                    fontWeight={Fonts.MEDIUM}
                  >
                    {'Representante Suplente'}                  
                    <Box
                      sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(1,1fr)',
                      }} 
                    >
                      <MyTextField 
                        sx={{[theme.breakpoints.up('xl')]: {
                          marginBottom: 5,
                        },}}
                        className = {classes.myTextField} 
                        label = 'Nombre' 
                        name = 'nombre_rep_suplente' 
                        disabled = {disabled} 
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2,1fr)',
                      }} 
                    >
                      
                      <FormikAutocomplete            
                        options={
                          accion !== 'ver'
                            ? TIPO_DOCUMENTO.filter((item) => item.estado === 1)
                            : TIPO_DOCUMENTO
                        }
                        name='tipo_documento_rep_supl'
                        sx={{ paddingRight: 4,}}
                        inputValue={initialValues.ciudad_id}
                        label='Tipo documento'
                        disabled={disabled}            
                        className={classes.myTextField}
                        variant='standard'
                        fullWidth
                        required
                      /> 
                      <MyCurrencyField 
                        maxDigits={20}
                        sx={{[theme.breakpoints.up('xl')]: {
                          marginBottom: 5,
                        },}}
                        className = {classes.myTextField} 
                        label = 'Número documento' 
                        name = 'numero_documento_rep_supl' 
                        disabled = {disabled}
                      />                    
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2,1fr)',
                      }} 
                    >
                      <MyCurrencyField 
                        sx={{[theme.breakpoints.up('xl')]: {
                          marginBottom: 5,
                        },paddingRight: 4}}
                        className = {classes.myTextField} 
                        label = 'Teléfono' 
                        name = 'telefono_rep_supl' 
                        disabled = {disabled}
                         
                      />
                      <MyTextField 
                        sx={{[theme.breakpoints.up('xl')]: {
                          marginBottom: 5,
                        },}}
                        className = {classes.myTextField} 
                        label = 'Correo electrónico' 
                        name = 'email_rep_supl' 
                        disabled = {disabled}
                         
                      />
                    </Box>
                  </Box>
                  <MyRadioField 
                     label = 'Estado' 
                     name = 'estado' 
                     disabled = {accion === 'ver'}
                     required 
                     options = {options}
                  />                  
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
        ) : (
          ''
        )}
        <Button
          sx={{paddingLeft: 15,
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

ComunidadEnergeticaForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ComunidadEnergeticaForm;
