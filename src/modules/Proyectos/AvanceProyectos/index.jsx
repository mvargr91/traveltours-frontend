import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Input } from '@mui/material';
import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Tooltip  from '@mui/material/Tooltip';
import MUIAutocomplete from '../../../shared/components/MUIAutocomplete';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from 'recharts';
import { useDebounce } from '../../../@crema/hooks/useDebounce';
import IntlMessages from '../../../@crema/helpers/IntlMessages';
import { onAvanceProyectos } from '../../../@crema/redux/features/Proyecto/proyectosSlice';
import { onGetColeccionLigera as onGetTiposProyectos } from '../../../@crema/redux/features/tipoProyecto/tiposProyectosSlice';
import { onGetColeccionLigera as onGetEtapasProyectos } from '../../../@crema/redux/features/etapaProyecto/etapaProyectoSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


const useToolbarStyles = makeStyles((theme) => ({
  root: {
    padding: '15px',
    boxShadow: '0px 0px 5px 5px rgb(0 0 0 / 10%)',
    borderRadius: '4px',
    display: 'grid',
    // gap: '20px',
  },
  title: {
    flex: '1 1 100%',
    fontWeight: 'bold',
  },
  horizontalBottoms: {
    width: 'min-content',
    display: 'flex',
    gap: '5px',
  },
  titleTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  contenedorFiltros: {
    width: '90%',
    display: 'grid',
    gridTemplateColumns: '4fr 4fr 1fr',
    gap: '20px',
    '@media (max-width: 600px)': { 
      gridTemplateColumns: '1fr',
    },
  },
  pairFilters: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '20px',
    minWidth: '100px',
  },
}));



const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { 
    theme ,
    tiposProyectos,
    etapasProyectos,
    idTipoProyecto,
    setIdTipoProyecto,
    etapaFiltro,
    setEtapaoFiltro,
    limpiarFiltros,
  } = props;
  return (
    <Toolbar
      sx={{
        padding: '15px',
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0px 0px 5px 5px rgb(0 0 0 / 10%)',
        borderRadius: '4px',
        display: 'grid',
      }}
    >   
        <>
          <Box className={classes.titleTop}>
            <Typography
              className={classes.title}
              variant='h2'
              id='tableTitle'
              component='div'
            >
              Avance Proyectos
            </Typography>
            <Box className={classes.horizontalBottoms}>
              <Tooltip
                title='Mostrar/Ocultar Columnas'
                onClick={''}
                sx={{backgroundColor: theme.palette.colorFiltro,
                  color: 'white',
                  boxShadow:
                    '0px 3px 5px -1px rgb(0 0 0 / 30%), 0px 6px 10px 0px rgb(0 0 0 / 20%), 0px 1px 18px 0px rgb(0 0 0 / 16%)',
                  '&:hover': {
                    backgroundColor: theme.palette.colorHovers,
                    cursor: 'pointer',
                  },
                  padding: '13px',}}
              >
              </Tooltip>
            </Box>
          </Box>
          <Box className={classes.contenedorFiltros}>     
            <MUIAutocomplete
              label="Tipo Proyecto"
              options={tiposProyectos.filter((item) => item.estado === 1)}
              value={tiposProyectos.find((i) => i.id === idTipoProyecto) || null}
              onChange={(_, option) => setIdTipoProyecto(option?.id ?? null)}
              getOptionLabel={(opt) => opt?.nombre || ''}
            /> 
            <MUIAutocomplete
              label="Etapa"
              options={etapasProyectos.filter((item) => item.estado === 1)}
              value={etapasProyectos.find((i) => i.nombre === etapaFiltro) || null}
              onChange={(_, option) => setEtapaoFiltro(option?.nombre ?? null)}
              getOptionLabel={(opt) => opt?.nombre || ''}
            />         
            <Box display='grid'>
              <Box display='flex' mb={2}>
                  <Tooltip title='Limpiar Filtros' onClick={limpiarFiltros}>
                    <IconButton
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        boxShadow:
                          '0px 3px 5px -1px rgb(0 0 0 / 30%), 0px 6px 10px 0px rgb(0 0 0 / 20%), 0px 1px 18px 0px rgb(0 0 0 / 16%)',
                        '&:hover': {
                          backgroundColor: theme.palette.colorHovers,
                          cursor: 'pointer',
                        },
                        padding: '13px', }}
                      aria-label='filter list'
                    >
                      <ClearAllIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
            </Box>
          </Box>
        </>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  limpiarFiltros: PropTypes.func.isRequired,
  nombreFiltro: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  permisos: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};


