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
  resetInversionistaActual,
  onGetColeccionLigera as onGetInversionistas,
}  from '../../../../@crema/redux/features/inversionista/inversionistasSlice';
import { onGetColeccionLigera as onGetCiudades } from '../../../../@crema/redux/features/ciudades/ciudadesSlice';
import { onGetColeccionLigera as onGetBancos } from '../../../../@crema/redux/features/bancos/bancosSlice';
import { onGetColeccionLigera as onGetTiposInversiones } from '../../../../@crema/redux/features/categoriaInversion/categoriaInversionesSlice';
import { onGetColeccionLigera as onGetParametros } from '../../../../@crema/redux/features/parametroConstante/parametroConstanteSlice';
import Slide from '@mui/material/Slide';
import InversionistaForm from './InversionistaForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';
import { Box } from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const InversionistaCreador = (props) => {
  const { Inversionista, handleOnClose, accion, updateColeccion, titulo , showForm} = props;
  const dispatch = useDispatch();
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
  const [tipoInversionDefault, setTipoInversionDefault] = useState(null);
  const selectedRow = useSelector((state) =>  state.inversionistas.InversionistaActual);  
  const loading = useSelector((state) =>  state.inversionistas.loading);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);
  const { coleccionLigera: bancos } = useSelector((state) => state.bancos);
  const { coleccionLigera: categoriasInversiones } = useSelector((state) => state.categoriasInversiones);
  const { coleccionLigera: inversionistas } = useSelector((state) => state.inversionistas);
  const { coleccionLigera: parametroConstantes } = useSelector((state) => state.parametroConstantes);

  let validationSchema = yup.object({
    nombre: yup.string().required('Requerido'),
    tipo_documento: yup.string().required('Requerido'),
    numero_documento: yup
    .string()
    .required('Requerido')
    .test(
        'max-value',
        'Debe ser menor que 9.999.999.999',
        value => {
          if (!value || value.trim() === '') return true; 
          return parseInt(value, 10) < 10000000000;
        }
      )
    .test('documento-existe', 'Documento ya registrado para otro inversionista', function (value) {
      const { id } = this.parent;
      return !inversionistas.some(
        (g) => g.numero_documento === value
      );
    }),
    tipo_persona:  yup.string().required('Requerido'),
    email: yup.string().email('Correo electrónico inválido').required('Requerido'),
    indicativo_socio: yup.string().required('Requerido'),
    id_tipo_inversion: yup.string().required('Requerido'),
    direccion: yup.string().required('Requerido'),
    ciudad_id: yup.number().required('Requerido'),
  });

  let validationSchemaEditar = yup.object({
    nombre: yup.string().required('Requerido'),
    tipo_documento: yup.string().required('Requerido'),
    numero_documento: yup
    .string()
    .required('Requerido')
    .trim()
    .test(
        'max-value',
        'Debe ser menor que 9.999.999.999',
        value => {
          if (!value || value.trim() === '') return true; 
          return parseInt(value, 10) < 10000000000;
        }
      )
    .test(
      'documento-unico',
      'Documento ya registrado para otro inversionista',
      function (value) {
        const { id } = this.parent;
        const documento = value?.trim();
        if (!documento) return true;
        return !inversionistas.some(
          (g) => g.numero_documento?.trim() === documento && g.id !== id
        );
      }
    ),
    tipo_persona:  yup.string().required('Requerido'),
    email: yup.string().email('Correo electrónico inválido').required('Requerido'),
    indicativo_socio: yup.string().required('Requerido'),
    id_tipo_inversion: yup.string().required('Requerido'),
    direccion: yup.string().required('Requerido'),
    ciudad_id: yup.number().required('Requerido'),
  });

  useEffect(() => {
    dispatch(onGetInversionistas());
  }, [dispatch]);

  const initializeSelectedRow = () => {
    dispatch(resetInversionistaActual()); 
  };
  useEffect(() => {
    initializeSelectedRow();
  }, []);

  if (accion === 'crear') {
    initializeSelectedRow();
  }

  useEffect(() => {
    if ((accion === 'editar') | (accion === 'ver')) {
      dispatch(onShow(Inversionista));
    }
  }, [accion, dispatch, Inversionista]);

    useEffect(() => {
      dispatch(onGetCiudades());
      dispatch(onGetBancos());      
      dispatch(onGetTiposInversiones());
      dispatch(onGetParametros());      
    }, [dispatch]);

    useEffect(() => {
      if (Array.isArray(parametroConstantes.datos)) {
        const parametro = parametroConstantes.datos.find(
          (param) => param.codigo_parametro === 'ID_TIPO_INVERSION_POR_DEFECTO'
        );
        if (parametro) {
          setTipoInversionDefault(parametro.valor_parametro);
        }
      }
    }, [parametroConstantes.datos]);


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
              tipo_persona: selectedRow ? selectedRow.tipo_persona : 'N',
              codigo_ciiu: selectedRow ? selectedRow.codigo_ciiu : '',
              descripcion_act_ecca: selectedRow ? selectedRow.descripcion_act_ecca : '',
              direccion: selectedRow ? selectedRow.direccion : '',
              ciudad_id: selectedRow ? selectedRow.ciudad_id : '',
              telefono: selectedRow ? selectedRow.telefono : '',
              email: selectedRow ? selectedRow.email : '',
              indicativo_socio: selectedRow ? selectedRow.indicativo_socio : 'N',
              porcentaje_ret_fuente_rendimientos: selectedRow ? selectedRow.porcentaje_ret_fuente_rendimientos : '',
              id_tipo_inversion: selectedRow ? selectedRow.id_tipo_inversion : Number(tipoInversionDefault),
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
            context={{
              inversionistas: inversionistas || [],
              currentId: selectedRow?.id || null,
            }}
          >
            {({ values, initialValues, setFieldValue }) => (
              <InversionistaForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                ciudades={ciudades}
                bancos={bancos}
                inversionistas={inversionistas}
                tipoInversion={categoriasInversiones}
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

InversionistaCreador.propTypes = {
  Inversionista: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default InversionistaCreador;
