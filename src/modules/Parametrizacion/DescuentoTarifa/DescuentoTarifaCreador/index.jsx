import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import Paper from '@mui/material/Paper';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import AppMessageView from '@crema/components/AppMessageView';
import {
  UPDATE_TYPE,
  CREATE_TYPE,
  ERROR_TYPE,
} from '../../../../shared/constants/Constantes';
import {
  onGetMatriz,
  onCreateMatriz,
} from '../../../../@crema/redux/features/descuentoTarifa/descuentoTarifaSlice';
import DescuentoTarifaForm from './DescuentoTarifaForm';

const useStyles = makeStyles(() => ({
  marcoTabla: {
    boxShadow: '0px 0px 5px 5px rgb(0 0 0 / 10%)',
    borderRadius: '4px',
    paddingLeft: '15px',
    paddingRight: '15px',
    marginTop: '5px',
  },
  root: {
    width: '100%',
    padding: '20px',
  },
  paper: {
    width: '100%',
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },
}));

const DescuentoTarifaCreador = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accion } = useParams();
  const classes = useStyles();

  const { matriz, loading } = useSelector((state) => state.descuentoTarifa);
  const { message, messageType } = useSelector(({ common }) => common);
  const { user } = useSelector(({ auth }) => auth);
  const [permisos, setPermisos] = useState('');
  const [titulo, setTitulo] = useState('Descuentos Tarifas');

  useEffect(() => {
    dispatch(onGetMatriz());
  }, [dispatch]);

  useEffect(() => {
    user &&
      user.usuario.permisos.forEach((modulo) => {
        modulo.opciones.forEach((opcion) => {
          if (opcion.url === props.route.path) {
            setTitulo(opcion.nombre);
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
    navigate('/descuentos-tarifas');
  };

  const initialValues = useMemo(() => {
    return {
      columnas: matriz?.columnas || [],
      filas: matriz?.filas || [],
      numero_anios: matriz?.numero_anios || 0,
    };
  }, [matriz]);

  return (
    <div className={classes.root}>
      <Paper
        sx={{ marginBottom: theme.spacing(2) }}
        className={classes.paper}
      >
        <Box
          sx={{ background: theme.palette.background.paper }}
          className={classes.marcoTabla}
        >
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitting(true);

              await dispatch(
                onCreateMatriz({
                  params: {
                    matriz: values.filas,
                  },
                })
              );

              setSubmitting(false);
            }}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <DescuentoTarifaForm
                values={values}
                setFieldValue={setFieldValue}
                handleOnClose={handleOnClose}
                titulo={titulo}
                accion={accion || 'editar'}
                loading={loading}
                isSubmitting={isSubmitting}
                permisos={permisos}
              />
            )}
          </Formik>
        </Box>

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
        <AppMessageView
          variant={messageType === ERROR_TYPE ? 'error' : 'success'}
          message={messageType === ERROR_TYPE ? message : ''}
        />
      </Paper>
    </div>
  );
};

DescuentoTarifaCreador.propTypes = {
  route: PropTypes.object.isRequired,
};

export default DescuentoTarifaCreador;