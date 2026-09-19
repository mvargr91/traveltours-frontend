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
  resetInversionistaContactoLegalActual,
}  from '../../../../@crema/redux/features/inversionistaContactoLegal/inversionistaContactosLegalesSlice';
import { onGetColeccionLigera as onGetInversionistas } from '../../../../@crema/redux/features/inversionista/inversionistasSlice';
import { onGetColeccionLigera as onGetCiudades} from '../../../../@crema/redux/features/ciudades/ciudadesSlice';
import { onGetColeccionLigera } from '../../../../@crema/redux/features/inversionistaContactoLegal/inversionistaContactosLegalesSlice';
import Slide from '@mui/material/Slide';
import ContactoForm from './ContactoInversionistaForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});



const ContactoCreador = (props) => {
  const { InversionistaContactoLegal, handleOnClose, accion, updateColeccion, titulo, inversionista, inversionistaId} = props;
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
  const contactos = useSelector((state) =>  state.inversionistasContactoLegal.coleccionLigera)
  const normDoc = (v) => String(v ?? '').trim();

  let validationSchema = yup.object({
    id_inversionista: yup.string().required('Requerido'),
    tipo_contacto_legal: yup.string().required('Requerido'),
    numero_documento_cont_leg: yup.string()
      .required('Requerido')
      .matches(/^\d+$/, 'Debe contener solo números')
      .test(
        'max-value',
        'Debe ser menor que 9.999.999.999',
        value => {
          return parseInt(value, 10) < 10000000000;
        }
      )
      .test(
        'nombre-contacto-unico',
        'Documento ya registrado para otro contacto legal del inversionista.',
        function (value) {
          const idInversionista = this.parent.id_inversionista;
          const doc = normDoc(value);
          return !contactos.some(
            (c) =>
              normDoc(c.numero_documento_cont_leg) === doc &&
              String(c.id_inversionista) === String(idInversionista)
          );
        }
      ),
    tipo_documento_cont_leg: yup.string().required('Requerido'),
    id_ciudad_docto: yup.string().required('Requerido'),
    nombre_cont_leg: yup.string().required('Requerido'),
    estado: yup.string().required('Requerido'),
  });
  
  let validationSchemaEditar = yup.object({
    id_inversionista: yup.string().required('Requerido'),
    tipo_contacto_legal: yup.string().required('Requerido'),
    numero_documento_cont_leg: yup.string()
      .required('Requerido')
      .matches(/^\d+$/, 'Debe contener solo números')
      .test(
        'max-value',
        'Debe ser menor que 9.999.999.999',
        value => {
          return parseInt(value, 10) < 10000000000;
        }
      )
      .test(
        'nombre-contacto-unico',
        'Documento ya registrado para otro contacto legal del inversionista.',
        function (value) {
          const idActual = this.parent.id;                   
          const idInversionista = this.parent.id_inversionista;
          const doc = normDoc(value);
          return !contactos.some(
            (c) =>
            normDoc(c.numero_documento_cont_leg) === doc &&
            String(c.id_inversionista) === String(idInversionista)
            && c.id !== idActual 
          );
        }
      ),
    tipo_documento_cont_leg: yup.string().required('Requerido'),
    id_ciudad_docto: yup.string().required('Requerido'),
    nombre_cont_leg: yup.string().required('Requerido'),
    estado: yup.string().required('Requerido'),
  });

  const classes = useStyles(props);
  

  const selectedRow = useSelector((state) =>  state.inversionistasContactoLegal.inversionistaContactoLegalActual);  
  const loading = useSelector((state) =>  state.inversionistasContactoLegal.loading);
  const { coleccionLigera: inversionistas } = useSelector((state) => state.inversionistas);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);
  const initializeSelectedRow = () => {
    dispatch(resetInversionistaContactoLegalActual()); 
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
    if ((accion === 'editar') || (accion === 'ver')) {
      dispatch(onShow({inversionista: inversionistaId, InversionistaContactoLegal}));
    }
  }, [accion, dispatch, InversionistaContactoLegal]);

  useEffect(() => {
    dispatch(onGetColeccionLigera(inversionistaId));
  }, [inversionistaId]);

  useEffect(() => {
    dispatch(onGetInversionistas());
    dispatch(onGetCiudades());
  }, [dispatch]);

  console.log(selectedRow)

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
              id_inversionista: inversionista ? inversionista?.id : '',
              tipo_documento: inversionista ? inversionista?.tipo_documento : '',
              numero_documento: inversionista ? inversionista?.numero_documento : '',
              tipo_contacto_legal: selectedRow ? selectedRow?.tipo_contacto_legal : 'S',
              tipo_documento_cont_leg: selectedRow ? selectedRow?.tipo_documento_cont_leg : '',
              numero_documento_cont_leg: selectedRow ? selectedRow.numero_documento_cont_leg : '',
              id_ciudad_docto: selectedRow ? selectedRow.id_ciudad_docto : '',
              nombre_cont_leg: selectedRow ? selectedRow.nombre_cont_leg : '',
              direccion_cont_leg: selectedRow ? selectedRow.direccion_cont_leg : '',
              id_ciudad_cont_leg: selectedRow ? selectedRow.id_ciudad_cont_leg : '',
              telefono_cont_leg: selectedRow ? selectedRow.telefono_cont_leg : '',
              porcentaje_participacion: selectedRow ? selectedRow.porcentaje_participacion : '',
              banco: selectedRow ? selectedRow?.banco : '',
              tipo_cuenta: selectedRow ? selectedRow?.tipo_cuenta : '',
              numero_cuenta: selectedRow ? selectedRow?.numero_cuenta : '',
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
              <ContactoForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                inversionistas={inversionistas}
                accion={accion}
                initialValues={initialValues}
                inversionista={inversionista}
                ciudades={ciudades}
              />
            )}
          </Formik>
        </AppScrollbar>
      </Dialog>
    )
  );
};

ContactoCreador.propTypes = {
  InversionistaContactoLegal: PropTypes.string.isRequired,
  contactos: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ContactoCreador;