const useStyles = makeStyles((theme) => ({
  marcoTabla: {
    boxShadow: '0px 0px 5px 5px rgb(0 0 0 / 10%)',
    borderRadius: '4px',
    paddingLeft: '15px',
    paddingRight: '15px',
    marginTop: '5px',
  },
  root: {
    width: '100%',
    padding: '20px',
  },
  head: {
    borderTop: '2px solid #dee2e6',
    borderBottom: '2px solid #dee2e6',
  },
  headCell: {
    padding: '0px 0px 0px 15px',
    // textAlign: 'start',
  },
  row: {
    padding: 'none',
  },
  cell: (props) => ({
    padding: props.vp + ' 0px ' + props.vp + ' 15px',
    whiteSpace: 'nowrap',
  }),
  cellWidth: (props) => ({
    minWidth: props.width,
  }),
  cellColor: (props) => ({
    backgroundColor: props.cellColor,
    color: 'white',
  }),
  acciones: (props) => ({
    padding: props.vp + ' 0px ' + props.vp + ' 15px',
    minWidth: '100px',
  }),
  paper: {
    width: '100%',    
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },
  table: {
    minWidth: '100%',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  paginacion: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px',
    paddingBottom: '5px',
  },
  rowsPerPageOptions: {
    marginRight: '10px',
  },
}));

let hUrl = '';

