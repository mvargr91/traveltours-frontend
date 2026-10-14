// Componente limpio de traducción con Google Translate (W3Schools)
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import CheckIcon from '@mui/icons-material/Check';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export const IDIOMAS_SOPORTADOS = [
  { codigo: 'es', nombre: 'Español', bandera: '🇪🇸', etiqueta: 'Original' },
  { codigo: 'en', nombre: 'English', bandera: '🇺🇸', etiqueta: 'Inglés' },
  { codigo: 'fr', nombre: 'Français', bandera: '🇫🇷', etiqueta: 'Francés' },
  { codigo: 'de', nombre: 'Deutsch', bandera: '🇩🇪', etiqueta: 'Alemán' },
  { codigo: 'it', nombre: 'Italiano', bandera: '🇮🇹', etiqueta: 'Italiano' },
  { codigo: 'pt', nombre: 'Português', bandera: '🇧🇷', etiqueta: 'Portugués' },
];

const obtenerIdiomaActivo = () => {
  if (typeof document === 'undefined') return 'es';
  try {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=\/es\/([a-zA-Z\-]+)/);
    if (match && match[1]) return match[1];
  } catch (e) {
    // Fallback silencioso
  }
  return 'es';
};

const aplicarTraduccion = (codigoDestino) => {
  const domain = window.location.hostname;
  const isLocalhost = domain === 'localhost' || domain === '127.0.0.1';
  const domainAttr = isLocalhost ? '' : `; domain=.${domain}`;

  if (codigoDestino === 'es') {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${domainAttr}`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `googtrans=/es/es; path=/;${domainAttr}`;
    document.cookie = `googtrans=/es/es; path=/;`;
  } else {
    const cookieValor = `/es/${codigoDestino}`;
    document.cookie = `googtrans=${cookieValor}; path=/;${domainAttr}`;
    document.cookie = `googtrans=${cookieValor}; path=/;`;
  }

  const combo = document.querySelector('.goog-te-combo');
  if (combo) {
    combo.value = codigoDestino;
    combo.dispatchEvent(new Event('change'));
  } else {
    window.location.reload();
  }
};

const GoogleTranslate = ({ showLabel = false, size = 'medium', sx = {}, ...rest }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [idiomaActivo, setIdiomaActivo] = useState(obtenerIdiomaActivo);

  const menuAbierto = Boolean(anchorEl);

  useEffect(() => {
    // 1. Inicializador de Google Translate según W3Schools
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'es',
            includedLanguages: IDIOMAS_SOPORTADOS.map((i) => i.codigo).join(','),
            autoDisplay: false,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element',
        );
      } catch (err) {
        console.warn('Google Translate init:', err);
      }
    };

    // 2. Inyección del script de W3Schools
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      const contenedor = document.getElementById('google_translate_element');
      if (contenedor && !contenedor.hasChildNodes()) {
        window.googleTranslateElementInit();
      }
    }
  }, []);

  const handleClick = (event) => {
    event?.stopPropagation?.();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSeleccionarIdioma = (codigo) => {
    setIdiomaActivo(codigo);
    aplicarTraduccion(codigo);
    handleClose();
  };

  const idiomaActualObj =
    IDIOMAS_SOPORTADOS.find((i) => i.codigo.toLowerCase() === idiomaActivo.toLowerCase()) || IDIOMAS_SOPORTADOS[0];

  const estaTraducido = idiomaActivo !== 'es';
  const tituloTooltip = estaTraducido
    ? `Traducido a ${idiomaActualObj.nombre}`
    : 'Traducir página';

  const isDark = theme.palette.mode === 'dark';

  return (
    <>
      {showLabel ? (
        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            cursor: 'pointer',
            py: 1,
            px: 1.5,
            borderRadius: 2,
            transition: 'all 0.2s ease',
            bgcolor: estaTraducido ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
            '&:hover': {
              bgcolor: estaTraducido ? alpha(theme.palette.primary.main, 0.15) : 'action.hover',
            },
            ...sx,
          }}
          {...rest}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TranslateOutlinedIcon
              sx={{
                color: estaTraducido ? 'primary.main' : 'text.secondary',
                fontSize: 22,
              }}
            />
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              Traducir página
            </Typography>
          </Box>
          <Chip
            size='small'
            label={`${idiomaActualObj.bandera} ${idiomaActualObj.codigo.toUpperCase()}`}
            color={estaTraducido ? 'primary' : 'default'}
            variant={estaTraducido ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24 }}
          />
        </Box>
      ) : (
        <Tooltip title={tituloTooltip} arrow>
          <IconButton
            onClick={handleClick}
            size={size}
            aria-label={tituloTooltip}
            sx={{
              position: 'relative',
              transition: 'all 0.25s ease-in-out',
              color: estaTraducido ? 'primary.main' : 'text.secondary',
              bgcolor: estaTraducido
                ? alpha(theme.palette.primary.main, 0.12)
                : isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.04)',
              border: estaTraducido ? `1px solid ${alpha(theme.palette.primary.main, 0.35)}` : '1px solid transparent',
              '&:hover': {
                bgcolor: estaTraducido
                  ? alpha(theme.palette.primary.main, 0.2)
                  : isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.08)',
                transform: 'scale(1.05)',
              },
              ...sx,
            }}
            {...rest}
          >
            <TranslateOutlinedIcon sx={{ fontSize: size === 'small' ? 20 : 22 }} />
            {estaTraducido && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  px: 0.4,
                  py: 0.2,
                  borderRadius: 1,
                  boxShadow: 1,
                  letterSpacing: 0.5,
                }}
              >
                {idiomaActualObj.codigo.substring(0, 2).toUpperCase()}
              </Box>
            )}
          </IconButton>
        </Tooltip>
      )}

      {/* Contenedor del elemento de Google Translate según W3Schools */}
      <div id='google_translate_element' style={{ display: 'none' }}></div>

      {/* Menú de selección de idiomas */}
      <Menu
        anchorEl={anchorEl}
        open={menuAbierto}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: 3,
            minWidth: 230,
            maxHeight: 440,
            mt: 1,
            p: 0.5,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, color: 'text.primary' }}>
              Traducir página
            </Typography>
            <Chip
              size='small'
              label={`${idiomaActualObj.bandera} ${idiomaActualObj.codigo.toUpperCase()}`}
              color={estaTraducido ? 'primary' : 'default'}
              variant={estaTraducido ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20 }}
            />
          </Box>
          <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
            Google Translate
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />

        {IDIOMAS_SOPORTADOS.map((item) => {
          const esSeleccionado = idiomaActivo.toLowerCase() === item.codigo.toLowerCase();
          return (
            <MenuItem
              key={item.codigo}
              onClick={() => handleSeleccionarIdioma(item.codigo)}
              selected={esSeleccionado}
              sx={{
                borderRadius: 1.5,
                my: 0.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.18),
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>{item.bandera}</Typography>
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: esSeleccionado ? 700 : 500 }}>
                    {item.nombre}
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                    {item.etiqueta}
                  </Typography>
                </Box>
              </Box>
              {esSeleccionado && <CheckIcon fontSize='small' color='primary' />}
            </MenuItem>
          );
        })}

        {estaTraducido && (
          <>
            <Divider sx={{ my: 1 }} />
            <MenuItem
              onClick={() => handleSeleccionarIdioma('es')}
              sx={{
                borderRadius: 1.5,
                color: 'primary.main',
                fontWeight: 600,
                gap: 1.5,
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 28 }}>
                <RestartAltIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText primary='Restablecer a Español' />
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

GoogleTranslate.propTypes = {
  showLabel: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  sx: PropTypes.object,
};

export default GoogleTranslate;
