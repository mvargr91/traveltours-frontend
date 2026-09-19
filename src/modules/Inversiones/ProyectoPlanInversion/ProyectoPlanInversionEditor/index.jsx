import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import Paper from '@mui/material/Paper';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import {
  onShow,
  onUpdate,
  resetProyectosPlanInversionesActual,
} from '../../../../@crema/redux/features/proyectoPlanInversion/proyectoPlanInversionSlice';
import { onGetColeccionLigera as onGetCiudades } from '../../../../@crema/redux/features/ciudades/ciudadesSlice';
import { onGetColeccionLigera as onGetTipoProyectos } from '../../../../@crema/redux/features/tipoProyecto/tiposProyectosSlice';
import { onGetColeccionLigera as onGetInversionistas } from '../../../../@crema/redux/features/inversionista/inversionistasSlice';
import { onGetColeccionLigeraDisponible as onGetProyectos } from '../../../../@crema/redux/features/Proyecto/proyectosSlice';
import PlanInversionProyectoForm from './ProyectoPlanInversionForm';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import AppMessageView from '@crema/components/AppMessageView';
import {
  UPDATE_TYPE,
  CREATE_TYPE,
  ERROR_TYPE,
} from '../../../../shared/constants/Constantes';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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

const generarFilaVacia = () => ({
  id: null,
  id_proyecto: '',
  id_inversionista: '',
  fecha_planeada: '',
  valor: '',
  fecha_pago: '',
  estado_plan_inversion: 'PLA',
});

const completarPlanPagos = (
  planPagos = [],
  cantidad = 100,
  idProyecto = '',
  idInversionista = '',
  accion = 'crear',
) => {
  const filasExistentes = (planPagos || []).map((item) => ({
    id: item?.id ?? null,
    id_proyecto: item?.id_proyecto ?? idProyecto,
    id_inversionista: item?.id_inversionista ?? idInversionista,
    fecha_planeada: item?.fecha_planeada ?? '',
    valor: item?.valor ?? '',
    fecha_pago: item?.fecha_pago ?? '',
    estado_plan_inversion: item?.estado_plan_inversion ?? 'PLA',
  }));

  let faltantes = Math.max(0, cantidad - filasExistentes.length);

  if (accion === 'ver') {
    faltantes = 0;
  }

  const filasVacias = Array.from({ length: faltantes }, () => ({
    ...generarFilaVacia(),
    id_proyecto: idProyecto,
    id_inversionista: idInversionista,
  }));

  return [...filasExistentes, ...filasVacias];
};

const validationSchema = yup.object({
  id_inversionista: yup.string().required('Requerido'),
  id_proyecto: yup.string().required('Requerido'),
  valor_total_proyecto: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? 0 : Number(originalValue)
    )
    .nullable(),

  plan_pagos: yup
    .array()
    .of(
      yup
        .object({
          fecha_planeada: yup.mixed().nullable(),
          valor: yup
            .number()
            .transform((value, originalValue) =>
              originalValue === '' || originalValue === null
                ? null
                : Number(String(originalValue).replace(/[^\d.-]/g, ''))
            )
            .nullable()
            .typeError('Debe ser un número'),
          fecha_pago: yup.mixed().nullable(),
        })
        .test(
          'fecha-planeada-requerida-si-hay-valor',
          'Fecha planeada es obligatoria cuando el valor es mayor a 0',
          function (row) {
            if (!row) return true;

            const valor = Number(row.valor || 0);
            const fecha = row.fecha_planeada;

            if (valor > 0 && !fecha) {
              return this.createError({
                path: `${this.path}.fecha_planeada`,
                message: 'Requerido',
              });
            }

            return true;
          }
        )
        .test(
          'valor-requerido-si-hay-fecha-planeada',
          'Valor es obligatorio cuando hay fecha planeada',
          function (row) {
            if (!row) return true;

            const fecha = row.fecha_planeada;
            const valor = row.valor;

            if (
              fecha &&
              (valor === undefined || valor === null || Number(valor) <= 0)
            ) {
              return this.createError({
                path: `${this.path}.valor`,
                message: 'Requerido',
              });
            }

            return true;
          }
        )
    )
    .test(
      'fecha-planeada-no-duplicada',
      'La fecha planeada no se puede repetir',
      function (rows) {
        if (!rows || !rows.length) return true;

        const fechasMap = new Map();

        for (let i = 0; i < rows.length; i++) {
          const fecha = rows[i]?.fecha_planeada;
          if (!fecha) continue;

          const fechaNormalizada =
            fecha instanceof Date
              ? fecha.toISOString().split('T')[0]
              : String(fecha).split('T')[0];

          if (fechasMap.has(fechaNormalizada)) {
            return this.createError({
              path: `plan_pagos[${i}].fecha_planeada`,
              message: 'Ya existe informacion para la fecha',
            });
          }

          fechasMap.set(fechaNormalizada, i);
        }

        return true;
      }
    )
    .test(
      'valor-fila-no-supera-total-proyecto',
      'El valor no puede superar el valor total del proyecto',
      function (rows) {
        if (!rows || !rows.length) return true;

        const valorTotalProyecto = Number(this.parent.valor_total_proyecto || 0);
        if (valorTotalProyecto <= 0) return true;

        for (let i = 0; i < rows.length; i++) {
          const valorFila = Number(rows[i]?.valor || 0);

          if (valorFila > valorTotalProyecto) {
            return this.createError({
              path: `plan_pagos[${i}].valor`,
              message: ` Valor inversion para la fecha excede valor total para inversion en el proyecto`,
            });
          }
        }

        return true;
      }
    )
    .test(
      'suma-planes-no-supera-total-proyecto',
      'La suma del plan de pagos no puede superar el valor total del proyecto',
      function (rows) {
        // if (!rows || !rows.length) return true;

        const valorTotalProyecto = Number(this.parent.valor_total_proyecto || 0);
        if (valorTotalProyecto <= 0) return true;

        console.log(rows)
        

        const suma = rows.reduce((acc, row) => {
          const valor = Number(row?.valor || 0);
          return acc + (valor > 0 ? valor : 0);
        }, 0);

        // console.log(valorTotalProyecto, suma);

        if (suma > valorTotalProyecto) {
          return this.createError({
            path: `valor_total_proyecto`,
            message: `Total valor invertido diferente al  valor total para inversion en el proyecto`,
          });
        }

        return true;
      }
    ),
});

