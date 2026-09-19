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
  resetProyectoActual,
}  from '../../../../@crema/redux/features/Proyecto/proyectosSlice';
import { onGetColeccionLigera as onGetCiudades } from '../../../../@crema/redux/features/ciudades/ciudadesSlice';
import { onGetColeccionLigera as onGetTiposProyectos } from '../../../../@crema/redux/features/tipoProyecto/tiposProyectosSlice';
import { onGetColeccionLigera as onGetSectoresProyectos } from '../../../../@crema/redux/features/sectorProyecto/sectoresProyectosSlice';
import { onGetColeccionLigera as onGetTposInversiones } from '../../../../@crema/redux/features/categoriaInversion/categoriaInversionesSlice';
import { onGetColeccionLigera as onGetParametros } from '../../../../@crema/redux/features/parametroConstante/parametroConstanteSlice';
import { onGetColeccionLigera as onGetVehiculoInversion } from '../../../../@crema/redux/features/VehiculoInversion/vehiculoInversionSlice';
import { onGetColeccionLigera as onGetComunidadEnergetica } from '../../../../@crema/redux/features/comunidadEnergetica/comunidadEnergeticaSlice';
import Slide from '@mui/material/Slide';
import ProyectoForm from './ProyectoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';
import { Box } from '@mui/system';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});


