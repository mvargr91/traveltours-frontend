import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Input } from '@mui/material';
import { Form, useFormikContext } from 'formik';
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
import MyCurrencyFieldPotencia from '../../../../shared/components/MyCurrencyFieldPotencia';
import MyDateField from '../../../../shared/components/MyDateField';
import MyCurrencyFieldMoneda from '../../../../shared/components/MyCurrencyFieldMoneda';
import MyCurrencyFieldNumeroDecimal from '../../../../shared/components/MyCurrencyFieldNumeroDecimal';
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import { DATO_BOOLEAN_RADIO } from '../../../../shared/constants/ListaValores';
import BasicDatePicker from '../../../muiComponents/lab/DatePicker/BasicDatePicker';
import Swal from 'sweetalert2';
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

const ProyectoForm = (props) => {
  const theme = useTheme();
  const { setValues } = useFormikContext();
  const { handleOnClose, 
    accion, 
    ciudades, 
    tiposProyectos,
    sectoresProyectos,
    categoriasInversiones,
    parametros,
    vehiculosInversiones,
    comunidadesEnergeticas,
    initialValues, 
    titulo,
    values,
    tipoInversionDefault,
    setFieldValue,
    } = props;

  // VALIDAMOS QUE TENGA EL PARAMETRO PORCENTAJE INVERSION EXTERNA
  let porcentajeInversionExterna = null;

  if (Array.isArray(parametros.datos)) {
      const parametro = parametros.datos.find(param => param.codigo_parametro === 'PORCENTAJE_INVERSION_EXTERNA');

      if (parametro) {
          let valor = parametro.valor_parametro;

          // Convertir a número si viene con símbolo de porcentaje
          if (typeof valor === 'string' && valor.includes('%')) {
              valor = parseFloat(valor.replace('%', '')) / 100;
          } else {
              valor = parseFloat(valor) / 100;
          }

          // Validar que el valor convertido sea un número
          porcentajeInversionExterna = isNaN(valor) ? null : valor;
      }
  }

  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') {
      setDisabled(true);
    }
  }, [initialValues.estado]);

  // 1) Default en crear: Plan padrino = 'N'
  useEffect(() => {
    if (accion === 'crear' && !values.indicativo_plan_padrino) {
      setFieldValue('indicativo_plan_padrino', 'N', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accion]);

  // 2) Si Plan padrino = 'N' -> limpiar campos dependientes (y se ocultarán en JSX)
  useEffect(() => {
    if (values.indicativo_plan_padrino === 'N') {
      setFieldValue('valor_inversion_proyecto', '', false);
      setFieldValue('id_tipo_inversion', '', false);
    }else{
      setFieldValue('id_tipo_inversion', tipoInversionDefault, true);      
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.indicativo_plan_padrino]);

  // 3) Si Plan padrino = 'S' y accion='crear' -> calcular valor_inversion_proyecto
  useEffect(() => {
    if (accion == 'ver') return;
    if (values.indicativo_plan_padrino !== 'S') return;

    if (porcentajeInversionExterna !== null && values.valor_total_proyecto) {
      const total = parseFloat(values.valor_total_proyecto);
      if (!isNaN(total) && total > 0) {
        const calc = total * porcentajeInversionExterna;
        setFieldValue('valor_inversion_proyecto', calc.toFixed(2), false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accion,
    values.indicativo_plan_padrino,
    values.valor_total_proyecto,
    porcentajeInversionExterna,
  ]);


  // Cálculo automático de valor_inversion_proyecto
  useEffect(() => {
    if(accion === 'crear' ){
      if (porcentajeInversionExterna !== null && values.valor_total_proyecto) {
        const valorCalculado =
          parseFloat(values.valor_total_proyecto) * porcentajeInversionExterna;
        setFieldValue('valor_inversion_proyecto', valorCalculado.toFixed(2));
      }
    }
  }, [values.valor_total_proyecto, porcentajeInversionExterna, setFieldValue]);

  const classes = useStyles(props);

  return (
    <Form className='' noValidate autoComplete='off'>
      <AppScrollbar style={{ maxHeight: 'auto' }}>
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
              <MyTextField 
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },paddingRight: 4}}
                  className = {classes.myTextField} 
                  label = 'Proyecto' 
                  name = 'nombre_proyecto' 
                  disabled
                  required 
              />
              <MyTextField 
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },}}
                  className = {classes.myTextField} 
                  label = 'Código' 
                  name = 'codigo_proyecto' 
                  disabled
                  required
                  autoFocus
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
                      },paddingRight: 4}}
                      className = {classes.myTextField} 
                      label = 'Tipo' 
                      name = 'tipo_proyecto' 
                      disabled
                    />
                    <MyTextField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },}}
                      className = {classes.myTextField} 
                      label = 'Ciudad' 
                      name = 'ciudad_proyecto' 
                      disabled
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
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },
                      paddingRight: 4}}
                      className = {classes.myTextField} 
                      label = 'Valor total proyecto' 
                      name = 'valor_total_proyecto' 
                      disabled
                      required
                    /> 
                    <MyCurrencyFieldPotencia 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },
                      paddingRight: 4}}
                      className = {classes.myTextField} 
                      label = 'Capacidad (kWp)'
                      name = 'potencia' 
                      disabled
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
                  <MyDateField
                      name="fecha_desembolso"
                      label="Fecha"
                      disabled={disabled}
                      variant="standard"
                      required
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
                          paddingRight: 4
                        },
                      }}
                    />
                    <MyTextField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },paddingRight: 4}}
                      className = {classes.myTextField} 
                      label = 'Concepto' 
                      name = 'concepto_desembolso' 
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
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },paddingRight: 4}}
                      className = {classes.myTextField} 
                      label = 'Proveedor' 
                      name = 'proveedor_desembolso' 
                      disabled = {disabled}
                    />
                    <MyCurrencyFieldMoneda
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 5,
                      },
                      paddingRight: 4}}
                      className = {classes.myTextField} 
                      label = 'Valor' 
                      name = 'valor_desembolso' 
                      disabled = {disabled}
                      required
                    />
                  </Box>
               </Box>
        </Box>
      
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
      </AppScrollbar>
    </Form>
  );
};

ProyectoForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ProyectoForm;
