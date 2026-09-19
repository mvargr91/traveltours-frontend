import React, { useEffect, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import Slide from '@mui/material/Slide';
import PropTypes from 'prop-types';
import AppMessageView from '@crema/components/AppMessageView';
import {
  UPDATE_TYPE,
  CREATE_TYPE,
  DELETE_TYPE,
  ERROR_TYPE,
} from '../../../../shared/constants/Constantes';
import {
  onGetColeccionLigera,
  onInitEdicionSimulacion,
  onGuardarSimulacion,
  resetSimulacionPorProyectoActual,
} from '../../../../@crema/redux/features/simulacionPorProyecto/simulacionPorProyectoSlice';

import { onHead } from '../../../../@crema/redux/features/actividadPorProyecto/actividadPorProyectoSlice';
import { onGetColeccionLigera as onGetProyectos } from '../../../../@crema/redux/features/Proyecto/proyectosSlice';
import { onGetColeccionLigera as onGetParametros } from '../../../../@crema/redux/features/parametroConstante/parametroConstanteSlice';
import { onGetColeccionLigera as onGetParametrosMensuales } from '../../../../@crema/redux/features/parametroMensual/parametroMensualSlice';

import SimulacionPorProyectoForm from './SimulacionPorProyectoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { useParams, useNavigate } from 'react-router-dom';

const useStylesBase = makeStyles((theme) => ({
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
  paper: {
    width: '100%',
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

let hUrl = '';

const SimulacionPorProyectoEditor = (props) => {
  const navigate = useNavigate();
  const { accion, proyecto_id, id } = useParams();
  const theme = useTheme();
  const dense = true;
  const [permisos, setPermisos] = useState('');
  const [titulo, setTitulo] = useState('');

  const [porcentajePerdidaEficiencia, setPorcentajePerdidaEficiencia] = useState(null);
  const [porcentajeIPC, setPorcentajeIPC] = useState(null);
  const [porcentajeIncrementoPrecio, setPorcentajeIncrementoPrecio] = useState(null);
  const [precioEnergia, setPrecioEnergia] = useState(null);

  // resultado del guardado (payload del back)
  const [saveOk, setSaveOk] = useState(false);
  const [savePayload, setSavePayload] = useState(null);

  const { message, messageType } = useSelector(({ common }) => common);
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
  if (dense === true) vp = '0px';

  const simsArr = useMemo(() => {
    const x = simulacionesPorProyecto;
    if (Array.isArray(x)) return x;
    if (Array.isArray(x?.datos)) return x.datos;
    return [];
  }, [simulacionesPorProyecto]);

  const classes = useStylesBase();

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
          // En editar no bloquees por existencia
          if (accion !== 'crear') return true;
          const v = (value ?? '').toString().trim().toUpperCase();
          return !simsArr.some((g) => (g?.indicativo_modelo_ccial ?? '').toString().trim().toUpperCase() === v);
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

  // reset selectedRow al montar
  useEffect(() => {
    initializeSelectedRow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar datos base
  useEffect(() => {
    dispatch(onHead(proyecto_id));
    dispatch(onGetColeccionLigera(proyecto_id));
    dispatch(onGetProyectos());
    dispatch(onGetParametros());
    dispatch(onGetParametrosMensuales());
  }, [dispatch, proyecto_id]);

  // Si es EDITAR, cargar la simulación completa (cabecera + conceptos)
  useEffect(() => {
    if (accion !== 'editar') return;
    if (!id) return;

    setSaveOk(false);
    setSavePayload(null);
    dispatch(onInitEdicionSimulacion({ id_simulacion: id }));
  }, [accion, id, dispatch]);

  // Leer parámetros constantes
  useEffect(() => {
    if (!Array.isArray(parametroConstantes?.datos)) return;

    const codigos = [
      'PORCENTAJE_PERDIDA_EFICIENCIA',
      'PORCENTAJE_DESCUENTO_TARIFA',
      'PORCENTAJE_IPC',
      'PORCENTAJE_INCREMENTO_PRECIO',
    ];

    const parametros = parametroConstantes.datos
      .filter((p) => codigos.includes(p.codigo_parametro))
      .reduce((acc, p) => {
        acc[p.codigo_parametro] = p.valor_parametro;
        return acc;
      }, {});

    setPorcentajePerdidaEficiencia(parametros.PORCENTAJE_PERDIDA_EFICIENCIA ?? null);
    setPorcentajeIPC(parametros.PORCENTAJE_IPC ?? null);
    setPorcentajeIncrementoPrecio(parametros.PORCENTAJE_INCREMENTO_PRECIO ?? null);
  }, [parametroConstantes?.datos, headProyecto, dispatch, proyecto_id]);

  const obtenerPrecioEnergiaComercializador = (parametrosMensualesArr) => {
    if (!Array.isArray(parametrosMensualesArr) || parametrosMensualesArr.length === 0) return null;

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

  // IMPORTANTE: reset flags SOLO en crear
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
              if (permiso.permitido) permisoAux.push(permiso.titulo);
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

  console.log(selectedRow);

  return (
    <div className={classes.root}>
      <Paper sx={{ marginBottom: theme.spacing(2) }} className={classes.paper}>
        <Box sx={{ background: theme.palette.background.paper }} className={classes.marcoTabla}>
          <Formik
            initialStatus
            enableReinitialize={true}
            validateOnBlur={false}
            initialValues={{
              accion : accion,
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
              porcentaje_perdida_efic: sim ? sim?.porcentaje_perdida_efic : Number(porcentajePerdidaEficiencia),
              valor_total_proyecto: sim?.valor_total_proyecto ?? headProyecto?.valor_total_proyecto,
              porcentaje_IPC: sim?.porcentaje_IPC ?? Number(porcentajeIPC),
              anios_depreciacion: sim?.anios_depreciacion ?? headProyecto?.anios_depreciacion,
              porcentaje_tasa_oportunidad: sim?.porcentaje_tasa_oportunidad ?? '',
              Valor_VPN_proyecto: sim?.vpn ?? sim?.Valor_VPN_proyecto ?? '',
              porcentaje_TIR_proyecto: sim?.tir ?? sim?.porcentaje_TIR_proyecto ?? '',
              anios_PBT: sim?.pbt ?? sim?.anios_PBT ?? '',
              updated_at: sim?.updated_at || today,
              conceptos: [],
            }}
            validationSchema={validationSchema}
            onSubmit={async (data, { setSubmitting }) => {
              setSubmitting(true);

              try {
                setSaveOk(false);
                setSavePayload(null);

                const res = await dispatch(onGuardarSimulacion({ params: data }));

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
                guardadoOk={saveOk}
                savePayload={savePayload}
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

SimulacionPorProyectoEditor.propTypes = {
  accion: PropTypes.string,
  titulo: PropTypes.string,
};

export default SimulacionPorProyectoEditor;
