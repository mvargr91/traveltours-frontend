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
  resetCondicionesPlazoActual,
}  from '../../../../@crema/redux/features/condicionesPlazo/condicionesPlazoSlice';
import Slide from '@mui/material/Slide';
import CondicionesPlazoForm from './CondicionesPlazoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const validationSchema = yup.object({
  plazo_capital: yup.string().required('Requerido'),
  porcentaje_inversion_externa: yup.string().required('Requerido'),
  nombre: yup.string().required('Requerido'),
  estado: yup.string().required('Requerido'),
});

const CondicionesPlazoCreador = (props) => {
  const { CondicionesPlazo, handleOnClose, accion, updateColeccion, titulo, tiposProyectos } = props;
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

  // const classes = useStyles(props);

  const selectedRow = useSelector((state) =>  state.condicionesPlazo.CondicionesPlazoActual);  
  const loading = useSelector((state) =>  state.condicionesPlazo.loading);

  const initializeSelectedRow = () => {
    dispatch(resetCondicionesPlazoActual()); 
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
      dispatch(onShow(CondicionesPlazo));
    }
  }, [accion, dispatch, CondicionesPlazo]);

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
              nombre: selectedRow ? selectedRow.nombre : '',
              plazo_capital: selectedRow ? selectedRow.plazo_capital : '',
              tasa_interes_inversion: selectedRow ? selectedRow.tasa_interes_inversion : '',
              porcentaje_inversion_externa: selectedRow ? selectedRow.porcentaje_inversion_externa : '',
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
              <CondicionesPlazoForm
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

CondicionesPlazoCreador.propTypes = {
  CondicionesPlazo: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default CondicionesPlazoCreador;
