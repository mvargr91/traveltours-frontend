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
import MyAutocomplete from '../../../../shared/components/MyAutoComplete';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import { TIPO_DOCUMENTO, TIPO_CUENTA } from '../../../../shared/constants/ListaValores';
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

const GestorForm = (props) => {
  const theme = useTheme();
  const { handleOnClose, accion, ciudades, bancos, initialValues, titulo,values  } = props;

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
                     autoFocus
                  />
                  
                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2,1fr)',
                    }} 
                  >  
                    <MyAutocomplete      
                      sx={{paddingRight: 4,}}                
                      options={TIPO_DOCUMENTO}
                      name='tipo_documento'
                      inputValue={initialValues.tipo_documento}
                      label='Tipo Documento'
                      disabled={disabled}            
                      className={classes.myTextField}
                      variant='standard'
                      fullWidth
                      required
                    />  
                    <MyCurrencyField 
                      maxDigits={100} 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },}}
                      className = {classes.myTextField} 
                      label = 'Número de documento' 
                      name = 'numero_documento' 
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
                    <MyTextField 
                      sx={
                        {[theme.breakpoints.up('xl')]: {
                          marginBottom: 5,
                        },
                        paddingRight: 4,
                      }}
                      className = {classes.myTextField} 
                      label='Correo electrónico' 
                      name='email' 
                      disabled={disabled}
                      required 
                    />
                    <MyTextField             
                      name='telefono'
                      label='Telefono'
                      disabled={disabled}            
                      className={classes.myTextField}                    
                    />  
                    
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2,1fr)',
                    }} 
                  >
                   
                    <MyCurrencyFieldPesos 
                      maxDigits={20}
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },                      
                      paddingRight: 4,}}
                      className = {classes.myTextField} 
                      label = 'Porcentaje comisión' 
                      name = 'porcentaje_comision' 
                      disabled = {disabled}      
                      required                 
                    /> 
                    <MyCurrencyFieldPesos 
                      maxDigits={20}
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },  }}
                      className = {classes.myTextField} 
                      label = 'Porcentaje ret fuente' 
                      name = 'porcentaje_ret_fuente' 
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
                      sx={{ paddingRight: 4 }}
                      options={accion !== 'ver' ? bancos.filter((item) => item.estado === 1) : bancos}
                      name='id_banco'
                      inputValue={initialValues.id_banco}
                      label='Banco'
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
                    <MyAutocomplete      
                      sx={{paddingRight: 4,}}                
                      options={TIPO_CUENTA}
                      name='tipo_cuenta'
                      inputValue={initialValues.tipo_documento}
                      label='Tipo Cuenta'
                      disabled={disabled}            
                      className={classes.myTextField}
                      variant='standard'
                      fullWidth
                      required
                    /> 
                    <MyCurrencyField 
                      maxDigits={100} 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },}}
                      className = {classes.myTextField} 
                      label = 'Número cuenta' 
                      name = 'numero_cuenta' 
                      disabled = {disabled}
                      required 
                    />
                  </Box>
                   <MyTextField 
                    sx={{[theme.breakpoints.up('xl')]: {
                      marginBottom: 5,
                    },}}
                     className = {classes.myTextField} 
                     label = 'Observación' 
                     name = 'observacion' 
                     disabled = {disabled}
                      
                  />
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

GestorForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default GestorForm;
