// Campos del editor de apariencia: color, icono, imagen y título de grupo.
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  Box,
  Button,
  FormHelperText,
  Icon,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RestoreIcon from '@mui/icons-material/Restore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Fonts } from '../../../shared/constants/AppEnums';
import { TIPOS_ARCHIVO } from '../../../shared/components/MyFileField';
import {
  ES_COLOR,
  ES_ICONO,
  ICONOS_SUGERIDOS,
  IMAGENES_APARIENCIA,
  contraste,
} from '../../../shared/constants/Apariencia';

// Título de un grupo de campos (mismo estilo que SeccionForm de los formularios CRUD).
export const Grupo = ({ titulo, ayuda, children }) => (
  <Box sx={{ mb: 8 }}>
    <Typography
      variant='subtitle2'
      sx={{
        pb: 1,
        color: 'primary.main',
        fontWeight: Fonts.BOLD,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {titulo}
    </Typography>
    {ayuda && (
      <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
        {ayuda}
      </Typography>
    )}
    <Box sx={{ mt: 4 }}>{children}</Box>
  </Box>
);

Grupo.propTypes = {
  titulo: PropTypes.string.isRequired,
  ayuda: PropTypes.node,
  children: PropTypes.node,
};

// Cuadrícula de campos: 1 columna en móvil, 2 en tablet y 3 en escritorio.
export const Rejilla = ({ children, columnas = 3 }) => (
  <Box
    sx={{
      display: 'grid',
      gap: 4,
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: `repeat(${columnas}, minmax(0, 1fr))` },
      alignItems: 'start',
    }}
  >
    {children}
  </Box>
);

Rejilla.propTypes = {
  children: PropTypes.node,
  columnas: PropTypes.number,
};

/**
 * Color #RRGGBB: muestra el selector del navegador y permite escribir el código.
 * "sobre" es el color con el que se combina (texto/fondo): avisa si el contraste es bajo.
 */
export const CampoColor = ({ label, value, onChange, disabled, sobre }) => {
  const [escrito, setEscrito] = useState(value);

  useEffect(() => {
    setEscrito(value);
  }, [value]);

  const escribir = (evento) => {
    const nuevo = evento.target.value.trim();
    setEscrito(nuevo);
    const conNumeral = nuevo.startsWith('#') ? nuevo : `#${nuevo}`;
    if (ES_COLOR.test(conNumeral)) onChange(conNumeral.toUpperCase());
  };

  const invalido = !ES_COLOR.test(escrito.startsWith('#') ? escrito : `#${escrito}`);
  const pocoContraste = sobre && contraste(value, sobre) < 3;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
      <Box
        component='label'
        sx={{
          position: 'relative',
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: value,
          overflow: 'hidden',
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        <input
          type='color'
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(evento) => onChange(evento.target.value.toUpperCase())}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'inherit' }}
        />
      </Box>
      <TextField
        fullWidth
        size='small'
        label={label}
        value={escrito}
        disabled={disabled}
        error={invalido}
        onChange={escribir}
        onBlur={() => setEscrito(value)}
        inputProps={{ maxLength: 7, spellCheck: false, style: { fontFamily: 'monospace' } }}
        InputProps={{
          endAdornment: pocoContraste ? (
            <InputAdornment position='end'>
              <Tooltip title='Poco contraste con el color que lo acompaña: puede leerse mal.'>
                <WarningAmberIcon color='warning' fontSize='small' />
              </Tooltip>
            </InputAdornment>
          ) : null,
        }}
      />
    </Box>
  );
};

CampoColor.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  sobre: PropTypes.string,
};

