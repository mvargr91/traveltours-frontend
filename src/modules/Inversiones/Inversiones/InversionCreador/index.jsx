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
  onCreate,
  resetInversionActual,
}  from '../../../../@crema/redux/features/inversion/inversionSlice';
import { onGetColeccionLigera as onGetCiudades } from '../../../../@crema/redux/features/ciudades/ciudadesSlice';
import { onGetColeccionLigera as onGetTiposInversiones } from '../../../../@crema/redux/features/categoriaInversion/categoriaInversionesSlice';
import {onGetColeccionLigera as onGetInversionistas} from '../../../../@crema/redux/features/inversionista/inversionistasSlice';
import {onGetColeccionLigeraDisponible as onGetProyectos} from '../../../../@crema/redux/features/Proyecto/proyectosSlice';
import {onGetColeccionLigera as onGetGestores} from '../../../../@crema/redux/features/gestor/gestoresSlice';
import Slide from '@mui/material/Slide';
import InversionForm from './InversionForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import AppMessageView from '@crema/components/AppMessageView';
import Swal from 'sweetalert2';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const validationSchema = yup.object({
  id_inversionista: yup.string().required('Requerido'),
  id_tipo_inversion: yup.string().required('Requerido'),
  valor_inversion: yup.string().required('Requerido'),
  fecha_inversion: yup
    .date()
    .required('Requerido')
    .transform((curr, orig) => (orig === '' ? null : new Date(orig))),
  id_gestor: yup
    .string()
    .nullable(),
  porcentaje_comision: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === '' || isNaN(originalValue) ? null : parseFloat(originalValue)
    )
    .test('requiere-gestor-coherente', '', function (value) {
      const { id_gestor } = this.parent;
      if (!id_gestor && value > 0) {
        return this.createError({
          message: 'Para registrar porcentaje de comisión se requiere seleccionar gestor',
          path: 'porcentaje_comision',
        });
      }
      return true;
    })
    .test('gestor-comision-coherente', '', function (value) {     
      const { id_gestor } = this.parent;
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
    .transform((value, originalValue) =>
      originalValue === '' || isNaN(originalValue) ? null : parseFloat(originalValue)
    )
    .max(99.99, 'Debe ser menor que 99.99')
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
  const theme = useTheme();
  const dispatch = useDispatch();
  const { accion, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  const selectedRow = useSelector((state) =>  state.inversiones.InversionActual);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);
  const { coleccionLigera: categoriasInversiones } = useSelector((state) => state.categoriasInversiones);
  const { coleccionLigera: inversionistas } = useSelector((state) => state.inversionistas);
  const { coleccionLigera: gestores } = useSelector((state) => state.gestores);
  const { coleccionLigera: proyectos } = useSelector((state) => state.proyectos);
  const { message, error, messageType } = useSelector(({ common }) => common);

  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [fechaHastaFiltro, setFechaHastaFiltro] = useState('');
  const [fechaDesdeFiltro, setFechaDesdeFiltro] = useState('');
  const [orderByToSend, setOrderByToSend] = React.useState(
    'nombre:asc',
  );
  const stateData = location.state || {}; 
  const [stateDataHandled, setStateDataHandled] = useState(false);

  const initializeSelectedRow = () => {
    dispatch(resetInversionActual()); 
  };
  useEffect(() => {
    initializeSelectedRow();
  }, []);

  if (accion === 'crear') {
    initializeSelectedRow();
  }

  useEffect(() => {
    if ((accion === 'editar') | (accion === 'ver')) {
      dispatch(onShow(id));
    }
  }, [accion, dispatch, id]);

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
      navigate('/inversiones');
    };

   return (
    (
      <div>
      <Formik
        initialStatus={true}
        enableReinitialize={true}
        validateOnBlur={false}
        initialValues={{
          id: selectedRow ? selectedRow.id :  '',
          id_inversionista:  stateData.id || (selectedRow ? selectedRow.id_inversionista : ''),
          id_tipo_inversion: selectedRow ? selectedRow?.id_tipo_inversion : '',
          valor_inversion: stateData.valor || (selectedRow ? selectedRow.valor_inversion : ''),
          fecha_inversion: stateData.fecha || (selectedRow ? selectedRow.fecha_inversion : ''),
          estado_inversion: selectedRow ? selectedRow.estado_inversion :'GEN' ,
          id_gestor: selectedRow ? selectedRow.id_gestor : '',
          porcentaje_comision:  selectedRow ? selectedRow.porcentaje_comision : '',
          porcentaje_ret_fuente: selectedRow ? selectedRow.porcentaje_ret_fuente : '',
          plazo_capital: selectedRow ? selectedRow.plazo_capital : '',
          plazo_interes: selectedRow ? selectedRow.plazo_interes : '',
          periodos_muertos: selectedRow ? selectedRow.periodos_muertos : '',
          periodos_gracia: selectedRow ? selectedRow.periodos_gracia : '',
          tasa_interes_inversion:  selectedRow ? selectedRow.tasa_interes_inversion : '',
          indicativo_forma_pago_int: selectedRow ? selectedRow.indicativo_forma_pago_int : '',
          indicativo_reinversion: selectedRow ? selectedRow.indicativo_reinversion :  'N',
          observaciones: selectedRow ? selectedRow.observaciones : '',
          telefono: '',
          email: '',
        }}
        validationSchema={validationSchema}
        onSubmit={async (data, { setSubmitting }) => {
          setSubmitting(true);
        
          if (!data.detalle_inversiones || data.detalle_inversiones.length === 0) {
            await Swal.fire({
              title: 'Validación',
              text: 'Debes seleccionar al menos un proyecto para invertir.',              
              confirmButtonText: 'OK',
              background: theme.palette.background.default,
              color: theme.palette.text.primary,
            });
            setSubmitting(false);
            return;
          }
        
          // Sumar los valores de todos los proyectos
          const totalProyectos = data.detalle_inversiones.reduce((acc, item) => {
            return acc + parseFloat(item.valor || 0);
          }, 0);
        
          const valorInversion = parseFloat(data.valor_inversion || 0);
        
          if (valorInversion !== totalProyectos) {
            await Swal.fire({
              title: 'Error',
              confirmButtonText: 'OK',
              background: theme.palette.background.default,
              color: theme.palette.text.primary,
              html: `<b>valor total invertido en los proyectos</b> <br /> <b>$${totalProyectos.toLocaleString()}</b> debe coincidir con el <b>valor de la inversión</b> <br /> <b>$${valorInversion.toLocaleString()}</b>.`,
            });
            setSubmitting(false);
            return;
          }
        
          const inversionesFinales = data.detalle_inversiones.map((detalle) => {
            const base = {
              id_inversionista: data.id_inversionista,
              porcentaje_ret_fuente_rendimientos: data.porcentaje_ret_fuente_rendimientos,
              id_tipo_inversion: data.id_tipo_inversion,
              fecha_inversion: data.fecha_inversion,
              valor_inversion: data.valor_inversion,
              estado_inversion: data.estado_inversion,
              id_gestor: data.id_gestor,
              porcentaje_comision: data.porcentaje_comision,
              porcentaje_ret_fuente: data.porcentaje_ret_fuente,
              plazo_capital: data.plazo_capital,
              plazo_interes: data.plazo_interes,
              periodos_muertos: data.periodos_muertos,
              periodos_gracia: data.periodos_gracia,
              tasa_interes_inversion: data.tasa_interes_inversion,
              indicativo_forma_pago_int: data.indicativo_forma_pago_int,
              indicativo_reinversion: data.indicativo_reinversion,
              observaciones: data.observaciones,
              telefono: data.telefono,
              email: data.email,
              id_proyecto: detalle.id,
              valor_inversion_proyecto: detalle.valor,
            };

            // Añade campos condicionalmente si vienen del stateData
            if (stateData?.ids_inversiones_originales) {
              base.ids_inversiones_originales = stateData.ids_inversiones_originales;
              base.indicativo_reinversion = stateData.indicador_reinversion;
              base.indicativo_reinversion = stateData.indicador_reinversion;
              base.indicativo_reinversion = stateData.indicador_reinversion;
            }


            return base;
          });

          if (accion === 'crear') {
            dispatch(
              onCreate({
                params: { inversiones: inversionesFinales },
                handleOnClose,
              })
            );
          }
        
          setSubmitting(false);
        }}
        
        
        
      >
        {({ values, initialValues, setFieldValue }) => {
          const valorOriginal = stateData?.valor
            ? Number(stateData.valor)
            : null;
          const valorActual = values?.valor_inversion
            ? Number(values.valor_inversion)
            : null;
          let warningReinversion = '';
          if (
            valorOriginal !== null &&
            valorActual !== null &&
            valorActual !== valorOriginal
          ) {
            const diferencia = valorActual - valorOriginal;
            const diferenciaFormateada =
              (diferencia > 0 ? '' : '-') +
              ' $' +
              Math.abs(diferencia).toLocaleString('es-CO');

            warningReinversion = `El valor a reinvertir tiene una diferencia de ${diferenciaFormateada} respecto al valor cancelado`;
          }          

          return (
            <InversionForm
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
              warningReinversion={warningReinversion}
            />
          );
        }}

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
