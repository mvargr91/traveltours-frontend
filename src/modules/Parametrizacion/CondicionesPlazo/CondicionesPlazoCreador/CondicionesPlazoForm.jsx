import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Input } from '@mui/material';
import { Form } from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import AppScrollbar from '@crema/components/AppScrollbar';
import { useDispatch, useSelector } from 'react-redux';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Fonts } from '../../../../shared/constants/AppEnums';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import { onGetColeccionLigera as onGetEtapasProyectos } from '../../../../@crema/redux/features/etapaProyecto/etapaProyectoSlice';
import PropTypes from 'prop-types';
import { DATO_BOOLEAN_RADIO } from '../../../../shared/constants/ListaValores';

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

const CondicionesPlazoForm = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { handleOnClose, accion, initialValues, titulo,values, tiposProyectos  } = props;
  const { coleccionLigera: etapasProyectos } = useSelector((state) => state.etapaProyecto);
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') {
      setDisabled(true);
    }
  }, [initialValues.estado, accion]);

  useEffect(() => {  
    if(values.id_tipo_proyecto){
      dispatch(onGetEtapasProyectos({id_tipo_proyecto: values.id_tipo_proyecto}));   

    }
  }, [dispatch, values.id_tipo_proyecto]);

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
                      },  paddingRight: 4         }}
                      className = {classes.myTextField} 
                      label = 'Plazo capital (meses)' 
                      name = 'plazo_capital' 
                      disabled = {disabled}
                      required 
                      onChange={(e) => {
                        setShouldSyncValoresTipoInversion(false); 
                      }}
                    />
                    <MyCurrencyFieldPesos 
                      maxDigits={20}
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,                        
                      },    }}
                      className = {classes.myTextField} 
                      label = 'Tasa interes(E.M.)' 
                      name = 'tasa_interes_inversion' 
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
                    <MyCurrencyFieldPesos 
                      maxDigits={20}
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      }, paddingRight: 4,   }}
                      className = {classes.myTextField} 
                      label = 'Porcentaje inversion ext.' 
                      name = 'porcentaje_inversion_externa'
                      disabled = {disabled}      
                      required                  
                    /> 
                    <MyRadioField
                      label = 'Estado *' 
                      name = 'estado' 
                      disabled = {accion === 'ver'}
                      required 
                      options = {options}
                    />
                  </Box>
                  
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

CondicionesPlazoForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default CondicionesPlazoForm;
