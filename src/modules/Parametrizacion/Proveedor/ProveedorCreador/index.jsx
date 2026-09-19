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
  resetProveedorActual,
}  from '../../../../@crema/redux/features/Proveedor/proveedoresSlice';
import { onGetColeccionLigera as onGetCiudades } from '../../../../@crema/redux/features/ciudades/ciudadesSlice';
import { onGetColeccionLigera as onGetBancos } from '../../../../@crema/redux/features/bancos/bancosSlice';
import Slide from '@mui/material/Slide';
import ProveedorForm from './ProveedorForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const validationSchema = yup.object({
  nombre: yup.string().required('Requerido'),
  tipo_documento: yup.string().required('Requerido'),
  numero_documento: yup.string().required('Requerido'),
  direccion: yup.string().required('Requerido'),
  id_ciudad: yup.string().required('Requerido'),
  telefono: yup.string().required('Requerido'),
  tipo_Persona: yup.string().required('Requerido'),
  pagina_web: yup
    .string()
    .nullable()
    .notRequired()
    .matches(
      /^www\.[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,6}(\/.*)?$/,
      {
        message: 'Debe tener formato de dirección URL',
        excludeEmptyString: true,}
    ),
  contacto_email: yup
    .string()
    .nullable()
    .notRequired()
    .email('Debe tener formato de correo electrónico'),
});


const ProveedorCreador = (props) => {
  const { Proveedor, handleOnClose, accion, updateColeccion, titulo } = props;
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

  const selectedRow = useSelector((state) =>  state.proveedores.ProveedorActual);  
  const loading = useSelector((state) =>  state.proveedores.loading);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);
  const { coleccionLigera: bancos } = useSelector((state) => state.bancos);
  const initializeSelectedRow = () => {
    dispatch(resetProveedorActual()); 
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
      dispatch(onShow(Proveedor));
    }
  }, [accion, dispatch, Proveedor]);

    useEffect(() => {
      dispatch(onGetCiudades());
      dispatch(onGetBancos());
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
              tipo_documento: selectedRow ? selectedRow.tipo_documento : '',
              numero_documento: selectedRow ? selectedRow.numero_documento : '',
              direccion: selectedRow ? selectedRow.direccion : '',
              id_ciudad: selectedRow ? selectedRow.id_ciudad : '',
              telefono: selectedRow ? selectedRow.telefono : '',
              pagina_web: selectedRow ? selectedRow.pagina_web : '',
              tipo_Persona: selectedRow ? selectedRow.tipo_Persona : '',
              contacto_nombre: selectedRow ? selectedRow.contacto_nombre : '',
              contacto_telefono: selectedRow ? selectedRow.contacto_telefono : '',
              contacto_email: selectedRow ? selectedRow.contacto_email : '',
              id_banco: selectedRow ? selectedRow.id_banco : '',
              tipo_cuenta_Bancaria: selectedRow ? selectedRow.tipo_cuenta_Bancaria : '',
              numero_cuenta_Bancaria: selectedRow ? selectedRow.numero_cuenta_Bancaria : '',
              observaciones: selectedRow ? selectedRow.observaciones : '',
              estado: selectedRow ? selectedRow.estado === 1 ? '1' : '0' : '1', 
            }}
            validationSchema={validationSchema}
            onSubmit={(data, { setSubmitting, resetForm }) => {
              setSubmitting(true);
              console.log(data);
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
              <ProveedorForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                ciudades={ciudades}
                bancos={bancos}
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

ProveedorCreador.propTypes = {
  Proveedor: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ProveedorCreador;
