import React, { useEffect, useState, useRef } from 'react';
import { Box, Button } from '@mui/material';
import { Form, useFormikContext } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Fonts } from '../../../../shared/constants/AppEnums';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import { obtenerContactoLegalDocumento } from '../../../../@crema/redux/features/inversionistaContactoLegal/inversionistaContactosLegalesSlice';
import { TIPO_DOCUMENTO, TIPO_CUENTA, DATO_BOOLEAN_RADIO, DATO_TIPO_PERSONA } from '../../../../shared/constants/ListaValores';
import PropTypes from 'prop-types';

const options = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
];

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
  widthFull: {
    width: '100%',
  },
  pointer: {
    cursor: 'pointer',
  },
}));

const InversionistaForm = (props) => {
  const theme = useTheme();
  const {
    handleOnClose,
    accion,
    ciudades,
    bancos,
    tipoInversion,
    initialValues,
    titulo,
    values,
  } = props;

  const classes = useStyles(props);
  const dispatch = useDispatch();
  const { setFieldValue , setValues} = useFormikContext();
  const [disabled, setDisabled] = useState(false);
  const [resultInversionista, setResultaInversionista] = useState({});
  const { consultaDocumento: inversionistasContactoLegal } = useSelector((state) => state.inversionistasContactoLegal);

  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') {
      setDisabled(true);
    }
  }, [initialValues.estado, accion]);

  useEffect(() => {
    // if (accion === 'ver') return;
    const doc = values?.numero_documento;
    if (doc && String(doc).trim() !== '') {
      dispatch(obtenerContactoLegalDocumento({ numero_documento: doc }));
    }
  }, [values?.numero_documento, accion, dispatch, setFieldValue]);

  useEffect(() => {
    const c = inversionistasContactoLegal[0];
    // if (!c) return;

    if(c && accion !== 'ver'){
      setFieldValue('nombre', c.nombre_cont_leg || '', false);
      setFieldValue('tipo_documento', c.tipo_documento_cont_leg || '', false);
      setFieldValue('direccion', c.direccion_cont_leg || '', false);
      setFieldValue('ciudad_id', c.id_ciudad_cont_leg || null, false);
      setFieldValue('telefono', c.telefono_cont_leg || '', false);
      setFieldValue('banco', c.banco || '', false);
      setFieldValue('tipo_cuenta', c.tipo_cuenta || null, false);
      setFieldValue('numero_cuenta', c.numero_cuenta || '', false);
    }else{
      setFieldValue('nombre' ,initialValues.nombre, false);
      setFieldValue('tipo_documento' ,initialValues.tipo_documento, false);
      setFieldValue('direccion' ,initialValues.direccion, false);
      setFieldValue('ciudad_id', initialValues.ciudad_id, false);
      setFieldValue('telefono' ,initialValues.telefono, false);
      setFieldValue('banco' ,initialValues.banco, false);
      setFieldValue('tipo_cuenta', initialValues.tipo_cuenta, false);
      setFieldValue('numero_cuenta' ,initialValues.numero_cuenta, false);
      return;
    }

  }, [inversionistasContactoLegal, setFieldValue, values.numero_documento]);

  return (
    <Form className='' noValidate autoComplete='off'>
      <Box style={{ maxHeight: 'auto' }}>
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

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
              <FormikAutocomplete
                sx={{ paddingRight: 4 }}
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
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 } }}
                className={classes.myTextField}
                label='Número de documento'
                name='numero_documento'
                disabled={disabled}
                required
              />
            </Box>
            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
              <MyTextField
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                className={classes.myTextField}
                label='Nombre'
                name='nombre'
                disabled={disabled}
                required
              />
              <MyRadioField
                label='Tipo de persona*'
                name='tipo_persona'
                disabled={disabled}
                required
                options={DATO_TIPO_PERSONA}
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
              <MyCurrencyField
                maxDigits={100}
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5, paddingRight: 4 } }}
                className={classes.myTextField}
                label='Codigo CIIU'
                name='codigo_ciiu'
                disabled={disabled}
              />
              <MyTextField
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5} }}
                className={classes.myTextField}
                label='Descripcion actividad ecca'
                name='descripcion_act_ecca'
                disabled={disabled}
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(1,1fr)' }}>
              <MyTextField
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 } }}
                className={classes.myTextField}
                label='Dirección'
                name='direccion'
                disabled={disabled}
                required
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
              <FormikAutocomplete
                sx={{ paddingRight: 4 }}
                options={accion !== 'ver' ? ciudades.filter((item) => item.estado === 1) : ciudades}
                name='ciudad_id'
                inputValue={initialValues.ciudad_id}
                label='Ciudad'
                disabled={disabled}
                className={classes.myTextField}
                variant='standard'
                fullWidth
                required
              />
              <MyTextField
                name='telefono'
                label='Telefono'
                disabled={disabled}
                className={classes.myTextField}
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
              <MyTextField
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                className={classes.myTextField}
                label='Correo electrónico'
                name='email'
                disabled={disabled}
                required
              />
              <MyCurrencyFieldPesos
                maxDigits={20}
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 } }}
                className={classes.myTextField}
                label='Porcentaje ret fuente rendimientos'
                name='porcentaje_ret_fuente_rendimientos'
                disabled={disabled}
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
              <FormikAutocomplete
                sx={{ paddingRight: 4 }}
                options={accion !== 'ver' ? tipoInversion.filter((item) => item.estado === 1) : tipoInversion}
                name='id_tipo_inversion'
                inputValue={initialValues.id_tipo_inversion}
                label='Tipo Inversión'
                disabled={disabled}
                className={classes.myTextField}
                variant='standard'
                fullWidth
                required
              />
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

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
              <FormikAutocomplete
                sx={{ paddingRight: 4 }}
                options={TIPO_CUENTA}
                name='tipo_cuenta'
                inputValue={initialValues.tipo_cuenta}
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

            <MyTextField
              sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 } }}
              className={classes.myTextField}
              label='Observación'
              name='observaciones'
              disabled={disabled}
            />

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
              <MyRadioField
                label='Socio*'
                name='indicativo_socio'
                disabled={disabled}
                required
                options={DATO_BOOLEAN_RADIO}
              />
              <MyRadioField
                label='Estado'
                name='estado'
                disabled={accion === 'ver'}
                required
                options={options}
              />
            </Box>
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
              '&:hover': { backgroundColor: theme.palette.colorHovers, cursor: 'pointer' },
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
          sx={{
            paddingLeft: 15,
            paddingRight: 15,
            color: 'white !important',
            '&:hover': { backgroundColor: theme.palette.colorHovers, cursor: 'pointer' },
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

InversionistaForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
  ciudades: PropTypes.array,
  tipoInversion: PropTypes.array,
};

export default InversionistaForm;
