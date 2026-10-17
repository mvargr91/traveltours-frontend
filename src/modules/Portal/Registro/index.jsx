// Registro público: viajero (rol Cliente) o proveedor (rol Proveedor, verificación pendiente).
// Tras crear la cuenta inicia sesión con el mismo login del proyecto y redirige.
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  Link,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import LuggageIcon from '@mui/icons-material/Luggage';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { onCreate } from '@crema/redux/features/portalRegistro/portalRegistroSlice';
import { onGetColeccion as onGetDestinos } from '@crema/redux/features/portalDestinos/portalDestinosSlice';
import { onGetColeccion as onGetCategorias } from '@crema/redux/features/portalCategorias/portalCategoriasSlice';
import SelectorCategorias from '../../../shared/components/SelectorCategorias';
import { TIPOS_SERVICIO } from '../../../shared/constants/Turismo';
import { login } from '@crema/redux/features/auth/authSlice';
import { useAuthMethod } from '@crema/hooks/AuthHooks';
import MyTextField from '../../../shared/components/MyTextField';
import { urlPanelDe } from '../../../shared/components/Portal/PortalHeader';
import { useApariencia, useTextos } from '@crema/context/AppContextProvider/AparienciaContextProvider';
import { conNegrita } from '../../../shared/constants/TextosPortal';

// t: textos del registro; c: textos comunes de formularios (useTextos).
const crearEsquemas = (t, c) => {
  const esquemaBase = {
    nombre: yup.string().required(c('requerido')).max(128, c('maximo', { n: 128 })),
    identificacion_usuario: yup
      .string()
      .required(c('requerido'))
      .max(128, c('maximo', { n: 128 }))
      .matches(/^[A-Za-z0-9.-]+$/, t('documentoInvalido')),
    correo_electronico: yup.string().required(c('requerido')).email(c('correoInvalido')),
    clave: yup.string().required(c('requerido')).min(8, t('claveMinimo', { n: 8 })),
    clave_confirmation: yup
      .string()
      .required(c('requerido'))
      .oneOf([yup.ref('clave')], t('clavesNoCoinciden')),
    acepta_terminos: yup.boolean().oneOf([true], t('debeAceptar')),
  };

  return {
    cliente: yup.object(esquemaBase),
    proveedor: yup.object({
      ...esquemaBase,
      nombre_comercial: yup.string().required(c('requerido')).max(150, c('maximo', { n: 150 })),
      tipo_servicio: yup.string().required(c('requerido')),
      telefono: yup.string().max(30).matches(/^[+]?[0-9\s-]*$/, c('telefonoInvalido')).nullable(),
    }),
  };
};

const valoresIniciales = {
  nombre: '',
  identificacion_usuario: '',
  correo_electronico: '',
  clave: '',
  clave_confirmation: '',
  acepta_terminos: false,
  nombre_comercial: '',
  nit: '',
  telefono: '',
  destino_id: '',
  tipo_servicio: '',
  categorias: [],
};

