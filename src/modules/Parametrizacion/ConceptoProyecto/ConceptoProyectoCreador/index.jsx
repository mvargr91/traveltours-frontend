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
  resetConceptoProyectoActual,
}  from '../../../../@crema/redux/features/conceptoProyecto/conceptoProyectoSlice';
import Slide from '@mui/material/Slide';
import ConceptoProyectoForm from './ConceptoProyectoForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});



const ConceptoProyectoCreador = (props) => {
  const { ConceptoProyecto, handleOnClose, accion, updateColeccion, titulo, registros, tiposProyectos  } = props;
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

  const validationSchema = useMemo(() => {
    const canon = (v) =>
      (v ?? '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); 

    return yup
      .object({
        id: yup.mixed().nullable(),
        nombre: yup.string().required('Requerido'),
        secuencia: yup.string().required('Requerido'),
        id_tipo_proyecto: yup.string().required('Requerido'),
        indicativo_tipo_concepto: yup.string().required('Requerido'),
        indicativo_tipo_valor: yup.string().required('Requerido'),
        indicativo_tipo_linea: yup.string().required('Requerido'),
        indicativo_presentacion_cons: yup.string().required('Requerido'),
        indicativo_concepto_calculado: yup.string().required('Requerido'),
        indicativo_permite_copia: yup.string().required('Requerido'),
        indicativo_concepto_editable: yup.string().required('Requerido'),
        estado: yup.string().required('Requerido'),
        valor_mensual_concepto: yup
        .number()
        .nullable(),
        porcentaje: yup
        .number()
        .typeError('Debe ser un número')
        .nullable()
        .transform((value, originalValue) =>
          originalValue === '' || originalValue === null ? null : value
        )
        .min(0, 'No puede ser negativo')
        .max(99.99, 'No puede ser mayor a 99.99'),
      })
      // ===== Control: porcentaje XOR valor_mensual (no ambos)
      .test(
        'porcentaje-xor-valor-mensual',
        'Solo se acepta porcentaje o valor mensual, no ambos.',
        function (values) {
          const porcentaje = (values?.porcentaje);
          const valorMensual = (values?.valor_mensual_concepto);

          const pctNoCero = Number.isFinite(porcentaje) && porcentaje !== 0;
          const vmNoCero = Number.isFinite(valorMensual) && valorMensual !== 0;

          if (pctNoCero && vmNoCero) {
            return this.createError({
              path: 'porcentaje', // o 'valor_mensual' si prefieres pintarlo allá
              message: 'Solo se acepta porcentaje o valor mensual, no ambos.',
            });
          }
          return true;
        }
      )
      .test(
        'operador-requerido-con-porcentaje-o-parametro',
        'Se requiere operador con porcentaje o parametro de referencia.',
        function (values) {
          const porcentaje = Number(values?.porcentaje ?? 0);
          const pctNoCero = Number.isFinite(porcentaje) && porcentaje !== 0;

          const paramRef = values?.parametro_referencia;
          const tieneParamRef = paramRef !== null && paramRef !== undefined && String(paramRef).trim() !== '';

          console.log('paramRef ', paramRef);
          console.log('tieneParamRef ', tieneParamRef);

          const operador = values?.indicativo_operador;
          const tieneOperador = operador !== null && operador !== undefined && String(operador).trim() !== '';

          console.log('tieneOperador ', tieneOperador);


          if ((pctNoCero || tieneParamRef) && !tieneOperador) {
            return this.createError({
              path: 'indicativo_operador',
              message: 'Se requiere operador con porcentaje o parametro de referencia.',
            });
          }
          return true;
        }
      )
      // VALIDACIÓN DE PARAMETROS PROYECCIÓN.
      .test(
        'operador-requerido-con-porcentaje-o-parametro',
        'Se requiere operador con porcentaje o parametro de referencia.',
        function (values) {
          const porcentaje = Number(values?.porcentaje_proy ?? 0);
          const pctNoCero = Number.isFinite(porcentaje) && porcentaje !== 0;

          const paramRef = values?.parametro_referencia_proy;
          const tieneParamRef = paramRef !== null && paramRef !== undefined && String(paramRef).trim() !== '';

          const operador = values?.indicativo_operador_proy;
          const tieneOperador = operador !== null && operador !== undefined && String(operador).trim() !== '';

          if ((pctNoCero || tieneParamRef) && !tieneOperador) {
            return this.createError({
              path: 'indicativo_operador_proy',
              message: 'Se requiere operador con porcentaje o parametro de referencia.',
            });
          }
          return true;
        }
      )
      .test(
        'unique-secuencia-tipo',
        'Ya existe esta secuencia con el tipo de proyecto.',
        function (values) {
          const { id, secuencia, id_tipo_proyecto } = values || {};
          // si falta alguno, deja que otras reglas marquen "Requerido"
          if (!secuencia || !id_tipo_proyecto) return true;

          const key = `${canon(secuencia)}|${canon(id_tipo_proyecto)}`;

          const dup = (registros || []).some((r) => {
            const samePair =
              `${canon(r.secuencia)}|${canon(r.id_tipo_proyecto)}` === key;
            const notSelf = String(r.id) !== String(id ?? '');
            return samePair && notSelf;
          });

          if (dup) {
            // Pinta el error en 'secuencia' (puedes cambiar a 'id_tipo_proyecto' si prefieres)
            return this.createError({
              path: 'secuencia',
              message: 'Ya existe esta secuencia con el tipo de proyecto.',
            });
          }
          return true;
        }
      );
  }, [registros]);

  const selectedRow = useSelector((state) =>  state.conceptoProyecto.ConceptoProyectoActual);  

  const initializeSelectedRow = () => {
    dispatch(resetConceptoProyectoActual()); 
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
      dispatch(onShow(ConceptoProyecto));
    }
  }, [accion, dispatch, ConceptoProyecto]);

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
              secuencia: selectedRow ? selectedRow.secuencia : '',
              id_tipo_proyecto: selectedRow ? selectedRow.id_tipo_proyecto : '',
              indicativo_tipo_concepto: selectedRow ? selectedRow.indicativo_tipo_concepto : '',
              indicativo_tipo_valor: selectedRow ? selectedRow.indicativo_tipo_valor : '',
              indicativo_tipo_linea: selectedRow ? selectedRow.indicativo_tipo_linea : 'D',
              indicativo_presentacion_cons: selectedRow ? selectedRow.indicativo_presentacion_cons : 'S',
              indicativo_concepto_calculado: selectedRow ? selectedRow.indicativo_concepto_calculado : 'N',
              indicativo_permite_copia: selectedRow ? selectedRow.indicativo_permite_copia : 'N',
              indicativo_concepto_editable: selectedRow ? selectedRow.indicativo_concepto_editable : 'N',
              valor_mensual_concepto: selectedRow ? selectedRow.valor_mensual_concepto : '',
              porcentaje: selectedRow ? selectedRow.porcentaje : '',
              parametro_referencia: selectedRow ? selectedRow.parametro_referencia : '',
              indicativo_valor_base: selectedRow ? selectedRow.indicativo_valor_base : '',
              indicativo_operador: selectedRow ? selectedRow.indicativo_operador : '',
              porcentaje_proy: selectedRow ? selectedRow.porcentaje_proy : '',
              parametro_referencia_proy: selectedRow ? selectedRow.parametro_referencia_proy : '',
              indicativo_valor_base_proy: selectedRow ? selectedRow.indicativo_valor_base_proy : '',
              indicativo_operador_proy: selectedRow ? selectedRow.indicativo_operador_proy : '',
              numero_anio_inicial_proy: selectedRow ? selectedRow.numero_anio_inicial_proy : '',
              numero_anios_proy: selectedRow ? selectedRow.numero_anios_proy : '',
              estado: selectedRow ? selectedRow.estado === 1 ? '1' : '0' : '1',
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
              <ConceptoProyectoForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                accion={accion}
                initialValues={initialValues}
                tiposProyectos={tiposProyectos}
              />
            )}
          </Formik>
        </AppScrollbar>
      </Dialog>
    )
  );
};

ConceptoProyectoCreador.propTypes = {
  ConceptoProyecto: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default ConceptoProyectoCreador;
