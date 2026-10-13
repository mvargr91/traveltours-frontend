// Pestañas del editor de apariencia. Cada una recibe:
//   config            configuración completa en edición
//   cambiar(ruta, v)  cambia un valor por su ruta ('portal.claro.fondo', 'portal.menu[0].color'...)
//   imagen(clave)     props de CampoImagen para esa imagen
//   disabled          sin permiso para modificar
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Slider,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestoreIcon from '@mui/icons-material/Restore';
import SearchIcon from '@mui/icons-material/Search';
import { ES_ENLACE, MAX_COLORES_FRANJA, MAX_PROPUESTAS, REDES_SOCIALES, RUTAS_MENU_PORTAL } from '../../../shared/constants/Apariencia';
import { MAX_TEXTO, TEXTOS_PORTAL, variablesDe } from '../../../shared/constants/TextosPortal';
import { CampoColor, CampoIcono, CampoImagen, Grupo, Rejilla } from './Campos';

const propTypes = {
  config: PropTypes.object.isRequired,
  cambiar: PropTypes.func.isRequired,
  imagen: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

// Fila de una lista editable (enlace del menú, propuesta).
const filaSx = {
  display: 'grid',
  gap: 4,
  alignItems: 'center',
  p: 4,
  mb: 3,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
};

export const SeccionMarca = ({ config, cambiar, imagen, disabled }) => {
  const { marca } = config;
  const campo = (clave, label, max, props = {}) => (
    <TextField
      fullWidth
      size='small'
      label={label}
      value={marca[clave]}
      disabled={disabled}
      onChange={(e) => cambiar(`marca.${clave}`, e.target.value.slice(0, max))}
      inputProps={{ maxLength: max }}
      {...props}
    />
  );

  return (
    <>
      <Grupo titulo='Textos de la marca' ayuda='Se usan en el encabezado del inicio, el pie de página y la pestaña del navegador.'>
        <Rejilla columnas={2}>
          {campo('nombre', 'Nombre del sitio', 80, { required: true, error: !marca.nombre.trim() })}
          {campo('eslogan', 'Eslogan (título del inicio)', 120)}
          {campo('descripcion', 'Descripción bajo el eslogan', 300, { multiline: true, minRows: 2 })}
          {campo('pie', 'Texto del pie de página', 300, { multiline: true, minRows: 2 })}
        </Rejilla>
      </Grupo>

      <Grupo titulo='Logos'>
        <Rejilla>
          <CampoImagen {...imagen('logo_principal')} />
          <CampoImagen {...imagen('logo_oscuro')} fondoOscuro />
          <CampoImagen {...imagen('isotipo')} />
          <CampoImagen {...imagen('favicon')} />
        </Rejilla>
      </Grupo>
    </>
  );
};
SeccionMarca.propTypes = propTypes;

// Campo de enlace (red social, video): debe empezar por http(s)://.
const CampoEnlace = ({ label, value, onChange, disabled, ayuda }) => {
  const invalido = Boolean(value) && !ES_ENLACE.test(value);
  return (
    <TextField
      fullWidth
      size='small'
      type='url'
      label={label}
      value={value}
      disabled={disabled}
      placeholder='https://'
      error={invalido}
      helperText={invalido ? 'Debe ser un enlace completo que empiece por https://' : ayuda}
      onChange={(e) => onChange(e.target.value.trim().slice(0, 300))}
      inputProps={{ maxLength: 300 }}
    />
  );
};
CampoEnlace.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  ayuda: PropTypes.string,
};

