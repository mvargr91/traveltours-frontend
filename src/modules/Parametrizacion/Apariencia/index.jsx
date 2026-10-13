// Parametrización > Apariencia: personaliza colores, textos, menú, iconos, logos e imágenes del portal
// público y del panel. Los cambios se ven al instante (vista previa y panel) y se aplican a
// todos los visitantes al guardar.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import Swal from 'sweetalert2';
import { Alert, Box, Button, CircularProgress, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  useApariencia,
  useAparienciaActions,
} from '@crema/context/AppContextProvider/AparienciaContextProvider';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import HelpButton from '../../../shared/components/HelpButton';
import { urlArchivo } from '../../../shared/functions/Archivos';
import { ES_ENLACE, IMAGENES_APARIENCIA, REDES_SOCIALES, combinarApariencia } from '../../../shared/constants/Apariencia';
import { SeccionContacto, SeccionInicio, SeccionMarca, SeccionMenu, SeccionPanel, SeccionPortal, SeccionTextos } from './Secciones';
import VistaPrevia from './VistaPrevia';

const PESTANAS = [
  ['Marca y logos', SeccionMarca],
  ['Contacto y redes', SeccionContacto],
  ['Colores del portal', SeccionPortal],
  ['Menú del portal', SeccionMenu],
  ['Página de inicio', SeccionInicio],
  ['Textos', SeccionTextos],
  ['Panel administrativo', SeccionPanel],
];

// URL a mostrar de cada imagen: la recién elegida, la guardada o la predeterminada.
const useVistasImagenes = (archivos, rutas, quitar) => {
  const urls = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(IMAGENES_APARIENCIA).map(([clave, { predeterminada }]) => {
          if (archivos[clave]) return [clave, URL.createObjectURL(archivos[clave])];
          if (rutas[clave] && !quitar.includes(clave)) return [clave, urlArchivo(rutas[clave])];
          return [clave, predeterminada];
        }),
      ),
    [archivos, rutas, quitar],
  );

  useEffect(
    () => () => Object.values(urls).forEach((url) => url.startsWith('blob:') && URL.revokeObjectURL(url)),
    [urls],
  );

  return urls;
};

