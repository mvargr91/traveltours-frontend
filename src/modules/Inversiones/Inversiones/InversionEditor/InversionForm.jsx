import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Input } from '@mui/material';
import {Form, useFormikContext  } from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import AppScrollbar from '@crema/components/AppScrollbar';
import IntlMessages from '@crema/helpers/IntlMessages';
import { useDispatch, useSelector } from 'react-redux';
import {onShow as onShowInversionista} from '../../../../@crema/redux/features/inversionista/inversionistasSlice';
import {onShow as onShowTipoInversion} from '../../../../@crema/redux/features/categoriaInversion/categoriaInversionesSlice';
import {onShow as onShowGestor} from '../../../../@crema/redux/features/gestor/gestoresSlice';
import { ArrowBackIos } from '@mui/icons-material';
import { Fonts } from '../../../../shared/constants/AppEnums';
import Tooltip from '@mui/material/Tooltip';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import MyAutocomplete from '../../../../shared/components/MyAutoComplete';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import BasicDatePicker from '../../../muiComponents/lab/DatePicker/BasicDatePicker';
import MyDatePicker from '../../../../shared/components/MyDatePicker';
import MyCurrencyFieldMoneda from '../../../../shared/components/MyCurrencyFieldMoneda';
import MyDateField from '../../../../shared/components/MyDateField';
import { TIPO_DOCUMENTO, TIPO_CUENTA, DATO_BOOLEAN_RADIO, FORMA_PAGO  } from '../../../../shared/constants/ListaValores';
import PropTypes from 'prop-types';
import TablaInversiones from '../../../../shared/components/TablaInversiones';
import { useParams, useNavigate } from 'react-router-dom'; 

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
    // position: 'sticky',
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

