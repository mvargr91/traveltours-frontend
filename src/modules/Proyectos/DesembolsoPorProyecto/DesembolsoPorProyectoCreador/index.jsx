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
  resetProyectosDesembolsosActual,
}  from '../../../../@crema/redux/features/proyectoDesembolso/proyectoDesembolsoSlice';
import { onGetColeccionLigera as onGetCiudades } from '../../../../@crema/redux/features/ciudades/ciudadesSlice';
import { onGetColeccionLigera as onGetTiposProyectos } from '../../../../@crema/redux/features/tipoProyecto/tiposProyectosSlice';
import { onGetColeccionLigera as onGetSectoresProyectos } from '../../../../@crema/redux/features/sectorProyecto/sectoresProyectosSlice';
import { onGetColeccionLigera as onGetTposInversiones } from '../../../../@crema/redux/features/categoriaInversion/categoriaInversionesSlice';
import { onGetColeccionLigera as onGetParametros } from '../../../../@crema/redux/features/parametroConstante/parametroConstanteSlice';
import { onGetColeccionLigera as onGetVehiculoInversion } from '../../../../@crema/redux/features/VehiculoInversion/vehiculoInversionSlice';
import { onGetColeccionLigera as onGetComunidadEnergetica } from '../../../../@crema/redux/features/comunidadEnergetica/comunidadEnergeticaSlice';
import Slide from '@mui/material/Slide';
import ProyectoForm from './DesembolsoPorProyectoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';
import { Box } from '@mui/system';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});


const ProyectoCreador = (props) => {
  const { DesembolsoPorProyecto, handleOnClose, accion, updateColeccion, titulo, proyectos, headProyecto} = props;
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
    fecha_desembolso: yup.string().required('Requerido'),
    concepto_desembolso: yup.string().required('Requerido'),
    valor_total_proyecto: yup.number().nullable(),
    valor_desembolso: yup
      .number()
      .typeError('Debe ser un número válido')
      .required('Requerido')
      .positive('Debe ser un valor positivo')
      .test(
        'no-mayor-que-proyecto',
        'Valor desembolso superior al valor del proyecto',
        function (value) {
          const { valor_total_proyecto } = this.parent;
          if (value == null || value === '') return true;
          if (valor_total_proyecto == null || valor_total_proyecto === '') return true;
          return Number(value) <= Number(valor_total_proyecto);
        }
      ),
  });

  // const classes = useStyles(props);
  const [tipoInversionDefault, setTipoInversionDefault] = useState(null);
  const selectedRow = useSelector((state) =>  state.proyectoDesembolso.proyectoDesembolsoActual);  
  const loading = useSelector((state) =>  state.proyectoDesembolso.loading);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);
  const { coleccionLigera: tiposProyectos } = useSelector((state) => state.tiposProyectos);
  const { coleccionLigera: sectoresProyectos } = useSelector((state) => state.sectoresProyectos);
  const { coleccionLigera: categoriasInversiones } = useSelector((state) => state.categoriasInversiones);
  const { coleccionLigera: parametroConstantes } = useSelector((state) => state.parametroConstantes);
  const { coleccionLigera: vehiculosInversiones } = useSelector((state) => state.vehiculoInversion);
  const { coleccionLigera: comunidadesEnergeticas } = useSelector((state) => state.comunidadEnergetica);
  const initializeSelectedRow = () => {
    dispatch(resetProyectosDesembolsosActual()); 
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
      dispatch(onShow(DesembolsoPorProyecto));
    }
  }, [accion, dispatch, DesembolsoPorProyecto]);

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
              id_proyecto: selectedRow ? selectedRow.id_proyecto : headProyecto?.id_proyecto,
              fecha_desembolso: selectedRow ? selectedRow.fecha_desembolso : '',
              concepto_desembolso: selectedRow ? selectedRow.concepto_desembolso : '',
              proveedor_desembolso: selectedRow ? selectedRow.proveedor_desembolso : '',
              valor_desembolso: selectedRow ? selectedRow.valor_desembolso : null,
              codigo_proyecto: headProyecto?.codigo_proyecto,
              nombre_proyecto: headProyecto?.nombre_proyecto,
              tipo_proyecto: headProyecto?.tipo_proyecto ,
              ciudad_proyecto: headProyecto?.ciudad_proyecto ,
              valor_total_proyecto: headProyecto?.valor_total_proyecto ,
              potencia: headProyecto?.potencia,           
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
  DesembolsoPorProyecto: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ProyectoCreador;
