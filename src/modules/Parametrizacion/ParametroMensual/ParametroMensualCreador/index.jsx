import React, { useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppScrollbar from '../../../../@crema/components/AppScrollbar';
import {
  onShow,
  onUpdate,
  onCreate,
  resetParametroMensualActual,
}  from '../../../../@crema/redux/features/parametroMensual/parametroMensualSlice';
import Slide from '@mui/material/Slide';
import ParametroMensualForm from './ParametroMensualForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const ParametroMensualCreador = (props) => {
  const { ParametroMensual, handleOnClose, accion, updateColeccion, titulo, registros } = props;
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

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1; // 1..12

// Para convertir '' -> undefined y que yup no falle con number()
const toNumber = (v, originalValue) =>
  originalValue === '' || originalValue === null ? undefined : Number(v);

const validationSchema = yup.object({
  anio: yup
    .number()
    .transform(toNumber)
    .typeError('Requerido')
    .required('Requerido')
    .integer('Debe ser un número entero')
    .min(2000, 'No puede ser menor que 2000')
    .max(currentYear, `No puede ser mayor que ${currentYear}`),
  mes: yup
  .string()
  .required('Requerido')
  .matches(/^([1-9]|1[0-2])$/, 'Usa el formato MM (1–12)')
  .test(
    'mes-max-por-anio',
    `No puede ser mayor a ${String(currentMonth).padStart(2, '0')} en ${currentYear}`,
    function (value) {
      const { anio } = this.parent;
      if (!value || !anio) return true;
      const m = parseInt(value, 10);
      if (Number(anio) < currentYear) return true;
      if (Number(anio) === currentYear) return m <= currentMonth;
      return false;
    }
  )
  .test(
    'registro-duplicado',
    'Ya existe un registro con ese año y mes',
    function (value) {
      const { anio, id } = this.parent;
      if (!value || !anio) return true;

      const existe = registros.some(
        (r) =>
          r.anio === Number(anio) &&
          r.mes === Number(value) &&
          r.id !== id 
      );

      return !existe;
    }
  ),
  valor_energia_mercado: yup
  .number()
  .typeError('Requerido')
  .required('Requerido')
  .test(
    'validar-suma-costos',
    'Precio mercado regulado diferente a suma de costos',
    function (value) {
      const {
        costo_compra,
        cargo_transporte_nacional,
        cargo_transporte_local,
        margen_comercializacion,
        costo_perdidas,
        costo_restricciones,
      } = this.parent;

      const suma =
        Number(costo_compra || 0) +
        Number(cargo_transporte_nacional || 0) +
        Number(cargo_transporte_local || 0) +
        Number(margen_comercializacion || 0) +
        Number(costo_perdidas || 0) +
        Number(costo_restricciones || 0);
      if (
        costo_compra == null ||
        cargo_transporte_nacional == null ||
        cargo_transporte_local == null ||
        margen_comercializacion == null ||
        costo_perdidas == null ||
        costo_restricciones == null ||
        value == null
      ) {
        return true;
      }
      const epsilon = 0.01;
      return Math.abs(Number(value) - suma) < epsilon;
    }
  ),
  valor_energia_bolsa: yup.number().typeError('Requerido').required('Requerido'),
  costo_compra: yup.number().typeError('Requerido').required('Requerido'),
  cargo_transporte_nacional: yup.number().typeError('Requerido').required('Requerido'),
  cargo_transporte_local: yup.number().typeError('Requerido').required('Requerido'),
  margen_comercializacion: yup.number().typeError('Requerido').required('Requerido'),
  costo_perdidas: yup.number().typeError('Requerido').required('Requerido'),
  costo_restricciones: yup.number().typeError('Requerido').required('Requerido'),
});

// ayudame con una validación nueva, el valor_energia_mercado debe de ser la suma de los campos costo_compra cargo_transporte_nacional, cargo_transporte_local,margen_comercializacion,costo_perdidas, costo_restricciones, si no es igual debe de salir error en el campo valor_energia_mercado con el mensaje Precio mercado regulado diferente a suma de costos



  // const classes = useStyles(props);

  const selectedRow = useSelector((state) =>  state.parametroMensual.ParametroMensualActual);  
  const loading = useSelector((state) =>  state.parametroMensual.loading);
  const initializeSelectedRow = () => {
    dispatch(resetParametroMensualActual()); 
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
      dispatch(onShow(ParametroMensual));
    }
  }, [accion, dispatch, ParametroMensual]);

  if(loading){
    return <AppLoader/>;
  }

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
              anio: selectedRow ? selectedRow.anio : '',
              mes: selectedRow ? selectedRow.mes : '',
              valor_energia_bolsa: selectedRow ? selectedRow.valor_energia_bolsa : '',
              valor_energia_mercado: selectedRow ? selectedRow.valor_energia_mercado : '',
              costo_compra: selectedRow ? selectedRow.costo_compra : '',
              cargo_transporte_nacional: selectedRow ? selectedRow.cargo_transporte_nacional : '',
              cargo_transporte_local: selectedRow ? selectedRow.cargo_transporte_local : '',
              margen_comercializacion: selectedRow ? selectedRow.margen_comercializacion : '',
              costo_perdidas: selectedRow ? selectedRow.costo_perdidas : '',
              costo_restricciones: selectedRow ? selectedRow.costo_restricciones : '',
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
              <ParametroMensualForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                accion={accion}
                initialValues={initialValues}
              />
            )}
          </Formik>
        </AppScrollbar>
      </Dialog>
    )
  );
};

ParametroMensualCreador.propTypes = {
  ParametroMensual: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ParametroMensualCreador;
