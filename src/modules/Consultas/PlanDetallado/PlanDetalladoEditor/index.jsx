import React, { useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppScrollbar from '../../../../@crema/components/AppScrollbar';
import {
  UPDATE_TYPE,
  CREATE_TYPE,
  DELETE_TYPE,
} from '../../../../shared/constants/Constantes';
import {
  onShow,
  onUpdate,
}  from '../../../../@crema/redux/features/planDetallado/planDetalladoSlice';
import { onGetColeccionLigera as onGetCiudades } from '../../../../@crema/redux/features/ciudades/ciudadesSlice';
import { onGetColeccionLigera as onGetTiposInversiones } from '../../../../@crema/redux/features/categoriaInversion/categoriaInversionesSlice';
import {onGetColeccionLigera as onGetInversionistas} from '../../../../@crema/redux/features/inversionista/inversionistasSlice';
import {onGetColeccionLigeraDisponible as onGetProyectos} from '../../../../@crema/redux/features/Proyecto/proyectosSlice';
import {onGetColeccionLigera as onGetGestores} from '../../../../@crema/redux/features/gestor/gestoresSlice';
import {onShow as onShowInversionista} from '../../../../@crema/redux/features/inversionista/inversionistasSlice';
import {onShow as onShowGestor} from '../../../../@crema/redux/features/gestor/gestoresSlice';
import Slide from '@mui/material/Slide';
import PlanDetalladoForm from './PlanDetalladoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import AppMessageView from '@crema/components/AppMessageView';
import { formatCurrency } from '../../../../shared/hooks/formatCurrency';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const validationSchema = yup.object({
  id_inversionista: yup.string().required('Requerido'),
  id_tipo_inversion: yup.string().required('Requerido'),
  valor_inversion: yup.string().required('Requerido'),
  fecha_inversion: yup
    .date()
    .nullable()
    .transform((curr, orig) => (orig === '' || orig === null ? null : new Date(orig)))
    .required('Requerido'),
  id_gestor: yup
    .string()
    .nullable(),
  porcentaje_comision: yup
    .number()
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .max(99.99, 'Debe ser menor que 99.99')
    .test('gestor-comision-coherente', '', function (value) {
      const { id_gestor } = this.parent;
      if (value > 0 && !id_gestor) {
        return this.createError({
          message: 'Para registrar porcentaje de comisión se requiere seleccionar gestor',
          path: 'id_gestor',
        });
      }

      if ((value === null || value === 0 || value === undefined) && id_gestor) {
        return this.createError({
          message: 'Para registrar gestor se requiere registrar porcentaje de comisión',
          path: 'porcentaje_comision',
        });
      }

      return true;
    }),
  porcentaje_ret_fuente: yup
    .number()
    .typeError('Debe ser un número válido')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimales', 'Máximo 2 decimales permitidos', (value) => {
      if (value == null) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    })
    .test('requiere-gestor', 'Para registrar porcentaje de ret fuente se requiere seleccionar gestor', function (value) {
      const { id_gestor } = this.parent;
      if (value > 0 && !id_gestor) {
        return false;
      }
      return true;
    })
    .test('requiere-comision', 'Para registrar porcentaje retención fuente se requiere porcentaje de comisión', function (value) {
      const { porcentaje_comision } = this.parent;
      if (value > 0 && (!porcentaje_comision || porcentaje_comision === 0)) {
        return false;
      }
      return true;
    }),
  
  indicativo_forma_pago_int: yup
    .string()
    .required('Requerido')
    .test('forma-pago-plazos-iguales', '', function (value) {
      const { plazo_capital, plazo_interes } = this.parent;
      // Solo valida si la forma de pago es "M"
      if (value === 'M' && plazo_capital !== plazo_interes) {
        return this.createError({
          message: 'Para esta forma de pago el plazo de capital e intereses deben ser iguales',
          path: 'plazo_capital',
        });
      }

      // Solo valida si la forma de pago es "F"
      if (value === 'F' && plazo_capital !== plazo_interes) {
        return this.createError({
          message: 'Para esta forma de pago el plazo de capital e intereses deben ser iguales',
          path: 'plazo_capital',
        });
      }

      if (value === 'I' && plazo_interes <= plazo_capital) {
        return this.createError({
          message: 'Para esta forma de pago el plazo de interés  deben ser mayor al plazo de capital',
          path: 'plazo_interes',
        });
      }

      return true;
    }),

  plazo_capital: yup
    .number()
    .required('Requerido'),

  plazo_interes: yup
    .number()
    .required('Requerido'),
  tasa_interes_inversion: yup
    .number()
    .required('Requerido'),
});



let hUrl = '';

