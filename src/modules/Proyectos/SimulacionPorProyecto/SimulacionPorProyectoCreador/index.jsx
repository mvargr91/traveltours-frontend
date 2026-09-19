import React, { useEffect, useRef, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Button } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppScrollbar from '../../../../@crema/components/AppScrollbar';
import {
  UPDATE_TYPE,
  CREATE_TYPE,
  DELETE_TYPE,
  ERROR_TYPE,
} from '../../../../shared/constants/Constantes';
import {
  onShow,
  onGuardarSimulacion,
  onGetColeccionLigera,
  resetSimulacionPorProyectoActual,
} from '../../../../@crema/redux/features/simulacionPorProyecto/simulacionPorProyectoSlice';
import { onHead } from '../../../../@crema/redux/features/actividadPorProyecto/actividadPorProyectoSlice';
import { onGetColeccionLigera as onGetProyectos } from '../../../../@crema/redux/features/Proyecto/proyectosSlice';
import { onGetColeccionLigera as onGetParametros } from '../../../../@crema/redux/features/parametroConstante/parametroConstanteSlice';
import { onGetColeccionLigera as onGetParametrosMensuales } from '../../../../@crema/redux/features/parametroMensual/parametroMensualSlice';
import Slide from '@mui/material/Slide';
import SimulacionPorProyectoForm from './SimulacionPorProyectoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';
import AppMessageView from '@crema/components/AppMessageView';
import { useParams, useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  marcoTabla: {
    boxShadow: '0px 0px 5px 5px rgb(0 0 0 / 10%)',
    borderRadius: '4px',
    paddingLeft: '15px',
    paddingRight: '15px',
    marginTop: '5px',
  },
  root: {
    width: '100%',
    padding: '20px',
  },
  head: {
    borderTop: '2px solid #dee2e6',
    borderBottom: '2px solid #dee2e6',
  },
  headCell: {
    padding: '0px 0px 0px 15px',
    // textAlign: 'start',
  },
  row: {
    padding: 'none',
  },
  cell: (props) => ({
    padding: props.vp + ' 0px ' + props.vp + ' 15px',
    whiteSpace: 'nowrap',
  }),
  cellWidth: (props) => ({
    minWidth: props.width,
  }),
  cellColor: (props) => ({
    backgroundColor: props.cellColor,
    color: 'white',
  }),
  acciones: (props) => ({
    padding: props.vp + ' 0px ' + props.vp + ' 15px',
    minWidth: '100px',
  }),
  paper: {
    width: '100%',    
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },
  table: {
    minWidth: '100%',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  paginacion: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px',
    paddingBottom: '5px',
  },
  rowsPerPageOptions: {
    marginRight: '10px',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

let hUrl = '';

const SimulacionPorProyectoCreador = (props) => {
  const navigate = useNavigate();
  const { accion, proyecto_id } = useParams();
  const theme = useTheme();
  const dense = true;
  const [permisos, setPermisos] = useState('');
  const [titulo, setTitulo] = useState('');

  const [porcentajePerdidaEficiencia, setPorcentajePerdidaEficiencia] = useState(null);
  const [porcentajeIPC, setPorcentajeIPC] = useState(null);
  const [porcentajeIncrementoPrecio, setPorcentajeIncrementoPrecio] = useState(null);
  const [precioEnergia, setPrecioEnergia] = useState(null);
  const [porcentajeOportunidad, setPorcentajeOportunidad] = useState(null);
  const [idConceptoKwhBolsa, setIdConceptoKwhBolsa]   = useState(null);
  const [idConceptoPrecioBolsa, setIdConceptoPrecioBolsa]  = useState(null);
  const [idConceptoKwhComunidad, setIdConceptoKwhComunidad]  = useState(null);
  const [idConceptoPrecioComunidad, setIdConceptoPrecioComunidad]  = useState(null);
  const [idVentaComunidad, setIdVentaComunidad]  = useState(null);
  const [idVentaBolsa, setIdVentaBolsa]  = useState(null);

  //  resultado del guardado (payload del back)
  const [saveOk, setSaveOk] = useState(false);
  const [savePayload, setSavePayload] = useState(null);

  const { message, error, messageType } = useSelector(({ common }) => common);
  const dispatch = useDispatch();

  const { user } = useSelector(({ auth }) => auth);
  const { HeadActividadPorProyectoActual: headProyecto } = useSelector((state) => state.actividadPorProyecto);
  const { coleccionLigera: proyectos } = useSelector((state) => state.proyectos);

  const selectedRow = useSelector((state) => state.simulacionPorProyecto.SimulacionPorProyectoActual);
  const { coleccionLigera: simulacionesPorProyecto } = useSelector((state) => state.simulacionPorProyecto);

  const { coleccionLigera: parametroConstantes } = useSelector((state) => state.parametroConstantes);
  const { coleccionLigera: parametrosMensuales } = useSelector((state) => state.parametroMensual);

  const loading = useSelector((state) => state.simulacionPorProyecto.loading);

  let vp = '15px';
  if (dense === true) {
    vp = '0px';
  }

  const simsArr = useMemo(() => {
    const x = simulacionesPorProyecto;
    if (Array.isArray(x)) return x;
    if (Array.isArray(x?.datos)) return x.datos;
    return [];
  }, [simulacionesPorProyecto]);

  const norm = (v) => (v ?? '').toString().trim().toUpperCase();

  const useStyles = makeStyles((theme) => ({
    dialogBox: {
      position: 'absolute',
      '& .MuiDialog-paperWidthSm': {
        maxWidth: 600,
        width: '100%',
      },
      '& .MuiTypography-h6': {
        fontWeight: Fonts.LIGHT,
      },
    },
  }));

  const validationSchema = yup.object({
    id_proyecto: yup.string().required('Requerido'),
    porcentaje_tasa_oportunidad: yup.string().required('Requerido'),
    indicativo_modelo_ccial: yup
      .string()
      .required('Requerido')
      .test(
        'indicativo-modelo-existe',
        'Ya existe simulacion para este modelo de comercializacion.',
        function (value) {
          return !simulacionesPorProyecto.some((g) => g.indicativo_modelo_ccial === value);
        },
      ),
    porcentaje_perdida_efic: yup.string().required('Requerido'),
    valor_total_proyecto: yup.string().required('Requerido'),
    porcentaje_IPC: yup.string().required('Requerido'),
    anios_depreciacion: yup.string().required('Requerido'),
  });

  const initializeSelectedRow = () => {
    dispatch(resetSimulacionPorProyectoActual());
  };

  useEffect(() => {
    initializeSelectedRow();
  }, []);


  // Cargar datos base
  useEffect(() => {
    dispatch(onHead(proyecto_id));
    dispatch(onGetColeccionLigera(proyecto_id));
    dispatch(onGetProyectos());
    dispatch(onGetParametros());
    dispatch(onGetParametrosMensuales());
  }, [dispatch, proyecto_id]);

  // Leer parámetros constantes
  useEffect(() => {
    if (!Array.isArray(parametroConstantes?.datos)) return;

    const codigos = [
      'PORCENTAJE_PERDIDA_EFICIENCIA',
      'PORCENTAJE_IPC',
      'PORCENTAJE_INCREMENTO_PRECIO',
      'PORCENTAJE_TASA_OPORTUNIDAD',
      'ID_CONCEPTO_KWH_BOLSA',
      'ID_CONCEPTO_PRECIO_BOLSA',
      'ID_CONCEPTO_KWH_COMUNIDAD',
      'ID_CONCEPTO_PRECIO_COMUNIDAD',
      'ID_CONCEPTO_VENTA_ENERGIA_COM',
      'ID_CONCEPTO_VENTA_ENERGIA_BOLSA',
    ];

    const parametros = parametroConstantes.datos
      .filter((p) => codigos.includes(p.codigo_parametro))
      .reduce((acc, p) => {
        acc[p.codigo_parametro] = p.valor_parametro;
        return acc;
      }, {});

    setPorcentajePerdidaEficiencia(parametros.PORCENTAJE_PERDIDA_EFICIENCIA ?? null);
    setPorcentajeOportunidad(parametros.PORCENTAJE_TASA_OPORTUNIDAD ?? null);
    setPorcentajeIPC(parametros.PORCENTAJE_IPC ?? null);
    setPorcentajeIncrementoPrecio(parametros.PORCENTAJE_INCREMENTO_PRECIO ?? null);
    setIdConceptoKwhBolsa(parametros.ID_CONCEPTO_KWH_BOLSA ?? null);
    setIdConceptoPrecioBolsa(parametros.ID_CONCEPTO_PRECIO_BOLSA ?? null);
    setIdConceptoKwhComunidad(parametros.ID_CONCEPTO_KWH_COMUNIDAD ?? null);
    setIdConceptoPrecioComunidad(parametros.ID_CONCEPTO_PRECIO_COMUNIDAD ?? null);
    setIdVentaComunidad(parametros.ID_CONCEPTO_VENTA_ENERGIA_COM ?? null);
    setIdVentaBolsa(parametros.ID_CONCEPTO_VENTA_ENERGIA_BOLSA ?? null);
  }, [parametroConstantes?.datos, headProyecto, dispatch, proyecto_id]);

  const obtenerPrecioEnergiaComercializador = (parametrosMensualesArr) => {
    if (!Array.isArray(parametrosMensualesArr) || parametrosMensualesArr.length === 0) {
      return null;
    }

    const hoy = new Date();
    const currentYM = hoy.getFullYear() * 100 + (hoy.getMonth() + 1);

    const registro = parametrosMensualesArr
      .filter((p) => p.estado === 1)
      .filter((p) => p.anio * 100 + p.mes <= currentYM)
      .sort((a, b) => b.anio * 100 + b.mes - (a.anio * 100 + a.mes))[0];

    return registro ? Number(registro.valor_energia_bolsa) : null;
  };

  // Precio energía sugerido SOLO en crear
  useEffect(() => {
    if (accion === 'crear' && parametrosMensuales?.length) {
      const precio = obtenerPrecioEnergiaComercializador(parametrosMensuales);
      setPrecioEnergia(precio);
    }
  }, [accion, parametrosMensuales]);

  // IMPORTANTE: NO ejecutar reset en render (rompía el flujo)
  useEffect(() => {
    if (accion === 'crear') {
      initializeSelectedRow();
      setSaveOk(false);
      setSavePayload(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accion]);



  useEffect(() => {
    user &&
      user.usuario.permisos.forEach((modulo) => {
        modulo.opciones.forEach((opcion) => {
          if (opcion.url === props?.route?.path) {
            setTitulo('Simulaciones ' + opcion.nombre);
            hUrl = opcion.url_ayuda;
            const permisoAux = [];
            opcion.permisos.forEach((permiso) => {
              if (permiso.permitido) {
                permisoAux.push(permiso.titulo);
              }
            });
            setPermisos(permisoAux);
          }
        });
      });
  }, [user, props?.route]);

  const today = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }, []);

  const sim = selectedRow?.simulacion;

  const classes = useStyles({ vp: vp });

  console.log(accion);

  return (
    <div className={classes.root}>
      <Paper sx={{marginBottom: theme.spacing(2),}} className={classes.paper}>
        <Box 
          sx={{
            background: theme.palette.background.paper
          }}
          className={classes.marcoTabla}
        >
      <Formik
        initialStatus
        enableReinitialize={false}
        validateOnBlur={false}
        initialValues={{
          accion: accion,
          id: sim?.id ?? '',
          id_proyecto: sim?.id_proyecto ?? headProyecto?.id_proyecto,
          id_tipo_proyecto: headProyecto?.id_tipo_proyecto,
          codigo_proyecto: headProyecto?.codigo_proyecto,
          potencia: headProyecto?.potencia,
          generacion_anual: headProyecto?.generacion_anual,
          generacion_mensual: headProyecto?.generacion_mensual,
          indicativo_modelo_ccial: sim?.indicativo_modelo_ccial ?? '',
          indicativo_tipo_simulacion: sim?.indicativo_tipo_simulacion ?? 'P',
          indicativo_beneficio_trib: sim?.indicativo_beneficio_trib ?? 'S',
          porcentaje_perdida_efic: '',
          valor_total_proyecto: sim?.valor_total_proyecto ?? headProyecto?.valor_total_proyecto,
          porcentaje_IPC: '',
          anios_depreciacion: sim?.anios_depreciacion ?? headProyecto?.anios_depreciacion,
          porcentaje_tasa_oportunidad: '',
          Valor_VPN_proyecto: sim?.vpn ?? sim?.Valor_VPN_proyecto ?? 0,
          porcentaje_TIR_proyecto: sim?.tir ?? sim?.porcentaje_TIR_proyecto ?? 0,
          anios_PBT: sim?.pbt ?? sim?.anios_PBT ?? 0,
          updated_at: sim?.updated_at || today,
          conceptos: [],
        }}
        validationSchema={validationSchema}
        onSubmit={async (data, { setSubmitting }) => {
          setSubmitting(true);

          try {
            // reset de flags antes del save
            setSaveOk(false);
            setSavePayload(null);
            
            const res = await dispatch(onGuardarSimulacion({ params: data }));

            // Detección robusta de "fulfilled"
            const ok =
              !res?.error &&
              (res?.meta?.requestStatus === 'fulfilled' ||
                String(res?.type || '').endsWith('/fulfilled'));

            if (ok) {
              setSaveOk(true);
              setSavePayload(res?.payload ?? null);
            } else {
              setSaveOk(false);
              setSavePayload(res?.payload ?? null);
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, initialValues, setFieldValue }) => (
          <SimulacionPorProyectoForm
            values={values}
            setFieldValue={setFieldValue}
            titulo={titulo}
            accion={accion}
            initialValues={initialValues}
            proyectos={proyectos}
            headProyecto={headProyecto}
            selectedRow={selectedRow}
            porcentajePerdidaEficiencia={porcentajePerdidaEficiencia}
            precioEnergia={precioEnergia}
            porcentajeIPC={porcentajeIPC}
            porcentajeIncrementoPrecio={porcentajeIncrementoPrecio}
            porcentajeOportunidad={porcentajeOportunidad}
            saveOk={saveOk}
            savePayload={savePayload}
            idConceptoKwhBolsa={idConceptoKwhBolsa}
            idConceptoPrecioBolsa={idConceptoPrecioBolsa}
            idConceptoKwhComunidad={idConceptoKwhComunidad}
            idConceptoPrecioComunidad={idConceptoPrecioComunidad}
            idVentaComunidad={idVentaComunidad}
            idVentaBolsa={idVentaBolsa}
          />
        )}
      </Formik>
      </Box>
      <AppMessageView
        variant={
          messageType === UPDATE_TYPE || messageType === CREATE_TYPE
            ? 'success'
            : 'error'
        }
        message={
          messageType === UPDATE_TYPE || messageType === CREATE_TYPE
            ? message
            : ''
        }
      />
      <AppMessageView
        variant={messageType === ERROR_TYPE ? 'error' : 'success'}
        message={messageType === ERROR_TYPE ? message : ''}
      />
    </Paper>
    </div>
  );
};

SimulacionPorProyectoCreador.propTypes = {
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default SimulacionPorProyectoCreador;