const Apariencia = ({ route }) => {
  const theme = useTheme();
  const { titulo, urlAyuda, permisos, cargado } = usePermisosOpcion(route.path);
  const { guardada, cargada } = useApariencia();
  const { guardar, restablecer, previsualizar } = useAparienciaActions();

  const [config, setConfig] = useState(() => combinarApariencia(guardada.configuracion));
  const [archivos, setArchivos] = useState({}); // columna -> File por subir
  const [quitar, setQuitar] = useState([]); // columnas que vuelven a la imagen predeterminada
  const [sucio, setSucio] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [pestana, setPestana] = useState(0);

  const puedeModificar = permisos.includes('Modificar');
  const disabled = !puedeModificar || guardando;
  const imagenes = useVistasImagenes(archivos, guardada.imagenes, quitar);

  const descartar = useCallback(() => {
    setConfig(combinarApariencia(guardada.configuracion));
    setArchivos({});
    setQuitar([]);
    setSucio(false);
  }, [guardada]);

  // Lo guardado llega del backend después del primer render: se toma mientras no haya cambios propios.
  useEffect(() => {
    if (!sucio) setConfig(combinarApariencia(guardada.configuracion));
  }, [guardada]); // eslint-disable-line react-hooks/exhaustive-deps

  // Vista en vivo: el panel completo toma los colores en edición (con una pausa mínima para
  // no reconstruir el tema en cada movimiento del selector de color).
  useEffect(() => {
    if (!sucio) {
      previsualizar(null);
      return undefined;
    }
    const espera = setTimeout(() => previsualizar(config), 150);
    return () => clearTimeout(espera);
  }, [config, sucio, previsualizar]);

  useEffect(() => () => previsualizar(null), [previsualizar]);

  const cambiar = useCallback((ruta, valor) => {
    setConfig((actual) => set(cloneDeep(actual), ruta, valor));
    setSucio(true);
  }, []);

  const imagen = (clave) => ({
    clave,
    url: imagenes[clave],
    disabled,
    personalizada: Boolean(archivos[clave]) || (Boolean(guardada.imagenes[clave]) && !quitar.includes(clave)),
    onArchivo: (archivo) => {
      setArchivos((actual) => ({ ...actual, [clave]: archivo }));
      setQuitar((actual) => actual.filter((c) => c !== clave));
      setSucio(true);
    },
    onQuitar: () => {
      setArchivos(({ [clave]: _, ...resto }) => resto);
      if (guardada.imagenes[clave]) setQuitar((actual) => [...new Set([...actual, clave])]);
      setSucio(true);
    },
  });

  const swalBase = { background: theme.palette.background.default, color: theme.palette.text.primary };

  const errorDeValidacion = () => {
    if (!config.marca.nombre.trim()) return 'El nombre del sitio es obligatorio.';
    if (config.portal.menu.some((enlace) => !enlace.etiqueta.trim())) return 'Todas las opciones del menú del portal deben tener nombre.';
    if (!config.portal.menu.some((enlace) => enlace.visible)) return 'Deja visible al menos una opción del menú del portal.';
    if (config.inicio.propuestas.some((propuesta) => !propuesta.titulo.trim())) return 'Todas las tarjetas del inicio deben tener título.';
    if (config.contacto.correo && !/^\S+@\S+\.\S+$/.test(config.contacto.correo)) return 'El correo de contacto no es válido.';
    const enlaces = [...REDES_SOCIALES.map(([red, nombre]) => [nombre, config.contacto[red]]), ['El video del inicio', config.inicio.video]];
    const malo = enlaces.find(([, valor]) => valor && !ES_ENLACE.test(valor));
    if (malo) return `${malo[0]}: el enlace debe empezar por https://`;
    return '';
  };

  const ejecutar = async (accion, tituloExito) => {
    setGuardando(true);
    try {
      const respuesta = await accion();
      // El backend devuelve lo que quedó guardado (al restablecer, vacío = valores de fábrica).
      setConfig(combinarApariencia(respuesta.datos?.configuracion));
      setArchivos({});
      setQuitar([]);
      setSucio(false);
      Swal.fire({ ...swalBase, title: tituloExito, text: respuesta.mensajes?.[0], icon: 'success' });
    } catch (error) {
      Swal.fire({ ...swalBase, title: 'Error', text: extraerMensajeError(error), icon: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  const onGuardar = () => {
    const error = errorDeValidacion();
    if (error) {
      Swal.fire({ ...swalBase, title: 'Revisa los datos', text: error, icon: 'warning' });
      return;
    }
    ejecutar(() => guardar({ configuracion: config, archivos, quitar }), 'Guardado');
  };

  const onRestablecer = async () => {
    const { isConfirmed } = await Swal.fire({
      ...swalBase,
      title: 'Restablecer apariencia',
      text: 'Se volverá a los colores, textos e imágenes de fábrica y se borrarán las imágenes subidas. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, restablecer',
      cancelButtonText: 'Cancelar',
    });
    if (isConfirmed) ejecutar(restablecer, 'Restablecido');
  };

  const Seccion = PESTANAS[pestana][1];

  return (
    <Box sx={{ width: '100%', p: '20px' }}>
      <Paper
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3,
          p: '15px',
          mb: 4,
          boxShadow: '0px 0px 5px 5px rgb(0 0 0 / 10%)',
          borderRadius: '4px',
          // Los botones siguen a la vista al recorrer un formulario largo.
          position: 'sticky',
          top: 0,
          zIndex: 3,
        }}
      >
        <Box>
          <Typography variant='h2' component='h1' sx={{ fontWeight: 'bold' }}>
            {titulo || 'Apariencia'}
          </Typography>
          <Typography variant='subtitle1' color='text.secondary'>
            {sucio ? 'Tienes cambios sin guardar: solo tú los ves por ahora.' : 'Colores, textos, menú, iconos, logos e imágenes del sitio.'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2.5 }}>
          {urlAyuda && <HelpButton url={urlAyuda} />}
          {puedeModificar && (
            <>
              <Button color='inherit' startIcon={<RestartAltIcon />} disabled={guardando} onClick={onRestablecer}>
                Restablecer
              </Button>
              <Button variant='outlined' startIcon={<UndoIcon />} disabled={!sucio || guardando} onClick={descartar}>
                Descartar
              </Button>
              <Button
                variant='contained'
                startIcon={guardando ? <CircularProgress size={16} color='inherit' /> : <SaveIcon />}
                disabled={!sucio || guardando}
                onClick={onGuardar}
              >
                Guardar
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {cargado && !puedeModificar && (
        <Alert severity='info' sx={{ mb: 4 }}>
          Tu rol puede ver la apariencia pero no modificarla.
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 380px' }, alignItems: 'start' }}>
        <Paper sx={{ minWidth: 0 }}>
          <Tabs
            value={pestana}
            onChange={(_, nueva) => setPestana(nueva)}
            variant='scrollable'
            scrollButtons='auto'
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
          >
            {PESTANAS.map(([nombre]) => (
              <Tab key={nombre} label={nombre} sx={{ textTransform: 'none' }} />
            ))}
          </Tabs>
          <Box sx={{ p: { xs: 4, md: 6 } }}>
            {cargada ? (
              <Seccion config={config} cambiar={cambiar} imagen={imagen} disabled={disabled} />
            ) : (
              <Box sx={{ display: 'grid', placeItems: 'center', py: 20 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Paper>

        <Paper sx={{ p: 4, position: { lg: 'sticky' }, top: { lg: 100 } }}>
          <VistaPrevia config={config} imagenes={imagenes} />
        </Paper>
      </Box>
    </Box>
  );
};

Apariencia.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Apariencia;