const InversionCreador = (props) => {
  const dispatch = useDispatch();
  const { accion, id } = useParams();
  const navigate = useNavigate();
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
  const { user } = useSelector(({ auth }) => auth);
  const [permisos, setPermisos] = useState('');
  const [titulo, setTitulo] = useState('');
  const selectedRow = useSelector((state) =>  state.planDetallado.PlanDetalladoActual);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);
  const { coleccionLigera: categoriasInversiones } = useSelector((state) => state.categoriasInversiones);
  const { coleccionLigera: inversionistas } = useSelector((state) => state.inversionistas);
  const { coleccionLigera: gestores } = useSelector((state) => state.gestores);
  const { coleccionLigera: proyectos } = useSelector((state) => state.proyectos);
  const selectedRowInversionista = useSelector((state) =>  state.inversionistas.InversionistaActual);
  const selectedRowGestor = useSelector((state) =>  state.gestores.GestorActual);
  const { message, error, messageType } = useSelector(({ common }) => common);
  const location = useLocation();
  const [locationState, setLocationState] = useState(location.state);
  useEffect(() => {
    if ((accion === 'ver')) {
      dispatch(onShow(id));
    }
  }, [accion, dispatch, id]);

  useEffect(() => {
    if (selectedRow?.id_inversionista) {
      dispatch(onShowInversionista(selectedRow?.id_inversionista));
    }
  }, [selectedRow?.id_inversionista, id]);

  useEffect(() => {
    if (selectedRow?.id_gestor !== null) {
      dispatch(onShowGestor(selectedRow?.id_gestor));
    }
  }, [selectedRow?.id_gestor, id]);

  useEffect(() => {
    dispatch(onGetCiudades());
    dispatch(onGetTiposInversiones());
    dispatch(onGetInversionistas());
    dispatch(onGetProyectos());
    dispatch(onGetGestores());
  }, [dispatch]);

  useEffect(() => {
    user &&
      user.usuario.permisos.forEach((modulo) => {
        modulo.opciones.forEach((opcion) => {
          if (opcion.url === props.route.path) {
            setTitulo(opcion.nombre);
            hUrl = opcion.url_ayuda;
            const permisoAux = [];
            opcion.permisos.forEach((permiso) => {
              if (permiso.permitido) {
                permisoAux.push(permiso.titulo);
              }
            });
            setPermisos(permisoAux);
          }
        });
      });
  }, [user, props.route]);


  const handleOnClose = () => {
    navigate('/consulta-plan-detallado',  { state: locationState  });
  };

   return (
    (
      <div>
      <Formik
        initialStatus={true}
        enableReinitialize={true}
        validateOnBlur={false}
        initialValues={{
          id: selectedRow?.id ? selectedRow?.id :  '',
          id_inversion:  selectedRow?.id_inversion ? selectedRow?.id_inversion:  '',
          id_proyecto:  selectedRow?.id_proyecto ? selectedRow?.id_proyecto:  '',
          id_inversionista: selectedRow?.id_inversionista ? selectedRow?.id_inversionista:  '',
          porcentaje_ret_fuente_rendimientos: selectedRow?.porcentaje_ret_fuente_rendimientos ? selectedRow?.porcentaje_ret_fuente_rendimientos:  '',
          tipo_concepto: selectedRow?.tipo_concepto ? selectedRow?.tipo_concepto : '',
          valor_inversion: selectedRow?.valor_inversion ? selectedRow?.valor_inversion : '',
          fecha_inversion:  selectedRow?.fecha_inversion ? selectedRow?.fecha_inversion : '',
          fecha_vencimiento:  selectedRow?.fecha_vencimiento ? selectedRow?.fecha_vencimiento : '',
          fecha_pago:  selectedRow?.fecha_pago ? selectedRow?.fecha_pago : '',
          estado_inversion: selectedRow?.estado_inversion ? selectedRow?.estado_inversion : '' ,
          id_gestor: selectedRow?.id_gestor ? selectedRowGestor?.nombre : '',
          porcentaje_comision:  selectedRow?.porcentaje_comision ? selectedRow?.porcentaje_comision : '',
          porcentaje_ret_fuente: selectedRow?.porcentaje_ret_fuente ? selectedRow?.porcentaje_ret_fuente : '',
          estado_plan: selectedRow?.estado_plan ? selectedRow?.estado_plan : '',
          valor_concepto: selectedRow?.valor_concepto ? formatCurrency(selectedRow?.valor_concepto) : '',
          valor_ret_fuente: selectedRow?.valor_ret_fuente ? formatCurrency(selectedRow?.valor_ret_fuente) : '',
          valor_a_pagar: selectedRow?.valor_a_pagar ? formatCurrency(selectedRow?.valor_a_pagar) : '',
          usuario_modificacion_nombre:  selectedRow?.usuario_modificacion_nombre  ? selectedRow?.usuario_modificacion_nombre : '',
          fecha_modificacion: selectedRow?.fecha_modificacion ? selectedRow?.fecha_modificacion : '',
          telefono: '',
          email:  selectedRowInversionista ? selectedRowInversionista?.email : '',
        }}
        validationSchema={validationSchema}
        onSubmit={(data, { setSubmitting, resetForm }) => {
          setSubmitting(true);
        
          // Enviar al backend
          if (accion === 'editar') {
            dispatch(
              onUpdate({
                data,
                handleOnClose
              })
            );
            // navigate('/inversiones');
            
          }
        
          setSubmitting(false);
        }}
        
      >
        {({ values, initialValues, setFieldValue }) => (
          <PlanDetalladoForm
            values={values}
            setFieldValue={setFieldValue}
            handleOnClose={handleOnClose}
            titulo={titulo}
            ciudades={ciudades}
            inversionistas={inversionistas}
            gestores={gestores}
            proyectos={proyectos}
            tipoInversion={categoriasInversiones}
            accion={accion}
            initialValues={initialValues}
            locationState={locationState}
          />
        )}
      </Formik>
      <AppMessageView
        variant={
          messageType === UPDATE_TYPE || messageType === CREATE_TYPE
            ? 'success'
            : 'error'
        }
        message={
          messageType === UPDATE_TYPE || messageType === CREATE_TYPE
            ? message
            : ''
        }
      />
      </div>
    )
  );
};

InversionCreador.propTypes = {
  Inversion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default InversionCreador;
