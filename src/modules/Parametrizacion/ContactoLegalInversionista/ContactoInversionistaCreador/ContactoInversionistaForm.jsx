import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Input } from '@mui/material';
import { Form, useFormikContext } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
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
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import PropTypes from 'prop-types';
import { obtenerContactoLegalDocumento } from '../../../../@crema/redux/features/inversionistaContactoLegal/inversionistaContactosLegalesSlice';
import { TIPO_DOCUMENTO, DATO_TIPO_CONTACTO_RADIO,TIPO_CUENTA } from '../../../../shared/constants/ListaValores';
import {
  ERROR_TYPE,
} from '../../../../shared/constants/Constantes';
import AppMessageView from '@crema/components/AppMessageView';

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
    marginBottom: 1,    
    height: '60px',
  },
  widthFull: {
    width: '100%',
  },
  pointer: {
    cursor: 'pointer',
  },
}));

const ContactoForm = (props) => {
  const theme = useTheme();
  const { handleOnClose, accion, inversionistas, initialValues, titulo, values, ciudades } = props;
  const { message, error, messageType } = useSelector(({ common }) => common);
  const [disabled, setDisabled] = useState(false);
  const dispatch = useDispatch();
  const { setFieldValue , setValues} = useFormikContext();
  const { consultaDocumento: inversionistasContactoLegal } = useSelector((state) => state.inversionistasContactoLegal);
  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') {
      setDisabled(true);
    }
  }, [initialValues.estado, accion]);

  useEffect(() => {
    // if (accion === 'ver') return;
    const doc = values?.numero_documento_cont_leg;
    if (doc && String(doc).trim() !== '') {
      dispatch(obtenerContactoLegalDocumento({ numero_documento: doc }));
    }
  }, [values?.numero_documento_cont_leg, accion, dispatch, setFieldValue]);

  useEffect(() => {
    if (!Array.isArray(inversionistasContactoLegal)) return;

    const docIngresado = String(values?.numero_documento_cont_leg ?? '').trim();
    if (!docIngresado) return;

    if (inversionistasContactoLegal.length > 0) {
      const c = inversionistasContactoLegal[0];
      if (!c  && accion !== 'ver') return;
      setFieldValue('nombre_cont_leg', c.nombre_cont_leg ?? '', false);
      setFieldValue('tipo_documento_cont_leg', c.tipo_documento_cont_leg ?? '', false);
      setFieldValue('direccion_cont_leg', c.direccion_cont_leg ?? '', false);
      setFieldValue('id_ciudad_cont_leg', c.id_ciudad_cont_leg ?? null, false);
      setFieldValue('telefono_cont_leg', c.telefono_cont_leg ?? '', false);
      setFieldValue('banco', c.banco ?? '', false);
      setFieldValue('tipo_cuenta', c.tipo_cuenta ?? null, false);
      setFieldValue('numero_cuenta', c.numero_cuenta ?? '', false);
      return;
    }

    const inv = (inversionistas || []).find(
      (i) => String(i?.numero_documento ?? '').trim() === docIngresado
    );

    if (inv) {
      setFieldValue('nombre_cont_leg', inv.nombre ?? '', false);
      setFieldValue('tipo_documento_cont_leg', inv.tipo_documento ?? '', false);
      setFieldValue('direccion_cont_leg', inv.direccion ?? '', false);
      setFieldValue('id_ciudad_cont_leg', inv.ciudad_id ?? null, false);
      setFieldValue('telefono_cont_leg', inv.telefono ?? '', false);
      setFieldValue('banco', inv.banco ?? '', false);
      setFieldValue('tipo_cuenta', inv.tipo_cuenta ?? null, false);
      setFieldValue('numero_cuenta', inv.numero_cuenta ?? '', false);
    } else {
      setFieldValue('nombre_cont_leg', '', false);
      setFieldValue('tipo_documento_cont_leg', '', false);
      setFieldValue('direccion_cont_leg', '', false);
      setFieldValue('id_ciudad_cont_leg', null, false);
      setFieldValue('telefono_cont_leg', '', false);
      setFieldValue('banco', '', false);
      setFieldValue('tipo_cuenta', null, false);
      setFieldValue('numero_cuenta', '', false);
    }
  }, [inversionistasContactoLegal, inversionistas, setFieldValue, values?.numero_documento_cont_leg]);

  const classes = useStyles(props);

  return (
    <Form className='' noValidate autoComplete='off'>
      <AppScrollbar style={{ maxHeight: 630 }}>
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
                    <MyAutocomplete     
                      sx={
                        {[theme.breakpoints.up('xl')]: {
                          marginBottom: 3,
                        },
                        paddingRight: 4,
                      }}                 
                      options={TIPO_DOCUMENTO}
                      name='tipo_documento'
                      inputValue={initialValues.tipo_contacto}
                      label='Tipo documento'
                      disabled={true}            
                      className={classes.myTextField}
                      variant='standard'
                      fullWidth                      
                    />  
                    <MyCurrencyField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 3,
                      },}}
                      maxDigits={100} 
                      className = {classes.myTextField} 
                      label = 'Número documento' 
                      name = 'numero_documento' 
                      disabled={true}
                    />
                  </Box>
                  <MyAutocomplete     
                    sx={
                      {[theme.breakpoints.up('xl')]: {
                        marginBottom: 1,
                      },
                    }}                 
                    options={inversionistas}
                    name='id_inversionista'
                    inputValue={initialValues.id_inversionista}
                    label='Nombre'
                    disabled={true}            
                    className={classes.myTextField}
                    variant='standard'
                    fullWidth
                    required
                  />  
                  <MyRadioField 
                     label = 'Tipo contacto' 
                     name = 'tipo_contacto_legal' 
                     disabled = {accion === 'ver'}
                     required 
                     options = {DATO_TIPO_CONTACTO_RADIO}
                  />                  
                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3,1fr)',
                    }} 
                  >
                    
                    <FormikAutocomplete      
                      sx={{paddingRight: 4,}}      
                      options={
                        accion !== 'ver'
                          ? TIPO_DOCUMENTO.filter((item) => item.estado === 1)
                          : TIPO_DOCUMENTO
                      }
                      name='tipo_documento_cont_leg'
                      // inputValue={initialValues.id_inversionista}
                      label='Tipo documento *'
                      disabled={disabled}            
                      className={classes.myTextField}
                      variant='standard'
                      clearOnEscape
                      clearText="Limpiar"
                      fullWidth
                      required
                    /> 
                    <MyCurrencyField 
                      sx={{[theme.breakpoints.up('xl')]: {
                        marginBottom: 3,
                      },paddingRight: 4,}}
                      maxDigits={100} 
                      className = {classes.myTextField} 
                      label = 'Número documento' 
                      name = 'numero_documento_cont_leg' 
                      disabled={disabled}
                      required
                    />                   
                   
                    <FormikAutocomplete      
                      sx={{paddingRight: 4,}}      
                      options={
                        accion !== 'ver'
                          ? ciudades.filter((item) => item.estado === 1)
                          : ciudades
                      }
                      name='id_ciudad_docto'
                      // inputValue={initialValues.id_inversionista}
                      label='Ciudad expedicion *'
                      disabled={disabled}            
                      className={classes.myTextField}
                      variant='standard'
                      clearOnEscape
                      clearText="Limpiar"
                      fullWidth
                      required
                    /> 
                  </Box>
                  <MyTextField 
                    sx={{[theme.breakpoints.up('xl')]: {
                      marginBottom: 3,
                    },}}
                     className = {classes.myTextField} 
                     label='Nombre' 
                     name='nombre_cont_leg' 
                     disabled = {disabled}
                     required
                  />
                  <MyTextField 
                    sx={{[theme.breakpoints.up('xl')]: {
                      marginBottom: 3,
                    },}}
                     className = {classes.myTextField} 
                     label='Dirección' 
                     name='direccion_cont_leg' 
                     disabled = {disabled}                     
                  />
                   <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2,1fr)',
                    }} 
                  > 
                    <FormikAutocomplete      
                      sx={{paddingRight: 4,}}      
                      options={
                        accion !== 'ver'
                          ? ciudades.filter((item) => item.estado === 1)
                          : ciudades
                      }
                      name='id_ciudad_cont_leg'
                      // inputValue={initialValues.id_inversionista}
                      label='Ciudad'
                      disabled={disabled}            
                      className={classes.myTextField}
                      variant='standard'
                      clearOnEscape
                      clearText="Limpiar"
                      fullWidth
                    />   
                    <MyCurrencyField 
                      sx={
                        {[theme.breakpoints.up('xl')]: {
                          marginBottom: 3,
                        },
                        paddingRight: 4,
                      }}
                      maxDigits={100} 
                      className = {classes.myTextField} 
                      label = 'Teléfono' 
                      name = 'telefono_cont_leg' 
                      disabled={disabled}
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
                        marginBottom: 3,
                      },                      
                      paddingRight: 4,}}
                      className = {classes.myTextField} 
                      label = 'Porcentaje participación' 
                      name = 'porcentaje_participacion' 
                      disabled = {disabled}                       
                    /> 
                  </Box>
                  <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>                   
                    <MyTextField
                      sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                      className={classes.myTextField}
                      label='Banco'
                      name='banco'
                      disabled={disabled}
                    />
                    
                  </Box>
      
                  <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
                    <FormikAutocomplete
                      sx={{ paddingRight: 4 }}
                      options={TIPO_CUENTA}
                      name='tipo_cuenta'
                      label='Tipo Cuenta'
                      disabled={disabled}
                      className={classes.myTextField}
                      variant='standard'
                      fullWidth
                    />
                    <MyCurrencyField
                      maxDigits={100}
                      sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 } }}
                      className={classes.myTextField}
                      label='Número cuenta'
                      name='numero_cuenta'
                      disabled={disabled}
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
      <AppMessageView
        variant={ messageType === ERROR_TYPE ? 'error' : 'success'}
        message={ messageType === ERROR_TYPE ? message : ''}
      />
    </Form>
  );
};

ContactoForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ContactoForm;
