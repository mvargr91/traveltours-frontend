// Rutas del portal público. Son distintas a las del panel (/experiencias, /destinos, /promociones)
// porque esas URL vienen del menú en base de datos.
export const RUTAS_PORTAL = {
  inicio: '/',
  tours: '/tours',
  tour: (slug) => `/tours/${slug}`,
  destinos: '/lugares',
  promociones: '/ofertas',
};

// Interruptor para apagar el portal sin tocar código: VITE__PORTAL_PUBLICO=false en .env
export const PORTAL_HABILITADO = import.meta.env.VITE__PORTAL_PUBLICO !== 'false';
