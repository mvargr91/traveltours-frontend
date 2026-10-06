import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PlaceIcon from '@mui/icons-material/Place';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useTheme } from '@mui/material/styles';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { onGetColeccion as onGetExperiencias } from '@crema/redux/features/portalExperiencias/portalExperienciasSlice';
import { onGetColeccion as onGetDestinos } from '@crema/redux/features/portalDestinos/portalDestinosSlice';
import { onGetColeccion as onGetCategorias } from '@crema/redux/features/portalCategorias/portalCategoriasSlice';
import { formatoMoneda } from '../../../shared/constants/Turismo';
import { ARCOIRIS, COLORES_MARCA } from '../../../shared/constants/Marca';

// Coordenadas centrales de Colombia [longitud, latitud]
const CENTRO_COLOMBIA = [-74.08175, 4.60971];

// Token de Mapbox configurado en variables de entorno o token por defecto
const ENV_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const TIENE_TOKEN_VALIDO = Boolean(ENV_TOKEN && ENV_TOKEN.startsWith('pk.'));
mapboxgl.accessToken = TIENE_TOKEN_VALIDO
  ? ENV_TOKEN
  : 'pk.eyJ1IjoidHJhdmVsdG91cnMiLCJhIjoiY211bmZxZ3Z5MGFtODJ5bzh2Ym9jaG5sOSJ9.6sftsmOpaiiAfuMn1xXWNw';

