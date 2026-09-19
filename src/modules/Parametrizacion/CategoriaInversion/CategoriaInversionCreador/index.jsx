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
  resetCategoriaInversionActual,
}  from '../../../../@crema/redux/features/categoriaInversion/categoriaInversionesSlice';
import { onGetColeccionLigera as onGetCategoriaInversiones } from '../../../../@crema/redux/features/ciudades/ciudadesSlice';
import {onGetColeccionLigera as onGetCondicionPlazo } from '../../../../@crema/redux/features/condicionesPlazo/condicionesPlazoSlice';
import Slide from '@mui/material/Slide';
import CategoriaInversionForm from './CategoriaInversionForm';
import { Fonts } from '../../../../shared/constants/AppEnums';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import AppLoader from '@crema/components/AppLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const CategoriaInversionCreador = (props) => {
  const { CategoriaInversion, handleOnClose, accion, updateColeccion, titulo } = props;
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

  // const classes = useStyles(props);

  const selectedRow = useSelector((state) =>  state.categoriasInversiones.CategoriaInversionActual);  
  const loading = useSelector((state) =>  state.categoriasInversiones.loading);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);
  const { coleccionLigera: condicionesPlazo } = useSelector((state) => state.condicionesPlazo);
  const initializeSelectedRow = () => {
    dispatch(resetCategoriaInversionActual());
  };
  useEffect(() => {
    initializeSelectedRow();
  }, []);

  if (accion === 'crear') {
    initializeSelectedRow();
  }

  // Helper para ubicar la condición de plazo seleccionada
  const getCondPlazo = (id) => {
    if (!id) return null;
    return (condicionesPlazo || []).find(cp => String(cp.id) === String(id)) || null;
  };


  const validationSchema = yup.object({
  nombre: yup.string().required('Requerido'),
  id_condicion_plazo: yup.string().required('Requerido'),

  plazo_capital: yup
    .number()
    .transform((v, o) => (o === '' || o === null ? NaN : Number(o)))
    .typeError('Solo acepta valores numéricos enteros')
    .integer('Solo acepta valores numéricos enteros')
    .required('Requerido')
    .test(
      'plazo-capital-condicion',
      'El plazo de capital debe ser menor o igual al de condición de plazo',
      function (valor) {
        const { id_condicion_plazo } = this.parent;
        const cond = (condicionesPlazo || []).find(cp => String(cp.id) === String(id_condicion_plazo));
        if (!cond || valor == null || Number.isNaN(valor)) return true;
        return Number(valor) <= Number(cond.plazo_capital);
      }
    ),

  plazo_interes: yup
    .number()
    .transform((v, o) => (o === '' || o === null ? NaN : Number(o)))
    .typeError('Solo acepta valores numéricos enteros')
    .integer('Solo acepta valores numéricos enteros')
    .required('Requerido'),

  periodos_muertos: yup
    .number()
    .transform((v, o) => (o === '' || o === null ? 0 : Number(o)))
    .min(0, 'No puede ser negativo')
    .nullable(),

  periodos_gracia: yup
    .number()
    .transform((v, o) => (o === '' || o === null ? 0 : Number(o)))
    .min(0, 'No puede ser negativo')
    .nullable(),

  // ✅ Tasa interés (opcional)
  tasa_interes_inversion: yup
    .mixed()
    .test('tasa-interes-formato', 'Solo acepta valores numéricos con 2 decimales', function (value) {
      if (value === '' || value === null || value === undefined) return true; // permitido vacío
      const num = parseFloat(String(value).replace(',', '.'));
      if (Number.isNaN(num)) return false;
      const partes = String(num).split('.');
      return partes.length === 1 || (partes[1] && partes[1].length <= 2);
    })
    .required('Requerido')
    .test(
      'tasa-interes-condicion',
      'Tasa interés debe ser menor o igual a la de condición de plazo',
      function (valor) {
        const { id_condicion_plazo } = this.parent;
        const cond = (condicionesPlazo || []).find(
          (cp) => String(cp.id) === String(id_condicion_plazo)
        );

        // si el campo está vacío, no validar
        if (valor === '' || valor === null || valor === undefined) return true;

        // convertir el valor ingresado a número
        const num = parseFloat(String(valor).replace(',', '.'));
        if (Number.isNaN(num)) return false; // formato inválido

        // si no hay condición, no validar
        if (!cond) return true;

        // revisar el valor de tasa_interes_inversion de la condición
        const limiteRaw = cond.tasa_interes_inversion;
        const limiteNum = limiteRaw !== null && limiteRaw !== undefined && String(limiteRaw).trim() !== ''
          ? parseFloat(String(limiteRaw).replace(',', '.'))
          : null;

        // si la condición no tiene valor de tasa, no se valida el límite
        if (limiteNum === null || Number.isNaN(limiteNum)) return true;

        // comparar si el valor ingresado no excede el límite
        return num <= limiteNum;
      }
    ),


  indicativo_asegurado: yup.string().required('Requerido'),

  indicativo_forma_pago_int: yup
    .string()
    .required('Requerido')
    .test('forma-pago-plazos-iguales', '', function (value) {
      const { plazo_capital, plazo_interes } = this.parent;
      if (value === 'M' && plazo_capital !== plazo_interes) {
        return this.createError({
          message: 'Para esta forma de pago el plazo de capital e intereses deben ser iguales',
          path: 'plazo_capital',
        });
      }
      if (value === 'F' && plazo_capital !== plazo_interes) {
        return this.createError({
          message: 'Para esta forma de pago el plazo de capital e intereses deben ser iguales',
          path: 'plazo_capital',
        });
      }
      if (value === 'I' && Number(plazo_interes) <= Number(plazo_capital)) {
        return this.createError({
          message: 'Para esta forma de pago el plazo de interés debe ser mayor al plazo de capital',
          path: 'plazo_interes',
        });
      }
      return true;
    }),

  observaciones: yup.string().nullable(),
  estado: yup.string().oneOf(['0', '1']).required('Requerido'),
  });



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
      dispatch(onShow(CategoriaInversion));
    }
  }, [accion, dispatch, CategoriaInversion]);

    useEffect(() => {
      dispatch(onGetCategoriaInversiones());
      dispatch(onGetCondicionPlazo());
    }, [dispatch]);

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
        maxWidth={'md'}
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
              id_condicion_plazo: selectedRow ? selectedRow.id_condicion_plazo : '',
              plazo_capital: selectedRow ? selectedRow.plazo_capital : '',
              plazo_interes: selectedRow ? selectedRow.plazo_interes : '',
              periodos_muertos: selectedRow ? selectedRow.periodos_muertos : '',
              periodos_gracia: selectedRow ? selectedRow.periodos_gracia : '',
              tasa_interes_inversion: selectedRow ? selectedRow.tasa_interes_inversion : '',
              indicativo_forma_pago_int: selectedRow ? selectedRow.indicativo_forma_pago_int : '',
              indicativo_asegurado: selectedRow ? selectedRow.indicativo_asegurado : 'N',
              observaciones: selectedRow ? selectedRow.observaciones : '',
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
              <CategoriaInversionForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                ciudades={ciudades}
                condicionesPlazo={condicionesPlazo}
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

CategoriaInversionCreador.propTypes = {
  CategoriaInversion: PropTypes.string.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
};

export default CategoriaInversionCreador;
