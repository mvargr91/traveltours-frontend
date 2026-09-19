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
  resetPrecioProyectadoActual,
}  from '../../../../@crema/redux/features/precioProyectado/precioProyectadoSlice';
import Slide from '@mui/material/Slide';
import PrecioProyectadoForm from './PrecioProyectadoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const PrecioProyectadoCreador = (props) => {
  const { PrecioProyectado, handleOnClose, accion, updateColeccion, titulo, registros } = props;
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
    .test(
      'registro-duplicado',
      'Ya existe informacion registrada para este año',
      function (value) {
        const { anio, id } = this.parent;
        if (!value || !anio) return true;

        const existe = registros.some(
          (r) =>
            r.anio === Number(anio) &&
            r.id !== id 
        );

        return !existe;
      }
    ),
  precio_bolsa: yup.number().typeError('Requerido').required('Requerido'),
  precio_mercado: yup.number().typeError('Requerido').required('Requerido'),
  precio_comunidad: yup.number().typeError('Requerido').required('Requerido'),
});



  // const classes = useStyles(props);

  const selectedRow = useSelector((state) =>  state.precioProyectado.PrecioProyectadoActual);  
  const loading = useSelector((state) =>  state.precioProyectado.loading);
  const initializeSelectedRow = () => {
    dispatch(resetPrecioProyectadoActual()); 
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
      dispatch(onShow(PrecioProyectado));
    }
  }, [accion, dispatch, PrecioProyectado]);

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
              precio_bolsa: selectedRow ? selectedRow.precio_bolsa : '',
              precio_mercado: selectedRow ? selectedRow.precio_mercado : '',
              precio_comunidad: selectedRow ? selectedRow.precio_comunidad : '',
              precio_com_ppa: selectedRow ? selectedRow.precio_com_ppa : '',
              precio_com_representado: selectedRow ? selectedRow.precio_com_representado : '',
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
              <PrecioProyectadoForm
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

PrecioProyectadoCreador.propTypes = {
  PrecioProyectado: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default PrecioProyectadoCreador;