const InversionForm = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleOnClose, accion, inversionistas, gestores, proyectos, tipoInversion, initialValues, titulo, values  } = props;
  const { setValues, setFieldValue } = useFormikContext();
  const [disabled, setDisabled] = useState(false);
  const selectedRowInversionista = useSelector((state) =>  state.inversionistas.InversionistaActual);
  const selectedRowGestor = useSelector((state) =>  state.gestores.GestorActual);
  const selectedRowTipoInversion = useSelector((state) =>  state.categoriasInversiones.CategoriaInversionActual);
  const [shouldSyncTipoInversion, setShouldSyncTipoInversion] = useState(true);
  const [shouldSyncValoresTipoInversion, setShouldSyncValoresTipoInversion] = useState(true);


  useEffect(() => {
    if (accion === 'ver') {
      setDisabled(true);
    }
  }, [initialValues.estado, accion]);

  useEffect(() => {
    if (values.id_inversionista) {
      dispatch(onShowInversionista(values.id_inversionista));
    }
  }, [values.id_inversionista]);

  useEffect(() => {
    if (values.id_gestor) {
      dispatch(onShowGestor(values.id_gestor));
    }
  }, [values.id_gestor]);
  
  
  useEffect(() => {
    if (selectedRowInversionista && values.id_inversionista) {
      setValues((prevValues) => {
        const newValues = {
          ...prevValues,
          email: selectedRowInversionista.email || '',
          porcentaje_ret_fuente_rendimientos:  accion === 'crear' ? selectedRowInversionista?.porcentaje_ret_fuente_rendimientos : values.porcentaje_ret_fuente_rendimientos,
        };
  
        // Solo setear id_tipo_inversion si la bandera lo permite
        if (shouldSyncTipoInversion) {
          newValues.id_tipo_inversion = selectedRowInversionista.id_tipo_inversion || null;
        }
  
        return newValues;
      });
    }else{
      setValues((prevValues) => {
        const newValues = {
          ...prevValues,
          email: '',
          porcentaje_ret_fuente_rendimientos:  '',
        };
        return newValues;
      });
    }
  }, [selectedRowInversionista, values.id_inversionista]);

  useEffect(() => {
    console.log(values.id_gestor);
    if (values.id_gestor) {
      setValues((prevValues) => {
        const newValues = {
          ...prevValues,
          porcentaje_comision: accion === 'crear' ?  selectedRowGestor?.porcentaje_comision : values.porcentaje_comision,
          porcentaje_ret_fuente:  accion === 'crear' ? selectedRowGestor?.porcentaje_ret_fuente : values.porcentaje_ret_fuente,
        };
  
        return newValues;
      });
    }else{
      setValues((prevValues) => {
        const newValues = {
          ...prevValues,
          porcentaje_comision: '',
          porcentaje_ret_fuente:  '',
        };
        return newValues;
      });
    }
  }, [selectedRowGestor,values.id_gestor]);
  
  // Resetear bandera al detectar cambio en inversionista
  useEffect(() => {
    if (values.id_inversionista) {
      setShouldSyncTipoInversion(true);
    }
  }, [values.id_inversionista]);

  useEffect(() => {
    if (values.id_tipo_inversion) {
      dispatch(onShowTipoInversion(values.id_tipo_inversion));
    }
  }, [values.id_tipo_inversion]);
  
  useEffect(() => {
  if (
    selectedRowTipoInversion &&
    selectedRowTipoInversion.id === values.id_tipo_inversion 
  ) {
    setValues(prevValues => ({
      ...prevValues,
      plazo_capital:
        accion === 'crear' && shouldSyncValoresTipoInversion
          ? selectedRowTipoInversion?.plazo_capital
          : prevValues.plazo_capital,
      plazo_interes:
        accion === 'crear' && shouldSyncValoresTipoInversion
          ? selectedRowTipoInversion?.plazo_interes
          : prevValues.plazo_interes,
      periodos_muertos:
        accion === 'crear' && shouldSyncValoresTipoInversion
          ? selectedRowTipoInversion?.periodos_muertos
          : prevValues.periodos_muertos,
      periodos_gracia:
        accion === 'crear' && shouldSyncValoresTipoInversion
          ? selectedRowTipoInversion?.periodos_gracia
          : prevValues.periodos_gracia,
      tasa_interes_inversion:
        accion === 'crear' && shouldSyncValoresTipoInversion
          ? selectedRowTipoInversion?.tasa_interes_inversion
          : prevValues.tasa_interes_inversion,
      indicativo_forma_pago_int:
        accion === 'crear' && shouldSyncValoresTipoInversion
          ? selectedRowTipoInversion?.indicativo_forma_pago_int
          : prevValues.indicativo_forma_pago_int,
    }));
  }
  // No else → dejamos los valores actuales sin modificarlos
}, [selectedRowTipoInversion, values.id_tipo_inversion]);

  

  const onGoBack = () => { 
    navigate('/inversiones');
  }

  const classes = useStyles(props);

  return (
    <Form className='' noValidate autoComplete='off'>
      {/* <AppScrollbar style={{ maxHeight: 600 }}> */}
        <Box py={5} px={{ xs: 5, lg: 8, xl: 10 }}>
          
          <Box
            component='h6'
            mb={{ xs: 4, xl: 6 }}
            fontSize={20}
            fontWeight={Fonts.MEDIUM}
          >
            <Tooltip title='Volver'>
              <ArrowBackIos
                style={{cursor: 'pointer', fontSize: 30}}
                onClick={onGoBack}
              />
            </Tooltip>
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
              <FormikAutocomplete      
                sx={{paddingRight: 4,}}                
                options={inversionistas}
                name='id_inversionista'
                // inputValue={initialValues.id_inversionista}
                label='Inversionista'
                disabled={disabled}            
                className={classes.myTextField}
                variant='standard'
                fullWidth
                required
              />  
              <MyTextField 
                sx={
                  {[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  // paddingRight: 4,
                }}
                className = {classes.myTextField} 
                label='Correo electrónico'
                name='email'
                disabled={true} 
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
                options={tipoInversion}
                name='id_tipo_inversion'
                // inputValue={initialValues.id_tipo_inversion}
                label='Tipo Inversión'
                disabled={disabled}            
                className={classes.myTextField}
                variant='standard'
                fullWidth
                required
                onChange={(e, value) => {
                  setShouldSyncTipoInversion(false);
                  setShouldSyncValoresTipoInversion(true); 
                }}
                sx={
                  {[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                }}
              /> 
              {/* <MyTextField 
                sx={
                  {[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  // paddingRight: 4,
                }}
                className = {classes.myTextField} 
                label='Teléfono' 
                name='telefono'
                disabled={true}
              /> */}
              <MyCurrencyFieldPesos 
                maxDigits={20}
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },  }}
                disabled={disabled}  
                className = {classes.myTextField} 
                label = 'Porcentaje Ret. fuente rendimientos' 
                name = 'porcentaje_ret_fuente_rendimientos' 
                // disabled = {disabled}                       
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
                label = 'Valor inversión' 
                name = 'valor_inversion' 
                disabled = {true}
                required 
              />
              <MyDateField
                  name="fecha_inversion"
                  label="Fecha inversión"
                  disabled={disabled}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      borderBottom: '1px solid ' + theme.palette.primary.main,
                      '&:hover:not(.Mui-disabled):before': {
                        borderBottom: '2px solid ' + theme.palette.primary.main,
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
              <FormikAutocomplete      
                sx={{paddingRight: 4,}}                
                options={gestores}
                name='id_gestor'
                // inputValue={initialValues.id_gestor}
                label='Gestor'
                disabled={disabled}            
                className={classes.myTextField}
                variant='standard'
                fullWidth
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
                label = 'Porcentaje comisión gestor' 
                name = 'porcentaje_comision' 
                disabled = {disabled}                       
              /> 
              <MyCurrencyFieldPesos 
                maxDigits={20}
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },}}
                className = {classes.myTextField} 
                label = 'Porcentaje ret fuente gestor' 
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
              <MyCurrencyField 
                maxDigits={20}
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },                      
                paddingRight: 4,}}
                className = {classes.myTextField} 
                label = 'Plazo Capital' 
                name = 'plazo_capital' 
                disabled = {disabled}
                required 
                onChange={(e) => {
                  setShouldSyncValoresTipoInversion(false); 
                }}
              />
              <MyCurrencyField 
                maxDigits={20} 
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },}}
                className = {classes.myTextField} 
                label = 'Plazo Interés' 
                name = 'plazo_interes' 
                disabled = {disabled}
                required 
                onChange={(e) => {
                  setShouldSyncValoresTipoInversion(false); 
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
                },                      
                paddingRight: 4,}}
                className = {classes.myTextField} 
                label = 'Período Muerto' 
                name = 'periodos_muertos' 
                disabled = {disabled}   
                onChange={(e) => {
                  setShouldSyncValoresTipoInversion(false); 
                }}                    
              />
              <MyCurrencyField 
                maxDigits={20} 
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },}}
                className = {classes.myTextField} 
                label = 'Período Gracia' 
                name = 'periodos_gracia' 
                disabled = {disabled} 
                onChange={(e) => {
                  setShouldSyncValoresTipoInversion(false); 
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
              <MyCurrencyFieldPesos 
                sx={
                  {[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                }}
                className = {classes.myTextField} 
                label = 'Rentabilidad(E.M.)' 
                name = 'tasa_interes_inversion' 
                disabled = {disabled}
                required 
                onChange={(e) => {
                  setShouldSyncValoresTipoInversion(false); 
                }}
              />
              <FormikAutocomplete                      
                options={FORMA_PAGO}
                name='indicativo_forma_pago_int'
                // inputValue={initialValues.ciudad_id}
                label='Forma pago'
                disabled={disabled}            
                className={classes.myTextField}
                variant='standard'
                fullWidth
                required
                onChange={(e) => {
                  setShouldSyncValoresTipoInversion(false); 
                }}
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
         
           
          </Box>
        </Box>
      {/* </AppScrollbar> */}
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
            <IntlMessages id='boton.update' />
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

InversionForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default InversionForm;
