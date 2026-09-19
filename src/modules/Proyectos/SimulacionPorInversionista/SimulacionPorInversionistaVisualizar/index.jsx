import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Formik } from 'formik';
import { makeStyles } from '@mui/styles';
import { styled, useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { useDispatch, useSelector } from 'react-redux';
import AppMessageView from '@crema/components/AppMessageView';
import { ERROR_TYPE } from '../../../../shared/constants/Constantes';
import {
  onShow,
  resetSimulacionPorProyectoActual,
} from '../../../../@crema/redux/features/simulacionPorProyecto/simulacionPorProyectoSlice';
import { onGetColeccionLigera as onGetProyectos } from '../../../../@crema/redux/features/Proyecto/proyectosSlice';
import { onGetColeccionLigera as onGetParametros } from '../../../../@crema/redux/features/parametroConstante/parametroConstanteSlice';
import { onGetColeccionLigera as onGetParametrosMensuales } from '../../../../@crema/redux/features/parametroMensual/parametroMensualSlice';
import SimulacionPorInversionistaForm from './SimulacionPorInversionistaForm';
import PropTypes from 'prop-types';
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

const SimulacionPorProyectoVer = (props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dense = true;
  const { id_simulacion, proyecto_id, id } = useParams();
  const { message, messageType } = useSelector(({ common }) => common);
  const { coleccionLigera: proyectos } = useSelector((state) => state.proyectos);
  const selectedRow = useSelector((state) => state.simulacionPorProyecto.SimulacionPorProyectoActual);
  const loading = useSelector((state) => state.simulacionPorProyecto.loading);
  const { coleccionLigera: parametroConstantes } = useSelector((state) => state.parametroConstantes);
  const { coleccionLigera: parametrosMensuales } = useSelector((state) => state.parametroMensual);
  const [porcentajePerdidaEficiencia, setPorcentajePerdidaEficiencia] = useState(null);
  const [porcentajeDescuentoTarifa, setPorcentajeDescuentoTarifa] = useState(null);
  const [porcentajeIPC, setPorcentajeIPC] = useState(null);
  const [porcentajeIncrementoPrecio, setPorcentajeIncrementoPrecio] = useState(null);
  const [precioEnergia, setPrecioEnergia] = useState(null);

  let vp = '15px';
  if (dense === true) {
    vp = '0px';
  }

  // Reset + cargar catálogos mínimos
  useEffect(() => {
    dispatch(resetSimulacionPorProyectoActual());
    dispatch(onGetProyectos());
    dispatch(onGetParametros());
    dispatch(onGetParametrosMensuales());
  }, [dispatch]);


  useEffect(() => {
    dispatch(onShow( id ));
  }, [dispatch, id]);

  // Leer parámetros constantes (igual que antes)
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
    setPorcentajeDescuentoTarifa(parametros.PORCENTAJE_DESCUENTO_TARIFA ?? null);
    setPorcentajeIPC(parametros.PORCENTAJE_IPC ?? null);
    setPorcentajeIncrementoPrecio(parametros.PORCENTAJE_INCREMENTO_PRECIO ?? null);
  }, [parametroConstantes?.datos]);

  // (opcional) si en ver necesitas mostrar precioEnergia calculado, déjalo; si no, quítalo.
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

  useEffect(() => {
    if (parametrosMensuales?.length) {
      setPrecioEnergia(obtenerPrecioEnergiaComercializador(parametrosMensuales));
    }
  }, [parametrosMensuales]);
  
  const sim = selectedRow;
  const classes = useStyles({ vp: vp });

  const handleOnClose = () => {
    navigate('/simulaciones-por-inversionista/'+ id_simulacion + '/' + proyecto_id +'/' +  sim?.indicativo_modelo_ccial );
  };

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
              enableReinitialize
              initialStatus
              validateOnBlur={false}
              initialValues={{
                id: sim?.id ?? id ?? '',
                id_proyecto: sim?.id_proyecto,
                codigo_proyecto:  sim?.codigo_proyecto ?? '',
                potencia:  sim?.potencia ?? '',
                fecha: sim?.fecha,
                indicativo_modelo_ccial: sim?.indicativo_modelo_ccial ?? '',
                indicativo_beneficio_trib: sim?.indicativo_beneficio_trib ?? '',
                porcentaje_perdida_efic: sim?.porcentaje_perdida_efic ?? '',
                valor_total_proyecto: sim?.valor_total_proyecto ??  '',
                porcentaje_reduccion_tarifa: sim?.porcentaje_reduccion_tarifa ?? '',
                porcentaje_IPC: sim?.porcentaje_IPC ?? '',
                anios_depreciacion: sim?.anios_depreciacion ?? '',
                porcentaje_tasa_oportunidad: sim?.porcentaje_tasa_oportunidad ?? '',
                Valor_VPN_proyecto: sim?.vpn ?? sim?.Valor_VPN_proyecto ?? 0,
                porcentaje_TIR_proyecto: sim?.tir ?? sim?.porcentaje_TIR_proyecto ?? 0,
                anios_PBT: sim?.pbt ?? sim?.anios_PBT ?? 0,
                nombre_inversionista: sim?.nombre_inversionista ?? '',
                telefono_inversionista: sim?.telefono_inversionista ?? '',
                email_inversionista: sim?.email_inversionista ?? '',
                porcentaje_part_inversionista: sim?.porcentaje_part_inversionista ?? 0,
                valor_part_inversionista: sim?.valor_part_inversionista ?? 0,
                updated_at: sim?.fecha_modificacion || '',
                detalle_conceptos: [],
              }}
              onSubmit={() => {}}
            >
              {({ values, initialValues, setFieldValue }) => (
                <SimulacionPorInversionistaForm
                  values={values}
                  setFieldValue={setFieldValue}
                  handleOnClose={handleOnClose}
                  titulo={'Simulación Inversionista'}
                  accion={'ver'}
                  initialValues={initialValues}
                  proyectos={proyectos}
                  selectedRow={selectedRow}
                  porcentajePerdidaEficiencia={porcentajePerdidaEficiencia}
                  porcentajeDescuentoTarifa={porcentajeDescuentoTarifa}
                  precioEnergia={precioEnergia}
                  porcentajeIPC={porcentajeIPC}
                  porcentajeIncrementoPrecio={porcentajeIncrementoPrecio}
                  parametroConstantes={parametroConstantes}
                />
              )}
            </Formik>
        </Box>
        <AppMessageView
          variant={messageType === ERROR_TYPE ? 'error' : 'success'}
          message={messageType === ERROR_TYPE ? message : ''}
        />
      </Paper>
    </div>
  );
};

SimulacionPorProyectoVer.propTypes = {
  handleOnClose: PropTypes.func,
};

export default SimulacionPorProyectoVer;
