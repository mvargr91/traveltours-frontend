// Diálogo Formik reutilizable para los "Creador" de cada módulo.
// Encapsula lo que repetían todos los creadores: carga del registro (onShow) en
// ver/editar, reset al crear, loader, Dialog con transición y despacho de onCreate/onUpdate.
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import AppLoader from '@crema/components/AppLoader';
import AppScrollbar from '@crema/components/AppScrollbar';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const AppCrudDialog = (props) => {
  const {
    stateKey,
    registroId,
    registroInicial,
    accion,
    handleOnClose,
    updateColeccion,
    onShow,
    onCreate,
    onUpdate,
    resetActual,
    initialValues,
    validationSchema,
    transformarAntesDeEnviar,
    maxWidth,
    children,
  } = props;

  const dispatch = useDispatch();
  const { actual, loadingActual, saving } = useSelector((state) => state[stateKey]);
  const requiereRegistro = accion === 'editar' || accion === 'ver';
  // Recursos sin GET /{id} (tablas pivote) reciben la fila de la tabla directamente.
  const usaRegistroInicial = Boolean(registroInicial);

  useEffect(() => {
    dispatch(resetActual());
    if (requiereRegistro && registroId && !usaRegistroInicial) {
      dispatch(onShow(registroId));
    }
    return () => {
      dispatch(resetActual());
    };
  }, [dispatch, registroId, accion]); // eslint-disable-line react-hooks/exhaustive-deps

  if (requiereRegistro && !usaRegistroInicial && (loadingActual || !actual)) {
    return <AppLoader />;
  }

  const registro = !requiereRegistro ? null : usaRegistroInicial ? registroInicial : actual;

  return (
    <Dialog
      open
      onClose={handleOnClose}
      TransitionComponent={Transition}
      maxWidth={maxWidth}
      fullWidth
    >
      <AppScrollbar>
        <Formik
          enableReinitialize
          validateOnBlur={false}
          initialValues={initialValues(registro)}
          validationSchema={validationSchema}
          onSubmit={(data, { setSubmitting }) => {
            const params = transformarAntesDeEnviar ? transformarAntesDeEnviar(data) : data;
            if (accion === 'crear') {
              dispatch(onCreate({ params, handleOnClose, updateColeccion }));
            } else if (accion === 'editar') {
              dispatch(onUpdate({ params, handleOnClose, updateColeccion }));
            }
            setSubmitting(false);
          }}
        >
          {(formik) => children({ ...formik, registro, saving })}
        </Formik>
      </AppScrollbar>
    </Dialog>
  );
};

AppCrudDialog.propTypes = {
  stateKey: PropTypes.string.isRequired,
  registroId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  registroInicial: PropTypes.object,
  accion: PropTypes.oneOf(['crear', 'editar', 'ver']).isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func,
  onShow: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  resetActual: PropTypes.func.isRequired,
  // (registro | null) => valores iniciales de Formik
  initialValues: PropTypes.func.isRequired,
  validationSchema: PropTypes.object,
  // (valores Formik) => payload para el backend
  transformarAntesDeEnviar: PropTypes.func,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  // Render prop: ({ values, setFieldValue, registro, saving, ... }) => <Form />
  children: PropTypes.func.isRequired,
};

AppCrudDialog.defaultProps = {
  maxWidth: 'sm',
};

export default AppCrudDialog;
