// Apariencia del sitio (colores, menú, iconos, logos e imágenes) configurada en
// Parametrización > Apariencia. Se lee del endpoint público, así aplica con o sin sesión,
// y se guarda en localStorage para pintar con los colores correctos desde el primer render.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { aFormData } from '../../../shared/functions/Archivos';
import {
  APARIENCIA_BASE,
  combinarApariencia,
  gradienteFranja,
  resolverImagenes,
} from '../../../shared/constants/Apariencia';
import { formatear } from '../../../shared/constants/TextosPortal';

const CLAVE_CACHE = 'tt-apariencia';
const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

const leerCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CACHE)) ?? {};
  } catch (e) {
    return {};
  }
};

const guardarCache = (datos) => {
  try {
    localStorage.setItem(CLAVE_CACHE, JSON.stringify(datos));
  } catch (e) {
    // Sin localStorage (modo privado): solo se pierde el arranque sin parpadeo.
  }
};

const construir = (configuracion, rutas, contacto) => {
  const apariencia = combinarApariencia(configuracion);
  const imagenes = resolverImagenes(rutas);
  return {
    ...apariencia,
    imagenes,
    // Contacto del pie + número de WhatsApp del portal (parámetro WHATSAPP_NUMERO); vacío = sin botón.
    contacto: { ...apariencia.contacto, whatsapp: String(contacto?.whatsapp ?? '').replace(/\D/g, '') },
    logos: { principal: imagenes.logo_principal, oscuro: imagenes.logo_oscuro, isotipo: imagenes.isotipo },
    gradienteFranja: gradienteFranja(apariencia.portal.franja),
  };
};

const AparienciaContext = createContext({
  apariencia: construir(APARIENCIA_BASE, {}),
  guardada: { configuracion: {}, imagenes: {}, contacto: {} },
  cargada: false,
});
const AparienciaActionsContext = createContext({});

/** { apariencia, guardada, cargada }: "apariencia" ya trae los valores de fábrica donde no hay personalización. */
export const useApariencia = () => useContext(AparienciaContext);

/**
 * Textos editables de una página del portal (grupo de TextosPortal).
 * const t = useTextos('mapa'); t('titulo'); t('lugares', { n: 5 })
 */
export const useTextos = (grupo) => {
  const textos = useContext(AparienciaContext).apariencia.textos[grupo];
  return useCallback((clave, variables) => formatear(textos[clave], variables), [textos]);
};

export const useAparienciaActions = () => useContext(AparienciaActionsContext);

const AparienciaContextProvider = ({ children }) => {
  // Lo que está guardado en el backend: { configuracion, imagenes (rutas), contacto }.
  const [guardada, setGuardada] = useState(() => {
    const cache = leerCache();
    return { configuracion: cache.configuracion ?? {}, imagenes: cache.imagenes ?? {}, contacto: cache.contacto ?? {} };
  });
  const [cargada, setCargada] = useState(false);
  // Cambios sin guardar que el editor quiere ver aplicados en vivo.
  const [borrador, setBorrador] = useState(null);

  const aplicar = useCallback((datos) => {
    const nueva = { configuracion: datos?.configuracion ?? {}, imagenes: datos?.imagenes ?? {}, contacto: datos?.contacto ?? {} };
    setGuardada(nueva);
    guardarCache(nueva);
    return nueva;
  }, []);

  const recargar = useCallback(async () => {
    try {
      const { data } = await jwtAxios.get('publico/apariencia');
      aplicar(data);
    } catch (e) {
      // Sin conexión con el backend se conserva lo último conocido (o los valores de fábrica).
    } finally {
      setCargada(true);
    }
  }, [aplicar]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // archivos: { columna: File }, quitar: columnas que vuelven a la imagen predeterminada.
  const guardar = useCallback(
    async ({ configuracion, archivos = {}, quitar = [] }) => {
      const { data } = await jwtAxios.post('apariencia', aFormData({ configuracion, quitar, ...archivos }), MULTIPART);
      aplicar(data.datos);
      return data;
    },
    [aplicar],
  );

  const restablecer = useCallback(async () => {
    const { data } = await jwtAxios.delete('apariencia');
    aplicar(data.datos);
    return data;
  }, [aplicar]);

  const previsualizar = useCallback((configuracion) => setBorrador(configuracion ?? null), []);

  const apariencia = useMemo(
    () => construir(borrador ?? guardada.configuracion, guardada.imagenes, guardada.contacto),
    [borrador, guardada],
  );

  // Pestaña del navegador: título, favicon y color del tema.
  useEffect(() => {
    document.title = apariencia.marca.nombre;
    document.querySelectorAll("link[rel='icon']").forEach((enlace, i) => {
      if (i === 0) enlace.href = apariencia.imagenes.favicon;
      else if (guardada.imagenes.favicon) enlace.remove();
    });
    document.querySelector("meta[name='theme-color']")?.setAttribute('content', apariencia.portal.primario);
  }, [apariencia.marca.nombre, apariencia.imagenes.favicon, apariencia.portal.primario, guardada.imagenes.favicon]);

  const valor = useMemo(() => ({ apariencia, guardada, cargada }), [apariencia, guardada, cargada]);
  const acciones = useMemo(
    () => ({ recargar, guardar, restablecer, previsualizar }),
    [recargar, guardar, restablecer, previsualizar],
  );

  return (
    <AparienciaContext.Provider value={valor}>
      <AparienciaActionsContext.Provider value={acciones}>{children}</AparienciaActionsContext.Provider>
    </AparienciaContext.Provider>
  );
};

AparienciaContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AparienciaContextProvider;