export const SeccionContacto = ({ config, cambiar, disabled }) => {
  const { contacto } = config;
  const campo = (clave, label, max, props = {}) => (
    <TextField
      fullWidth
      size='small'
      label={label}
      value={contacto[clave]}
      disabled={disabled}
      onChange={(e) => cambiar(`contacto.${clave}`, e.target.value.slice(0, max))}
      inputProps={{ maxLength: max }}
      {...props}
    />
  );

  return (
    <>
      <Grupo titulo='Datos de contacto' ayuda='Se muestran en el pie de página del portal. Lo que quede vacío no aparece.'>
        <Rejilla>
          {campo('correo', 'Correo de contacto', 120, { type: 'email' })}
          {campo('telefono', 'Teléfono', 30)}
          {campo('direccion', 'Dirección o ciudad', 150)}
        </Rejilla>
        <Alert severity='info' sx={{ mt: 4 }}>
          El número de WhatsApp (botón flotante y botón de contacto del pie) se define en Parametrización › Parámetros,
          parámetro WHATSAPP_NUMERO. Sin WhatsApp, el botón de contacto abre el correo.
        </Alert>
      </Grupo>

      <Grupo titulo='Redes sociales' ayuda='Pega el enlace completo del perfil. Cada red con enlace aparece como icono en el pie de página.'>
        <Rejilla>
          {REDES_SOCIALES.map(([red, nombre]) => (
            <CampoEnlace key={red} label={nombre} value={contacto[red]} disabled={disabled} onChange={(v) => cambiar(`contacto.${red}`, v)} />
          ))}
        </Rejilla>
      </Grupo>
    </>
  );
};
SeccionContacto.propTypes = propTypes;

const COLORES_MODO_PORTAL = [
  ['fondo', 'Fondo de la página'],
  ['superficie', 'Tarjetas y encabezado'],
  ['texto', 'Texto principal', 'superficie'],
  ['textoSecundario', 'Texto secundario', 'superficie'],
  ['secundario', 'Color secundario'],
  ['pie', 'Fondo del pie de página'],
];

