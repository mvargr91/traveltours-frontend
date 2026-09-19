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
  resetNivelConsumoActual,
}  from '../../../../@crema/redux/features/nivelConsumo/nivelConsumoSlice';
import Slide from '@mui/material/Slide';
import NivelConsumoForm from './NivelConsumoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const NivelConsumoCreador = (props) => {
  const { NivelConsumo, handleOnClose, accion, updateColeccion, titulo, registros } = props;
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



const toNumber = (value, originalValue) => {
  if (originalValue === '' || originalValue === null || originalValue === undefined) {
    return undefined;
  }
  return Number(originalValue);
};

const maxDosDecimales = (value) => {
  if (value === undefined || value === null || value === '') return true;
  return /^\d+(\.\d{1,2})?$/.test(String(value));
};

const obtenerNivelAnterior = (registros = [], numeroNivelActual, idActual) => {
  const anteriores = registros.filter(
    (r) =>
      Number(r.id) !== Number(idActual || 0) &&
      Number(r.numero_nivel) < Number(numeroNivelActual)
  );

  if (!anteriores.length) return null;

  return anteriores.reduce((prev, curr) =>
    Number(curr.numero_nivel) > Number(prev.numero_nivel) ? curr : prev
  );
};

const obtenerNivelSiguiente = (registros = [], numeroNivelActual, idActual) => {
  const siguientes = registros.filter(
    (r) =>
      Number(r.id) !== Number(idActual || 0) &&
      Number(r.numero_nivel) > Number(numeroNivelActual)
  );

  if (!siguientes.length) return null;

  return siguientes.reduce((prev, curr) =>
    Number(curr.numero_nivel) < Number(prev.numero_nivel) ? curr : prev
  );
};

const validationSchema = yup.object({
  numero_nivel: yup
    .number()
    .transform(toNumber)
    .typeError('Dato requerido')
    .required('Dato requerido')
    .integer('Debe ser un número entero')
    .min(1, 'Debe ser mayor o igual a 1')
    .test(
      'numero-nivel-unico',
      'Numero nivel ya existe.',
      function (value) {
        const { id } = this.parent;

        if (value === undefined || value === null) return true;

        const existe = (registros || []).some(
          (r) =>
            Number(r.numero_nivel) === Number(value) &&
            Number(r.id) !== Number(id || 0)
        );

        return !existe;
      }
    ),

  limite_inferior: yup
    .number()
    .transform(toNumber)
    .typeError('Dato requerido')
    .required('Dato requerido')
    .moreThan(0, 'Debe ser mayor que 0')
    .test(
      'max-2-decimales-inferior',
      'Debe ser un número con máximo 2 decimales',
      function (value) {
        return maxDosDecimales(value);
      }
    )
    .test(
      'limite-inferior-rango-anterior',
      'Valor limite inferior debe ser mayor que limite superior del rango anterior',
      function (value) {
        const { numero_nivel, id } = this.parent;

        if (
          value === undefined ||
          value === null ||
          numero_nivel === undefined ||
          numero_nivel === null
        ) {
          return true;
        }

        const nivelAnterior = obtenerNivelAnterior(registros, numero_nivel, id);

        if (!nivelAnterior) {
          return true;
        }

        return Number(value) > Number(nivelAnterior.limite_superior);
      }
    ),

  limite_superior: yup
    .number()
    .transform(toNumber)
    .typeError('Dato requerido')
    .required('Dato requerido')
    .test(
      'max-2-decimales-superior',
      'Debe ser un número con máximo 2 decimales',
      function (value) {
        return maxDosDecimales(value);
      }
    )
    .test(
      'superior-mayor-inferior',
      'Valor limite superior debe ser mayor que limite inferior',
      function (value) {
        const { limite_inferior } = this.parent;

        if (
          value === undefined ||
          value === null ||
          limite_inferior === undefined ||
          limite_inferior === null
        ) {
          return true;
        }

        return Number(value) > Number(limite_inferior);
      }
    )
    .test(
      'superior-menor-que-siguiente',
      'Valor limite superior debe ser menor que limite inferior del rango siguiente',
      function (value) {
        const { numero_nivel, id } = this.parent;

        if (
          value === undefined ||
          value === null ||
          numero_nivel === undefined ||
          numero_nivel === null
        ) {
          return true;
        }

        const nivelSiguiente = obtenerNivelSiguiente(
          registros,
          numero_nivel,
          id
        );

        if (!nivelSiguiente) {
          return true;
        }

        return Number(value) < Number(nivelSiguiente.limite_inferior);
      }
    ),

  estado: yup.string().required('Dato requerido'),
});


  // const classes = useStyles(props);

  const selectedRow = useSelector((state) =>  state.nivelConsumo.nivelConsumoActual);  
  const loading = useSelector((state) =>  state.nivelConsumo.loading);
  const initializeSelectedRow = () => {
    dispatch(resetNivelConsumoActual()); 
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
      dispatch(onShow(NivelConsumo));
    }
  }, [accion, dispatch, NivelConsumo]);

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
              numero_nivel: selectedRow ? selectedRow.numero_nivel : '',
              limite_inferior: selectedRow ? selectedRow.limite_inferior : '',
              limite_superior: selectedRow ? selectedRow.limite_superior : '',
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
              <NivelConsumoForm
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

NivelConsumoCreador.propTypes = {
  NivelConsumo: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default NivelConsumoCreador;