// Estilo de mapa base de alta resolución para Mapbox GL (sin restricción de cuota de pago, 100% visible)
const ESTILO_MAPA_BASE = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const Mapa = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Estados de datos protegidos contra valores no definidos
  const experienciasData = useSelector((state) => state.portalExperiencias);
  const destinosData = useSelector((state) => state.portalDestinos);
  const categoriasData = useSelector((state) => state.portalCategorias);

  const experiencias = useMemo(
    () => (Array.isArray(experienciasData?.rows) ? experienciasData.rows : []),
    [experienciasData]
  );
  const destinos = useMemo(
    () => (Array.isArray(destinosData?.rows) ? destinosData.rows : []),
    [destinosData]
  );
  const categorias = useMemo(
    () => (Array.isArray(categoriasData?.rows) ? categoriasData.rows : []),
    [categoriasData]
  );

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);

  // Carga inicial de datos desde backend
  useEffect(() => {
    dispatch(onGetExperiencias({ rowsPerPage: 50 }));
    if (destinos.length === 0) dispatch(onGetDestinos());
    if (categorias.length === 0) dispatch(onGetCategorias());
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unificar lugares (experiencias y destinos con coordenadas válidas)
  const lugares = useMemo(() => {
    const lista = [];

    // Experiencias con latitud y longitud
    (experiencias || []).forEach((exp) => {
      const lat = parseFloat(exp.latitud);
      const lng = parseFloat(exp.longitud);
      if (!isNaN(lat) && !isNaN(lng)) {
        lista.push({
          id: `exp-${exp.id}`,
          tipo: 'experiencia',
          nombre: exp.nombre,
          slug: exp.slug,
          descripcion: exp.descripcion,
          destino_nombre: exp.destino_nombre,
          direccion: exp.direccion || exp.punto_encuentro,
          precio_desde: exp.precio_desde,
          duracion: exp.duracion,
          calificacion: exp.calificacion_promedio,
          verificada: exp.verificada,
          latitud: lat,
          longitud: lng,
          categoria: exp.categoria_slug || '',
        });
      }
    });

    // Destinos con coordenadas
    (destinos || []).forEach((dest) => {
      const lat = parseFloat(dest.latitud);
      const lng = parseFloat(dest.longitud);
      if (!isNaN(lat) && !isNaN(lng)) {
        lista.push({
          id: `dest-${dest.id}`,
          tipo: 'destino',
          nombre: dest.nombre,
          slug: dest.slug,
          descripcion: dest.descripcion,
          destino_nombre: [dest.ciudad, dest.departamento].filter(Boolean).join(', '),
          direccion: `${dest.ciudad || dest.nombre}, ${dest.departamento || 'Colombia'}`,
          total_experiencias: dest.total_experiencias,
          latitud: lat,
          longitud: lng,
          categoria: '',
        });
      }
    });

    return lista;
  }, [experiencias, destinos]);

  // Filtrar lugares según búsqueda y categoría
  const lugaresFiltrados = useMemo(() => {
    return lugares.filter((item) => {
      const cumpleTexto =
        !busqueda ||
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (item.destino_nombre &&
          item.destino_nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
        (item.direccion &&
          item.direccion.toLowerCase().includes(busqueda.toLowerCase()));

      const cumpleCategoria =
        categoriaActiva === 'todas' ||
        item.categoria === categoriaActiva ||
        (item.tipo === 'destino' && categoriaActiva === 'todas');

      return cumpleTexto && cumpleCategoria;
    });
  }, [lugares, busqueda, categoriaActiva]);

  // Inicializar mapa de Mapbox exclusivamente en el div
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destruir instancia anterior si existe
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Estilo: oficial de Mapbox si hay token válido, o estilo base garantizado
    const estiloInicial = TIENE_TOKEN_VALIDO
      ? isDark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12'
      : ESTILO_MAPA_BASE;

    let map;
    try {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: estiloInicial,
        center: CENTRO_COLOMBIA,
        zoom: 5.5,
        attributionControl: true,
      });

      // Manejar error en caso de token de vector tiles inválido y conmutar al estilo base
      map.on('error', (e) => {
        if (
          e?.error?.status === 401 ||
          e?.error?.status === 403 ||
          e?.status === 401 ||
          e?.status === 403
        ) {
          console.warn('Mapbox Token restringido. Aplicando estilo base garantizado.');
          map.setStyle(ESTILO_MAPA_BASE);
        }
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Redimensionar automáticamente al cargar
      map.on('load', () => {
        map.resize();
      });

      // Asegurar redimensionamiento después del renderizado del DOM
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 350);

      mapRef.current = map;
    } catch (err) {
      console.error('Error al inicializar Mapbox GL:', err);
    }

    // Escuchar redimensionamiento de ventana
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isDark]); // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizar marcadores cuando cambian los lugares filtrados
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (lugaresFiltrados.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    lugaresFiltrados.forEach((lugar, index) => {
      const colorArcoiris = ARCOIRIS[index % ARCOIRIS.length];

      // Elemento visual personalizado del pin
      const el = document.createElement('div');
      el.className = 'custom-mapbox-marker';
      el.style.width = '34px';
      el.style.height = '34px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.backgroundColor = colorArcoiris;
      el.style.border = '3px solid #ffffff';
      el.style.boxShadow = '0 4px 14px rgba(0,0,0,0.4)';
      el.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
      el.innerHTML = `
        <svg style="width: 18px; height: 18px; fill: white;" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3) translateY(-4px)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1) translateY(0)';
      });

      // Contenido del popup
      const precioHtml = lugar.precio_desde
        ? `<div style="font-weight: 700; color: ${COLORES_MARCA.azul}; margin-top: 6px; font-size: 13px;">Desde ${formatoMoneda(
            lugar.precio_desde
          )}</div>`
        : '';

      const enlaceHtml =
        lugar.tipo === 'experiencia'
          ? `<a href="/tours/${lugar.slug}" style="display: inline-block; margin-top: 8px; font-size: 12px; color: ${COLORES_MARCA.azul}; text-decoration: none; font-weight: 700;">Ver experiencia &rarr;</a>`
          : `<a href="/tours?destino=${lugar.slug}" style="display: inline-block; margin-top: 8px; font-size: 12px; color: ${COLORES_MARCA.azul}; text-decoration: none; font-weight: 700;">Ver tours en destino &rarr;</a>`;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
      }).setHTML(`
        <div style="font-family: inherit; padding: 6px; max-width: 220px; color: #1e293b;">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: ${colorArcoiris}; font-weight: 800;">
            ${lugar.tipo === 'experiencia' ? 'Experiencia LGTBIQ+' : 'Destino Turístico'}
          </div>
          <h4 style="margin: 4px 0 2px; font-size: 14px; font-weight: 700; line-height: 1.25; color: #0f172a;">${lugar.nombre}</h4>
          <div style="font-size: 12px; color: #64748b;">${lugar.destino_nombre || ''}</div>
          ${
            lugar.direccion
              ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">📍 ${lugar.direccion}</div>`
              : ''
          }
          ${precioHtml}
          ${enlaceHtml}
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lugar.longitud, lugar.latitud])
        .setPopup(popup)
        .addTo(map);

      // Guardar id del lugar en el marcador para referenciarlo
      marker._lugarId = lugar.id;

      el.addEventListener('click', () => {
        setLugarSeleccionado(lugar);
      });

      markersRef.current.push(marker);
      bounds.extend([lugar.longitud, lugar.latitud]);
    });

    // Ajustar el mapa al conjunto de marcadores
    if (lugaresFiltrados.length > 0) {
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 13,
        duration: 800,
      });
    }
  }, [lugaresFiltrados]);

  // Al hacer clic en un lugar de la lista lateral: enfocar y desplegar popup
  const seleccionarLugar = useCallback((lugar) => {
    setLugarSeleccionado(lugar);
    const map = mapRef.current;
    if (map && lugar.longitud && lugar.latitud) {
      map.flyTo({
        center: [lugar.longitud, lugar.latitud],
        zoom: 14,
        speed: 1.2,
        curve: 1.4,
        essential: true,
      });

      // Abrir el popup del marcador seleccionado
      const markerObj = markersRef.current.find((m) => m._lugarId === lugar.id);
      if (markerObj) {
        // Cerrar otros popups abiertos
        markersRef.current.forEach((m) => {
          if (m !== markerObj && m.getPopup().isOpen()) {
            m.togglePopup();
          }
        });
        if (!markerObj.getPopup().isOpen()) {
          markerObj.togglePopup();
        }
      }
    }
  }, []);

  const centrarColombia = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: CENTRO_COLOMBIA,
        zoom: 5.5,
        speed: 1,
      });
      // Cerrar popups al restablecer vista
      markersRef.current.forEach((m) => {
        if (m.getPopup().isOpen()) {
          m.togglePopup();
        }
      });
    }
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 3, md: 5 } }}>
      <Container maxWidth='xl'>
        {/* Encabezados solicitados */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            component='h1'
            variant='h1'
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.8rem' },
              color: 'text.primary',
              mb: 1,
            }}
          >
            Mapa de experiencias
          </Typography>
          <Typography
            component='h3'
            variant='h3'
            sx={{
              fontWeight: 500,
              fontSize: { xs: '1.1rem', md: '1.35rem' },
              color: 'text.secondary',
            }}
          >
            Encuentra experiencias LGTBIQ+ friendly por toda Colombia
          </Typography>
        </Box>

        {/* Barra de Filtros y Búsqueda */}
        <Paper
          elevation={isDark ? 0 : 1}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TextField
                  sx={{ width: { xs: '100%', md: '85%' } }}
                  size='small'
                  placeholder='Buscar por experiencia, destino o ciudad...'
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon color='primary' />
                      </InputAdornment>
                    ),
                    endAdornment: busqueda ? (
                      <InputAdornment position='end'>
                        <IconButton size='small' onClick={() => setBusqueda('')}>
                          <ClearIcon fontSize='small' />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={12}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  py: 0.5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              >
                <Chip
                  label='Todas las categorías'
                  clickable
                  color={categoriaActiva === 'todas' ? 'primary' : 'default'}
                  variant={categoriaActiva === 'todas' ? 'filled' : 'outlined'}
                  onClick={() => setCategoriaActiva('todas')}
                />
                {categorias.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.nombre}
                    clickable
                    color={categoriaActiva === cat.slug ? 'primary' : 'default'}
                    variant={categoriaActiva === cat.slug ? 'filled' : 'outlined'}
                    onClick={() => setCategoriaActiva(cat.slug)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Layout Principal: Lista Lateral de Lugares + Div exclusivo con Mapa Mapbox */}
        <Grid container spacing={3}>
          {/* A un lado del mapa: Lista de lugares registrados por nombre */}
          <Grid item xs={12} md={4} lg={4}>
            <Paper
              elevation={isDark ? 0 : 1}
              sx={{
                height: { xs: 400, md: 650 },
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: (t) => `1px solid ${t.palette.divider}`,
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderBottom: (t) => `1px solid ${t.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant='subtitle1' fontWeight={700}>
                  Lugares registrados ({lugaresFiltrados.length})
                </Typography>
                <Tooltip title='Centrar en Colombia'>
                  <IconButton size='small' onClick={centrarColombia} color='primary'>
                    <MyLocationIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                {lugaresFiltrados.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <PlaceIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                    <Typography color='text.secondary'>
                      No se encontraron experiencias o destinos con los filtros aplicados.
                    </Typography>
                    <Button
                      size='small'
                      sx={{ mt: 1 }}
                      onClick={() => {
                        setBusqueda('');
                        setCategoriaActiva('todas');
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {lugaresFiltrados.map((lugar) => {
                      const esSeleccionado =
                        lugarSeleccionado && lugarSeleccionado.id === lugar.id;

                      return (
                        <Card
                          key={lugar.id}
                          variant='outlined'
                          onClick={() => seleccionarLugar(lugar)}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: 2,
                            borderColor: esSeleccionado ? 'primary.main' : 'divider',
                            bgcolor: esSeleccionado
                              ? isDark
                                ? 'rgba(0, 161, 204, 0.12)'
                                : 'rgba(0, 161, 204, 0.05)'
                              : 'background.paper',
                            boxShadow: esSeleccionado
                              ? `0 0 0 1px ${COLORES_MARCA.azul}`
                              : 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant='h4'
                                sx={{
                                  fontSize: '0.98rem',
                                  fontWeight: 600,
                                  color: 'text.primary',
                                }}
                              >
                                {lugar.nombre}
                              </Typography>
                              {lugar.verificada && (
                                <Tooltip title='Verificada por Travel City'>
                                  <VerifiedIcon
                                    color='primary'
                                    sx={{ fontSize: 18, flexShrink: 0 }}
                                  />
                                </Tooltip>
                              )}
                            </Box>

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mt: 0.5,
                                color: 'text.secondary',
                              }}
                            >
                              <PlaceIcon sx={{ fontSize: 15 }} />
                              <Typography variant='caption'>
                                {lugar.destino_nombre}
                              </Typography>
                            </Box>

                            {lugar.direccion && (
                              <Typography
                                variant='caption'
                                sx={{
                                  display: 'block',
                                  color: 'text.disabled',
                                  mt: 0.25,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {lugar.direccion}
                              </Typography>
                            )}

                            <Divider sx={{ my: 1 }} />

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Chip
                                size='small'
                                label={
                                  lugar.tipo === 'experiencia'
                                    ? 'Experiencia'
                                    : 'Destino'
                                }
                                sx={{
                                  fontSize: 11,
                                  height: 20,
                                  bgcolor:
                                    lugar.tipo === 'experiencia'
                                      ? 'primary.main'
                                      : 'secondary.main',
                                  color: '#fff',
                                }}
                              />

                              {lugar.precio_desde ? (
                                <Typography
                                  variant='body2'
                                  fontWeight={700}
                                  color='primary.main'
                                >
                                  {formatoMoneda(lugar.precio_desde)}
                                </Typography>
                              ) : lugar.tipo === 'destino' ? (
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  {lugar.total_experiencias ?? 0} tours
                                </Typography>
                              ) : null}
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* El div contenedor exclusivo con el mapa Mapbox */}
          <Grid item xs={12} md={8} lg={8}>
            <Paper
              elevation={isDark ? 0 : 1}
              sx={{
                height: { xs: 450, md: 650 },
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                border: (t) => `1px solid ${t.palette.divider}`,
                bgcolor: 'background.paper',
              }}
            >
              {/* Contenedor del mapa: Div con Mapbox GL */}
              <Box
                ref={mapContainerRef}
                sx={{
                  width: '100%',
                  height: '100%',
                  minHeight: 450,
                  '& .mapboxgl-canvas': {
                    outline: 'none',
                    filter: isDark
                      ? 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(105%)'
                      : 'none',
                    transition: 'filter 0.3s ease',
                  },
                  '& .mapboxgl-popup-content': {
                    borderRadius: 3,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
                    p: 1.5,
                  },
                }}
              />

              {/* Botón flotante para restablecer vista */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  zIndex: 2,
                }}
              >
                <Button
                  variant='contained'
                  size='small'
                  startIcon={<MyLocationIcon />}
                  onClick={centrarColombia}
                  sx={{
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    '&:hover': {
                      bgcolor: 'background.paper',
                    },
                  }}
                >
                  Ver toda Colombia
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Mapa;
