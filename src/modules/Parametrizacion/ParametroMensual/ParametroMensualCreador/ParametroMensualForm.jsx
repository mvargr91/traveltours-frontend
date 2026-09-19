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
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyCurrencyFieldDate from '../../../../shared/components/MyCurrencyFieldDate';
import MyCurrencyFieldMoneda from '../../../../shared/components/MyCurrencyFieldMoneda';
import { TIPO_LISTA } from '../../../../shared/constants/ListaValores';
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

const ParametroMensualForm = (props) => {
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
             <Box
                sx={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2,1fr)',
                }} 
              >   
                    <MyCurrencyField 
                      maxDigits={200}
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,                        
                      },  paddingRight: 4         }}
                      className = {classes.myTextField} 
                      label = 'Año' 
                      name = 'anio' 
                      disabled = {disabled}
                      required 
                    />
                    <MyTextField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },}}
                      className = {classes.myTextField} 
                      label = 'Mes' 
                      name = 'mes'  
                      disabled = {disabled}
                      required 
                      type={'number'}
                    />
             </Box>
             <Box
                sx={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2,1fr)',
                }} 
              >   
                <MyCurrencyFieldMoneda 
                  maxDigits={100} 
                  sx={{[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                  }}
                  className = {classes.myTextField} 
                  label = 'Precio Bolsa' 
                  name = 'valor_energia_bolsa' 
                  disabled = {disabled}
                  required 
                  onChange={(e) => setFieldValue(name, e.target.value)}
                />
                <MyCurrencyFieldMoneda 
                  maxDigits={100} 
                  sx={{[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  }}
                  className = {classes.myTextField} 
                  label = 'Precio mercado regulado' 
                  name = 'valor_energia_mercado' 
                  disabled = {disabled}
                  required 
                  onChange={(e) => setFieldValue(name, e.target.value)}
                />
             </Box>
             {/*  */}
              <Box
                sx={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2,1fr)',
                }} 
              >   
                <MyCurrencyFieldMoneda 
                  maxDigits={100} 
                  sx={{[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                  }}
                  className = {classes.myTextField} 
                  label = 'Costo compra' 
                  name = 'costo_compra' 
                  disabled = {disabled}
                  required 
                  onChange={(e) => setFieldValue(name, e.target.value)}
                />
                <MyCurrencyFieldMoneda 
                  maxDigits={100} 
                  sx={{[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  }}
                  className = {classes.myTextField} 
                  label = 'Cargo transporte nacional' 
                  name = 'cargo_transporte_nacional' 
                  disabled = {disabled}
                  required 
                  onChange={(e) => setFieldValue(name, e.target.value)}
                />
             </Box>
             {/*  */}
                          <Box
                sx={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2,1fr)',
                }} 
              >   
                <MyCurrencyFieldMoneda 
                  maxDigits={100} 
                  sx={{[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                  }}
                  className = {classes.myTextField} 
                  label = 'Cargo transporte local' 
                  name = 'cargo_transporte_local' 
                  disabled = {disabled}
                  required 
                  onChange={(e) => setFieldValue(name, e.target.value)}
                />
                <MyCurrencyFieldMoneda 
                  maxDigits={100} 
                  sx={{[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  }}
                  className = {classes.myTextField} 
                  label = 'Margen comercializacion' 
                  name = 'margen_comercializacion' 
                  disabled = {disabled}
                  required 
                  onChange={(e) => setFieldValue(name, e.target.value)}
                />
             </Box>
             {/*  */}
                          <Box
                sx={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2,1fr)',
                }} 
              >   
                <MyCurrencyFieldMoneda 
                  maxDigits={100} 
                  sx={{[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                  }}
                  className = {classes.myTextField} 
                  label = 'Costo perdidas' 
                  name = 'costo_perdidas' 
                  disabled = {disabled}
                  required 
                  onChange={(e) => setFieldValue(name, e.target.value)}
                />
                <MyCurrencyFieldMoneda 
                  maxDigits={100} 
                  sx={{[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  }}
                  className = {classes.myTextField} 
                  label = 'Costo restricciones' 
                  name = 'costo_restricciones' 
                  disabled = {disabled}
                  required 
                  onChange={(e) => setFieldValue(name, e.target.value)}
                />
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

ParametroMensualForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ParametroMensualForm;
