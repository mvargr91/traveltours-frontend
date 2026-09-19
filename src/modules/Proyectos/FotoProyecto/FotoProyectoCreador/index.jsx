// src/modules/.../FotoProyectoCreador.jsx
import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppScrollbar from '../../../../@crema/components/AppScrollbar';
import {
  onUploadFoto as onUpload, // ⬅ usamos este thunk
} from '../../../../@crema/redux/features/proyectoFoto/proyectoFotosSlice';
import { onGetColeccionLigera as onGetCiudades } from '../../../../@crema/redux/features/ciudades/ciudadesSlice';
import Slide from '@mui/material/Slide';
import ProyectoFotoForm from './FotoProyectoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

/**
 * Validación:
 * - id_proyecto: requerido
 * - nombre_foto: requerido
 * - archivo: requerido (File), máx 5MB, tipos permitidos
 */
const validationSchema = yup.object({
  id_proyecto: yup.string().required('Requerido'),
  nombre_foto: yup.string().required('Requerido'),
  archivo: yup
    .mixed()
    .required('Requerido')
    .test(
      'fileSize',
      'El archivo es muy grande (máx 5MB)',
      (value) => !value || value.size <= 5 * 1024 * 1024
    )
    .test(
      'fileFormat',
      'Formato no soportado (JPG, PNG, WEBP)',
      (value) =>
        !value ||
        ['image/jpeg', 'image/png', 'image/webp'].includes(value.type)
    ),
});

const ProyectoFotoCreador = (props) => {
  const {
    ProyectoFoto,
    handleOnClose,
    accion,
    updateColeccion,
    titulo,
    headProyecto,
    proyectos,
  } = props;

  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);

  const useStyles = makeStyles(() => ({
    dialogBox: {
      position: 'absolute',
      '& .MuiDialog-paperWidthSm': {
        maxWidth: 600,
        width: '100%',
      },
      '& .MuiTypography-h6': {
        fontWeight: Fonts.LIGHT,
      },
    },
  }));

  const classes = useStyles(props);

  // Aquí estás usando loading de gestores, si quieres podrías cambiarlo luego al de proyectoFoto
  const loading = useSelector((state) => state.gestores.loading);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);

  // Solo mostrar el form cuando accion === 'crear'
  useEffect(() => {
    if (accion === 'crear') {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }, [accion]);

  // Cargar ciudades ligeras
  useEffect(() => {
    dispatch(onGetCiudades());
  }, [dispatch]);

  if (loading) {
    return <AppLoader />;
  }

  return (
    showForm && (
      <Dialog
        open={showForm}
        onClose={handleOnClose}
        aria-labelledby='simple-modal-title'
        TransitionComponent={Transition}
        aria-describedby='simple-modal-description'
        className={classes.dialogBox}
        maxWidth={'md'}
        fullWidth
      >
        <AppScrollbar>
          <Formik
            initialStatus={true}
            enableReinitialize={true}
            validateOnBlur={false}
            initialValues={{
              id: '',
              id_proyecto: headProyecto ? headProyecto?.id_proyecto : '',
              codigo_proyecto: headProyecto ? headProyecto?.codigo_proyecto : '',
              ciudad_proyecto: headProyecto ? headProyecto?.ciudad_proyecto : '',
              tipo_proyecto: headProyecto ? headProyecto?.tipo_proyecto : '',
              nombre_foto: '',
              archivo: null, // aquí se guarda el File
            }}
            validationSchema={validationSchema}
            onSubmit={(data, { setSubmitting }) => {
              setSubmitting(true);

              // Construyes el FormData SOLO con los campos que pide el back
              const formData = new FormData();
              formData.append('id_proyecto', data.id_proyecto);
              formData.append('nombre_foto', data.nombre_foto);
              if (data.archivo) {
                formData.append('archivo', data.archivo); // importante: el File
              }

              // Usamos onUploadFoto para mandar el FormData
              dispatch(onUpload({ formData, handleOnClose, updateColeccion }));

              setSubmitting(false);
            }}
          >
            {({ values, initialValues, setFieldValue }) => (
              <ProyectoFotoForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                ciudades={ciudades}
                accion={accion}
                initialValues={initialValues}
                proyectos={proyectos}
              />
            )}
          </Formik>
        </AppScrollbar>
      </Dialog>
    )
  );
};

ProyectoFotoCreador.propTypes = {
  ProyectoFoto: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  headProyecto: PropTypes.object,
  proyectos: PropTypes.array,
};

export default ProyectoFotoCreador;
