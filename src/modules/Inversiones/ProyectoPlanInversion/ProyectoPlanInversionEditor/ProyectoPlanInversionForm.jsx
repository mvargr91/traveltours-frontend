import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import { Form, useFormikContext } from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import IntlMessages from '@crema/helpers/IntlMessages';
import { useDispatch, useSelector } from 'react-redux';
import {
  onShow as onShowInversionista,
} from '../../../../@crema/redux/features/inversionista/inversionistasSlice';
import {
  onShow as onShowProyecto,
} from '../../../../@crema/redux/features/Proyecto/proyectosSlice';
import { ArrowBackIos } from '@mui/icons-material';
import { Fonts } from '../../../../shared/constants/AppEnums';
import Tooltip from '@mui/material/Tooltip';
import MyTextField from '../../../../shared/components/MyTextField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import MyCurrencyFieldMoneda from '../../../../shared/components/MyCurrencyFieldMoneda';
import MyDatePicker from '../../../../shared/components/MyDatePicker';
import { TIPO_DOCUMENTO } from '../../../../shared/constants/ListaValores';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';

const useStyles = makeStyles(() => ({
  bottomsGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: '20px',
    gap: '10px',
    paddingRight: '20px',
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

const opcionesPorPagina = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const InversionForm = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    handleOnClose,
    accion,
    inversionistas,
    ciudades,
    tiposProyectos,
    proyectos,
    titulo,
  } = props;

  const { values, setValues } = useFormikContext();
  const [disabled, setDisabled] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const selectedRowInversionista = useSelector(
    (state) => state.inversionistas.InversionistaActual,
  );
  const selectedRowProyecto = useSelector(
    (state) => state.proyectos.ProyectoActual,
  );

  const stateData = location.state || {};
  const classes = useStyles(props);

  useEffect(() => {
    setDisabled(accion === 'ver');
  }, [accion]);

  useEffect(() => {
    setPagina(1);
  }, [values.id_inversionista, values.id_proyecto, accion]);

  useEffect(() => {
    if (values.id_inversionista) {
      dispatch(onShowInversionista(values.id_inversionista));
    }
  }, [dispatch, values.id_inversionista]);

  useEffect(() => {
    if (values.id_proyecto) {
      dispatch(onShowProyecto(values.id_proyecto));
    }
  }, [dispatch, values.id_proyecto, accion]);

  useEffect(() => {
    if (selectedRowInversionista && values.id_inversionista) {
      const tipo = TIPO_DOCUMENTO.find(
        (item) => item.id === selectedRowInversionista.tipo_documento,
      );

      setValues((prevValues) => ({
        ...prevValues,
        email: selectedRowInversionista.email || '',
        tipo_documento: tipo?.nombre || '',
        numero_documento: selectedRowInversionista.numero_documento || '',
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        email: '',
        tipo_documento: '',
        numero_documento: '',
      }));
    }
  }, [selectedRowInversionista, values.id_inversionista, accion, setValues]);

  useEffect(() => {
    if (selectedRowProyecto) {
      const ciudad = ciudades.find(
        (item) => item.id === selectedRowProyecto.ciudad_id,
      );
      const tipo = tiposProyectos.find(
        (item) => item.id === selectedRowProyecto.id_tipo_proyecto,
      );

      console.log(selectedRowProyecto?.valor_total_proyecto);

      setValues((prevValues) => ({
        ...prevValues,
        codigo_proyecto: selectedRowProyecto.codigo_proyecto || '',
        ciudad: ciudad?.nombre || '',
        tipo_proyecto: tipo?.nombre || '',
        valor_total_proyecto: selectedRowProyecto?.valor_total_proyecto || '',
        capacidad: selectedRowProyecto?.potencia || '',
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        codigo_proyecto: '',
        ciudad: '',
        tipo_proyecto: '',
        valor_total_proyecto: '',
        capacidad: '',
      }));
    }
  }, [
    selectedRowProyecto,
    values.id_proyecto,
    ciudades,
    tiposProyectos,
    setValues,
    accion,
  ]);

  const onGoBack = () => {
    navigate('/proyectos-plan-inversiones');
  };

  const planPagos = Array.isArray(values.plan_pagos) ? values.plan_pagos : [];

  const totalPaginas = Math.max(1, Math.ceil(planPagos.length / porPagina));

  const filasPaginaActual = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    return planPagos.slice(inicio, fin);
  }, [planPagos, pagina, porPagina]);

  const totalValor = useMemo(() => {
    return planPagos.reduce((acc, item) => {
      const valorNumerico =
        typeof item.valor === 'string'
          ? Number(String(item.valor).replace(/[^\d.-]/g, '')) || 0
          : Number(item.valor) || 0;

      return acc + valorNumerico;
    }, 0);
  }, [planPagos]);

  const handleChangePorPagina = (event) => {
    setPorPagina(Number(event.target.value));
    setPagina(1);
  };

  return (
    <Form noValidate autoComplete='off'>
      <Box py={5} px={{ xs: 5, lg: 8, xl: 10 }}>
        <Box
          component='h6'
          mb={{ xs: 4, xl: 6 }}
          fontSize={20}
          fontWeight={Fonts.MEDIUM}
        >
          <Tooltip title='Volver'>
            <ArrowBackIos
              style={{ cursor: 'pointer', fontSize: 30 }}
              onClick={onGoBack}
            />
          </Tooltip>
          {titulo}
        </Box>

        <Box px={{ md: 5, lg: 8, xl: 10 }}>
          <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
            <FormikAutocomplete
              sx={{ paddingRight: 4 }}
              options={
                accion !== 'ver'
                  ? inversionistas.filter((item) => item.estado === 1)
                  : inversionistas
              }
              name='id_inversionista'
              label='Inversionista'
              disabled={disabled}
              className={classes.myTextField}
              variant='standard'
              clearOnEscape
              clearText='Limpiar'
              fullWidth
              required
            />
            <MyTextField
              className={classes.myTextField}
              label='Correo electrónico'
              name='email'
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
            <MyTextField
              className={classes.myTextField}
              label='Tipo Documento'
              name='tipo_documento'
              disabled
              sx={{ paddingRight: 4 }}
              InputLabelProps={{ shrink: true }}
            />
            <MyTextField
              className={classes.myTextField}
              label='Número Documento'
              name='numero_documento'
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
            <FormikAutocomplete
              sx={{ paddingRight: 4 }}
              options={
                accion !== 'ver'
                  ? proyectos?.filter((item) => item.estado_proyecto === 1)
                  : proyectos
              }
              name='id_proyecto'
              label='Proyectos'
              disabled={disabled}
              className={classes.myTextField}
              variant='standard'
              clearOnEscape
              clearText='Limpiar'
              fullWidth
              required
            />
            <MyTextField
              className={classes.myTextField}
              label='Código'
              name='codigo_proyecto'
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
            <MyTextField
              className={classes.myTextField}
              sx={{ paddingRight: 4 }}
              label='Tipo Proyecto'
              name='tipo_proyecto'
              disabled
              InputLabelProps={{ shrink: true }}
            />
            <MyTextField
              className={classes.myTextField}
              label='Ciudad'
              name='ciudad'
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
            <MyCurrencyFieldMoneda
              className={classes.myTextField}
              sx={{ paddingRight: 4 }}
              label='Valor total proyecto'
              name='valor_total_proyecto'
              disabled
              InputLabelProps={{ shrink: true }}
            />
            <MyTextField
              className={classes.myTextField}
              label='Capacidad(kWp)'
              name='capacidad'
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box mt={6}>
            <Typography variant='h2' sx={{ mb: 3, fontWeight: 500 }}>
              Plan de pagos
            </Typography>

            <Box
              mt={4}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography variant='body2'>
                Mostrando de {(pagina - 1) * porPagina + 1} a {Math.min(pagina * porPagina, planPagos.length)} de {planPagos.length} resultados - Página {pagina} de {totalPaginas}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <select value={porPagina} onChange={handleChangePorPagina}>
                  {opcionesPorPagina.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>

                <Pagination
                  count={totalPaginas}
                  page={pagina}
                  onChange={(event, value) => setPagina(value)}
                  shape='rounded'
                  showFirstButton
                  showLastButton
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                gap: 2,
                mb: 2,
                fontWeight: 700,
              }}
            >
              <Box />
              <Typography>Fecha planeada</Typography>
              <Typography>Valor inversion</Typography>
              <Typography>Fecha pago</Typography>
              <Box />
            </Box>

            {filasPaginaActual.map((item, index) => {
              const realIndex = (pagina - 1) * porPagina + index;
              const rowKey = `${values.id_inversionista}-${values.id_proyecto}-${realIndex}-${item.id ?? 'new'}`;

              return (
                <Box
                  key={rowKey}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                    gap: 2,
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box />
                  <MyDatePicker
                    key={`fecha-planeada-${rowKey}`}
                    name={`plan_pagos[${realIndex}].fecha_planeada`}
                    disabled={disabled}
                  />
                  <MyCurrencyFieldMoneda
                    key={`valor-${rowKey}`}
                    name={`plan_pagos[${realIndex}].valor`}
                    disabled={disabled}
                    sx={{ padding: '3px !important' }}
                  />
                  <MyDatePicker
                    key={`fecha-pago-${rowKey}`}
                    name={`plan_pagos[${realIndex}].fecha_pago`}
                    disabled={disabled}
                  />
                  <Box />
                </Box>
              );
            })}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                gap: 2,
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Box />
              <Typography variant='h5' sx={{ mb: 0, fontWeight: 500 }}>
                Total invertido
              </Typography>
              <Typography variant='h5'>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 2,
                }).format(totalValor)}
              </Typography>
              <Box />
              <Box />
            </Box>
                        <Box
              mt={4}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography variant='body2'>
                Mostrando de {(pagina - 1) * porPagina + 1} a {Math.min(pagina * porPagina, planPagos.length)} de {planPagos.length} resultados - Página {pagina} de {totalPaginas}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <select value={porPagina} onChange={handleChangePorPagina}>
                  {opcionesPorPagina.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>

                <Pagination
                  count={totalPaginas}
                  page={pagina}
                  onChange={(event, value) => setPagina(value)}
                  shape='rounded'
                  showFirstButton
                  showLastButton
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className={classes.bottomsGroup}>
        {accion !== 'ver' && (
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
        )}

        <Button
          sx={{
            paddingLeft: 15,
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
  initialValues: PropTypes.object,
  values: PropTypes.object,
  titulo: PropTypes.string.isRequired,
  inversionistas: PropTypes.array,
  ciudades: PropTypes.array,
  tiposProyectos: PropTypes.array,
  proyectos: PropTypes.array,
};

InversionForm.defaultProps = {
  initialValues: {},
  values: {},
  inversionistas: [],
  ciudades: [],
  tiposProyectos: [],
  proyectos: [],
};

export default InversionForm;