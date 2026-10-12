// Apariencia personalizable del sitio (Parametrización > Apariencia).
// APARIENCIA_BASE son los valores de fábrica; lo que el administrador guarda en el backend
// (tabla "apariencia") se combina encima con combinarApariencia(). Las claves y límites deben
// coincidir con las reglas de App\Models\Parametrizacion\Apariencia en el backend.
import fondoLogin from '../../assets/fondo/247.jpg';
import { coloresPanel } from '@crema/constants/defaultConfig';
import { urlArchivo } from '../functions/Archivos';
import { ARCOIRIS, COLORES_MARCA, MARCA } from './Marca';
import { RUTAS_PORTAL } from './RutasPortal';

// Enlaces del menú del portal: la clave es fija (define la ruta), el resto se personaliza.
export const RUTAS_MENU_PORTAL = {
  inicio: RUTAS_PORTAL.inicio,
  tours: RUTAS_PORTAL.tours,
  destinos: RUTAS_PORTAL.destinos,
  promociones: RUTAS_PORTAL.promociones,
  mapa: RUTAS_PORTAL.mapa,
};

export const MAX_PROPUESTAS = 6;
export const MAX_COLORES_FRANJA = 8;

export const APARIENCIA_BASE = {
  marca: {
    nombre: MARCA.nombre,
    eslogan: MARCA.eslogan,
    descripcion: 'Tours, planes y experiencias verificadas por la comunidad LGTBIQ+ en los mejores destinos del país.',
    pie: 'Experiencias verificadas y seguras para toda la comunidad.',
  },
  portal: {
    primario: COLORES_MARCA.azul,
    primarioOscuro: COLORES_MARCA.azulOscuro,
    mostrarFranja: true,
    franja: ARCOIRIS,
    claro: {
      secundario: '#732982',
      fondo: '#F7F9FB',
      superficie: '#FFFFFF',
      texto: COLORES_MARCA.texto,
      textoSecundario: '#4B5563',
      pie: COLORES_MARCA.texto,
    },
    oscuro: {
      secundario: '#C084FC',
      fondo: '#0F172A',
      superficie: '#1E293B',
      texto: '#F8FAFC',
      textoSecundario: '#94A3B8',
      pie: '#0B111A',
    },
    menu: [
      { clave: 'inicio', etiqueta: 'Inicio', color: '#EF4444', icono: '', visible: true },
      { clave: 'tours', etiqueta: 'Tours', color: '#F97316', icono: '', visible: true },
      { clave: 'destinos', etiqueta: 'Destinos', color: '#EAB308', icono: '', visible: true },
      { clave: 'promociones', etiqueta: 'Promociones', color: '#22C55E', icono: '', visible: true },
      { clave: 'mapa', etiqueta: 'Mapa', color: '#06B6D4', icono: '', visible: true },
    ],
  },
  inicio: {
    textoHero: '#FFFFFF',
    // Sombra sobre la imagen principal para que el texto se lea (0 = sin sombra).
    oscurecer: 0,
    propuestas: [
      { icono: 'verified_user', titulo: 'Proveedores verificados', texto: 'Revisamos documentos y registro de turismo de cada proveedor antes de publicar.' },
      { icono: 'reviews', titulo: 'Reseñas de la comunidad', texto: 'Opiniones reales de viajeros, moderadas por nuestro equipo.' },
      { icono: 'event_available', titulo: 'Reserva con confianza', texto: 'Cupos y horarios actualizados por el proveedor, confirmación en tu cuenta.' },
    ],
  },
  panel: {
    principal: coloresPanel.principal,
    acento: coloresPanel.acento,
    encabezado: coloresPanel.textoEncabezado,
    peligro: '#BE1E2D',
    menu: {
      fondo: coloresPanel.barraMenu,
      texto: '#FFFFFF',
      seleccionFondo: coloresPanel.acento,
      seleccionTexto: '#FFFFFF',
      fondoOscuro: '#1F2937',
    },
    claro: {
      fondo: '#F4F7FE',
      superficie: '#FFFFFF',
      texto: '#2D2F33',
      textoSecundario: '#565B66',
    },
    oscuro: {
      fondo: '#111827',
      superficie: '#1F2937',
      texto: '#F3F4F6',
      textoSecundario: '#9CA3AF',
    },
  },
};

// Imágenes: clave = columna en el backend. "predeterminada" se usa cuando no se ha subido ninguna.
export const IMAGENES_APARIENCIA = {
  logo_principal: { etiqueta: 'Logo principal', ayuda: 'Fondos claros: portal, login y panel en modo claro.', predeterminada: MARCA.logos.principal },
  logo_oscuro: { etiqueta: 'Logo para fondos oscuros', ayuda: 'Modo oscuro y pie de página del portal.', predeterminada: MARCA.logos.oscuro },
  isotipo: { etiqueta: 'Isotipo', ayuda: 'Versión cuadrada: marcador cuando una experiencia no tiene foto.', predeterminada: MARCA.logos.isotipo },
  favicon: { etiqueta: 'Favicon', ayuda: 'Icono de la pestaña del navegador (PNG cuadrado).', predeterminada: '/brand/favicon-32.png' },
  imagen_inicio: { etiqueta: 'Imagen principal del inicio', ayuda: 'Fondo del encabezado de la página de inicio del portal. Recomendado 1920 × 700 px.', predeterminada: '/brand/banner3.png' },
  imagen_login: { etiqueta: 'Fondo del inicio de sesión', ayuda: 'Imagen de fondo de la pantalla de ingreso.', predeterminada: fondoLogin },
};

