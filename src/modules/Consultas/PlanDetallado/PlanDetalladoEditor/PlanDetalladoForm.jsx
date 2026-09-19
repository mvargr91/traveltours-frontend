import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Input } from '@mui/material';
import {Form, useFormikContext  } from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import AppScrollbar from '@crema/components/AppScrollbar';
import IntlMessages from '@crema/helpers/IntlMessages';
import { ArrowBackIos } from '@mui/icons-material';
import { Fonts } from '../../../../shared/constants/AppEnums';
import Tooltip from '@mui/material/Tooltip';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import MyAutocomplete from '../../../../shared/components/MyAutoComplete';
import MyAutoCompleteProyecto from '../../../../shared/components/MyAutoCompleteProyecto';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import MyCurrencyFieldMoneda from '../../../../shared/components/MyCurrencyFieldMoneda';
import MyDateField from '../../../../shared/components/MyDateField';
import { ESTADOS_PLAN_DETALLADO_INVERSIONES, FORMA_PAGO, TIPOS_VALOR  } from '../../../../shared/constants/ListaValores';
import PropTypes from 'prop-types';
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

const PlanDetalladoForm = (props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { handleOnClose, accion, inversionistas, gestores, proyectos, initialValues, titulo, locationState  } = props;
  const [disabled, setDisabled] = useState(false);


  useEffect(() => {
    if (accion === 'ver') {
      setDisabled(true);
    }
  }, [initialValues.estado, accion]);
  
  const onGoBack = () => { 
    navigate('/consulta-plan-detallado', {state: locationState});
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
              <MyTextField 
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                }, paddingRight: 4,}}
                  className = {classes.myTextField} 
                  label='Inversión' 
                  name='id_inversion' 
                  disabled={disabled}  
                  InputLabelProps={{
                    shrink: true,
                  }}                   
              />
              <MyTextField 
                sx={
                  {[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  // paddingRight: 4,
                }}
                className = {classes.myTextField} 
                label='Fecha inversion'
                name='fecha_inversion'
                disabled={true} 
                InputLabelProps={{
                  shrink: true,
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
              <MyAutocomplete      
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
              
              <MyAutoCompleteProyecto                    
                options={proyectos}
                name='id_proyecto'
                label='Proyecto'
                disabled={disabled}            
                className={classes.myTextField}
                variant='standard'
                fullWidth
                required
                sx={
                  {[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                }}
                InputLabelProps={{
                  shrink: true,
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
              {/* <MyAutocomplete      
                sx={{paddingRight: 4,}}                
                options={gestores}
                name='id_gestor'
                label='Gestor'
                disabled={disabled}            
                className={classes.myTextField}
                variant='standard'
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }} 
              />  */}
              <MyTextField 
                sx={
                  {[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                }}
                className = {classes.myTextField} 
                label='Gestor'
                name='id_gestor'
                disabled={true} 
                InputLabelProps={{
                  shrink: true,
                }} 
              /> 
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
                InputLabelProps={{
                  shrink: true,
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
              <MyAutocomplete      
                  sx={{paddingRight: 4,}}                
                  options={TIPOS_VALOR}
                  name='tipo_concepto'
                  label='Tipo concepto'
                  disabled={disabled}            
                  className={classes.myTextField}
                  variant='standard'
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }} 
              />
              <MyAutocomplete      
                  sx={{paddingRight: 4,}}                
                  options={ESTADOS_PLAN_DETALLADO_INVERSIONES}
                  name='estado_plan'
                  label='Estado plan detallado'
                  disabled={disabled}            
                  className={classes.myTextField}
                  variant='standard'
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
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
              <MyTextField 
                sx={
                  {[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                }}
                className = {classes.myTextField} 
                label='Fecha vencimiento'
                name='fecha_vencimiento'
                disabled={true} 
                InputLabelProps={{
                  shrink: true,
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
              <MyCurrencyFieldMoneda 
                maxDigits={20}
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },                      
                paddingRight: 4,}}
                className = {classes.myTextField} 
                label = 'Valor concepto' 
                name = 'valor_concepto' 
                disabled = {disabled}     
                InputLabelProps={{
                  shrink: true,
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
              <MyCurrencyFieldMoneda 
                maxDigits={20}
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },                      
                paddingRight: 4,}}
                className = {classes.myTextField} 
                label = 'Valor ret fuente' 
                name = 'valor_ret_fuente' 
                disabled = {disabled}     
                InputLabelProps={{
                  shrink: true,
                }}          
              />
              <MyCurrencyFieldPesos 
                maxDigits={20}
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },                      
                paddingRight: 4,}}
                className = {classes.myTextField} 
                label = 'Porcentaje ret. fuente' 
                name = 'porcentaje_ret_fuente' 
                disabled = {disabled}      
                InputLabelProps={{
                  shrink: true,
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
              <MyCurrencyFieldMoneda 
                sx={
                  {[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                }}
                className = {classes.myTextField} 
                label = 'Valor a pagar' 
                name = 'valor_a_pagar' 
                disabled = {disabled}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
              <MyTextField 
                sx={
                  {[theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                }}
                className = {classes.myTextField} 
                label='Fecha pago'
                name='fecha_pago'
                disabled={true} 
                InputLabelProps={{
                  shrink: true,
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
              <MyTextField 
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                }, paddingRight: 4,}}
                  className = {classes.myTextField} 
                  label = 'Usuario ultima actualizacion' 
                  name = 'usuario_modificacion_nombre' 
                  disabled = {disabled}    
                  InputLabelProps={{
                    shrink: true,
                  }}                    
              />
              <MyTextField 
                sx={{[theme.breakpoints.up('xl')]: {
                  marginBottom: 5,
                },}}
                  className = {classes.myTextField} 
                  label = 'Fecha ultima act.' 
                  name = 'fecha_modificacion' 
                  disabled = {disabled}       
                  InputLabelProps={{
                    shrink: true,
                  }}              

              />         
            </Box>
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

PlanDetalladoForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default PlanDetalladoForm;