const ProyectoCreador = (props) => {
  const { Proyecto, handleOnClose, accion, updateColeccion, titulo, proyectos} = props;
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

  const validationSchema = yup.object({
    nombre: yup.string().required('Requerido'),
    codigo_proyecto: yup
      .string()
      .required('Requerido')
      .test('codigo-proyecto-existe', 'Código proyecto ya registrado para otro proyecto', function (value) {
        const { id } = this.parent; 
        return !proyectos.some(
          (g) => g.codigo_proyecto === value
        );
      }),
    ciudad_id: yup.string().required('Requerido'),
    id_tipo_proyecto: yup.string().required('Requerido'),
    id_sector_proyecto: yup.string().required('Requerido'),
    potencia: yup.string().required('Requerido'),
    id_vehiculo_inversion: yup.number().required('Requerido'),
    fecha_inicio_proyecto: yup
    .date()
    .nullable()
    .transform((curr, orig) => (orig === '' ? null : new Date(orig))),
    generacion_anual: yup
        .number()
        .required('Requerido')
        .positive('Debe ser un valor positivo'),
    generacion_mensual: yup
        .number()
        .required('Requerido')
        .positive('Debe ser un valor positivo'),
    valor_total_proyecto: yup
        .number()
        .required('Requerido')
        .positive('Debe ser un valor positivo'),
    indicativo_plan_padrino: yup.string().required('Requerido'),
    id_tipo_inversion: yup
      .number()
      .nullable()
      .when('indicativo_plan_padrino', {
        is: 'S',
        then: (schema) =>
          schema.required('Requerido cuando el plan padrino es S'),
        otherwise: (schema) =>
          schema.nullable().notRequired(),
      }),

    valor_inversion_proyecto: yup
      .number()
      .nullable()
      .when('indicativo_plan_padrino', {
        is: 'S',
        then: (schema) =>
          schema
            .required('Requerido cuando el plan padrino es S')
            .positive('Debe ser un valor positivo')
            .test(
              'is-less-than-total',
              'El valor de inversión externa no puede ser superior al total del proyecto',
              function (value) {
                const { valor_total_proyecto } = this.parent;
                if (value == null || valor_total_proyecto == null) return true;
                return value <= valor_total_proyecto;
              }
            ),
        otherwise: (schema) =>
          schema.nullable().notRequired(),
      }),    
    factor_planta: yup
      .number()
      .typeError('Debe ser un número')
      .nullable()
      .min(0, 'No puede ser negativo')
      .max(99.99, 'No puede ser mayor a 99.99'),
  });

  const validationSchemaEditar = yup.object({
    nombre: yup.string().required('Requerido'),
    codigo_proyecto: yup
      .string()
      .required('Requerido')
      .test(
        'codigo-proyecto-existe',
        'Código proyecto ya registrado para otro proyecto',
        function (value) {
          const { id } = this.parent;
          return !proyectos.some(
            (g) => g.codigo_proyecto === value && g.id !== id
          );
        }
      ),
    ciudad_id: yup.string().required('Requerido'),
    id_tipo_proyecto: yup.string().required('Requerido'),
    indicativo_plan_padrino: yup.string().required('Requerido'),
    id_sector_proyecto: yup.string().required('Requerido'),
    potencia: yup.string().required('Requerido'),
    generacion_anual: yup
        .number()
        .required('Requerido')
        .positive('Debe ser un valor positivo'),
    generacion_mensual: yup
        .number()
        .required('Requerido')
        .positive('Debe ser un valor positivo'),
    id_vehiculo_inversion: yup.number().required('Requerido'),
    fecha_inicio_proyecto: yup
      .date()
      .nullable()
      .transform((curr, orig) => (orig === '' ? null : new Date(orig))),
    valor_total_proyecto: yup
      .number()
      .typeError('Debe ser un número')
      .required('Requerido')
      .positive('Debe ser un valor positivo'),
    id_tipo_inversion: yup
      .number()
      .nullable()
      .when('indicativo_plan_padrino', {
        is: 'S',
        then: (schema) =>
          schema.required('Requerido cuando el plan padrino es S'),
        otherwise: (schema) =>
          schema.nullable().notRequired(),
      }),

    valor_inversion_proyecto: yup
      .number()
      .nullable()
      .when('indicativo_plan_padrino', {
        is: 'S',
        then: (schema) =>
          schema
            .required('Requerido cuando el plan padrino es S')
            .positive('Debe ser un valor positivo')
            .test(
              'is-less-than-total',
              'El valor de inversión externa no puede ser superior al total del proyecto',
              function (value) {
                const { valor_total_proyecto } = this.parent;
                if (value == null || valor_total_proyecto == null) return true;
                return value <= valor_total_proyecto;
              }
            ),
        otherwise: (schema) =>
          schema.nullable().notRequired(),
      }),  
    factor_planta: yup
      .number()
      .typeError('Debe ser un número')
      .nullable()
      .min(0, 'No puede ser negativo')
      .max(99.99, 'No puede ser mayor a 99.99'),      
  });



  // const classes = useStyles(props);
  const [tipoInversionDefault, setTipoInversionDefault] = useState(null);
  const selectedRow = useSelector((state) =>  state.proyectos.ProyectoActual);  
  const loading = useSelector((state) =>  state.proyectos.loading);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);
  const { coleccionLigera: tiposProyectos } = useSelector((state) => state.tiposProyectos);
  const { coleccionLigera: sectoresProyectos } = useSelector((state) => state.sectoresProyectos);
  const { coleccionLigera: categoriasInversiones } = useSelector((state) => state.categoriasInversiones);
  const { coleccionLigera: parametroConstantes } = useSelector((state) => state.parametroConstantes);
  const { coleccionLigera: vehiculosInversiones } = useSelector((state) => state.vehiculoInversion);
  const { coleccionLigera: comunidadesEnergeticas } = useSelector((state) => state.comunidadEnergetica);
  const initializeSelectedRow = () => {
    dispatch(resetProyectoActual()); 
  };
  useEffect(() => {
    initializeSelectedRow();
  }, []);

  console.log(selectedRow)

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
      dispatch(onShow(Proyecto));
    }
  }, [accion, dispatch, Proyecto]);

    useEffect(() => {
      dispatch(onGetCiudades());
      dispatch(onGetTiposProyectos());
      dispatch(onGetSectoresProyectos());
      dispatch(onGetTposInversiones());
      dispatch(onGetParametros());      
      dispatch(onGetVehiculoInversion());
      dispatch(onGetComunidadEnergetica());
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

  const adjustUTCDateToLocal = (date) => {
    if (!date) return null;
  
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-'); // Extraer partes de la fecha
      return new Date(year, month - 1, day); // Crear fecha sin afectar la zona horaria
    }
  
    return date instanceof Date && !isNaN(date) ? date : null;
  };



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
        scroll="paper"
      >
        <Box  >
          <Formik
            initialStatus={true}
            enableReinitialize={true}
            validateOnBlur={false}
            initialValues={{
              id: selectedRow ? selectedRow.id : '',
              nombre: selectedRow ? selectedRow.nombre : '',
              codigo_proyecto: selectedRow ? selectedRow.codigo_proyecto : '',
              ciudad_id: selectedRow ? selectedRow.ciudad_id : '',
              coordenadas_ubicacion: selectedRow ? selectedRow.coordenadas_ubicacion : '',
              fecha_inicio_proyecto: selectedRow?.fecha_inicio_proyecto ? (selectedRow.fecha_inicio_proyecto) : null,
              id_tipo_proyecto: selectedRow ? selectedRow.id_tipo_proyecto : '',
              id_sector_proyecto: selectedRow ? selectedRow.id_sector_proyecto : '',
              potencia: selectedRow ? selectedRow.potencia : '',
              generacion_anual: selectedRow ? selectedRow.generacion_anual : '',
              generacion_mensual: selectedRow ? selectedRow.generacion_mensual : '',
              nombre_comercializador: selectedRow ? selectedRow.nombre_comercializador : '',
              nombre_operador: selectedRow ? selectedRow.nombre_operador : '',
              id_tipo_inversion: selectedRow ? selectedRow.id_tipo_inversion : Number(tipoInversionDefault),
              indicativo_plan_padrino: selectedRow ? selectedRow.indicativo_plan_padrino : 'N',
              valor_total_proyecto: selectedRow ? selectedRow.valor_total_proyecto : '',
              valor_inversion_proyecto: selectedRow ? selectedRow.valor_inversion_proyecto : '',
              id_vehiculo_inversion: selectedRow ? selectedRow.id_vehiculo_inversion : '',
              id_comunidad_energetica: selectedRow ? selectedRow.id_comunidad_energetica : '',
              tipo_generacion: selectedRow ? selectedRow.tipo_generacion : '',
              costo_nivelado: selectedRow ? selectedRow.costo_nivelado : '',
              factor_planta: selectedRow ? selectedRow.factor_planta : '',
              anios_depreciacion: selectedRow ? selectedRow.anios_depreciacion : '',
              id_ultima_etapa_proyecto: selectedRow ? selectedRow.id_ultima_etapa_proyecto : '',
              observaciones: selectedRow ? selectedRow.observaciones : '',
              estado_proyecto: selectedRow ? selectedRow.estado_proyecto === 1 ? '1' : '0' : '1',
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
              <ProyectoForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                ciudades={ciudades}
                tiposProyectos={tiposProyectos}
                sectoresProyectos={sectoresProyectos}
                categoriasInversiones={categoriasInversiones}
                parametros={parametroConstantes}
                vehiculosInversiones={vehiculosInversiones}
                comunidadesEnergeticas={comunidadesEnergeticas}
                accion={accion}
                tipoInversionDefault={tipoInversionDefault}
                initialValues={initialValues}
              />
            )}
          </Formik>
        </Box>
      </Dialog>
    )
  );
};

ProyectoCreador.propTypes = {
  Proyecto: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ProyectoCreador;
