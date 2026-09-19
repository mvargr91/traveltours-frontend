import React, { useEffect, useRef, useState, useMemo  } from 'react';
import Dialog from '@mui/material/Dialog';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppScrollbar from '../../../../@crema/components/AppScrollbar';
import {
  onShow,
  onUpdate,
  onCreate,
  resetActividadProyectoActual,
}  from '../../../../@crema/redux/features/actividadProyecto/actividadProyectoSlice';
import Slide from '@mui/material/Slide';
import ActividadProyectoForm from './ActividadProyectoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});



const ActividadProyectoCreador = (props) => {
  const { ActividadProyecto, handleOnClose, accion, updateColeccion, titulo, tiposProyectos, registros } = props;
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const useStyles = makeStyles((theme) => ({
    dialogBox: {
      position: 'absolute',
      '& .MuiDialog-paperWidthSm': {
        maxWidth: 600,
        width: '100%',
        // maxHeight:'fit-content'
      },
      '& .MuiTypography-h6': {
        fontWeight: Fonts.LIGHT,
      },
    },
  }));

const validationSchema = useMemo(() => {
  // Helpers
  const canon = (v) =>
    (v ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const toNumber = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const s = String(v).replace(',', '.').trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };

  const hasTwoDecimalsOrLess = (v) => {
    if (v === null || v === undefined || v === '') return true; // opcional
    const s = String(v).replace(',', '.').trim();
    return /^\d+(\.\d{1,2})?$/.test(s);
  };

  const sumSafe = (arr) =>
    arr.reduce((acc, x) => acc + (Number.isFinite(x) ? x : 0), 0);

  const regs = Array.isArray(registros) ? registros : [];

  return yup
    .object({
      id: yup.mixed().nullable(),
      id_tipo_proyecto: yup.string().required('Requerido'),
      id_etapa_proyecto: yup.string().required('Requerido'),
      nombre: yup.string().required('Requerido'),
      secuencia: yup.string().required('Requerido'),
      Indicativo_fecha_vcmto: yup.string().required('Requerido'),
      indicativo_envio_correo: yup.string().required('Requerido'),
      estado: yup.string().required('Requerido'),

      // % por etapa (opcional, 0..100, 2 decimales)
      peso_porcentual_etapa: yup
        .mixed()
        .transform((v) => (v === '' ? null : toNumber(v)))
        .test('two-decimals-etapa', 'Solo se permiten hasta 2 decimales.', hasTwoDecimalsOrLess)
        .test('range-etapa', 'El valor debe estar entre 0 y 100.', (v) => {
          if (v === null || v === undefined || v === '') return true;
          return Number.isFinite(v) && v >= 0 && v <= 100;
        }),

      // % por proyecto (opcional, 0..100, 2 decimales)
      peso_porcentual_proyecto: yup
        .mixed()
        .transform((v) => (v === '' ? null : toNumber(v)))
        .test('two-decimals-proy', 'Solo se permiten hasta 2 decimales.', hasTwoDecimalsOrLess)
        .test('range-proy', 'El valor debe estar entre 0 y 100.', (v) => {
          if (v === null || v === undefined || v === '') return true;
          return Number.isFinite(v) && v >= 0 && v <= 100;
        }),

      // Prerrequisito (opcional, mismo tipo, activo, no sí mismo)
      id_actividad_prerequisito: yup
        .mixed()
        .nullable()
        .test(
          'prereq-existe-activo-mismo-tipo',
          'La actividad prerrequisito debe pertenecer al mismo Tipo de proyecto y estar activa.',
          function (value) {
            if (value === null || value === undefined || value === '') return true;
            const { id, id_tipo_proyecto } = this.parent || {};

            if (String(value) === String(id ?? '')) {
              return this.createError({
                path: 'id_actividad_prerequisito',
                message: 'La actividad no puede ser prerrequisito de sí misma.',
              });
            }

            const match = regs.find(
              (r) =>
                String(r.id) === String(value) &&
                String(r.id_tipo_proyecto) === String(id_tipo_proyecto) &&
                String(r.estado) === '1'
            );
            return !!match;
          }
        ),
    })

    // Unicidad: tipo + etapa + secuencia
    .test(
      'unique-tipo-etapa-secuencia',
      'Ya existe una actividad con este Tipo de proyecto, Etapa y secuencia.',
      function (values) {
        const { id, id_tipo_proyecto, id_etapa_proyecto, secuencia } = values || {};
        if (!id_tipo_proyecto || !id_etapa_proyecto || !secuencia) return true;

        const dup = regs.some((r) => {
          const sameTipo = String(r.id_tipo_proyecto) === String(id_tipo_proyecto);
          const sameEtapa = String(r.id_etapa_proyecto) === String(id_etapa_proyecto);
          const sameSec = canon(r.secuencia) === canon(secuencia);
          const notSelf = String(r.id) !== String(id ?? '');
          return sameTipo && sameEtapa && sameSec && notSelf;
        });

        if (dup) {
          return this.createError({
            path: 'secuencia',
            message: 'Ya existe una actividad con este Tipo de proyecto, Etapa y secuencia.',
          });
        }
        return true;
      }
    )

    // SUMA <= 100 por ETAPA (anclar error al campo de etapa)
    .test(
      'suma-porcentajes-etapa',
      'Suma porcentajes etapa mayor que 100%',
      function (values) {
        const {
          id,
          id_tipo_proyecto,
          id_etapa_proyecto,
          peso_porcentual_etapa,
        } = values || {};

        if (!id_tipo_proyecto || !id_etapa_proyecto) return true;

        const mismos = regs.filter(
          (r) =>
            String(r.id_tipo_proyecto) === String(id_tipo_proyecto) &&
            String(r.id_etapa_proyecto) === String(id_etapa_proyecto)
        );

        const sumaOtros = sumSafe(
          mismos
            .filter((r) => String(r.id) !== String(id ?? ''))
            .map((r) => toNumber(r.peso_porcentual_etapa) || 0)
        );

        const valorNuevo = Number.isFinite(peso_porcentual_etapa) ? peso_porcentual_etapa : 0;
        const total = sumaOtros + valorNuevo;

        if (total > 100 + 1e-9) {
          return this.createError({
            path: 'peso_porcentual_etapa',
            message: 'Suma porcentajes etapa mayor que 100%',
          });
        }
        return true;
      }
    )

    // SUMA <= 100 por TIPO (anclar error al campo de proyecto)
    .test(
      'suma-porcentajes-tipo',
      'Suma porcentajes para tipo de proyecto mayor que 100%',
      function (values) {
        const { id, id_tipo_proyecto, peso_porcentual_proyecto } = values || {};
        if (!id_tipo_proyecto) return true;

        const mismoTipo = regs.filter(
          (r) => String(r.id_tipo_proyecto) === String(id_tipo_proyecto)
        );

        const sumaOtros = sumSafe(
          mismoTipo
            .filter((r) => String(r.id) !== String(id ?? ''))
            .map((r) => toNumber(r.peso_porcentual_proyecto) || 0)
        );

        const valorNuevo = Number.isFinite(peso_porcentual_proyecto) ? peso_porcentual_proyecto : 0;
        const total = sumaOtros + valorNuevo;

        if (total > 100 + 1e-9) {
          return this.createError({
            path: 'peso_porcentual_proyecto',
            message: 'Suma porcentajes para tipo de proyecto mayor que 100%',
          });
        }
        return true;
      }
    );
}, [registros]);


  // const classes = useStyles(props);

  const selectedRow = useSelector((state) =>  state.actividadProyecto.ActividadProyectoActual);  
  const loading = useSelector((state) =>  state.actividadProyecto.loading);

  const initializeSelectedRow = () => {
    dispatch(resetActividadProyectoActual()); 
  };
  useEffect(() => {
    initializeSelectedRow();
  }, []);

  if (accion === 'crear') {
    initializeSelectedRow();
  }

  useEffect(() => {
    if (selectedRow) {
      setShowForm(true);
    } else if (accion === 'crear') {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }, [selectedRow, accion]);

  useEffect(() => {
    if ((accion === 'editar') | (accion === 'ver')) {
      dispatch(onShow(ActividadProyecto));
    }
  }, [accion, dispatch, ActividadProyecto]);

  


  return (
    showForm && (
      <Dialog
        open={showForm}
        onClose={handleOnClose}
        aria-labelledby='simple-modal-title'
        TransitionComponent={Transition}
        aria-describedby='simple-modal-description'
        className={useStyles.dialogBox}
        maxWidth={'md'}
        fullWidth
      >
        <AppScrollbar>
          <Formik
            initialStatus={true}
            enableReinitialize={true}
            validateOnBlur={false}
            initialValues={{
              id: selectedRow ? selectedRow.id : '',
              id_tipo_proyecto: selectedRow ? selectedRow.id_tipo_proyecto : '',
              id_etapa_proyecto: selectedRow ? selectedRow.id_etapa_proyecto : '',
              nombre: selectedRow ? selectedRow.nombre : '',
              secuencia: selectedRow ? selectedRow.secuencia : '',
              Indicativo_fecha_vcmto: selectedRow ? selectedRow.Indicativo_fecha_vcmto : 'N',
              indicativo_envio_correo: selectedRow ? selectedRow.indicativo_envio_correo : 'N',
              peso_porcentual_etapa: selectedRow ? selectedRow.peso_porcentual_etapa : '',
              peso_porcentual_proyecto: selectedRow ? selectedRow.peso_porcentual_proyecto : '',
              id_actividad_prerequisito: selectedRow ? selectedRow.id_actividad_prerequisito : '',
              estado: selectedRow ? selectedRow.estado === 1 ? '1' : '0' : '1',
            }}
            validationSchema={validationSchema}
            onSubmit={(data, { setSubmitting, resetForm }) => {
              setSubmitting(true);
              if (accion === 'crear') {
                dispatch(onCreate({params: data, handleOnClose, updateColeccion}));
              } else if (accion === 'editar') {
                if (selectedRow) {
                  dispatch(onUpdate({params: data, handleOnClose, updateColeccion}));
                }
              }
              setSubmitting(false);
            }}
          >
            {({ values, initialValues, setFieldValue }) => (
              <ActividadProyectoForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                accion={accion}
                initialValues={initialValues}
                tiposProyectos={tiposProyectos}
              />
            )}
          </Formik>
        </AppScrollbar>
      </Dialog>
    )
  );
};

ActividadProyectoCreador.propTypes = {
  ActividadProyecto: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ActividadProyectoCreador;
