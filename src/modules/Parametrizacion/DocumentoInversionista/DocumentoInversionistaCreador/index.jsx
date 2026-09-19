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
  resetGestorActual,
}  from '../../../../@crema/redux/features/gestor/gestoresSlice';
import { onGetColeccionLigera as onGetCiudades } from '../../../../@crema/redux/features/ciudades/ciudadesSlice';
import Slide from '@mui/material/Slide';
import CiudadForm from './DocumentoInversionistaForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const validationSchema = yup.object({
  nombre: yup.string().required('Requerido'),
  numero_nit: yup.string().required('Requerido'),
  digito_verificacion: yup.string().required('Requerido'),
  direccion: yup.string().required('Requerido'),
  ciudad_id: yup.string().required('Requerido'),
});

const CiudadCreador = (props) => {
  const { Ciudad, handleOnClose, accion, updateColeccion, titulo } = props;
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

  const selectedRow = useSelector((state) =>  state.gestores.GestorActual);  
  const loading = useSelector((state) =>  state.gestores.loading);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);
  const initializeSelectedRow = () => {
    dispatch(resetGestorActual()); 
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
      dispatch(onShow(Ciudad));
    }
  }, [accion, dispatch, Ciudad]);

    useEffect(() => {
      dispatch(onGetCiudades());
    }, [dispatch]);

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
              nombre: selectedRow ? selectedRow.nombre : '',
              numero_nit: selectedRow ? selectedRow.numero_nit : '',
              digito_verificacion: selectedRow ? selectedRow.digito_verificacion : '',
              direccion: selectedRow ? selectedRow.direccion : '',
              ciudad_id: selectedRow ? selectedRow.ciudad_id : '',
              telefono_1: selectedRow ? selectedRow.telefono_1 : '',
              telefono_2: selectedRow ? selectedRow.telefono_2 : '',
              representante_legal: selectedRow ? selectedRow.representante_legal : '',
              email_representante: selectedRow ? selectedRow.email_representante : '',
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
              <CiudadForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                ciudades={ciudades}
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

CiudadCreador.propTypes = {
  Ciudad: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default CiudadCreador;