const Registro = () => {
  const dispatch = useDispatch();
  const { apariencia } = useApariencia();
  const t = useTextos('registro');
  const c = useTextos('comunes');
  const esquemas = useMemo(() => crearEsquemas(t, c), [t, c]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tipo = searchParams.get('tipo') === 'proveedor' ? 'proveedor' : 'cliente';
  const redirect = searchParams.get('redirect');
  const { saving } = useSelector((state) => state.portalRegistro);
  const destinos = useSelector((state) => state.portalDestinos.rows);
  const categorias = useSelector((state) => state.portalCategorias.rows);
  const [ingresando, setIngresando] = useState(false);
  const { signInUser } = useAuthMethod();

  useEffect(() => {
    if (destinos.length === 0) dispatch(onGetDestinos());
    if (categorias.length === 0) dispatch(onGetCategorias());
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const cambiarTipo = (nuevo) => {
    const params = new URLSearchParams(searchParams);
    params.set('tipo', nuevo);
    setSearchParams(params, { replace: true });
  };

  // Mismo par de llamadas que SigninJwtAuth: signInUser deja el token en jwtAxios
  // (si no, las peticiones siguientes salen sin Authorization) y login actualiza Redux.
  const ingresar = async ({ identificacion_usuario: username, clave: password }) => {
    setIngresando(true);
    await signInUser({ username, password });
    dispatch(login({ username, password }))
      .unwrap()
      .then(({ user }) => navigate(redirect || urlPanelDe(user), { replace: true }))
      .catch(() => navigate('/signin', { replace: true }))
      .finally(() => setIngresando(false));
  };

  const enviar = (valores) => {
    const params = { ...valores, tipo };
    if (tipo === 'cliente') {
      ['nombre_comercial', 'nit', 'telefono', 'destino_id', 'tipo_servicio', 'categorias'].forEach((campo) => delete params[campo]);
    }
    dispatch(onCreate({ params, handleOnClose: () => ingresar(valores) }));
  };

  const ocupado = saving || ingresando;

  return (
    <Container maxWidth='md' sx={{ py: 6 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box component='img' src={apariencia.logos.principal} alt={apariencia.marca.nombre} sx={{ height: 80 }} />
          <Typography variant='h2' sx={{ mt: 1 }}>{t('titulo')}</Typography>
          <Typography color='text.secondary'>
            {t('yaTienes')} <Link component={RouterLink} to={redirect ? `/signin?redirect=${redirect}` : '/signin'}>{t('ingresa')}</Link>
          </Typography>
        </Box>

        <Tabs value={tipo} onChange={(e, v) => cambiarTipo(v)} variant='fullWidth' sx={{ mb: 3 }}>
          <Tab value='cliente' icon={<LuggageIcon />} iconPosition='start' label={t('quieroViajar')} />
          <Tab value='proveedor' icon={<StorefrontIcon />} iconPosition='start' label={t('tengoNegocio')} />
        </Tabs>

        {tipo === 'proveedor' && (
          <Alert severity='info' sx={{ mb: 3 }}>
            {conNegrita(t('avisoProveedor'))}
          </Alert>
        )}

        <Formik
          key={tipo}
          initialValues={valoresIniciales}
          validationSchema={esquemas[tipo]}
          validateOnBlur={false}
          onSubmit={enviar}
        >
          {({ values, errors, touched, setFieldValue, handleChange }) => (
            <Form noValidate>
              <Grid container spacing={2.5}>
                {tipo === 'proveedor' && (
                  <>
                    <Grid item xs={12}>
                      <Divider textAlign='left'>{t('tuNegocio')}</Divider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MyTextField name='nombre_comercial' label={t('nombreComercial')} fullWidth required variant='outlined' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MyTextField name='nit' label={t('nit')} fullWidth variant='outlined' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MyTextField name='telefono' label={t('telefono')} fullWidth variant='outlined' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField select name='destino_id' label={t('destinoPrincipal')} fullWidth value={values.destino_id} onChange={handleChange}>
                        <MenuItem value=''>{t('sinDefinir')}</MenuItem>
                        {destinos.map((d) => <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        required
                        name='tipo_servicio'
                        label={t('tipoServicio')}
                        fullWidth
                        value={values.tipo_servicio}
                        onChange={handleChange}
                        error={Boolean(touched.tipo_servicio && errors.tipo_servicio)}
                        helperText={touched.tipo_servicio && errors.tipo_servicio}
                      >
                        {TIPOS_SERVICIO.map((tipoServicio) => (
                          <MenuItem key={tipoServicio.id} value={tipoServicio.id}>{tipoServicio.nombre}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <SelectorCategorias
                        categorias={categorias}
                        value={values.categorias}
                        onChange={(ids) => setFieldValue('categorias', ids)}
                        label={t('categorias')}
                        helperText={t('categoriasAyuda')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider textAlign='left'>{t('datosAcceso')}</Divider>
                    </Grid>
                  </>
                )}
                <Grid item xs={12} sm={6}>
                  <MyTextField name='nombre' label={t('nombre')} fullWidth required variant='outlined' />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextField name='correo_electronico' label={t('correo')} type='email' fullWidth required variant='outlined' />
                </Grid>
                <Grid item xs={12}>
                  <MyTextField
                    name='identificacion_usuario'
                    label={t('documento')}
                    fullWidth
                    required
                    variant='outlined'
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextField name='clave' label={t('clave')} type='password' fullWidth required variant='outlined' />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextField name='clave_confirmation' label={t('repiteClave')} type='password' fullWidth required variant='outlined' />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.acepta_terminos}
                        onChange={(e) => setFieldValue('acepta_terminos', e.target.checked)}
                      />
                    }
                    label={t('terminos')}
                  />
                  {touched.acepta_terminos && errors.acepta_terminos && (
                    <FormHelperText error>{errors.acepta_terminos}</FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type='submit'
                    variant='contained'
                    size='large'
                    fullWidth
                    disabled={ocupado}
                    startIcon={ocupado ? <CircularProgress size={18} color='inherit' /> : null}
                  >
                    {t(ingresando ? 'ingresando' : tipo === 'proveedor' ? 'registrarNegocio' : 'crearCuenta')}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default Registro;
