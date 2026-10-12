// Vista previa del editor de apariencia: miniaturas del portal y del panel con los valores
// que se están editando (incluidas las imágenes aún sin guardar).
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Icon, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ThemeProvider, alpha } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { getPortalTheme } from '../../../shared/components/Portal/portalTheme';
import { gradienteFranja, textoSobre } from '../../../shared/constants/Apariencia';
import { Fonts } from '../../../shared/constants/AppEnums';

const Marco = ({ titulo, children }) => (
  <Box sx={{ mb: 5 }}>
    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {titulo}
    </Typography>
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>{children}</Box>
  </Box>
);

Marco.propTypes = {
  titulo: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const Portal = ({ config, imagenes, oscuro }) => {
  const { marca, portal, inicio, textos } = config;
  const theme = useMemo(() => getPortalTheme(oscuro ? 'dark' : 'light', portal), [oscuro, portal]);
  const colores = oscuro ? portal.oscuro : portal.claro;
  const enlaces = portal.menu.filter((enlace) => enlace.visible);
  const franja = portal.mostrarFranja && <Box sx={{ height: 3, background: gradienteFranja(portal.franja) }} />;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', color: 'text.primary', fontSize: 11 }}>
        {franja}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2, bgcolor: 'background.paper' }}>
          <Box component='img' src={oscuro ? imagenes.logo_oscuro : imagenes.logo_principal} alt='' sx={{ height: 26, mr: 'auto' }} />
          {enlaces.map((enlace, i) => (
            <Box
              key={enlace.clave}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontWeight: Fonts.MEDIUM,
                // El primero se muestra como el enlace activo.
                ...(i === 0 && { color: enlace.color, bgcolor: alpha(enlace.color, 0.1) }),
              }}
            >
              {enlace.icono && <Icon sx={{ fontSize: 13 }}>{enlace.icono}</Icon>}
              {enlace.etiqueta}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            px: 3,
            py: 5,
            color: inicio.textoHero,
            background: `linear-gradient(rgba(0, 0, 0, ${inicio.oscurecer}), rgba(0, 0, 0, ${inicio.oscurecer})), url("${imagenes.imagen_inicio}") center / cover no-repeat, linear-gradient(120deg, ${portal.primarioOscuro} 0%, ${portal.primario} 100%)`,
          }}
        >
          <Typography sx={{ fontSize: 17, fontWeight: Fonts.BOLD, lineHeight: 1.2 }}>{marca.eslogan}</Typography>
          <Typography sx={{ fontSize: 10, opacity: 0.9, mt: 1, mb: 2.5, maxWidth: 260 }}>{marca.descripcion}</Typography>
          <Button variant='contained' size='small' sx={{ fontSize: 10, py: 0.5 }}>
            {textos.inicio.buscar}
          </Button>
        </Box>

        {inicio.propuestas.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, p: 3 }}>
            {inicio.propuestas.slice(0, 3).map((propuesta, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                  borderTop: `3px solid ${portal.franja[(i * 2) % portal.franja.length]}`,
                }}
              >
                {propuesta.icono && <Icon color='primary' sx={{ fontSize: 16 }}>{propuesta.icono}</Icon>}
                <Typography noWrap sx={{ fontSize: 10, fontWeight: Fonts.MEDIUM }}>{propuesta.titulo}</Typography>
                <Typography noWrap color='text.secondary' sx={{ fontSize: 9 }}>{propuesta.texto}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {franja}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2.5, bgcolor: colores.pie, color: alpha('#FFFFFF', 0.75) }}>
          <Box component='img' src={imagenes.logo_oscuro} alt='' sx={{ height: 22 }} />
          <Typography noWrap sx={{ fontSize: 9 }}>© {marca.nombre}</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

Portal.propTypes = {
  config: PropTypes.object.isRequired,
  imagenes: PropTypes.object.isRequired,
  oscuro: PropTypes.bool,
};

const Panel = ({ config, imagenes, oscuro }) => {
  const { panel } = config;
  const colores = oscuro ? panel.oscuro : panel.claro;
  const { menu } = panel;
  const modulos = ['Catálogo', 'Ventas', 'Marketing'];

  return (
    <Box sx={{ bgcolor: colores.fondo, color: colores.texto, fontSize: 11 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 6, py: 4, bgcolor: colores.superficie }}>
        <Box component='img' src={oscuro ? imagenes.logo_oscuro : imagenes.logo_principal} alt='' sx={{ height: 24 }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, px: 6, py: 3, bgcolor: oscuro ? menu.fondoOscuro : menu.fondo, color: menu.texto }}>
        {modulos.map((modulo, i) => (
          <Box
            key={modulo}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              ...(i === 0 && { bgcolor: menu.seleccionFondo, color: menu.seleccionTexto }),
            }}
          >
            {modulo}
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 6 }}>
        <Box sx={{ p: 6, borderRadius: 3, bgcolor: colores.superficie }}>
          <Typography sx={{ fontSize: 13, fontWeight: Fonts.BOLD, color: panel.encabezado }}>Título de la pantalla</Typography>
          <Typography sx={{ fontSize: 10, color: colores.textoSecundario, mb: 5 }}>Texto secundario de ejemplo</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {[
              ['Guardar', panel.principal],
              ['Filtrar', panel.acento],
              ['Eliminar', panel.peligro],
            ].map(([texto, fondo]) => (
              <Box key={texto} sx={{ px: 5, py: 1.5, borderRadius: 2, bgcolor: fondo, color: textoSobre(fondo), fontWeight: Fonts.MEDIUM }}>
                {texto}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

Panel.propTypes = Portal.propTypes;

const VistaPrevia = ({ config, imagenes }) => {
  const [modo, setModo] = useState('claro');
  const oscuro = modo === 'oscuro';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant='h4'>Vista previa</Typography>
        <ToggleButtonGroup size='small' exclusive value={modo} onChange={(_, nuevo) => nuevo && setModo(nuevo)}>
          <ToggleButton value='claro' aria-label='Modo claro'>
            <LightModeIcon fontSize='small' />
          </ToggleButton>
          <ToggleButton value='oscuro' aria-label='Modo oscuro'>
            <DarkModeIcon fontSize='small' />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Marco titulo='Portal público'>
        <Portal config={config} imagenes={imagenes} oscuro={oscuro} />
      </Marco>
      <Marco titulo='Panel administrativo'>
        <Panel config={config} imagenes={imagenes} oscuro={oscuro} />
      </Marco>
    </Box>
  );
};

VistaPrevia.propTypes = {
  config: PropTypes.object.isRequired,
  // URL de cada imagen (clave = columna), ya resuelta.
  imagenes: PropTypes.object.isRequired,
};

export default VistaPrevia;
