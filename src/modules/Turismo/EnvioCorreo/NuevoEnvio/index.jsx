// Nuevo envío de correo: mensaje + clientes del proveedor, revisión previa y envío a la cola.
// El administrador elige el proveedor; el proveedor logueado escribe a sus clientes (campo fijo).
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, useFormikContext } from 'formik';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { Alert, Autocomplete, Box, Button, Card, CardContent, IconButton, MenuItem, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import GroupsIcon from '@mui/icons-material/Groups';
import SendIcon from '@mui/icons-material/Send';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { showMessage } from '@crema/redux/features/cammon/commonSlice';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import { onGetColeccionLigera as onGetProveedores } from '@crema/redux/features/proveedoresTuristicos/proveedoresTuristicosSlice';
import MyTextField from '../../../../shared/components/MyTextField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import FormikEditorHtml from '../../../../shared/components/FormikEditorHtml';
import useProveedorSesion, { conProveedorPropio } from '../../../../shared/hooks/useProveedorSesion';
import { reducirImagen } from '../../../../shared/functions/Imagenes';

const RUTA = '/envios-correo';

// Imágenes del contenido: se reducen en el navegador y se suben; al enviar van incrustadas en el correo.
// Si falla, CKEditor muestra el mensaje del rechazo.
const subirImagen = (archivo) =>
  reducirImagen(archivo).then((reducida) => {
    const datos = new FormData();
    datos.append('imagen', reducida);
    return jwtAxios
      .post(`${RUTA.slice(1)}/imagenes`, datos, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(({ data }) => data.url)
      .catch((e) => Promise.reject(extraerMensajeError(e)));
  });
const sombra = { boxShadow: '0px 0px 5px 2px rgb(0 0 0 / 8%)' };

const esquema = yup.object({
  proveedor_id: yup.mixed().required('Elige el proveedor'),
  asunto: yup.string().required('Requerido').max(150, 'Máximo 150 caracteres'),
  // El correo puede ser solo una imagen (ej. una pieza gráfica) o texto, o ambos.
  texto: yup
    .string()
    .test('vacio', 'Escribe el contenido o agrega una imagen', (v) =>
      Boolean(v && (/<img\b/i.test(v) || v.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim())),
    ),
  audiencia: yup.string().required('Elige a quién enviar'),
  experiencia_id: yup.mixed().when('audiencia', { is: 'experiencia', then: (s) => s.required('Elige la experiencia') }),
  correos: yup.array().when('audiencia', { is: 'seleccion', then: (s) => s.min(1, 'Elige al menos un cliente') }),
});

const payload = (v) => ({
  proveedor_id: v.proveedor_id,
  asunto: v.asunto,
  texto: v.texto,
  audiencia: v.audiencia,
  experiencia_id: v.audiencia === 'experiencia' ? v.experiencia_id : null,
  correos: v.audiencia === 'seleccion' ? v.correos : [],
});

const Contenido = ({ catalogos, proveedores, proveedorPropio, resumen, setResumen }) => {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const [experiencias, setExperiencias] = useState([]);
  const [clientes, setClientes] = useState([]);

  // Experiencias y clientes del proveedor elegido.
  useEffect(() => {
    setFieldValue('experiencia_id', '');
    setFieldValue('correos', []);
    if (!values.proveedor_id) {
      setExperiencias([]);
      setClientes([]);
      return;
    }
    jwtAxios
      .get('experiencias', { params: { ligera: 1, todas: 1, proveedor_id: values.proveedor_id } })
      .then(({ data }) => setExperiencias(data))
      .catch(() => setExperiencias([]));
    jwtAxios
      .get(`${RUTA.slice(1)}/clientes`, { params: { proveedor_id: values.proveedor_id } })
      .then(({ data }) => setClientes(data))
      .catch(() => setClientes([]));
  }, [values.proveedor_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cambiar los destinatarios invalida el resumen calculado.
  useEffect(() => setResumen(null), [values.proveedor_id, values.audiencia, values.experiencia_id, values.correos]); // eslint-disable-line react-hooks/exhaustive-deps

  const seleccionados = clientes.filter((c) => values.correos.includes(c.id));
  // Los correos que son casi solo imagen suelen terminar en spam: se avisa (no se bloquea).
  const conImagen = /<img\b/i.test(values.texto);
  const letras = values.texto.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\{[a-z_]+\}/g, '').trim().length;
  const casiSoloImagen = conImagen && letras < 80;

  return (
    <>
      <Card sx={{ mb: 3, ...sombra }}>
        <CardContent sx={{ display: 'grid', gap: 3 }}>
          <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
            1. Mensaje
          </Typography>
          <MyTextField fullWidth label='Asunto' name='asunto' placeholder='Ej: {nombre}, tenemos nuevas fechas para ti' required />
          <FormikEditorHtml
            name='texto'
            label='Contenido (puedes agregar imágenes con el botón de imagen, pegándolas o arrastrándolas)'
            variables={catalogos.variables}
            subirImagen={subirImagen}
            className=''
          />
          {casiSoloImagen && (
            <Alert severity='warning'>
              Los correos que son casi solo una imagen suelen llegar a <strong>spam</strong>. Agrega dos o tres frases de texto
              (por ejemplo, qué ofreces y cómo reservar) y una descripción a cada imagen (selecciónala y usa el botón de texto alternativo).
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, ...sombra }}>
        <CardContent sx={{ display: 'grid', gap: 3 }}>
          <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
            2. Destinatarios
          </Typography>
          <FormikAutocomplete
            name='proveedor_id'
            label='Proveedor *'
            options={proveedores}
            disabled={!!proveedorPropio}
            textFieldProps={{ variant: 'standard', helperText: proveedorPropio ? 'El correo se enviará a tus clientes.' : undefined }}
          />
          <TextField
            select
            variant='standard'
            label='Enviar a'
            value={values.audiencia}
            onChange={(e) => setFieldValue('audiencia', e.target.value)}
            disabled={!values.proveedor_id}
          >
            {catalogos.audiencias.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.nombre}
              </MenuItem>
            ))}
          </TextField>
          {values.audiencia === 'experiencia' && (
            <FormikAutocomplete name='experiencia_id' label='Experiencia' options={experiencias} textFieldProps={{ variant: 'standard' }} />
          )}
          {values.audiencia === 'seleccion' && (
            <Autocomplete
              multiple
              options={clientes}
              value={seleccionados}
              getOptionLabel={(c) => c.nombre}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              onChange={(_, nuevos) => setFieldValue('correos', nuevos.map((c) => c.id))}
              noOptionsText='Este proveedor aún no tiene clientes'
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant='standard'
                  label='Clientes'
                  placeholder='Buscar cliente...'
                  error={Boolean(touched.correos && errors.correos)}
                  helperText={touched.correos && errors.correos}
                />
              )}
            />
          )}
          {resumen && (
            <Alert severity={resumen.total ? (resumen.supera_limite ? 'warning' : 'success') : 'error'}>
              {resumen.total ? (
                <>
                  <strong>{resumen.total}</strong> cliente(s) recibirán el correo.
                </>
              ) : (
                'No hay clientes con correo para esta selección.'
              )}
              {resumen.supera_limite && ` Supera el límite diario aproximado (${resumen.limite}): algunos podrían no salir hoy.`}
            </Alert>
          )}
        </CardContent>
      </Card>
    </>
  );
};

