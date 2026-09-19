import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppScrollbar from '../../../../@crema/components/AppScrollbar';
import {
  resetConceptoPorProyectoActual,
  onCopiarValores,
  onGetConceptosParaPeriodo,
} from '../../../../@crema/redux/features/conceptoPorProyecto/conceptoPorProyectoSlice';
import Slide from '@mui/material/Slide';
import ConceptoPorProyectoForm from './ConceptoPorProyectoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';
import Swal from 'sweetalert2';

// ------------------ UI ------------------
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const useStyles = makeStyles(() => ({
  dialogBox: {
    position: 'absolute',
    '& .MuiDialog-paperWidthSm': {
      maxWidth: 600,
      width: '100%',
    },
    '& .MuiTypography-h6': {
      fontWeight: Fonts.LIGHT,
    },
  },
}));

const ConceptoPorProyectoCreador = (props) => {
  const {
    ConceptoPorProyecto,
    handleOnClose,
    accion,
    updateColeccion,
    titulo,
    tiposProyectos,
    registros,
    proyectos,
    ciudades,
  } = props;

  const dispatch = useDispatch();
  const classes = useStyles();
  const [showForm, setShowForm] = useState(false);

  const selectedRow = useSelector((state) => state.conceptoPorProyecto.conceptosPorProyecto);
  const loading = useSelector((state) => state.conceptoPorProyecto.loading);

  // -------- Calcular año/mes sugeridos según regla --------
  const anioSistema = useMemo(() => new Date().getFullYear(), []);

  // -------- Validación (sin cambiar tu lógica) --------
  const validationSchema = useMemo(
    () =>
      yup.object({
        id_proyecto: yup
          .mixed()
          .transform((v) => (v === '' || v === undefined ? null : v))
          .required('Requerido'),
        anio: yup
          .number()
          .transform((v, o) => (o === '' || o === null || o === undefined ? NaN : Number(o)))
          .typeError('Año inválido')
          .min(anioSistema, `El año debe ser ≥ ${anioSistema}`)
          .required('Requerido'),
        mes: yup
          .number()
          .transform((v, o) => (o === '' || o === null || o === undefined ? NaN : Number(o)))
          .typeError('Mes inválido')
          .min(1, 'Mes inválido')
          .max(12, 'Mes inválido')
          .required('Requerido'),
        anio_origen: yup
          .number()
          .min(anioSistema, `El año debe ser ≥ ${anioSistema}`)
          .required('Requerido'),
        mes_origen: yup
          .number()
          .min(1, 'Mes inválido')
          .max(12, 'Mes inválido')
          .required('Requerido'),
        // Validación que tu (anio,mes) cumpla EXACTAMENTE tu regla de sugerido
      })
  );

  // -------- Ciclo de vida --------
  const initializeSelectedRow = () => {
    dispatch(resetConceptoPorProyectoActual());
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
    let id_proyecto = ConceptoPorProyecto?.id_proyecto;
    let anio = ConceptoPorProyecto?.anio;
    let mes = ConceptoPorProyecto?.mes;

    if ((accion === 'editar')) {
      dispatch(onGetConceptosParaPeriodo( {id_proyecto, anio, mes} ));
    } 
  }, [accion, dispatch, ConceptoPorProyecto]);

  return (
    showForm && (
      <Dialog
        open={showForm}
        onClose={handleOnClose}
        aria-labelledby='simple-modal-title'
        TransitionComponent={Transition}
        aria-describedby='simple-modal-description'
        className={classes.dialogBox}
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
              id_proyecto: selectedRow ? selectedRow.id_proyecto : '',
              codigo_proyecto: selectedRow ? selectedRow?.codigo_proyecto : '',
              ciudad_id: selectedRow ? selectedRow?.ciudad_id : '',
              id_tipo_proyecto: selectedRow ? selectedRow?.id_tipo_proyecto : '',
              anio_origen: selectedRow ? selectedRow?.anio_origen : '',
              mes_origen: selectedRow ? selectedRow?.mes_origen : '',
              anio: selectedRow ? selectedRow.anio : '',
              mes: selectedRow ? selectedRow.mes : '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (data, { setSubmitting }) => {
              setSubmitting(true);
              try {
                const mm = String(data.mes).padStart(2, '0');
                const aa = data.anio;
                handleOnClose?.();
                const confirma = await Swal.fire({
                  title: 'Confirmar copia',
                  html: `Confirma generacion de informacion para <b>${aa}-${mm}</b>`,
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'SÍ',
                  cancelButtonText: 'NO',
                  target: document.body,
                });

                if (!confirma.isConfirmed) {
                  setSubmitting(false);
                  return;
                }

                // 1) Preview (replace=false)
                let resp = await dispatch(
                  onCopiarValores({
                    id_proyecto: data.id_proyecto,
                    anio_origen: data.anio_origen,
                    mes_origen: data.mes_origen,
                    anio_destino: data.anio,
                    mes_destino: data.mes,
                    replace: false,
                  })
                ).unwrap();

                if (resp.status === 'exists') {
                  const reemplazar = await Swal.fire({
                    title: 'Datos existentes',
                    html: 'Desea reemplazar la informacion?',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, reemplazar',
                    cancelButtonText: 'No',
                    target: document.body,
                  });

                  if (!reemplazar.isConfirmed) {
                    await Swal.fire({
                      title: 'Proceso cancelado',
                      text: 'No se realizó la copia de información.',
                      confirmButtonColor: '#3085d6',
                      target: document.body,
                    });
                    setSubmitting(false);
                    return;
                  }

                  // 2) Reemplazo (replace=true)
                  resp = await dispatch(
                    onCopiarValores({
                      id_proyecto: data.id_proyecto,
                      anio_origen: data.anio_origen,
                      mes_origen: data.mes_origen,
                      anio_destino: data.anio,
                      mes_destino: data.mes,
                      replace: true,
                    })
                  ).unwrap();
                                    
                } 
              } catch (e) {
                console.error(e);
                await Swal.fire({
                  title: 'Error realizando la copia',
                  text: e.message || 'Ocurrió un error inesperado.',
                  confirmButtonColor: '#3085d6',
                  target: document.body,
                });
              } finally {
                updateColeccion?.();
                handleOnClose?.();
                setSubmitting(false);
              }
            }}


                      >
                        {({ values, initialValues, setFieldValue }) => (
                          <ConceptoPorProyectoForm
                            values={values}
                            setFieldValue={setFieldValue}
                            handleOnClose={handleOnClose}
                            titulo={titulo}
                            accion={accion}
                            initialValues={initialValues}
                            tiposProyectos={tiposProyectos}
                            proyectos={proyectos}
                            ciudades={ciudades}
                            ConceptoPorProyecto={ConceptoPorProyecto}
                            conceptos={selectedRow}
                          />
                        )}
                      </Formik>
                    </AppScrollbar>
                  </Dialog>
                )
              );
            };

ConceptoPorProyectoCreador.propTypes = {
  ConceptoPorProyecto: PropTypes.any, // puede venir objeto o indefinido
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  tiposProyectos: PropTypes.any,
  registros: PropTypes.any,
  proyectos: PropTypes.any,
  ciudades: PropTypes.any,
};

export default ConceptoPorProyectoCreador;
