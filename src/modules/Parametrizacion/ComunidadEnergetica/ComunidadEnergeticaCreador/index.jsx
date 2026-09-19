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
  resetComunidadEnergeticaActual,
}  from '../../../../@crema/redux/features/comunidadEnergetica/comunidadEnergeticaSlice';
import Slide from '@mui/material/Slide';
import ComunidadEnergeticaForm from './ComunidadEnergeticaForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const validationSchema = yup.object({
  nombre: yup.string().required('Requerido'),
  numero_resolucion: yup.string().required('Requerido'),
  fecha_resolucion: yup.string().required('Requerido'),
  nurin: yup.string().required('Requerido'),
  tipo_comunidad: yup.string().required('Requerido'),
  nombre_rep_principal: yup.string().required('Requerido'),
  tipo_documento_rep_ppal: yup.string().required('Requerido'),
  numero_documento_rep_ppal: yup.string().required('Requerido'),
  nombre_rep_legal: yup.string().required('Requerido'),
  tipo_documento_rep_legal: yup.string().required('Requerido'),
  numero_documento_rep_legal: yup.string().required('Requerido'),
  telefono_rep_legal: yup.string().required('Requerido'),
  email_rep_legal: yup.string().email('Correo electrónico inválido').required('Requerido'),
  estado: yup.string().required('Requerido'),
});

const ComunidadEnergeticaCreador = (props) => {
  const { ComunidadEnergetica, handleOnClose, accion, updateColeccion, titulo } = props;
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

  const selectedRow = useSelector((state) =>  state.comunidadEnergetica.comunidadEnergeticaActual);  
  const loading = useSelector((state) =>  state.comunidadEnergetica.loading);

  const initializeSelectedRow = () => {
    dispatch(resetComunidadEnergeticaActual()); 
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
      dispatch(onShow(ComunidadEnergetica));
    }
  }, [accion, dispatch, ComunidadEnergetica]);

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
        maxWidth={'lg'}
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
              numero_resolucion: selectedRow ? selectedRow.numero_resolucion : '',
              fecha_resolucion: selectedRow ? selectedRow.fecha_resolucion : '',
              nurin: selectedRow ? selectedRow.nurin : '',
              tipo_comunidad: selectedRow ? selectedRow.tipo_comunidad : '',
              numero_registro_comunidad: selectedRow ? selectedRow.numero_registro_comunidad : '',
              nombre_comercializador: selectedRow ? selectedRow.nombre_comercializador : '',
              nombre_operador: selectedRow ? selectedRow.nombre_operador : '',
              nombre_rep_principal: selectedRow ? selectedRow.nombre_rep_principal : '',
              tipo_documento_rep_ppal: selectedRow ? selectedRow.tipo_documento_rep_ppal : '',
              numero_documento_rep_ppal: selectedRow ? selectedRow.numero_documento_rep_ppal : '',
              nombre_rep_legal: selectedRow ? selectedRow.nombre_rep_legal : '',
              tipo_documento_rep_legal: selectedRow ? selectedRow.tipo_documento_rep_legal : '',
              numero_documento_rep_legal: selectedRow ? selectedRow.numero_documento_rep_legal : '',
              telefono_rep_legal: selectedRow ? selectedRow.telefono_rep_legal : '',
              email_rep_legal: selectedRow ? selectedRow.email_rep_legal : '',
              nombre_rep_suplente: selectedRow ? selectedRow.nombre_rep_suplente : '', 
              tipo_documento_rep_supl: selectedRow ? selectedRow.tipo_documento_rep_supl : '', 
              numero_documento_rep_supl: selectedRow ? selectedRow.numero_documento_rep_supl : '', 
              telefono_rep_supl: selectedRow ? selectedRow.telefono_rep_supl : '', 
              email_rep_supl: selectedRow ? selectedRow.email_rep_supl : '', 
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
              <ComunidadEnergeticaForm
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

ComunidadEnergeticaCreador.propTypes = {
  ComunidadEnergetica: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ComunidadEnergeticaCreador;