export const SeccionPortal = ({ config, cambiar, disabled }) => {
  const { portal } = config;

  const cambiarFranja = (franja) => cambiar('portal.franja', franja);

  return (
    <>
      <Grupo titulo='Colores principales' ayuda='Botones, enlaces y elementos destacados del portal público.'>
        <Rejilla>
          <CampoColor label='Color primario' value={portal.primario} disabled={disabled} onChange={(v) => cambiar('portal.primario', v)} />
          <CampoColor label='Primario oscuro (al pasar el cursor)' value={portal.primarioOscuro} disabled={disabled} onChange={(v) => cambiar('portal.primarioOscuro', v)} />
        </Rejilla>
      </Grupo>

      <Grupo titulo='Franja de colores' ayuda='Línea decorativa sobre el encabezado y el pie. Sus colores también se usan en los marcadores del mapa y en las tarjetas del inicio.'>
        <FormControlLabel
          sx={{ mb: 3 }}
          control={<Switch checked={portal.mostrarFranja} disabled={disabled} onChange={(e) => cambiar('portal.mostrarFranja', e.target.checked)} />}
          label='Mostrar la franja'
        />
        <Rejilla>
          {portal.franja.map((color, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <CampoColor label={`Color ${i + 1}`} value={color} disabled={disabled} onChange={(v) => cambiarFranja(portal.franja.map((c, j) => (j === i ? v : c)))} />
              </Box>
              {!disabled && portal.franja.length > 2 && (
                <Tooltip title='Quitar color'>
                  <IconButton size='small' onClick={() => cambiarFranja(portal.franja.filter((_, j) => j !== i))}>
                    <DeleteOutlineIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Rejilla>
        {!disabled && portal.franja.length < MAX_COLORES_FRANJA && (
          <Button sx={{ mt: 3 }} size='small' startIcon={<AddIcon />} onClick={() => cambiarFranja([...portal.franja, portal.primario])}>
            Agregar color
          </Button>
        )}
      </Grupo>

      {[
        ['claro', 'Modo claro'],
        ['oscuro', 'Modo oscuro'],
      ].map(([modo, titulo]) => (
        <Grupo key={modo} titulo={titulo}>
          <Rejilla>
            {COLORES_MODO_PORTAL.map(([clave, label, sobre]) => (
              <CampoColor
                key={clave}
                label={label}
                value={portal[modo][clave]}
                sobre={sobre && portal[modo][sobre]}
                disabled={disabled}
                onChange={(v) => cambiar(`portal.${modo}.${clave}`, v)}
              />
            ))}
          </Rejilla>
        </Grupo>
      ))}
    </>
  );
};
SeccionPortal.propTypes = propTypes;

export const SeccionMenu = ({ config, cambiar, disabled }) => {
  const { menu } = config.portal;

  const mover = (i, salto) => {
    const copia = [...menu];
    [copia[i], copia[i + salto]] = [copia[i + salto], copia[i]];
    cambiar('portal.menu', copia);
  };

  return (
    <Grupo
      titulo='Menú del portal'
      ayuda='Orden, nombre, color e icono de cada opción del menú superior del portal. El color se ve al pasar el cursor y en la opción activa.'
    >
      {menu.map((enlace, i) => (
        <Box key={enlace.clave} sx={{ ...filaSx, gridTemplateColumns: { xs: '1fr', md: 'auto 1.2fr 1fr 1fr auto' }, opacity: enlace.visible ? 1 : 0.6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={enlace.visible ? 'Visible en el menú' : 'Oculta'}>
              <Switch checked={enlace.visible} disabled={disabled} onChange={(e) => cambiar(`portal.menu[${i}].visible`, e.target.checked)} />
            </Tooltip>
          </Box>
          <TextField
            fullWidth
            size='small'
            label='Nombre'
            value={enlace.etiqueta}
            disabled={disabled}
            error={!enlace.etiqueta.trim()}
            helperText={`Abre ${RUTAS_MENU_PORTAL[enlace.clave]}`}
            onChange={(e) => cambiar(`portal.menu[${i}].etiqueta`, e.target.value.slice(0, 30))}
            inputProps={{ maxLength: 30 }}
          />
          <CampoColor label='Color' value={enlace.color} disabled={disabled} onChange={(v) => cambiar(`portal.menu[${i}].color`, v)} />
          <CampoIcono value={enlace.icono} disabled={disabled} onChange={(v) => cambiar(`portal.menu[${i}].icono`, v)} />
          {!disabled && (
            <Box sx={{ display: 'flex' }}>
              <Tooltip title='Subir'>
                <span>
                  <IconButton size='small' disabled={i === 0} onClick={() => mover(i, -1)}>
                    <ArrowUpwardIcon fontSize='small' />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title='Bajar'>
                <span>
                  <IconButton size='small' disabled={i === menu.length - 1} onClick={() => mover(i, 1)}>
                    <ArrowDownwardIcon fontSize='small' />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        </Box>
      ))}
    </Grupo>
  );
};
SeccionMenu.propTypes = propTypes;

export const SeccionInicio = ({ config, cambiar, imagen, disabled }) => {
  const { inicio } = config;
  const { propuestas } = inicio;
  const cambiarPropuestas = (lista) => cambiar('inicio.propuestas', lista);

  return (
    <>
      <Grupo titulo='Encabezado del inicio' ayuda='Imagen de fondo del primer bloque de la página de inicio, con el eslogan y el buscador encima.'>
        <CampoImagen {...imagen('imagen_inicio')} alto={180} />
        <Box sx={{ mt: 5 }}>
          <CampoEnlace
            label='Video de fondo (opcional)'
            value={inicio.video}
            disabled={disabled}
            ayuda='Enlace directo a un archivo .mp4 o .webm (no sirve un enlace de YouTube). Se reproduce en silencio y en bucle sobre la imagen, que queda de portada mientras carga.'
            onChange={(v) => cambiar('inicio.video', v)}
          />
        </Box>
        <Box sx={{ mt: 5 }}>
          <Rejilla columnas={2}>
            <CampoColor label='Color del texto sobre la imagen' value={inicio.textoHero} disabled={disabled} onChange={(v) => cambiar('inicio.textoHero', v)} />
            <Box>
              <Typography variant='body2' color='text.secondary'>
                Oscurecer la imagen: {Math.round(inicio.oscurecer * 100)}%
              </Typography>
              <Slider
                size='small'
                min={0}
                max={0.9}
                step={0.05}
                value={inicio.oscurecer}
                disabled={disabled}
                onChange={(_, v) => cambiar('inicio.oscurecer', v)}
                aria-label='Oscurecer la imagen'
              />
            </Box>
          </Rejilla>
        </Box>
      </Grupo>

      <Grupo titulo='Tarjetas de propuesta de valor' ayuda='Bloques con icono, título y texto que aparecen en el inicio, debajo de los destinos.'>
        {propuestas.map((propuesta, i) => (
          <Box key={i} sx={{ ...filaSx, gridTemplateColumns: { xs: '1fr', md: '1fr 1.3fr 2fr auto' } }}>
            <CampoIcono value={propuesta.icono} disabled={disabled} onChange={(v) => cambiar(`inicio.propuestas[${i}].icono`, v)} />
            <TextField
              fullWidth
              size='small'
              label='Título'
              value={propuesta.titulo}
              disabled={disabled}
              error={!propuesta.titulo.trim()}
              onChange={(e) => cambiar(`inicio.propuestas[${i}].titulo`, e.target.value.slice(0, 60))}
              inputProps={{ maxLength: 60 }}
            />
            <TextField
              fullWidth
              size='small'
              label='Texto'
              value={propuesta.texto}
              disabled={disabled}
              onChange={(e) => cambiar(`inicio.propuestas[${i}].texto`, e.target.value.slice(0, 200))}
              inputProps={{ maxLength: 200 }}
            />
            {!disabled && (
              <Tooltip title='Quitar tarjeta'>
                <IconButton size='small' onClick={() => cambiarPropuestas(propuestas.filter((_, j) => j !== i))}>
                  <DeleteOutlineIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ))}
        {!disabled && propuestas.length < MAX_PROPUESTAS && (
          <Button size='small' startIcon={<AddIcon />} onClick={() => cambiarPropuestas([...propuestas, { icono: 'star', titulo: 'Nueva tarjeta', texto: '' }])}>
            Agregar tarjeta
          </Button>
        )}
      </Grupo>
    </>
  );
};
SeccionInicio.propTypes = propTypes;

// Un texto del portal: muestra las variables que admite y permite volver al de fábrica.
const CampoTexto = ({ etiqueta, base, valor, onChange, disabled }) => {
  const variables = variablesDe(base);
  const ayuda = [
    !valor.trim() && 'Vacío: se usará el texto original.',
    variables.length > 0 && `Variables: ${variables.join(' ')}`,
    base.includes('**') && '**así** va en negrita',
  ].filter(Boolean).join(' · ');

  return (
    <TextField
      fullWidth
      multiline
      size='small'
      label={etiqueta}
      value={valor}
      placeholder={base}
      helperText={ayuda}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value.replace(/\s*\n\s*/g, ' ').slice(0, MAX_TEXTO))}
      inputProps={{ maxLength: MAX_TEXTO }}
      InputLabelProps={{ shrink: true }}
      InputProps={{
        endAdornment:
          !disabled && valor !== base ? (
            <InputAdornment position='end'>
              <Tooltip title='Volver al texto original'>
                <IconButton size='small' edge='end' onClick={() => onChange(base)}>
                  <RestoreIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : null,
      }}
    />
  );
};
CampoTexto.propTypes = {
  etiqueta: PropTypes.string.isRequired,
  base: PropTypes.string.isRequired,
  valor: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export const SeccionTextos = ({ config, cambiar, disabled }) => {
  const { textos } = config;
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState('');
  const buscado = busqueda.trim().toLowerCase();

  // Se filtra con los textos del momento en que se busca: así un campo no desaparece mientras se edita.
  const grupos = useMemo(
    () =>
      TEXTOS_PORTAL.map((grupo) => ({
        ...grupo,
        campos: grupo.campos.filter(([clave, etiqueta, base]) =>
          [etiqueta, base, textos[grupo.clave][clave]].some((valor) => valor.toLowerCase().includes(buscado)),
        ),
      })).filter((grupo) => grupo.campos.length > 0),
    [buscado], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <Grupo
      titulo='Textos del portal'
      ayuda='Títulos, botones y mensajes de cada página del portal público. Busca el texto tal como se ve en el sitio para encontrarlo.'
    >
      <TextField
        fullWidth
        size='small'
        sx={{ mb: 4 }}
        placeholder='Buscar un texto…'
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon fontSize='small' />
            </InputAdornment>
          ),
        }}
      />
      {grupos.length === 0 && <Alert severity='info'>Ningún texto coincide con la búsqueda.</Alert>}
      {grupos.map((grupo) => {
        const modificados = grupo.campos.filter(([clave, , base]) => textos[grupo.clave][clave] !== base).length;
        return (
          <Accordion
            key={grupo.clave}
            disableGutters
            variant='outlined'
            expanded={Boolean(buscado) || abierto === grupo.clave}
            onChange={(_, expandido) => setAbierto(expandido ? grupo.clave : '')}
            TransitionProps={{ unmountOnExit: true }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 500 }}>{grupo.titulo}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {grupo.campos.length} texto(s)
                </Typography>
                {modificados > 0 && <Chip size='small' color='primary' variant='outlined' label={`${modificados} modificado(s)`} />}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {grupo.ayuda && (
                <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
                  {grupo.ayuda}
                </Typography>
              )}
              <Rejilla columnas={2}>
                {grupo.campos.map(([clave, etiqueta, base]) => (
                  <CampoTexto
                    key={clave}
                    etiqueta={etiqueta}
                    base={base}
                    valor={textos[grupo.clave][clave]}
                    disabled={disabled}
                    onChange={(valor) => cambiar(`textos.${grupo.clave}.${clave}`, valor)}
                  />
                ))}
              </Rejilla>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Grupo>
  );
};
SeccionTextos.propTypes = propTypes;

const COLORES_MODO_PANEL = [
  ['fondo', 'Fondo de la página'],
  ['superficie', 'Tarjetas y encabezado'],
  ['texto', 'Texto principal', 'superficie'],
  ['textoSecundario', 'Texto secundario', 'superficie'],
];

export const SeccionPanel = ({ config, cambiar, imagen, disabled }) => {
  const { panel } = config;
  const color = (ruta, label, valor, sobre) => (
    <CampoColor key={ruta} label={label} value={valor} sobre={sobre} disabled={disabled} onChange={(v) => cambiar(`panel.${ruta}`, v)} />
  );

  return (
    <>
      <Grupo titulo='Colores generales' ayuda='Botones, títulos y acciones del panel administrativo.'>
        <Rejilla>
          {color('principal', 'Principal (botones)', panel.principal)}
          {color('acento', 'Acento (filtros y resaltados)', panel.acento)}
          {color('encabezado', 'Títulos de encabezado', panel.encabezado)}
          {color('peligro', 'Acciones de peligro', panel.peligro)}
        </Rejilla>
      </Grupo>

      <Grupo titulo='Barra de menú'>
        <Rejilla>
          {color('menu.fondo', 'Fondo del menú', panel.menu.fondo)}
          {color('menu.fondoOscuro', 'Fondo del menú (modo oscuro)', panel.menu.fondoOscuro)}
          {color('menu.texto', 'Texto del menú', panel.menu.texto, panel.menu.fondo)}
          {color('menu.seleccionFondo', 'Opción activa: fondo', panel.menu.seleccionFondo)}
          {color('menu.seleccionTexto', 'Opción activa: texto', panel.menu.seleccionTexto, panel.menu.seleccionFondo)}
        </Rejilla>
        <Alert severity='info' sx={{ mt: 4 }}>
          Los iconos y nombres de los módulos y opciones del menú del panel se editan en Seguridad › Módulos y
          Seguridad › Opciones del sistema.
        </Alert>
      </Grupo>

      {[
        ['claro', 'Modo claro'],
        ['oscuro', 'Modo oscuro'],
      ].map(([modo, titulo]) => (
        <Grupo key={modo} titulo={titulo}>
          <Rejilla>
            {COLORES_MODO_PANEL.map(([clave, label, sobre]) =>
              color(`${modo}.${clave}`, label, panel[modo][clave], sobre && panel[modo][sobre]),
            )}
          </Rejilla>
        </Grupo>
      ))}

      <Grupo titulo='Inicio de sesión'>
        <CampoImagen {...imagen('imagen_login')} alto={180} />
      </Grupo>
    </>
  );
};
SeccionPanel.propTypes = propTypes;