const NuevoEnvio = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const proveedoresLigera = useSelector((state) => state.proveedoresTuristicos.coleccionLigera);
  const { proveedor: proveedorPropio, cargando } = useProveedorSesion();
  const [catalogos, setCatalogos] = useState({ audiencias: [], variables: {} });
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    dispatch(onGetProveedores());
    jwtAxios
      .get(RUTA.slice(1), { params: { limite: 1 } })
      .then(({ data }) => setCatalogos({ audiencias: data.audiencias, variables: data.variables }))
      .catch(() => setError('No se pudieron cargar los datos del formulario.'));
  }, [dispatch]);

  const proveedores = conProveedorPropio(
    proveedoresLigera.map((p) => ({ id: p.id, nombre: p.nombre_comercial ?? p.nombre })),
    proveedorPropio,
  );

  // Valida el formulario y calcula cuántos clientes lo recibirán. Devuelve el resumen o null si hay errores.
  const revisar = (values, validateForm, setTouched) =>
    validateForm().then((errores) => {
      if (Object.keys(errores).length) {
        setTouched(Object.fromEntries(Object.keys(errores).map((k) => [k, true])));
        setError('Revisa los campos marcados en rojo.');
        return null;
      }
      setError('');
      return jwtAxios
        .post(`${RUTA.slice(1)}/resumen`, payload(values))
        .then(({ data }) => {
          setResumen(data);
          return data;
        })
        .catch((e) => {
          setError(extraerMensajeError(e));
          return null;
        });
    });

  // Enviar siempre está disponible: valida, calcula los destinatarios y pide confirmación en un solo paso.
  const enviar = (values, validateForm, setTouched) =>
    revisar(values, validateForm, setTouched).then((datos) => {
      if (!datos?.total) return; // sin clientes: el aviso queda en Destinatarios
      Swal.fire({
        title: 'Confirmar envío',
        text: `Se enviará "${values.asunto}" a ${datos.total} cliente(s). ¿Continuar?`,
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
      }).then(({ isConfirmed }) => {
        if (!isConfirmed) return;
        setEnviando(true);
        jwtAxios
          .post(RUTA.slice(1), payload(values))
          .then(({ data }) => {
            dispatch(showMessage(data.mensajes));
            navigate(RUTA);
          })
          .catch((e) => setError(extraerMensajeError(e)))
          .finally(() => setEnviando(false));
      });
    });

  // Se espera a saber si es proveedor para fijar su negocio desde el inicio.
  if (cargando) return null;

  return (
    <Box sx={{ maxWidth: 1000 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Tooltip title='Volver'>
          <IconButton onClick={() => navigate(RUTA)}>
            <ArrowBackIosIcon />
          </IconButton>
        </Tooltip>
        <Typography variant='h2' sx={{ fontWeight: 'bold' }}>
          Nuevo envío de correo
        </Typography>
      </Box>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Formik
        initialValues={{
          proveedor_id: proveedorPropio?.id ?? '',
          asunto: '',
          texto: '',
          audiencia: 'todos',
          experiencia_id: '',
          correos: [],
        }}
        validationSchema={esquema}
        onSubmit={() => {}}
      >
        {({ values, validateForm, setTouched }) => (
          <Form noValidate>
            <Contenido
              catalogos={catalogos}
              proveedores={proveedores}
              proveedorPropio={proveedorPropio}
              resumen={resumen}
              setResumen={setResumen}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => navigate(RUTA)}>Cancelar</Button>
              <Button variant='outlined' startIcon={<GroupsIcon />} onClick={() => revisar(values, validateForm, setTouched)}>
                Revisar destinatarios
              </Button>
              <Button variant='contained' startIcon={<SendIcon />} disabled={enviando} onClick={() => enviar(values, validateForm, setTouched)}>
                Enviar
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NuevoEnvio;
