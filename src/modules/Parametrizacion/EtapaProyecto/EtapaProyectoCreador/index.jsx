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
  resetEtapaProyectoActual,
}  from '../../../../@crema/redux/features/etapaProyecto/etapaProyectoSlice';
import Slide from '@mui/material/Slide';
import EtapaProyectoForm from './EtapaProyectoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const validationSchema = yup.object({
  id_tipo_proyecto: yup.string().required('Requerido'),
  nombre: yup.string().required('Requerido'),
  secuencia: yup.string().required('Requerido'),
});

const EtapaProyectoCreador = (props) => {
  const { EtapaProyecto, handleOnClose, accion, updateColeccion, titulo, tiposProyectos } = props;
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

  const selectedRow = useSelector((state) =>  state.etapaProyecto.EtapaProyectoActual);  
  const loading = useSelector((state) =>  state.etapaProyecto.loading);
  const initializeSelectedRow = () => {
    dispatch(resetEtapaProyectoActual()); 
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
      dispatch(onShow(EtapaProyecto));
    }
  }, [accion, dispatch, EtapaProyecto]);

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
        maxWidth={'sm'}
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
              nombre: selectedRow ? selectedRow.nombre : '',
              secuencia: selectedRow ? selectedRow.secuencia : '',
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
              <EtapaProyectoForm
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

EtapaProyectoCreador.propTypes = {
  EtapaProyecto: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default EtapaProyectoCreador;