/** Icono de Material Icons: lista sugerida con vista previa, o cualquier nombre escrito a mano. */
export const CampoIcono = ({ label = 'Icono', value, onChange, disabled }) => {
  const cambiar = (nuevo) => {
    const nombre = (nuevo ?? '').trim().toLowerCase().replace(/\s+/g, '_');
    if (nombre === '' || ES_ICONO.test(nombre)) onChange(nombre);
  };

  return (
    <Autocomplete
      freeSolo
      size='small'
      disabled={disabled}
      options={ICONOS_SUGERIDOS}
      value={value}
      inputValue={value}
      onChange={(_, nuevo) => cambiar(nuevo)}
      onInputChange={(_, nuevo, motivo) => motivo !== 'reset' && cambiar(nuevo)}
      renderOption={(props, opcion) => (
        <Box component='li' {...props} key={opcion} sx={{ display: 'flex', gap: 3 }}>
          <Icon fontSize='small'>{opcion}</Icon>
          {opcion}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder='Sin icono'
          InputProps={{
            ...params.InputProps,
            startAdornment: value ? (
              <InputAdornment position='start'>
                <Icon fontSize='small'>{value}</Icon>
              </InputAdornment>
            ) : null,
          }}
        />
      )}
    />
  );
};

CampoIcono.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

/**
 * Imagen de la apariencia. El archivo se sube al guardar; "Usar predeterminada" quita la
 * imagen propia (también al guardar).
 */
export const CampoImagen = ({ clave, url, personalizada, onArchivo, onQuitar, disabled, fondoOscuro, alto = 96 }) => {
  const { etiqueta, ayuda } = IMAGENES_APARIENCIA[clave];
  const { accept, extensiones, maxMB } = TIPOS_ARCHIVO.imagen;
  const input = useRef(null);
  const [error, setError] = useState('');

  const seleccionar = (evento) => {
    const elegido = evento.target.files?.[0];
    evento.target.value = ''; // permite volver a elegir el mismo archivo
    if (!elegido) return;
    if (!extensiones.includes(elegido.name.split('.').pop().toLowerCase())) {
      setError(`Formatos permitidos: ${extensiones.join(', ')}`);
    } else if (elegido.size > maxMB * 1048576) {
      setError(`El archivo no puede pesar más de ${maxMB} MB`);
    } else {
      setError('');
      onArchivo(elegido);
    }
  };

  return (
    <Box sx={{ border: '1px dashed', borderColor: error ? 'error.main' : 'divider', borderRadius: 2, p: 4 }}>
      <Typography variant='subtitle1' sx={{ fontWeight: Fonts.MEDIUM }}>
        {etiqueta}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {ayuda}
      </Typography>
      <Box
        sx={{
          height: alto,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 1,
          overflow: 'hidden',
          // Los logos para fondo oscuro se revisan sobre oscuro.
          bgcolor: fondoOscuro ? '#1F2933' : '#F1F4F7',
        }}
      >
        <Box component='img' src={url} alt={etiqueta} sx={{ maxWidth: '100%', maxHeight: alto, objectFit: 'contain' }} />
      </Box>
      {!disabled && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
          <Button variant='outlined' size='small' startIcon={<UploadFileIcon />} onClick={() => input.current?.click()}>
            Cambiar
          </Button>
          {personalizada && (
            <Button size='small' color='inherit' startIcon={<RestoreIcon />} onClick={() => { setError(''); onQuitar(); }}>
              Usar predeterminada
            </Button>
          )}
        </Box>
      )}
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 2 }}>
        {extensiones.join(', ').toUpperCase()} · máximo {maxMB} MB
      </Typography>
      {error && <FormHelperText error>{error}</FormHelperText>}
      <input ref={input} type='file' hidden accept={accept} onChange={seleccionar} />
    </Box>
  );
};

CampoImagen.propTypes = {
  clave: PropTypes.oneOf(Object.keys(IMAGENES_APARIENCIA)).isRequired,
  url: PropTypes.string.isRequired,
  // true si hay una imagen propia (guardada o recién elegida) que se puede quitar.
  personalizada: PropTypes.bool,
  onArchivo: PropTypes.func.isRequired,
  onQuitar: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  fondoOscuro: PropTypes.bool,
  alto: PropTypes.number,
};
