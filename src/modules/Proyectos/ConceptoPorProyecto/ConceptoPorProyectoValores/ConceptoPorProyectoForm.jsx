import React, { useEffect, useState, useMemo } from 'react';
import { Box, Button } from '@mui/material';
import { Form, useFormikContext } from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import AppScrollbar from '@crema/components/AppScrollbar';
import { useDispatch, useSelector } from 'react-redux';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Fonts } from '../../../../shared/constants/AppEnums';
import MyTextField from '../../../../shared/components/MyTextField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import MyCurrencyFieldConcepto from '../../../../shared/components/MyCurrencyFieldConceptos';
import { onGetColeccionLigera as onGetEtapasProyectos } from '../../../../@crema/redux/features/etapaProyecto/etapaProyectoSlice';
import {
  onHead,
  onGetDatosPrevios,
} from '../../../../@crema/redux/features/conceptoPorProyecto/conceptoPorProyectoSlice';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

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
    marginBottom: 2,
    height: '48px',
  },
  tableRowField: {
    width: '100%',
    marginBottom: 0,
    height: '28px',
  },
  widthFull: {
    width: '100%',
  },
  pointer: {
    cursor: 'pointer',
  },
}));

const ConceptoPorProyectoForm = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { setFieldValue, values: formikValues } = useFormikContext();

  const {
    handleOnClose,
    accion,
    initialValues,
    titulo,
    values,
    tiposProyectos,
    proyectos,
    ciudades,
    parametrosMensuales,
    parametrosConstantes,
    ConceptoPorProyecto,
    conceptos,
    onRecalcular,
  } = props;

  const { conceptosCalculados } = useSelector(
    (state) => state.conceptoPorProyecto,
  );

  let porcentaje = null;
  const [disabled, setDisabled] = useState(false);
  const [recalculoInicialHecho, setRecalculoInicialHecho] = useState(false);

  // Deshabilitar cuando es ver o estado 0
  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') {
      setDisabled(true);
    }
  }, [initialValues.estado, accion]);

  // Reset recálculo cuando cambia periodo
  useEffect(() => {
    setRecalculoInicialHecho(false);
  }, [formikValues.id_proyecto, formikValues.anio, formikValues.mes]);

  // Cargar etapas según tipo de proyecto
  useEffect(() => {
    if (values.id_tipo_proyecto) {
      dispatch(
        onGetEtapasProyectos({ id_tipo_proyecto: values.id_tipo_proyecto }),
      );
    }
  }, [dispatch, values.id_tipo_proyecto]);

  // Cargar datos previos y head
  useEffect(() => {
    if (values.id_proyecto) {
      let proyecto_id = values.id_proyecto;
      dispatch(onHead(proyecto_id));
      dispatch(onGetDatosPrevios({ proyecto_id }));
    }
  }, [dispatch, values.id_proyecto]);

  // IDs energía
  const idsConceptosEnergia = useMemo(() => {
    if (!parametrosConstantes || !Array.isArray(parametrosConstantes.datos)) {
      return [];
    }

    const getId = (codigo) => {
      const row = parametrosConstantes.datos.find(
        (p) => p.codigo_parametro === codigo,
      );
      return row ? Number(row.valor_parametro) : null;
    };

    return [
      getId('ID_CONCEPTO_PRECIO_COMUNIDAD'),
      getId('ID_CONCEPTO_KWH_COMUNIDAD'),
      getId('ID_CONCEPTO_PRECIO_BOLSA'),
      getId('ID_CONCEPTO_KWH_BOLSA'),
    ].filter((v) => v != null);
  }, [parametrosConstantes]);

  // Inicialización conceptos del backend
  useEffect(() => {
    if (!conceptos || !Array.isArray(conceptos)) {
      setFieldValue('conceptos', [], false);
      return;
    }

    const filtrados = conceptos.filter((c) => {
      const idC = Number(c.id_concepto ?? c.id);
      return !idsConceptosEnergia.includes(idC);
    });

    const normalizados = filtrados.map((c) => ({
      ...c,
      secuencia: Number(c.secuencia ?? c.secuencia_valor ?? 0),
      concepto: c.nombre ?? c.concepto ?? '',
      valor:
        c.valor !== undefined
          ? c.valor
          : c.valor_concepto_proyecto ?? 0,
    }));

    setFieldValue('conceptos', normalizados, false);
  }, [conceptos, idsConceptosEnergia, setFieldValue]);

  // Actualizar tabla cuando llegan calculados
  useEffect(() => {
    if (!conceptosCalculados || !Array.isArray(conceptosCalculados)) return;
    if (!conceptosCalculados.length) return;

    const filtrados = conceptosCalculados.filter((c) => {
      const idC = Number(c.id_concepto ?? c.id);
      return !idsConceptosEnergia.includes(idC);
    });

    const normalizados = filtrados.map((c) => ({
      ...c,
      secuencia: Number(c.secuencia ?? c.secuencia_valor ?? 0),
      concepto: c.nombre ?? c.concepto ?? '',
      valor:
        c.valor !== undefined
          ? c.valor
          : c.valor_concepto_proyecto ?? 0,
    }));

    setFieldValue('conceptos', normalizados, false);
  }, [conceptosCalculados, idsConceptosEnergia, setFieldValue]);

  useEffect(() => {
    if (!conceptos || !Array.isArray(conceptos)) return;

    // solo cargar conceptos la PRIMERA VEZ
    if (formikValues.conceptos?.length > 0) return;

    const filtrados = conceptos.filter((c) => {
      const idC = Number(c.id_concepto ?? c.id);
      return !idsConceptosEnergia.includes(idC);
    });

    const normalizados = filtrados.map((c) => ({
      ...c,
      secuencia: Number(c.secuencia ?? c.secuencia_valor ?? 0),
      concepto: c.nombre ?? c.concepto ?? '',
      valor: c.valor ?? c.valor_concepto_proyecto ?? 0,
    }));

    setFieldValue('conceptos', normalizados, false);
  }, [conceptos]);



  // Porcentaje descuento tarifa
  if (Array.isArray(parametrosConstantes.datos)) {
    const parametro = parametrosConstantes.datos.find(
      (param) => param.codigo_parametro === 'PORCENTAJE_DESCUENTO_TARIFA',
    );
    if (parametro) {
      let valor = parametro.valor_parametro;
      if (typeof valor === 'string' && valor.includes('%')) {
        valor = parseFloat(valor.replace('%', '')) / 100;
      } else {
        valor = parseFloat(valor) / 100;
      }
      porcentaje = isNaN(valor) ? null : valor;
    }
  }

  // Autocompletar precios si no hay digitados
  useEffect(() => {
    if (values.anio && values.mes) {
      const datosFiltrados = parametrosMensuales.filter(
        (item) => item.anio === values.anio && item.mes === values.mes,
      );

      if (datosFiltrados.length > 0) {
        const yaTieneValores =
          Number(values.precio_energia_bolsa || 0) !== 0 ||
          Number(values.precio_energia_comunidad || 0) !== 0 ||
          Number(values.energia_comercializada_bolsa || 0) !== 0 ||
          Number(values.energia_comercializada_comunidad || 0) !== 0;

        if (yaTieneValores) return;

        setFieldValue(
          'precio_energia_bolsa',
          datosFiltrados[0]?.valor_energia_bolsa,
        );

        const valorMercado =
          datosFiltrados[0]?.valor_energia_mercado ?? 0;

        let resultado;
        if (porcentaje !== null && porcentaje !== undefined) {
          resultado = valorMercado * (1 - porcentaje);
        } else {
          resultado = valorMercado;
        }

        resultado = Number(resultado || 0).toFixed(2);
        setFieldValue('precio_energia_comunidad', resultado);
      }
    }
  }, [
    parametrosMensuales,
    parametrosConstantes,
    values.anio,
    values.mes,
    porcentaje,
    values.precio_energia_bolsa,
    values.precio_energia_comunidad,
    values.energia_comercializada_bolsa,
    values.energia_comercializada_comunidad,
    setFieldValue,
  ]);

  const classes = useStyles(props);

  console.log(formikValues);

  return (
    <Form className='' noValidate autoComplete='off'>
      <AppScrollbar style={{ maxHeight: 700 }}>
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
            {/* Proyecto + código */}
            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
              }}
            >
              <FormikAutocomplete
                options={
                  accion !== 'ver'
                    ? proyectos.filter((item) => item.estado_proyecto === 1)
                    : proyectos
                }
                sx={{ paddingRight: 4 }}
                name='id_proyecto'
                inputValue={initialValues.id_proyecto}
                label='Proyecto'
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={true}
                className={classes.myTextField}
                variant='standard'
                fullWidth
              />
              <MyTextField
                className={classes.myTextField}
                label='Código Proyecto'
                name='codigo_proyecto'
                disabled={true}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>

            {/* Tipo proyecto + ciudad */}
            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
              }}
            >
              <FormikAutocomplete
                options={tiposProyectos}
                sx={{ paddingRight: 4 }}
                name='id_tipo_proyecto'
                inputValue={initialValues.id_tipo_proyecto}
                label='Tipo Proyecto'
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={true}
                className={classes.myTextField}
                variant='standard'
                fullWidth
                required
              />
              <FormikAutocomplete
                options={ciudades}
                name='ciudad_id'
                inputValue={initialValues.ciudad_id}
                label='Ciudad'
                disabled={true}
                className={classes.myTextField}
                variant='standard'
                fullWidth
                required
              />
            </Box>

            {/* Energía generada */}
            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '2fr 2fr',
                paddingBottom: 4,
              }}
            >
              <MyTextField
                className={classes.myTextField}
                label='Energia comercializada comunidad [kWh-mes]:'
                name='energia_comercializada_comunidad'
                disabled={disabled}
                sx={{ paddingRight: 4 }}
                InputLabelProps={{
                  shrink: true,
                }}
                onBlur={() => {
                  onRecalcular(formikValues);
                }}
              />
              <MyTextField
                className={classes.myTextField}
                label='Energia comercializada bolsa [kWh-mes]:'
                name='energia_comercializada_bolsa'
                disabled={disabled}
                InputLabelProps={{
                  shrink: true,
                }}
                onBlur={() => {
                  onRecalcular(formikValues);
                }}
              />
            </Box>

            {/* Precio Energía */}
            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '2fr 2fr',
              }}
            >
              <MyTextField
                className={classes.myTextField}
                label='Precio energia comunidad [$/kWh]*:'
                name='precio_energia_comunidad'
                disabled={disabled}
                sx={{ paddingRight: 4 }}
                InputLabelProps={{
                  shrink: true,
                }}
                onBlur={() => {
                  onRecalcular(formikValues);
                }}
              />
              <MyTextField
                className={classes.myTextField}
                label='Precio energia bolsa [$/kWh]*:'
                name='precio_energia_bolsa'
                disabled={disabled}
                InputLabelProps={{
                  shrink: true,
                }}
                onBlur={() => {
                  onRecalcular(formikValues);
                }}
              />
            </Box>

            {/* Tabla conceptos */}
            <Box sx={{ mt: 0 }}>
              {/* Encabezados */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 1fr',
                  gap: 15,
                }}
              >
                <MyTextField label='Concepto' name='__header_conc' disabled />
                <MyTextField
                  label='Valor'
                  name='__header_val'
                  disabled
                  inputProps={{ style: { textAlign: 'right' } }}
                  InputLabelProps={{
                    style: { textAlign: 'right', width: '100%' },
                  }}
                />
              </Box>

              {/* Filas dinámicas */}
              {formikValues.conceptos?.map((row, i) => {
                const esDetalle = row.indicativo_tipo_linea === 'D';

                return (
                  <Box
                    key={`concepto-${i}-${row.secuencia}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '3fr 1fr',
                      gap: 15,
                    }}
                  >
                    <MyTextField
                      label=''
                      name={`conceptos[${i}].concepto`}
                      disabled
                      className={classes.tableRowField}
                      variant='standard'
                      margin='none'
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        marginTop: 0,
                        marginBottom: 0,
                        '& .MuiInputBase-root': {
                          padding: 0,
                          height: '28px',
                        },
                        '& .MuiInputBase-input': {
                          padding: 0,
                          paddingLeft: esDetalle ? theme.spacing(6) : 0,
                        },
                        '& .MuiInput-underline:before': {
                          borderBottom: 'none',
                        },
                        '& .MuiInput-underline:hover:before': {
                          borderBottom: 'none',
                        },
                        '& .MuiInput-underline:after': {
                          borderBottom: 'none',
                        },
                      }}
                    />

                    <MyCurrencyFieldConcepto
                      label=''
                      name={`conceptos[${i}].valor`}
                      disabled={!row.es_editable || disabled}
                      className={classes.tableRowField}
                      variant='standard'
                      fullWidth
                      margin='none'
                      inputProps={{ style: { textAlign: 'right' } }}
                      InputLabelProps={{
                        shrink: true,
                        style: { textAlign: 'right', width: '100%' },
                      }}
                      sx={{
                        marginTop: 0,
                        marginBottom: 0,
                        '& .MuiInputBase-root': {
                          padding: 0,
                          height: '28px',
                        },
                        '& .MuiInputBase-input': {
                          padding: 0,
                        },
                        '& .MuiInput-underline:before': {
                          borderBottomColor: '#e0e0e0',
                        },
                        '& .MuiInput-underline:hover:before': {
                          borderBottomColor: '#e0e0e0',
                        },
                        '& .MuiInput-underline:after': {
                          borderBottomColor: '#e0e0e0',
                        },
                      }}
                      onBlur={() => {
                        if (
                          !disabled &&
                          row.es_editable &&
                          typeof onRecalcular === 'function'
                        ) {
                          onRecalcular(formikValues);
                        }
                      }}
                    />
                  </Box>
                );
              })}
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
                boxShadow: 'none',
              },
              backgroundColor: theme.palette.primary.main,
              boxShadow: 'none',
            }}
            variant='contained'
            type='submit'
          >
            <IntlMessages id='boton.submit' />
          </Button>
        ) : null}

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

ConceptoPorProyectoForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
  tiposProyectos: PropTypes.any,
  proyectos: PropTypes.any,
  ciudades: PropTypes.any,
  ConceptoPorProyecto: PropTypes.any,
  conceptos: PropTypes.array,
  onRecalcular: PropTypes.func,
};

export default ConceptoPorProyectoForm;
