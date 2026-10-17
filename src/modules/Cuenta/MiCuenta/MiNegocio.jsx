// Datos del negocio del proveedor, agrupados como el formulario "Únete como proveedor".
// Solo campos que existen en proveedores_turisticos; la verificación la decide el administrador.
// El logo y las fotos se suben aparte (cada archivo al elegirlo), fuera del formulario.
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { Box, Button, CircularProgress, Divider, Grid, MenuItem, TextField } from '@mui/material';
import { onUpdateNegocio } from '@crema/redux/features/cuenta/cuentaSlice';
import { onGetColeccion as onGetDestinos } from '@crema/redux/features/portalDestinos/portalDestinosSlice';
import { onGetColeccion as onGetCategorias } from '@crema/redux/features/portalCategorias/portalCategoriasSlice';
import MyTextField from '../../../shared/components/MyTextField';
import FotosProveedor from '../../../shared/components/FotosProveedor';
import SelectorCategorias from '../../../shared/components/SelectorCategorias';
import { TIPOS_CUENTA, TIPOS_SERVICIO } from '../../../shared/constants/Turismo';
import Seccion, { valoresIniciales } from './Seccion';

const CAMPOS = [
  'nombre_comercial', 'razon_social', 'nit', 'tipo_servicio', 'destino_id', 'direccion', 'rnt',
  'telefono', 'correo', 'sitio_web', 'instagram', 'facebook', 'descripcion',
  'banco', 'tipo_cuenta', 'numero_cuenta', 'titular_cuenta', 'documento_titular',
];

const esquema = yup.object({
  nombre_comercial: yup.string().required('Requerido').max(150, 'Máximo 150 caracteres'),
  razon_social: yup.string().max(150, 'Máximo 150 caracteres'),
  nit: yup.string().max(50),
  rnt: yup.string().max(50),
  direccion: yup.string().max(255),
  telefono: yup.string().max(30).matches(/^[+]?[0-9\s-]*$/, 'Teléfono inválido'),
  correo: yup.string().email('Correo inválido').max(128),
  sitio_web: yup.string().url('Debe ser una URL válida (https://...)').max(255),
  instagram: yup.string().max(255),
  facebook: yup.string().max(255),
  banco: yup.string().max(100),
  numero_cuenta: yup.string().max(40).matches(/^[0-9-]*$/, 'Solo números y guiones'),
  titular_cuenta: yup.string().max(150),
  documento_titular: yup.string().max(50),
});

// '' -> null para que el backend guarde vacío en los opcionales (destino_id es entero).
const aParams = (valores) =>
  Object.fromEntries(Object.entries(valores).map(([campo, valor]) => [campo, valor === '' ? null : valor]));

const MiNegocio = ({ proveedor }) => {
  const dispatch = useDispatch();
  const saving = useSelector((state) => state.cuenta.saving);
  const destinos = useSelector((state) => state.portalDestinos.rows);
  const categorias = useSelector((state) => state.portalCategorias.rows);

  useEffect(() => {
    if (!destinos.length) dispatch(onGetDestinos());
    if (!categorias.length) dispatch(onGetCategorias());
  }, [dispatch, destinos.length, categorias.length]);

  const campo = (name, label, { md = 6, ...props } = {}) => (
    <Grid item xs={12} md={md}>
      <MyTextField name={name} label={label} fullWidth variant='outlined' {...props} />
    </Grid>
  );

  const seleccion = (name, label, opciones, { md = 6, vacio = 'Sin definir' } = {}, values, handleChange) => (
    <Grid item xs={12} md={md}>
      <TextField select name={name} label={label} fullWidth value={values[name]} onChange={handleChange}>
        <MenuItem value=''>{vacio}</MenuItem>
        {opciones.map((o) => (
          <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>
        ))}
      </TextField>
    </Grid>
  );

  return (
    <>
      <Formik
        enableReinitialize
        initialValues={{ ...valoresIniciales(proveedor, CAMPOS), categorias: proveedor.categorias ?? [] }}
        validationSchema={esquema}
        onSubmit={(valores) => dispatch(onUpdateNegocio({ params: aParams(valores) }))}
      >
        {({ values, handleChange, setFieldValue }) => (
          <Form noValidate>
            <Seccion titulo='Información del negocio'>
              {campo('nombre_comercial', 'Nombre comercial', { required: true })}
              {campo('razon_social', 'Razón social')}
              {campo('nit', 'NIT')}
              {seleccion('tipo_servicio', 'Tipo de servicio', TIPOS_SERVICIO, {}, values, handleChange)}
              {seleccion('destino_id', 'Destino principal', destinos, {}, values, handleChange)}
              {campo('direccion', 'Dirección')}
              <Grid item xs={12}>
                <SelectorCategorias categorias={categorias} value={values.categorias} onChange={(ids) => setFieldValue('categorias', ids)} />
              </Grid>
            </Seccion>

            <Seccion titulo='Documentación legal' descripcion='Necesaria para verificar tu negocio. Sube los documentos en Mi Cuenta > Mis Documentos.'>
              {campo('rnt', 'Registro Nacional de Turismo (RNT)')}
            </Seccion>

            <Seccion titulo='Contacto' descripcion='Datos que verán los viajeros.'>
              {campo('telefono', 'Teléfono / WhatsApp')}
              {campo('correo', 'Correo de contacto', { type: 'email' })}
            </Seccion>

            <Seccion titulo='Presencia en línea'>
              {campo('sitio_web', 'Sitio web', { placeholder: 'https://', md: 4 })}
              {campo('instagram', 'Instagram', { placeholder: '@tu_negocio', md: 4 })}
              {campo('facebook', 'Facebook', { md: 4 })}
            </Seccion>

            <Seccion titulo='Descripción' descripcion='Cuéntale a los viajeros qué hace especial a tu negocio.'>
              {campo('descripcion', 'Descripción', { multiline: true, minRows: 4, md: 12 })}
            </Seccion>

            <Seccion titulo='Datos para recibir pagos' descripcion='Cuenta donde te transferimos lo que se cobre por tus reservas. Solo la ve nuestro equipo.'>
              {campo('banco', 'Banco o entidad')}
              {seleccion('tipo_cuenta', 'Tipo de cuenta', TIPOS_CUENTA, {}, values, handleChange)}
              {campo('numero_cuenta', 'Número de cuenta')}
              {campo('titular_cuenta', 'Titular de la cuenta')}
              {campo('documento_titular', 'Documento o NIT del titular')}
            </Seccion>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type='submit'
                variant='contained'
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
              >
                Guardar datos del negocio
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      <Divider sx={{ my: 6 }} />
      <Seccion titulo='Logo y fotos' descripcion='Se muestran en tu perfil público. Se guardan al subirlas.'>
        <Grid item xs={12}>
          <FotosProveedor base='cuenta/proveedor' logo={proveedor.logo} fotos={proveedor.fotos} />
        </Grid>
      </Seccion>
    </>
  );
};

MiNegocio.propTypes = {
  proveedor: PropTypes.object.isRequired,
};

export default MiNegocio;
