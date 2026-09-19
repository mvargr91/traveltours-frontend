import React, { useEffect, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import {
  onInitSimulacionInversionista,
  onGuardarSimulacionInversionista,
} from '../../../../@crema/redux/features/simulacionPorProyecto/simulacionPorProyectoSlice';
import { onHead } from '../../../../@crema/redux/features/actividadPorProyecto/actividadPorProyectoSlice';
import { onGetColeccionLigera as onGetProyectos } from '../../../../@crema/redux/features/Proyecto/proyectosSlice';
import { onGetColeccionLigera as onGetParametros } from '../../../../@crema/redux/features/parametroConstante/parametroConstanteSlice';
import { onGetColeccionLigera as onGetParametrosMensuales } from '../../../../@crema/redux/features/parametroMensual/parametroMensualSlice';
import SimulacionPorProyectoForm from './SimulacionPorProyectoForm';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles(() => ({
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

const SimulacionPorProyectoCreador = (props) => {
  const { accion, proyecto_id, id_simulacion } = useParams();
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [titulo, setTitulo] = useState('');
  const [porcentajePerdidaEficiencia, setPorcentajePerdidaEficiencia] = useState(null);
  const [porcentajeIPC, setPorcentajeIPC] = useState(null);
  const [porcentajeOportunidad, setPorcentajeOportunidad] = useState(null);
  const [idConceptoKwhBolsa, setIdConceptoKwhBolsa] = useState(null);
  const [idConceptoPrecioBolsa, setIdConceptoPrecioBolsa] = useState(null);
  const [idConceptoKwhComunidad, setIdConceptoKwhComunidad] = useState(null);
  const [idConceptoPrecioComunidad, setIdConceptoPrecioComunidad] = useState(null);
  const [idVentaComunidad, setIdVentaComunidad] = useState(null);
  const [idVentaBolsa, setIdVentaBolsa] = useState(null);

  const [saveOk, setSaveOk] = useState(false);
  const [savePayload, setSavePayload] = useState(null);

  const { message, messageType } = useSelector(({ common }) => common);
  const { user } = useSelector(({ auth }) => auth);

  const { HeadActividadPorProyectoActual: headProyecto } = useSelector(
    (state) => state.actividadPorProyecto,
  );

  const { coleccionLigera: proyectos } = useSelector((state) => state.proyectos);

  const selectedRow = useSelector(
    (state) => state.simulacionPorProyecto.SimulacionPorInversionistaActual,
  );

  const { coleccionLigera: parametroConstantes } = useSelector(
    (state) => state.parametroConstantes,
  );

  const { coleccionLigera: parametrosMensuales } = useSelector(
    (state) => state.parametroMensual,
  );

  useEffect(() => {
    dispatch(onHead(proyecto_id));
    dispatch(onGetProyectos());
    dispatch(onGetParametros());
    dispatch(onGetParametrosMensuales());
  }, [dispatch, proyecto_id]);

  useEffect(() => {
    if (!id_simulacion) return;

    dispatch(
      onInitSimulacionInversionista({
        accion: 'crear',
        id: null,
        id_simulacion: Number(id_simulacion),
        porcentaje_part_inversionista: '',
      }),
    );
  }, [dispatch, id_simulacion]);

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
    setIdConceptoKwhBolsa(parametros.ID_CONCEPTO_KWH_BOLSA ?? null);
    setIdConceptoPrecioBolsa(parametros.ID_CONCEPTO_PRECIO_BOLSA ?? null);
    setIdConceptoKwhComunidad(parametros.ID_CONCEPTO_KWH_COMUNIDAD ?? null);
    setIdConceptoPrecioComunidad(parametros.ID_CONCEPTO_PRECIO_COMUNIDAD ?? null);
    setIdVentaComunidad(parametros.ID_CONCEPTO_VENTA_ENERGIA_COM ?? null);
    setIdVentaBolsa(parametros.ID_CONCEPTO_VENTA_ENERGIA_BOLSA ?? null);
  }, [parametroConstantes?.datos]);

  useEffect(() => {
    if (!user) return;

    user.usuario.permisos.forEach((modulo) => {
      modulo.opciones.forEach((opcion) => {
        if (opcion.url === props?.route?.path) {
          setTitulo('Simulación Inversionista');
        }
      });
    });
  }, [user, props?.route]);

  const today = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }, []);

  const sim = useMemo(() => {
    return selectedRow?.simulacion ?? null;
  }, [selectedRow]);

  const conceptosIniciales = useMemo(() => {
    return Array.isArray(selectedRow?.conceptos) ? selectedRow.conceptos : [];
  }, [selectedRow]);

  const validationSchema = useMemo(() => {
    return yup.object({
      id_proyecto: yup.string().required('Requerido'),
      indicativo_modelo_ccial: yup.string().required('Requerido'),
      nombre_inversionista: yup.string().required('Requerido'),
      telefono_inversionista: yup.string().required('Requerido'),
      email_inversionista: yup
        .string()
        .email('Formato de correo inválido')
        .required('Requerido'),
      porcentaje_part_inversionista: yup.mixed().required('Requerido'),
      valor_part_inversionista: yup.mixed().required('Requerido'),
    });
  }, []);

  const onGoBack = () => {
    navigate('/simulaciones-por-inversionista/' + id_simulacion + '/' + proyecto_id + '/' + selectedRow?.simulacion?.indicativo_modelo_ccial); 
  };



  return (
    <div className={classes.root}>
      <Paper sx={{ marginBottom: theme.spacing(2) }} className={classes.paper}>
        <Box
          sx={{
            background: theme.palette.background.paper,
          }}
          className={classes.marcoTabla}
        >
          <Formik
            initialStatus
            enableReinitialize
            validateOnBlur={false}
            initialValues={{
              accion:'crear',
              id_simulacion_origen: sim?.id_simulacion_origen ?? id_simulacion ?? '',
              id_proyecto: sim?.id_proyecto ?? headProyecto?.id_proyecto ?? proyecto_id,
              id_tipo_proyecto: headProyecto?.id_tipo_proyecto ?? '',
              codigo_proyecto: headProyecto?.codigo_proyecto ?? '',
              potencia: headProyecto?.potencia ?? '',
              generacion_anual: headProyecto?.generacion_anual ?? '',
              generacion_mensual: headProyecto?.generacion_mensual ?? '',
              indicativo_modelo_ccial: sim?.indicativo_modelo_ccial ?? '',
              indicativo_tipo_simulacion: 'I',
              indicativo_beneficio_trib: sim?.indicativo_beneficio_trib ?? 'S',
              valor_total_proyecto: sim?.valor_total_proyecto ?? 0,
              nombre_inversionista: sim?.nombre_inversionista ?? '',
              telefono_inversionista: sim?.telefono_inversionista ?? '',
              email_inversionista: sim?.email_inversionista ?? '',
              porcentaje_part_inversionista: sim?.porcentaje_part_inversionista,
              valor_part_inversionista: sim?.valor_part_inversionista,
              porcentaje_perdida_efic: '',
              porcentaje_IPC: '',
              porcentaje_tasa_oportunidad: '',
              anios_depreciacion: headProyecto?.anios_depreciacion ?? 0,
              Valor_VPN_proyecto: sim?.Valor_VPN_proyecto ?? 0,
              porcentaje_TIR_proyecto: sim?.porcentaje_TIR_proyecto ?? 0,
              anios_PBT: sim?.anios_PBT ?? 0,
              updated_at: today,
              conceptos: conceptosIniciales,
            }}
            validationSchema={validationSchema}
            onSubmit={async (data, { setSubmitting }) => {
              try {
                setSubmitting(true);
                await dispatch(
                  onGuardarSimulacionInversionista({ params: data })
                ).unwrap();
                onGoBack();
              } catch (error) {
                console.error(error);
              } finally {
                setSubmitting(false);
              }             
            }
          }
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
                porcentajeIPC={porcentajeIPC}
                porcentajeOportunidad={porcentajeOportunidad}
              />
            )}
          </Formik>
        </Box>

      </Paper>
    </div>
  );
};

SimulacionPorProyectoCreador.propTypes = {
  accion: PropTypes.string,
  titulo: PropTypes.string,
  route: PropTypes.object,
};

export default SimulacionPorProyectoCreador;