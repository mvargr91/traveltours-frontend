import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppScrollbar from '../../../../@crema/components/AppScrollbar';
import {
  resetConceptoPorProyectoActual,
  onGetConceptosParaPeriodo,  
  onCalcular,
  onGuardar,
} from '../../../../@crema/redux/features/conceptoPorProyecto/conceptoPorProyectoSlice';
import Slide from '@mui/material/Slide';
import ConceptoPorProyectoForm from './ConceptoPorProyectoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
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

const ConceptoPorProyectoValores = (props) => {
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
    parametrosMensuales,
    parametrosConstantes,
  } = props;

  const dispatch = useDispatch();
  const classes = useStyles();
  const [showForm, setShowForm] = useState(false);

  const selectedRow = useSelector(
    (state) => state.conceptoPorProyecto.conceptosPorProyecto,
  );
  const camposEnergia = useSelector(
    (state) => state.conceptoPorProyecto.camposEnergia,
  );
  const selectedRowCalculos = useSelector(
    (state) => state.conceptoPorProyecto.conceptosCalculados,
  );
  const loading = useSelector((state) => state.conceptoPorProyecto.loading);

  const anioSistema = useMemo(() => new Date().getFullYear(), []);


  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        id_proyecto: yup
          .mixed()
          .transform((v) => (v === '' || v === undefined ? null : v))
          .required('Requerido'),
        precio_energia_comunidad: yup
          .number()
          .typeError('Solo acepta valores numéricos')
          .transform((v, originalValue) =>
            originalValue === '' || originalValue === null ? 0 : v,
          )
          .min(0, 'No puede ser negativa')
          .required('Requerido'),
        precio_energia_bolsa: yup
          .number()
          .typeError('Solo acepta valores numéricos')
          .transform((v, originalValue) =>
            originalValue === '' || originalValue === null ? 0 : v,
          )
          .min(0, 'No puede ser negativa')
          .required('Requerido'),
        // Energia comercializada comunidad (opcional, pero numérica)
        energia_comercializada_comunidad: yup
          .number()
          .typeError('Solo acepta valores numéricos')
          .transform((v, originalValue) =>
            originalValue === '' || originalValue === null ? 0 : v,
          )
          .min(0, 'No puede ser negativa')
          .nullable(),

        // Energia comercializada bolsa (opcional, pero numérica)
        energia_comercializada_bolsa: yup
          .number()
          .typeError('Solo acepta valores numéricos')
          .transform((v, originalValue) =>
            originalValue === '' || originalValue === null ? 0 : v,
          )
          .min(0, 'No puede ser negativa')
          .nullable()
          .test(
            'energia-required',
            'Se requiere dato energia comercializada bolsa o comunidad energetica',
            function (value) {
              const { energia_comercializada_comunidad } = this.parent;

              const energiaComunidad = Number(energia_comercializada_comunidad || 0);
              const energiaBolsa = Number(value || 0);

              // Si comunidad = 0 Y bolsa = 0 -> error
              return energiaComunidad !== 0 || energiaBolsa !== 0;
            },
          ),
      }),
    [],
  );

  useEffect(() => {
    if (accion === 'crear' || accion === 'editar') {
      dispatch(resetConceptoPorProyectoActual());
    }
  }, [dispatch, accion]);

  // Mostrar formulario
  useEffect(() => {
    if (selectedRow) {
      setShowForm(true);
    } else if (accion === 'crear') {
      setShowForm(true);
    }
  }, [selectedRow, accion]);

  // Cargar conceptos de BD para el periodo cuando es editar
  useEffect(() => {
    const id_proyecto = ConceptoPorProyecto?.id_proyecto;
    const anio = ConceptoPorProyecto?.anio;
    const mes = ConceptoPorProyecto?.mes;

    if (accion === 'editar' && id_proyecto && anio && mes) {
      dispatch(onGetConceptosParaPeriodo({ id_proyecto, anio, mes }));
    }
  }, [accion, dispatch, ConceptoPorProyecto]);


  // IDs de los 4 conceptos de energía
  const idsConceptosEnergia = useMemo(() => {
    if (!parametrosConstantes || !Array.isArray(parametrosConstantes.datos)) {
      return [];
    }

    const getId = (codigo) => {
      const row = parametrosConstantes.datos.find(
        (p) => p.codigo_parametro === codigo,
      );
      return row ? Number(row.valor_parametro) : null;
    };

    return [
      getId('ID_CONCEPTO_PRECIO_COMUNIDAD'),
      getId('ID_CONCEPTO_KWH_COMUNIDAD'),
      getId('ID_CONCEPTO_PRECIO_BOLSA'),
      getId('ID_CONCEPTO_KWH_BOLSA'),
    ].filter((v) => v != null);
  }, [parametrosConstantes]);

  // Normalizar conceptos que vienen de Redux (selectedRow)
  const conceptosIniciales = useMemo(() => {
    if (!Array.isArray(selectedRow)) return [];

    const filtrados = selectedRow.filter((c) => {
      const idC = Number(c.id_concepto ?? c.id);
      return !idsConceptosEnergia.includes(idC); // excluimos los 4 de energía
    });

    return filtrados.map((c) => ({
      ...c,
      secuencia: Number(c.secuencia ?? c.secuencia_valor ?? 0),
      concepto: c.nombre ?? c.concepto ?? '',
      valor:
        c.valor !== undefined
          ? c.valor
          : c.valor_concepto_proyecto ?? 0,
    }));
  }, [selectedRow, idsConceptosEnergia]);


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
              // Cabecera
              id: ConceptoPorProyecto ? ConceptoPorProyecto.id : '',
              anio: ConceptoPorProyecto ? ConceptoPorProyecto.anio : '',
              mes: ConceptoPorProyecto ? ConceptoPorProyecto.mes : '',
              id_proyecto: ConceptoPorProyecto
                ? ConceptoPorProyecto.id_proyecto
                : '',
              codigo_proyecto: ConceptoPorProyecto
                ? ConceptoPorProyecto.codigo_proyecto
                : '',
              ciudad_id: ConceptoPorProyecto
                ? ConceptoPorProyecto.ciudad_id
                : '',
              id_tipo_proyecto: ConceptoPorProyecto
                ? ConceptoPorProyecto.id_tipo_proyecto
                : '',

              // Energía / precios: prioridad a BD, luego camposEnergia
              energia_comercializada_comunidad:
                (ConceptoPorProyecto &&
                  ConceptoPorProyecto.energia_comercializada_comunidad !== null &&
                  ConceptoPorProyecto.energia_comercializada_comunidad !== undefined)
                  ? ConceptoPorProyecto.energia_comercializada_comunidad
                  : (camposEnergia?.energia_comercializada_comunidad ?? ''),

              energia_comercializada_bolsa:
                (ConceptoPorProyecto &&
                  ConceptoPorProyecto.energia_bolsa !== null &&
                  ConceptoPorProyecto.energia_bolsa !== undefined)
                  ? ConceptoPorProyecto.energia_bolsa
                  : (camposEnergia?.energia_comercializada_bolsa ?? ''),

              precio_energia_comunidad:
                (ConceptoPorProyecto &&
                  ConceptoPorProyecto.precio_energia_comunidad !== null &&
                  ConceptoPorProyecto.precio_energia_comunidad !== undefined)
                  ? ConceptoPorProyecto.precio_energia_comunidad
                  : (camposEnergia?.precio_energia_comunidad ?? ''),

              precio_energia_bolsa:
                (ConceptoPorProyecto &&
                  ConceptoPorProyecto.precio_energia_bolsa !== null &&
                  ConceptoPorProyecto.precio_energia_bolsa !== undefined)
                  ? ConceptoPorProyecto.precio_energia_bolsa
                  : (camposEnergia?.precio_energia_bolsa ?? ''),

              // El array de conceptos lo inicializamos con lo que vino del periodo
              conceptos: conceptosIniciales,
            }}
            validationSchema={validationSchema}
            onSubmit={(data, { setSubmitting }) => {
              setSubmitting(true);
              dispatch(onGuardar({params : data , updateColeccion, handleOnClose}));
              setSubmitting(false);
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
                parametrosMensuales={parametrosMensuales}
                parametrosConstantes={parametrosConstantes}
                ConceptoPorProyecto={ConceptoPorProyecto}
                conceptos={selectedRow}
                onRecalcular={(formValues) =>
                  dispatch(onCalcular({ params: formValues }))
                }
              />
            )}
          </Formik>
        </AppScrollbar>
      </Dialog>
    )
  );
};

ConceptoPorProyectoValores.propTypes = {
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

export default ConceptoPorProyectoValores;
