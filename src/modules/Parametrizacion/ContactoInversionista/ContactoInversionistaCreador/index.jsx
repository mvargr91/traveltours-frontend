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
  resetInversionistaContactoActual,
}  from '../../../../@crema/redux/features/inversionistaContacto/inversionistaContactosSlice';
import { onGetColeccionLigera as onGetInversionistas } from '../../../../@crema/redux/features/inversionista/inversionistasSlice';
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
  const { InversionistaContacto, handleOnClose, accion, updateColeccion, titulo, inversionista, contactos} = props;
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

const getValidationSchema = (contactos) =>
  yup.object({
    id_inversionista: yup.string().required('Requerido'),
    tipo_contacto: yup.string().required('Requerido'),
    nombre_contacto: yup
      .string()
      .required('Requerido')
      .test(
        'nombre-contacto-unico',
        'Ya existe un contacto con ese nombre para este inversionista',
        function (value) {
          const idInversionista = this.parent.id_inversionista;
          const idActual = this.parent.id;
          return !contactos.some(
            (c) =>
              c.nombre_contacto === value &&
              c.id_inversionista == idInversionista &&
              c.id != idActual
          );
        }
      ),
    email_contacto: yup
      .string()
      .email('Debe ser un correo electrónico válido')
      .required('Requerido'),

    // Teléfonos: ninguno obligatorio por sí solo
    telefono_celular_contacto: yup
      .string()
      .nullable()
      .trim()
      // Si no hay "telefono_contacto", el celular se vuelve obligatorio
      .when('telefono_contacto', (telFijo, schema) => {
        const tieneFijo = !!(telFijo && String(telFijo).trim());
        return tieneFijo
          ? schema.notRequired()
          : schema.required('Requerido si no diligencia teléfono de contacto');
      }),
    telefono_contacto: yup.string().nullable().trim().notRequired(),

    numero_documento_cont: yup
      .string()
      .nullable()
      .matches(/^\d+$/, 'Debe contener solo números')
      .test('max-value', 'Debe ser menor que 9.999.999.999', (value) => {
        if (!value || value.trim() === '') return true; // permite vacío o nulo
        return parseInt(value, 10) < 10000000000;
      }),
  })
  // Validación a nivel de objeto: al menos uno de los dos teléfonos
  .test(
    'al-menos-un-telefono',
    'Ingrese celular o teléfono',
    function (values) {
      const cel = values?.telefono_celular_contacto?.trim();
      const fijo = values?.telefono_contacto?.trim();
      const ok = !!(cel || fijo);
      // Si falla, marcamos el error sobre el campo celular (como pediste)
      return ok || this.createError({
        path: 'telefono_celular_contacto',
        message: 'Ingrese celular o teléfono',
      });
    }
  );

  // const classes = useStyles(props);

  const selectedRow = useSelector((state) =>  state.inversionistasContacto.inversionistaContactoActual);  
  const loading = useSelector((state) =>  state.inversionistasContacto.loading);
  const { coleccionLigera: inversionistas } = useSelector((state) => state.inversionistas);
  const initializeSelectedRow = () => {
    dispatch(resetInversionistaContactoActual()); 
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
      dispatch(onShow({inversionista: inversionista.id, InversionistaContacto}));
    }
  }, [accion, dispatch, InversionistaContacto]);


  useEffect(() => {
    dispatch(onGetInversionistas());
  }, [dispatch]);


  // if(loading){
  //   return <AppLoader/>;
  // }

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
              tipo_contacto: selectedRow ? selectedRow.tipo_contacto : '',
              tipo_documento_cont: selectedRow ? selectedRow.tipo_documento_cont : '',
              numero_documento_cont: selectedRow ? selectedRow.numero_documento_cont : '',
              nombre_contacto: selectedRow ? selectedRow.nombre_contacto : '',
              cargo_contacto: selectedRow ? selectedRow.cargo_contacto : '',
              email_contacto: selectedRow ? selectedRow.email_contacto : '',
              telefono_contacto: selectedRow ? selectedRow.telefono_contacto : '',
              telefono_celular_contacto: selectedRow ? selectedRow.telefono_celular_contacto : '',
              estado: selectedRow ? selectedRow.estado === 1 ? '1' : '0' : '1',
            }}
            validationSchema={getValidationSchema(contactos)}
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
              />
            )}
          </Formik>
        </AppScrollbar>
      </Dialog>
    )
  );
};

ContactoCreador.propTypes = {
  InversionistaContacto: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ContactoCreador;
