import React, { useEffect, useRef, useState, useMemo  } from 'react';
import Dialog from '@mui/material/Dialog';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppScrollbar from '../../../../@crema/components/AppScrollbar';
import {
  onShow,
  onUpdate,
  onCreate,
  resetActividadPorProyectoActual,
}  from '../../../../@crema/redux/features/actividadPorProyecto/actividadPorProyectoSlice';
import Slide from '@mui/material/Slide';
import ActividadPorProyectoForm from './ActividadPorProyectoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});



const ActividadPorProyectoCreador = (props) => {
  const { ActividadPorProyecto, handleOnClose, accion, updateColeccion, titulo, tiposProyectos, registros, headProyecto, proyectos, ciudades } = props;
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
    id_proyecto: yup.string().required('Requerido'),
    id_etapa_proyecto: yup.string().required('Requerido'),
    id_actividad_proyecto: yup.string().required('Requerido'),
    fecha_ejecucion: yup
    .string()
    .required('Requerido')
    .test('fecha-no-futura', 'Fecha ejecucion debe ser menor o igual a la fecha del sistema.', function (value) {
      if (!value) return true;
      const fechaIngresada = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return fechaIngresada <= hoy;
    }),
    estado_actividad: yup.string().required('Requerido'),
  });


  // const classes = useStyles(props);

  const selectedRow = useSelector((state) =>  state.actividadPorProyecto.ActividadPorProyectoActual);  
  const loading = useSelector((state) =>  state.actividadPorProyecto.loading);

  const initializeSelectedRow = () => {
    dispatch(resetActividadPorProyectoActual()); 
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
    } 
  }, [selectedRow, accion]);

  useEffect(() => {
    if ((accion === 'editar') || (accion === 'ver') && ActividadPorProyecto?.id) {
      dispatch(onShow(ActividadPorProyecto?.id));
    }else{
      setShowForm(true);
    }
  }, [accion, dispatch, ActividadPorProyecto?.id]);


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
              id_proyecto: selectedRow ? selectedRow.id_proyecto : ActividadPorProyecto?.id_proyecto,
              codigo_proyecto: ActividadPorProyecto ? ActividadPorProyecto?.codigo_proyecto : '',
              ciudad_id: ActividadPorProyecto ? ActividadPorProyecto?.ciudad_id : '',
              id_tipo_proyecto: ActividadPorProyecto ? ActividadPorProyecto?.id_tipo_proyecto : '',
              id_etapa_proyecto: selectedRow ? selectedRow.id_etapa_proyecto : ActividadPorProyecto?.id_etapa_proyecto ,
              nombre_actividad: ActividadPorProyecto ? ActividadPorProyecto?.nombre_actividad : '',
              id_actividad_proyecto: selectedRow ? selectedRow.id_actividad_proyecto : ActividadPorProyecto?.id_actividad_proyecto,
              fecha_ejecucion: selectedRow ? selectedRow.fecha_ejecucion : '',
              fecha_compromiso: selectedRow ? selectedRow.fecha_compromiso : '',
              observaciones: selectedRow ? selectedRow.observaciones : '',
              nombre_archivo: selectedRow ? selectedRow.nombre_archivo : '',
              estado_actividad: selectedRow ? selectedRow.estado_actividad : '',
              borrar_archivo: 0, 
              archivo: '',
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
              <ActividadPorProyectoForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                accion={accion}
                initialValues={initialValues}
                tiposProyectos={tiposProyectos}
                proyectos={proyectos}
                ciudades={ciudades}
                ActividadPorProyecto={ActividadPorProyecto}
              />
            )}
          </Formik>
        </AppScrollbar>
      </Dialog>
    )
  );
};

ActividadPorProyectoCreador.propTypes = {
  ActividadPorProyecto: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ActividadPorProyectoCreador;