// Iconos sugeridos (Material Icons). El campo también acepta cualquier otro nombre de
// https://fonts.google.com/icons?icon.set=Material+Icons
export const ICONOS_SUGERIDOS = [
  'home', 'explore', 'travel_explore', 'tour', 'map', 'place', 'public', 'flight', 'hotel', 'beach_access',
  'hiking', 'kayaking', 'sailing', 'directions_bus', 'directions_car', 'local_offer', 'sell', 'confirmation_number',
  'event_available', 'calendar_month', 'schedule', 'verified_user', 'verified', 'security', 'shield', 'lock',
  'reviews', 'star', 'favorite', 'thumb_up', 'groups', 'diversity_3', 'handshake', 'support_agent', 'chat',
  'payments', 'credit_card', 'savings', 'restaurant', 'local_bar', 'nightlife', 'celebration', 'festival',
  'photo_camera', 'landscape', 'park', 'forest', 'pets', 'spa', 'emoji_events', 'bolt', 'eco', 'language',
];

export const ES_COLOR = /^#[0-9a-f]{6}$/i;
export const ES_ICONO = /^[a-z0-9_]{1,40}$/;

const texto = (valor, base, max) => (typeof valor === 'string' ? valor.slice(0, max) : base);
const color = (valor, base) => (typeof valor === 'string' && ES_COLOR.test(valor) ? valor : base);
const icono = (valor, base = '') => (typeof valor === 'string' && (valor === '' || ES_ICONO.test(valor)) ? valor : base);

// Combina un nodo guardado sobre el base respetando el tipo de cada valor. Lo que no cumple
// (un color que no es #RRGGBB, un tipo distinto, una clave desconocida) se descarta.
const combinar = (base, valor) => {
  if (Array.isArray(base)) return base; // las listas se combinan aparte
  if (base && typeof base === 'object') {
    return Object.fromEntries(Object.entries(base).map(([clave, hijo]) => [clave, combinar(hijo, valor?.[clave])]));
  }
  if (typeof base === 'string') return ES_COLOR.test(base) ? color(valor, base) : texto(valor, base, 300);
  return typeof valor === typeof base && !Number.isNaN(valor) ? valor : base;
};

const combinarMenu = (base, guardado) => {
  if (!Array.isArray(guardado)) return base;
  const porClave = Object.fromEntries(base.map((enlace) => [enlace.clave, enlace]));
  // Se respeta el orden guardado; los enlaces que falten se agregan al final.
  const claves = [...new Set([...guardado.map((e) => e?.clave), ...base.map((e) => e.clave)])].filter((c) => porClave[c]);
  return claves.map((clave) => {
    const original = porClave[clave];
    const enlace = guardado.find((e) => e?.clave === clave) ?? {};
    return {
      clave,
      etiqueta: texto(enlace.etiqueta, original.etiqueta, 30) || original.etiqueta,
      color: color(enlace.color, original.color),
      icono: icono(enlace.icono, original.icono),
      visible: typeof enlace.visible === 'boolean' ? enlace.visible : original.visible,
    };
  });
};

const combinarPropuestas = (base, guardado) => {
  if (!Array.isArray(guardado)) return base;
  return guardado
    .filter((p) => p && typeof p.titulo === 'string' && p.titulo.trim())
    .slice(0, MAX_PROPUESTAS)
    .map((p) => ({ icono: icono(p.icono), titulo: p.titulo.slice(0, 60), texto: texto(p.texto, '', 200) }));
};

const combinarFranja = (base, guardado) => {
  const colores = Array.isArray(guardado) ? guardado.filter((c) => ES_COLOR.test(c ?? '')).slice(0, MAX_COLORES_FRANJA) : [];
  return colores.length >= 2 ? colores : base;
};

/** Configuración completa y segura: valores guardados sobre los de fábrica. */
export const combinarApariencia = (guardada) => {
  const origen = guardada && typeof guardada === 'object' ? guardada : {};
  const resultado = combinar(APARIENCIA_BASE, origen);
  resultado.marca.nombre = resultado.marca.nombre.trim() || APARIENCIA_BASE.marca.nombre;
  resultado.portal.franja = combinarFranja(APARIENCIA_BASE.portal.franja, origen.portal?.franja);
  resultado.portal.menu = combinarMenu(APARIENCIA_BASE.portal.menu, origen.portal?.menu);
  resultado.inicio.propuestas = combinarPropuestas(APARIENCIA_BASE.inicio.propuestas, origen.inicio?.propuestas);
  resultado.inicio.oscurecer = Math.min(0.9, Math.max(0, resultado.inicio.oscurecer));
  return resultado;
};

/** URL de cada imagen: la subida por el administrador o la predeterminada. */
export const resolverImagenes = (rutas = {}) =>
  Object.fromEntries(
    Object.entries(IMAGENES_APARIENCIA).map(([clave, { predeterminada }]) => [
      clave,
      typeof rutas?.[clave] === 'string' && rutas[clave] ? urlArchivo(rutas[clave]) : predeterminada,
    ]),
  );

export const gradienteFranja = (colores) => `linear-gradient(90deg, ${colores.join(', ')})`;

// Contraste WCAG entre dos colores #RRGGBB (1 a 21). Menos de 3 se lee mal.
const luminancia = (hex) => {
  const canal = (i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
};

export const contraste = (a, b) => {
  if (!ES_COLOR.test(a ?? '') || !ES_COLOR.test(b ?? '')) return 21;
  const [clara, oscura] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (clara + 0.05) / (oscura + 0.05);
};

// Texto legible (blanco u oscuro) sobre un color de fondo.
export const textoSobre = (fondo) => (contraste(fondo, '#FFFFFF') >= 3 ? '#FFFFFF' : '#1F2933');
