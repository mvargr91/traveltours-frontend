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
  onGetColeccionLigera as onGetGestores,
}  from '../../../../@crema/redux/features/gestor/gestoresSlice';
import { onGetColeccionLigera as onGetBancos } from '../../../../@crema/redux/features/bancos/bancosSlice';
import Slide from '@mui/material/Slide';
import GestorForm from './GestorForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});


const GestorCreador = (props) => {
  const { Gestor, handleOnClose, accion, updateColeccion, titulo } = props;
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
  const { coleccionLigera: bancos} = useSelector((state) => state.bancos);
  const { coleccionLigera: gestores } = useSelector((state) => state.gestores);

  let validationSchema = yup.object({
    nombre: yup.string().required('Requerido'),
    tipo_documento: yup.string().required('Requerido'),
    numero_documento: yup
    .string()
    .required('Requerido')
    .test('documento-existe', 'Numero de documento ya registrado para otro gestor', function (value) {
      const { id } = this.parent; // para excluir al mismo registro si estás editando
      console.log(value, gestores)
      return !gestores.some(
        (g) => g.numero_documento === value
      );
    }),
    email: yup.string().email('Correo electrónico inválido').required('Requerido'),
    id_banco: yup.string().required('Requerido'),
    porcentaje_comision: yup.string().required('Requerido'),
    tipo_cuenta: yup.string().required('Requerido'),
    numero_cuenta: yup.string().required('Requerido'),
  });

  const validationSchemaEditar = yup.object({
    nombre: yup.string().required('Requerido'),
    tipo_documento: yup.string().required('Requerido'),
    numero_documento: yup
      .string()
      .required('Requerido')
      .trim()
      .test(
        'documento-unico',
        'Número de documento ya registrado para otro gestor',
        function (value) {
          const { id } = this.parent; // ID actual del formulario
          const documento = value?.trim();
          if (!documento) return true;

          // Aquí puedes acceder a "gestores" desde el scope externo del archivo
          return !gestores.some(
            (g) => g.numero_documento?.trim() === documento && g.id !== id
          );
        }
      ),
    email: yup.string().email('Correo electrónico inválido').required('Requerido'),
    id_banco: yup.string().required('Requerido'),
    porcentaje_comision: yup.string().required('Requerido'),
    tipo_cuenta: yup.string().required('Requerido'),
    numero_cuenta: yup.string().required('Requerido'),
  });

    useEffect(() => {
      dispatch(onGetGestores());
      dispatch(onGetBancos());
    }, [dispatch]);

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
      dispatch(onShow(Gestor));
    }
  }, [accion, dispatch, Gestor]);



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
              tipo_documento: selectedRow ? selectedRow.tipo_documento : '',
              numero_documento: selectedRow ? selectedRow.numero_documento : '',
              email: selectedRow ? selectedRow.email : '',
              telefono: selectedRow ? selectedRow.telefono : '',
              porcentaje_comision: selectedRow ? selectedRow.porcentaje_comision : '',
              porcentaje_ret_fuente: selectedRow ? selectedRow.porcentaje_ret_fuente : '',
              id_banco: selectedRow ? selectedRow.id_banco : '',
              tipo_cuenta: selectedRow ? selectedRow.tipo_cuenta : '',
              numero_cuenta: selectedRow ? selectedRow.numero_cuenta : '',
              observaciones: selectedRow ? selectedRow.observaciones : '',
              estado: selectedRow ? selectedRow.estado === 1 ? '1' : '0' : '1',
            }}
            validationSchema={accion === 'crear' ? validationSchema : validationSchemaEditar}
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
              <GestorForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                ciudades={ciudades}
                bancos={bancos}
                gestores={gestores}
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

GestorCreador.propTypes = {
  Gestor: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default GestorCreador;