const AvanceProyectosChart = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector(({ auth }) => auth);
  const { AvanceProyectos } = useSelector((state) => state.proyectos);
  const dense = true; 
  const { coleccionLigera: tiposProyectos } = useSelector((state) => state.tiposProyectos);
  const { coleccionLigera: etapasProyectos } = useSelector((state) => state.etapaProyecto);
  const [idTipoProyecto, setIdTipoProyecto]   = useState(null);
  const [etapaFiltro, setEtapaoFiltro] = useState('');
  const debouncedTipo = useDebounce(idTipoProyecto, 800);
  const debouncedEtapa = useDebounce(etapaFiltro, 800);
  const [permisos, setPermisos] = useState('');
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    user &&
      user.usuario.permisos.forEach((modulo) => {
        modulo.opciones.forEach((opcion) => {
          if (opcion.url === props.route.path) {
            setTitulo(opcion.nombre);
            hUrl = opcion.url_ayuda;
            const permisoAux = [];
            opcion.permisos.forEach((permiso) => {
              if (permiso.permitido) {
                permisoAux.push(permiso.titulo);
              }
            });
            setPermisos(permisoAux);
          }
        });
      });
  }, [user, props.route]);

  useEffect(() => {
    dispatch(onAvanceProyectos({idTipoProyecto, etapaFiltro}));
  }, [dispatch, debouncedTipo, debouncedEtapa]);

  useEffect(() => {
    dispatch(onGetEtapasProyectos({idTipoProyecto}));    
    dispatch(onGetTiposProyectos());   
  }, [dispatch, debouncedTipo]);

  useEffect(() => {
    dispatch(onGetEtapasProyectos({idTipoProyecto}));    
  }, [dispatch, debouncedTipo]);

  const baseData = useMemo(
    () =>
      (AvanceProyectos || []).map((d) => ({
        ...d,
        id: d.id,
        nombre_proyecto: d.nombre_proyecto,
        ultima_actividad: d.ultima_actividad || 'Actividad N/A',
        ultima_etapa: d.ultima_etapa || 'Etapa N/A',
        ultima_etapa_id: d.ultima_etapa_id ?? null,
        avance_porcentual: Number(d.avance_porcentual ?? 0),
      })),
    [AvanceProyectos]
  );


  const ENABLE_SIMULACION = false; 
  const data = ENABLE_SIMULACION ? generarDatosDemo(baseData, 35) : baseData;

  const limpiarFiltros = () => {
    setIdTipoProyecto('');
    setEtapaoFiltro('');
  };

  const tooltipFormatter = (value) => {
    const num = Number(value || 0);
    return [`${num.toFixed(2)}%`, 'Avance'];
  };

  const tooltipLabelFormatter = (label, payload) => {
    const row = payload?.[0]?.payload;
    if (!row) return label;
    return `Etapa: ${row.ultima_etapa} • Última actividad: ${row.ultima_actividad}`;
  };

  const yTickFormatter = (val, index) => {
    const row = data?.[index];
    return row ? `${row.nombre_proyecto} ` : val;
  };

  const handleBarClick = ({ payload }) => {
    if (!payload?.id) return;
    navigate(`/avances-proyectos/${payload.id}`, { state: payload });
  };

  let vp = '15px';
  if (dense === true) {
    vp = '0px';
  }

  const classes = useStyles({ vp: vp });

  return (
    <>
    <EnhancedTableToolbar  
      theme={theme}  
      tiposProyectos={tiposProyectos}
      etapasProyectos={etapasProyectos}
      idTipoProyecto={idTipoProyecto}
      setIdTipoProyecto={setIdTipoProyecto}
      etapaFiltro={etapaFiltro}
      setEtapaoFiltro={setEtapaoFiltro}
      limpiarFiltros={limpiarFiltros}
    />
    
     { permisos ? (
          <Box sx={{
            width: '100%',
            height: 600,
            boxShadow: '0px 0px 5px 5px rgb(0 0 0 / 10%)',
            borderRadius: '4px',
            paddingX: '15px',
            mt: '5px',
            backgroundColor: 'white',
          }}>            
               {permisos.indexOf('Listar') >= 0 ?(
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data} margin={{ top: 10, right: 0, left: 0, bottom: 100 }}>
                      <XAxis 
                        type="number"
                        domain={[0, 100]}
                        ticks={[0, 20, 40, 60, 80, 100]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis dataKey="nombre_proyecto" type="category" tickFormatter={yTickFormatter} width={280} />
                      <RechartsTooltip formatter={tooltipFormatter} labelFormatter={tooltipLabelFormatter} />
                      <Bar dataKey="avance_porcentual" fill="#3f51b5" radius={[0, 0, 0, 0]} onClick={handleBarClick} cursor="pointer">
                        <LabelList
                          dataKey="avance_porcentual"
                          position="right"
                          formatter={(v) => `${Number(v || 0).toFixed(2)}%`}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               ) : (
                <Box
                  component='h2'
                  padding={4}
                  fontSize={19}
                  className={classes.marcoTabla}
                  sx={{
                    background: theme.palette.background.paper
                  }}
                >
                  <IntlMessages id='sinResultados' />
                </Box>
               )
            }
            
          </Box>

      ) : (
        <Box
          component='h2'
          padding={4}
          fontSize={19}
          className={classes.marcoTabla}
          sx={{
            background: theme.palette.background.paper
          }}
        >
          <IntlMessages id='noAutorizado' />
        </Box>
      )}
    
    </>
  );
};

export default AvanceProyectosChart;

function generarDatosDemo(base, total = 35) {
  if (!Array.isArray(base) || base.length === 0 || base.length >= total) return base;
  const out = [...base];
  for (let i = 0; i < total - base.length; i++) {
    const src = base[i % base.length];
    out.push({
      ...src,
      id: `${src.id}-demo-${i + 1}`,
      nombre_proyecto: `${src.nombre_proyecto} (Demo ${i + 1})`,
      avance_porcentual: Math.max(0, Math.min(100, src.avance_porcentual + ((i % 7) - 3) * 5)),
      ultima_actividad: src.ultima_actividad || 'Actividad demo',
      ultima_etapa: src.ultima_etapa || 'Etapa demo',
    });
  }
  return out;
}
