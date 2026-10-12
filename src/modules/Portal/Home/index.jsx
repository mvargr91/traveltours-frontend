import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Icon,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ExploreIcon from '@mui/icons-material/Explore';
import Chip from '@mui/material/Chip';
import { onGetColeccion as onGetExperiencias } from '@crema/redux/features/portalExperiencias/portalExperienciasSlice';
import { onGetColeccion as onGetDestinos } from '@crema/redux/features/portalDestinos/portalDestinosSlice';
import { onGetColeccion as onGetPromociones } from '@crema/redux/features/portalPromociones/portalPromocionesSlice';
import CategoryBar from '../../../shared/components/Portal/CategoryBar';
import ExperienceCard, { ImagenExperiencia } from '../../../shared/components/Portal/ExperienceCard';
import { useApariencia } from '@crema/context/AppContextProvider/AparienciaContextProvider';
import { textoSobre } from '../../../shared/constants/Apariencia';
import { GrillaCargando, TituloSeccion } from '../../../shared/components/Portal/Secciones';
import { RUTAS_PORTAL } from '../../../shared/constants/RutasPortal';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const experiencias = useSelector((state) => state.portalExperiencias);
  const destinos = useSelector((state) => state.portalDestinos.rows);
  const promociones = useSelector((state) => state.portalPromociones.rows);
  const [busqueda, setBusqueda] = useState({ texto: '', destino: '' });
  // Textos, colores e imagen principal: Parametrización > Apariencia.
  const { marca, portal, inicio, imagenes } = useApariencia().apariencia;

  useEffect(() => {
    dispatch(onGetExperiencias({ rowsPerPage: 8, filtros: { orden: 'relevancia' } }));
    dispatch(onGetDestinos());
    dispatch(onGetPromociones());
  }, [dispatch]);

  const buscar = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(Object.entries(busqueda).filter(([, v]) => v));
    navigate(`${RUTAS_PORTAL.tours}?${params.toString()}`);
  };

  return (
    <>
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: inicio.textoHero,
          // Sombra configurable sobre la imagen; si la imagen no carga queda el degradado de la marca.
          background: `linear-gradient(rgba(0, 0, 0, ${inicio.oscurecer}), rgba(0, 0, 0, ${inicio.oscurecer})), url("${imagenes.imagen_inicio}") center / cover no-repeat, linear-gradient(120deg, ${portal.primarioOscuro} 0%, ${portal.primario} 100%)`,
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth='lg' sx={{ position: 'relative' }}>
          <Grid container spacing={4} alignItems='center'>
            <Grid item xs={12} md={7}>
              <Typography variant='h1' sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                {marca.eslogan}
              </Typography>
              <Typography sx={{ mt: 2, mb: 4, fontSize: '1.1rem', opacity: 0.9, maxWidth: 560 }}>
                {marca.descripcion}
              </Typography>
              <Paper component='form' onSubmit={buscar} sx={{ p: 1.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='¿Qué quieres vivir?'
                  value={busqueda.texto}
                  onChange={(e) => setBusqueda({ ...busqueda, texto: e.target.value })}
                />
                <TextField
                  select
                  size='small'
                  sx={{ minWidth: 180 }}
                  label='Destino'
                  value={busqueda.destino}
                  onChange={(e) => setBusqueda({ ...busqueda, destino: e.target.value })}
                >
                  <MenuItem value=''>Todos</MenuItem>
                  {destinos.map((d) => (
                    <MenuItem key={d.id} value={d.slug}>{d.nombre}</MenuItem>
                  ))}
                </TextField>
                <Button type='submit' variant='contained' startIcon={<SearchIcon />} sx={{ px: 4 }}>
                  Buscar
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <CategoryBar />

      <Container maxWidth='lg' sx={{ py: 7 }}>
        <TituloSeccion
          titulo='Experiencias recomendadas'
          subtitulo='Seleccionadas y verificadas por nuestro equipo'
          accion={<Button component={RouterLink} to={RUTAS_PORTAL.tours}>Ver todas</Button>}
        />
        {experiencias.loading ? (
          <GrillaCargando />
        ) : experiencias.rows.length === 0 ? (
          <Typography color='text.secondary'>Pronto publicaremos nuevas experiencias.</Typography>
        ) : (
          <Grid container spacing={3}>
            {experiencias.rows.map((exp) => (
              <Grid item xs={12} sm={6} md={3} key={exp.id}>
                <ExperienceCard experiencia={exp} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {destinos.length > 0 && (
        <Box sx={{ bgcolor: 'background.paper', py: 7 }}>
          <Container maxWidth='lg'>
            <TituloSeccion titulo='Destinos' accion={<Button component={RouterLink} to={RUTAS_PORTAL.destinos}>Ver destinos</Button>} />
            <Grid container spacing={3}>
              {destinos.slice(0, 6).map((d) => (
                <Grid item xs={12} sm={6} md={4} key={d.id}>
                  <Card>
                    <CardActionArea component={RouterLink} to={`${RUTAS_PORTAL.tours}?destino=${d.slug}`}>
                      <ImagenExperiencia src={d.imagen} alt={d.nombre} altura={160} />
                      <CardContent>
                        <Typography variant='h4'>{d.nombre}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {[d.ciudad, d.departamento].filter(Boolean).join(', ')} · {d.total_experiencias} experiencia(s)
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {inicio.propuestas.length > 0 && (
        <Container maxWidth='lg' sx={{ py: 7 }}>
          <Grid container spacing={3} justifyContent='center'>
            {inicio.propuestas.map(({ icono, titulo, texto }, i) => (
              <Grid item xs={12} md={4} key={`${titulo}-${i}`}>
                <Stack spacing={1.5} sx={{ p: 3, height: '100%', borderRadius: 3, bgcolor: 'background.paper', borderTop: `4px solid ${portal.franja[(i * 2) % portal.franja.length]}` }}>
                  {icono && <Icon color='primary' sx={{ fontSize: 36 }}>{icono}</Icon>}
                  <Typography variant='h4'>{titulo}</Typography>
                  <Typography color='text.secondary'>{texto}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* Banner / Acceso a Mapa de Experiencias */}
      <Container maxWidth='lg' sx={{ pb: 7 }}>
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 3,
            borderRadius: 4,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ maxWidth: 640 }}>
            <Chip label='Nuevo Mapa Interactivo' color='primary' size='small' sx={{ mb: 1.5, fontWeight: 700 }} />
            <Typography variant='h2' sx={{ fontWeight: 800, mb: 1 }}>
              Mapa de experiencias
            </Typography>
            <Typography variant='h4' sx={{ color: 'text.secondary', fontWeight: 400, fontSize: { xs: '1rem', md: '1.2rem' } }}>
              Encuentra experiencias LGTBIQ+ friendly por toda Colombia en el mapa interactivo con Mapbox.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to={RUTAS_PORTAL.mapa}
            variant='contained'
            size='large'
            startIcon={<ExploreIcon />}
            sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 700 }}
          >
            Explorar en el mapa
          </Button>
        </Paper>
      </Container>

      {promociones.length > 0 && (
        <Container maxWidth='lg'>
          <Paper sx={{ p: { xs: 3, md: 5 }, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', background: `linear-gradient(90deg, ${portal.claro.secundario}, ${portal.primario})`, color: textoSobre(portal.primario) }}>
            <LocalOfferIcon sx={{ fontSize: 48 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant='h3'>{promociones[0].nombre}</Typography>
              <Typography sx={{ opacity: 0.9 }}>
                {promociones.length > 1 ? `y ${promociones.length - 1} promoción(es) más vigentes` : `Válida hasta ${promociones[0].fecha_fin}`}
              </Typography>
            </Box>
            <Button variant='contained' color='inherit' sx={{ color: portal.claro.texto }} component={RouterLink} to={RUTAS_PORTAL.promociones}>
              Ver promociones
            </Button>
          </Paper>
        </Container>
      )}
    </>
  );
};

export default Home;
