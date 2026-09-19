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
import MyCurrencyFieldMoneda from '../../../../shared/components/MyCurrencyFieldMoneda';
import { onGetColeccionLigera as onGetEtapasProyectos } from '../../../../@crema/redux/features/etapaProyecto/etapaProyectoSlice';
import PropTypes from 'prop-types';
import { DATO_BOOLEAN_RADIO, TIPO_LISTA_RADIO, TIPO_CONCEPTO, OPERADORES, VALOR_BASE, TIPOS_VALOR_CONCEPTO} from '../../../../shared/constants/ListaValores';

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
    'body { color: #ff0000 !important; font-family: Arial, sans-serif; }',
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

const ConceptoProyectoForm = (props) => {
  const theme = useTheme();
  const { handleOnClose, accion, initialValues, titulo, values, tiposProyectos  } = props;
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') {
      setDisabled(true);
    }
  }, [initialValues.estado, accion]);

  const classes = useStyles(props);

  return (
    <Form className='' noValidate autoComplete='off'>
      <AppScrollbar style={{ maxHeight: 675 }}>
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
                 
                   {/* <FormikAutocomplete
                    options={
                      accion !== 'ver'
                        ? etapasProyectos.filter((item) => item.estado === 1)
                        : etapasProyectos
                    }
                    name="id_etapa_proyecto"
                    inputValue={initialValues.id_etapa_proyecto}
                    label="Etapa Proyecto *"
                    disabled={disabled}
                    className={classes.myTextField}
                    variant="standard"
                    fullWidth
                    required
                  /> */}
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
                      label = 'Orden secuencia' 
                      name = 'secuencia' 
                      disabled = {disabled}
                      required 
                      onChange={(e) => {
                        setShouldSyncValoresTipoInversion(false); 
                      }}
                    />
                    <FormikAutocomplete
                      options={
                        accion !== 'ver'
                          ? tiposProyectos.filter((item) => item.estado === 1)
                          : tiposProyectos
                      }
                      name="id_tipo_proyecto"
                      inputValue={initialValues.id_tipo_proyecto}
                      label="Tipo proyecto *"
                      disabled={disabled}
                      className={classes.myTextField}
                      variant="standard"
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
                    <FormikAutocomplete
                      options={
                        accion !== 'ver'
                          ? TIPO_CONCEPTO.filter((item) => item.estado === 1)
                          : TIPO_CONCEPTO
                      }
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,                        
                      },  paddingRight: 4         }}
                      name="indicativo_tipo_concepto"
                      inputValue={initialValues.indicativo_tipo_concepto}
                      label="Tipo concepto *"
                      disabled={disabled}
                      className={classes.myTextField}
                      variant="standard"
                      fullWidth
                      required
                    />
                    <FormikAutocomplete
                      options={
                        accion !== 'ver'
                          ? TIPOS_VALOR_CONCEPTO.filter((item) => item.estado === 1)
                          : TIPOS_VALOR_CONCEPTO
                      }
                      name="indicativo_tipo_valor"
                      inputValue={initialValues.indicativo_tipo_valor}
                      label="Tipo valor *"
                      disabled={disabled}
                      className={classes.myTextField}
                      variant="standard"
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
                    <MyRadioField 
                      label = 'Tipo línea *' 
                      name = 'indicativo_tipo_linea' 
                      disabled={disabled}
                      required 
                      options={TIPO_LISTA_RADIO}
                    /> 
                    <MyRadioField 
                      label = 'Presentacion consulta *' 
                      name = 'indicativo_presentacion_cons' 
                      disabled={disabled}
                      required 
                      options={DATO_BOOLEAN_RADIO}
                    /> 
                    
                  </Box>
                    <Box
                      sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2,1fr)',
                      }} 
                    >  
                    <MyRadioField 
                      label = 'Permite copia *' 
                      name = 'indicativo_permite_copia' 
                      disabled={disabled}
                      required 
                      options={DATO_BOOLEAN_RADIO}
                    />                    
                    <MyRadioField 
                      label = 'Concepto editable *' 
                      name = 'indicativo_concepto_editable' 
                      disabled={disabled}
                      required 
                      options={DATO_BOOLEAN_RADIO}
                    />
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2,1fr)',
                    }} 
                  >  
                    <MyRadioField 
                      label = 'Concepto calculado *' 
                      name = 'indicativo_concepto_calculado' 
                      disabled={disabled}
                      required 
                      options={DATO_BOOLEAN_RADIO}
                    /> 
                    <MyCurrencyFieldMoneda
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },}}
                      className = {classes.myTextField} 
                      label = 'Valor mensual pesos' 
                      name = 'valor_mensual_concepto' 
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
                      },                      
                      paddingRight: 4,}}
                      className = {classes.myTextField} 
                      label = 'Porcentaje' 
                      name = 'porcentaje' 
                      disabled = {disabled}                       
                    />
                    <MyTextField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },}}
                      className = {classes.myTextField} 
                      label = 'Parametro referencia' 
                      name = 'parametro_referencia' 
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
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,                        
                      },  paddingRight: 4         }}
                      options={
                        accion !== 'ver'
                          ? VALOR_BASE.filter((item) => item.estado === 1)
                          : VALOR_BASE
                      }
                      name="indicativo_valor_base"
                      inputValue={initialValues.indicativo_valor_base}
                      label="Valor base"
                      disabled={disabled}
                      className={classes.myTextField}
                      variant="standard"
                      fullWidth
                      
                    />
                    <FormikAutocomplete
                      options={
                        accion !== 'ver'
                          ? OPERADORES.filter((item) => item.estado === 1)
                          : OPERADORES
                      }
                      name="indicativo_operador"
                      inputValue={initialValues.indicativo_operador}
                      label="Operador "
                      disabled={disabled}
                      className={classes.myTextField}
                      variant="standard"
                      fullWidth                      
                    />
                  </Box>
                  <Box
                    component='h6'
                    mb={{ xs: 4, xl: 6 }}
                    fontSize={16}
                    fontWeight={Fonts.MEDIUM}
                  >
                    Parametros proyección
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
                      label = 'Porcentaje' 
                      name = 'porcentaje_proy' 
                      disabled = {disabled}                       
                    />
                    <MyTextField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },}}
                      className = {classes.myTextField} 
                      label = 'Parametro referencia' 
                      name = 'parametro_referencia_proy' 
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
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,                        
                      },  paddingRight: 4         }}
                      options={
                        accion !== 'ver'
                          ? VALOR_BASE.filter((item) => item.estado === 1)
                          : VALOR_BASE
                      }
                      name="indicativo_valor_base_proy"
                      inputValue={initialValues.indicativo_valor_base}
                      label="Valor base"
                      disabled={disabled}
                      className={classes.myTextField}
                      variant="standard"
                      fullWidth
                      
                    />
                    <FormikAutocomplete
                      options={
                        accion !== 'ver'
                          ? OPERADORES.filter((item) => item.estado === 1)
                          : OPERADORES
                      }
                      name="indicativo_operador_proy"
                      inputValue={initialValues.indicativo_operador}
                      label="Operador "
                      disabled={disabled}
                      className={classes.myTextField}
                      variant="standard"
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
                    <MyCurrencyField 
                      maxDigits={20}
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,                        
                      },  paddingRight: 4         }}
                      className = {classes.myTextField} 
                      label = 'Número año inicial proyección' 
                      name = 'numero_anio_inicial_proy' 
                      disabled = {disabled}
                      onChange={(e) => {
                        setShouldSyncValoresTipoInversion(false); 
                      }}
                    />
                    <MyCurrencyField 
                      maxDigits={20}
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,                        
                      },  paddingRight: 4         }}
                      className = {classes.myTextField} 
                      label = 'Número años proyección' 
                      name = 'numero_anios_proy' 
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
                  <MyRadioField
                      label = 'Estado' 
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

ConceptoProyectoForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ConceptoProyectoForm;
