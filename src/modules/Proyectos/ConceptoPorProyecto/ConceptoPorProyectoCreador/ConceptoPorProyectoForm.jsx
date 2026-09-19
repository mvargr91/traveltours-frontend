import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Input } from '@mui/material';
import { Form, useFormikContext } from 'formik';
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
import MyDateField from '../../../../shared/components/MyDateField';
import { onGetColeccionLigera as onGetEtapasProyectos } from '../../../../@crema/redux/features/etapaProyecto/etapaProyectoSlice';
import {
  onHead,
  onGetDatosPrevios,
} from '../../../../@crema/redux/features/conceptoPorProyecto/conceptoPorProyectoSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PropTypes from 'prop-types';
import DownloadIcon from '@mui/icons-material/Download';
import defaultConfig from '@crema/constants/defaultConfig';
import {
  DATO_BOOLEAN_RADIO,
  ESTADO_ACTIVIDADES_POR_PROYECTO,
} from '../../../../shared/constants/ListaValores';

// ------------------ Helpers ------------------
const nextYearMonth = (anio, mes) => {
  const d = new Date(Number(anio), Number(mes) - 1, 1);
  d.setMonth(d.getMonth() + 1);
  return { anio: d.getFullYear(), mes: d.getMonth() + 1 };
};

// Helper pequeño para castear seguro a número (sin NaN para null/undefined/'')
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

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
    'blockQuote',
  ],
  placeholder: 'Escribe algo aquí...',
  contentsCss: [
    'body { color: #ff0000 !important; font-family: Arial, sans-serif; }',
  ],
  fontColor: {
    colors: [{ color: '#ff0000', label: 'Red' }],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
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
    ConceptoPorProyecto,
  } = props;

  const { coleccionLigera: etapasProyectos } = useSelector(
    (state) => state.etapaProyecto,
  );
  const {
    HeadConceptoPorProyectoActual: headProyecto,
    datosPrevios,
  } = useSelector((state) => state.conceptoPorProyecto);

  const [disabled, setDisabled] = useState(false);

  // Proyecto actual en el form (aseguramos número)
  const proyectoIdActual = formikValues.id_proyecto
    ? Number(formikValues.id_proyecto)
    : null;

  // SOLO usar datosPrevios si son del mismo proyecto
  const datosPreviosProyecto =
    proyectoIdActual !== null &&
    datosPrevios &&
    Number(datosPrevios.proyecto_id) === proyectoIdActual
      ? datosPrevios
      : null;

  // true si el backend devolvió año/mes origen para ESTE proyecto
  const hasDatosPrevios = Boolean(
    datosPreviosProyecto?.anio_origen && datosPreviosProyecto?.mes_origen,
  );

  // Campos origen deshabilitados si el form está disabled o si vienen de backend
  const disableCamposOrigen = disabled || hasDatosPrevios;

  // Deshabilitar todo si es ver o estado=0
  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') {
      setDisabled(true);
    }
  }, [initialValues.estado, accion]);

  // Cargar etapas según tipo de proyecto desde Formik
  useEffect(() => {
    if (formikValues.id_tipo_proyecto) {
      dispatch(
        onGetEtapasProyectos({ id_tipo_proyecto: formikValues.id_tipo_proyecto }),
      );
    }
  }, [dispatch, formikValues.id_tipo_proyecto]);

  // Cuando cambia el proyecto en el formulario:
  // - limpiamos campos dependientes
  // - pedimos HEAD y DATOS PREVIOS para ese proyecto
  useEffect(() => {
    const proyecto_id = formikValues.id_proyecto;

    if (!proyecto_id) {
      // Si se deselecciona proyecto, limpiar todo
      setFieldValue('codigo_proyecto', '');
      setFieldValue('id_tipo_proyecto', null);
      setFieldValue('ciudad_id', null);
      setFieldValue('anio_origen', '');
      setFieldValue('mes_origen', '');
      setFieldValue('anio', '');
      setFieldValue('mes', '');
      return;
    }

    // Al seleccionar un nuevo proyecto, limpiar origen/destino
    setFieldValue('anio_origen', '');
    setFieldValue('mes_origen', '');
    setFieldValue('anio', '');
    setFieldValue('mes', '');

    dispatch(onHead(proyecto_id));
    dispatch(onGetDatosPrevios({ proyecto_id }));
  }, [dispatch, formikValues.id_proyecto, setFieldValue]);

  // Sincronizar HEAD + DATOS PREVIOS con el formulario
  useEffect(() => {
    // 1. Si no hay proyecto seleccionado -> nada más que hacer aquí
    if (!formikValues.id_proyecto) return;

    // 2. Rellenar datos del head SOLO si corresponde al proyecto actual
    if (
      headProyecto &&
      Number(headProyecto.id_proyecto) === Number(formikValues.id_proyecto)
    ) {
      setFieldValue('codigo_proyecto', headProyecto.codigo_proyecto ?? '');
      setFieldValue('id_tipo_proyecto', headProyecto.id_tipo_proyecto ?? null);
      setFieldValue('ciudad_id', headProyecto.ciudad_id ?? null);
    }

    // 3. Si hay datos previos para ESTE proyecto -> proponer año/mes origen
    if (datosPreviosProyecto) {
      setFieldValue('anio_origen', datosPreviosProyecto.anio_origen ?? '');
      setFieldValue('mes_origen', datosPreviosProyecto.mes_origen ?? '');
    } else {
      // 4. NO hay datos previos para este proyecto -> asegurar origen/destino vacíos
      setFieldValue('anio_origen', '');
      setFieldValue('mes_origen', '');
      setFieldValue('anio', '');
      setFieldValue('mes', '');
    }
  }, [
    formikValues.id_proyecto,
    headProyecto,
    datosPreviosProyecto,
    setFieldValue,
  ]);

  // Calcular automáticamente año/mes destino en función del origen
  useEffect(() => {
    const ao = toNum(formikValues.anio_origen);
    const mo = toNum(formikValues.mes_origen);

    // Si falta alguno, limpiar destino
    if (!ao || !mo) {
      if (formikValues.anio !== '') setFieldValue('anio', '', false);
      if (formikValues.mes !== '') setFieldValue('mes', '', false);
      return;
    }

    if (hasDatosPrevios) {
      // 👉 Caso A: hay datos previos → usar REGLA de siguiente mes (como ahora)
      const { anio, mes } = nextYearMonth(ao, mo);

      if (formikValues.anio !== anio) setFieldValue('anio', anio, false);
      if (formikValues.mes !== mes) setFieldValue('mes', mes, false);
    } else {
      // 👉 Caso B: NO hay datos previos → copiar origen al destino
      if (formikValues.anio !== ao) setFieldValue('anio', ao, false);
      if (formikValues.mes !== mo) setFieldValue('mes', mo, false);
    }
  }, [
    formikValues.anio_origen,
    formikValues.mes_origen,
    formikValues.anio,
    formikValues.mes,
    hasDatosPrevios,
    setFieldValue,
  ]);


  const classes = useStyles(props);
  const showDestino = hasDatosPrevios;

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
                sx={{
                  [theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                }}
                name='id_proyecto'
                inputValue={initialValues.id_proyecto}
                label='Proyecto'
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={disabled}
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
                sx={{
                  [theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                }}
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

            {/* Año/Mes origen */}
            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
              }}
            >
              <MyCurrencyField
                maxDigits={20}
                sx={{
                  [theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                  paddingRight: 4,
                }}
                className={classes.myTextField}
                label='Año origen '
                name='anio_origen'
                disabled={disableCamposOrigen}
                required
              />
              <MyCurrencyField
                maxDigits={20}
                sx={{
                  [theme.breakpoints.up('xl')]: {
                    marginBottom: 5,
                  },
                }}
                className={classes.myTextField}
                label='Mes origen'
                name='mes_origen'
                disabled={disableCamposOrigen}
                required
              />
            </Box>

            {/* Año/Mes destino */}
            {showDestino && (
              <Box
                sx={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                }}
              >
                <MyCurrencyField
                  maxDigits={20}
                  sx={{
                    [theme.breakpoints.up('xl')]: {
                      marginBottom: 5,
                    },
                    paddingRight: 4,
                  }}
                  className={classes.myTextField}
                  label='Año destino'
                  name='anio'
                  disabled={true}
                  required
                />
                <MyCurrencyField
                  maxDigits={20}
                  sx={{
                    [theme.breakpoints.up('xl')]: {
                      marginBottom: 5,
                    },
                  }}
                  className={classes.myTextField}
                  label='Mes destino'
                  name='mes'
                  disabled={true}
                  required
                />
              </Box>
            )}

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
        ) : (
          ''
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

ConceptoPorProyectoForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ConceptoPorProyectoForm;