const InversionCreador = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accion, id_inversionista, id_proyecto } = useParams();
  const classes = useStyles();
  const [titulo, setTitulo] = useState('');

  const { user } = useSelector(({ auth }) => auth);
  const selectedRow = useSelector((state) => state.proyectoPlanInversion.proyectoPlanInversionActual);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);
  const { coleccionLigera: tiposProyectos } = useSelector((state) => state.tiposProyectos);
  const { coleccionLigera: inversionistas } = useSelector( (state) => state.inversionistas);
  const { coleccionLigera: proyectos } = useSelector((state) => state.proyectos);
  const { message, messageType } = useSelector(({ common }) => common);

  useEffect(() => {
    dispatch(onGetCiudades());
    dispatch(onGetTipoProyectos());
    dispatch(onGetInversionistas());
    dispatch(onGetProyectos());
  }, [dispatch]);

  useEffect(() => {
    dispatch(resetProyectosPlanInversionesActual());

    if (accion === 'editar' || accion === 'ver') {
      dispatch(onShow({ id_inversionista, id_proyecto }));
    }
  }, [accion, dispatch, id_inversionista, id_proyecto]);

  useEffect(() => {
    if (!user) return;

    user.usuario.permisos.forEach((modulo) => {
      modulo.opciones.forEach((opcion) => {
        if (opcion.url === props.route.path) {
          setTitulo(opcion.nombre);
        }
      });
    });
  }, [user, props.route]);

  const handleOnClose = () => {
    navigate('/proyectos-plan-inversiones');
  };

  const initialValues = useMemo(() => {
    const idProyecto = selectedRow?.id_proyecto || id_proyecto || '';
    const idInversionista = selectedRow?.id_inversionista || id_inversionista || '';
    0;
    const proyecto = proyectos.find((item) => item.id == idProyecto);

    return {
      id_inversionista: idInversionista,
      id_proyecto: idProyecto,
      valor_total_proyecto: Number(proyecto?.valor_total_proyecto),
      plan_pagos: completarPlanPagos(
        selectedRow?.plan_pagos || [],
        100,
        idProyecto,
        idInversionista,
        accion,
      ),
    };
  }, [selectedRow, id_proyecto, id_inversionista, accion]);

  return (
    <div className={classes.root}>
      <Paper
        sx={{ marginBottom: theme.spacing(2) }}
        className={classes.paper}
      >
        <Box
          sx={{ background: theme.palette.background.paper }}
          className={classes.marcoTabla}
        >
          <Formik
            key={`${accion}-${id_inversionista || 'nuevo'}-${id_proyecto || 'nuevo'}`}
            initialStatus={true}
            enableReinitialize={true}
            validateOnBlur={false}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitting(true);

              console.log('VALUES EN SUBMIT', values);
              console.log('PLAN PAGOS EN SUBMIT', values.plan_pagos);

              const planPagosLimpio = (values.plan_pagos || [])
                .filter((item) => {
                  const tieneFechaPlaneada = !!item.fecha_planeada;
                  const tieneFechaPago = !!item.fecha_pago;
                  const tieneValor =
                    item.valor !== '' &&
                    item.valor !== null &&
                    item.valor !== undefined &&
                    Number(String(item.valor).replace(/[^\d.-]/g, '')) > 0;

                  return tieneFechaPlaneada || tieneFechaPago || tieneValor;
                })
                .map((item) => ({
                  id: item.id || null,
                  id_proyecto: values.id_proyecto,
                  id_inversionista: values.id_inversionista,
                  fecha_planeada: item.fecha_planeada || null,
                  valor:
                    Number(String(item.valor || '').replace(/[^\d.-]/g, '')) || 0,
                  fecha_pago: item.fecha_pago || null,
                  estado_plan_inversion: item.fecha_pago ? 'PAG' : 'PLA',
                }));

              if (planPagosLimpio.length === 0) {
                await Swal.fire({
                  title: 'Validación',
                  text: 'Debes registrar al menos una fila en el plan de pagos.',
                  confirmButtonText: 'OK',
                  background: theme.palette.background.default,
                  confirmButtonColor: '#3085d6',
                });
                setSubmitting(false);
                return;
              }

              dispatch(
                onUpdate({
                  params: {
                    id_proyecto: values.id_proyecto,
                    id_inversionista: values.id_inversionista,
                    plan_pagos: planPagosLimpio,
                  },
                  handleOnClose,
                }),
              );

              setSubmitting(false);
            }}
          >
            {({ values, initialValues: formikInitialValues, setFieldValue }) => (
              <PlanInversionProyectoForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                ciudades={ciudades}
                tiposProyectos={tiposProyectos}
                inversionistas={inversionistas}
                proyectos={proyectos}
                accion={accion}
                initialValues={formikInitialValues}
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

InversionCreador.propTypes = {
  route: PropTypes.object.isRequired,
};

export default InversionCreador;