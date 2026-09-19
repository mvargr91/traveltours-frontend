import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button } from '@mui/material';
import { Input } from '@mui/material';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled, useTheme } from '@mui/material/styles';
import { lighten } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Pagination from '@mui/material/Pagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import MUIAutocomplete from '../../../shared/components/MUIAutocomplete';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ActividadPorProyectoCreador from './ActividadPorProyectoCreador';
import {onGetColeccionEjecutadas, onHead} from '../../../@crema/redux/features/actividadPorProyecto/actividadPorProyectoSlice';
import { onGetColeccionLigera as onGetTiposProyectos } from '../../../@crema/redux/features/tipoProyecto/tiposProyectosSlice';
import { onGetColeccionLigera as onGetEtapasProyectos } from '../../../@crema/redux/features/etapaProyecto/etapaProyectoSlice';
import { onGetColeccionLigera as onGetProyectos } from '../../../@crema/redux/features/Proyecto/proyectosSlice';
import { onGetColeccionLigera as onGetCiudades } from '../../../@crema/redux/features/ciudades/ciudadesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowBackIos } from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IntlMessages from '../../../@crema/helpers/IntlMessages';
import Popover from '@mui/material/Popover';
import TuneIcon from '@mui/icons-material/Tune';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { RadioGroup, Radio } from '@mui/material';
import TextField from '@mui/material/TextField';
import Swal from 'sweetalert2';
import {
  UPDATE_TYPE,
  CREATE_TYPE,
  DELETE_TYPE,
  ERROR_TYPE,
} from '../../../shared/constants/Constantes';
import AppMessageView from '@crema/components/AppMessageView';
import { useDebounce } from '../../../@crema/hooks/useDebounce';
import MyCell from '../../../shared/components/MyCell';
import moment from 'moment';
import HelpButton from '../../../shared/components/HelpButton';
import parse from 'html-react-parser';
import { useParams, useNavigate } from 'react-router-dom'; 
import { DATO_BOOLEAN_RADIO, ESTADO_ACTIVIDADES_POR_PROYECTO } from '../../../shared/constants/ListaValores';
import defaultConfig from '@crema/constants/defaultConfig';

const options = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
];

const cells = [
  {
    id: 'etapa_proyecto',
    typeHead: 'string',
    label: 'Etapa',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'nombre_actividad',
    typeHead: 'string',
    label: 'Actividad',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'estado_actividad',
    typeHead: 'string',
    label: 'Estado',
    value: (value) => ESTADO_ACTIVIDADES_POR_PROYECTO.map((estado) => estado.id === value ? estado.nombre : ''),
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'fecha_ejecucion',
    typeHead: 'string',
    label: 'Fecha ejecución',
    value: (value) => value ? moment(value).format('YYYY-MM-DD') : '',
    align: 'left',
    width: '180px',
    mostrarInicio: true,
  },
  {
    id: 'fecha_compromiso',
    typeHead: 'string',
    label: 'Fecha compromiso',
    value: (value) => value ? moment(value).format('YYYY-MM-DD') : '',
    align: 'left',
    width: '180px',
    mostrarInicio: true,
  },
  {
    id: 'observaciones',
    typeHead: 'string',
    label: 'Observación',
    value: (value) => value ,
    align: 'left',
    width: '180px',
    mostrarInicio: false,
  },
  {
    id: 'nombre_archivo',
    typeHead: 'string',
    label: 'Nombre archivo',
    value: (value, row) => 
    {
      if (!row?.id_proyecto) return value; 
      return  (
        <a
          href={`${defaultConfig.API_URL}/descargarActividades/${row?.id_proyecto}/${row?.id_etapa_proyecto}/${row?.id_actividad_proyecto}/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: '#0A8FDC', fontWeight: 'bold' }}
        >
          {value}
        </a>
      )
    },
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'usuario_modificacion_nombre',
    typeHead: 'string',
    label: 'Modificado Por',
    value: (value) => value,
    align: 'left',
    width: '140px',
    mostrarInicio: false,
  },
  {
    id: 'fecha_modificacion',
    typeHead: 'string',
    label: 'Fecha Última Modificación',
    value: (value) => value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '',
    align: 'left',
    width: '180px',
    mostrarInicio: false,
  },
  {
    id: 'usuario_creacion_nombre',
    typeHead: 'string',
    label: 'Creado Por',
    value: (value) => value,
    align: 'left',
    width: '140px',
    mostrarInicio: false,
  },
  {
    id: 'fecha_creacion',
    typeHead: 'string',
    label: 'Fecha Creación',
    value: (value) => value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '',
    align: 'left',
    width: '180px',
    mostrarInicio: false,
  },
];
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.primary,  
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 11,
    textAlign: 'center',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  textAlign: 'start',
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
    fontSize: 14,
  },
}));



function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort, columnasMostradas } = props;

  return (
    <TableHead>
      <StyledTableRow className={classes.head}>
        {/* <StyledTableCell
          align='center'
          style={{ fontWeight: 'bold' }}
          className={classes.headCell}
        >
          {'Acciones'}
        </StyledTableCell> */}
        {columnasMostradas.map((cell) => {
          if (cell.mostrar) {
            return (
              <StyledTableCell
                key={cell.id}
                style={{ fontWeight: 'bold' }}
                align={
                  // eslint-disable-next-line prettier/prettier
                  cell.typeHead === 'string'
                    ? 'left'
                    : cell.typeHead === 'numeric' // eslint-disable-next-line prettier/prettier
                    ? 'right'// eslint-disable-next-line prettier/prettier
                    : 'center'
                }
                // eslint-disable-next-line prettier/prettier
                className={classes.cell}
                sortDirection={orderBy === cell.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === cell.id}
                  direction={orderBy === cell.id ? order : 'asc'}
                  onClick={() => {
                    onRequestSort(cell.id);
                  }}
                >
                  {cell.label}
                  {orderBy === cell.id ? (
                    <span className={classes.visuallyHidden}>
                      {order === 'desc'
                        ? 'sorted descending'
                        : 'sorted ascending'}
                    </span>
                  ) : null}
                </TableSortLabel>
              </StyledTableCell>
            );
          } else {
            return <th key={cell.id}></th>;
          }
        })}
      </StyledTableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  columnasMostradas: PropTypes.array.isRequired,
};

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
    '@media (max-width: 600px)': { // Cambia a una columna en pantallas móviles
      gridTemplateColumns: '1fr',
    },
  },
  contenedorFiltrosP:{
    width: '90%',
    marginBottom:10,
    display: 'grid',
    gridTemplateColumns: '6fr 3fr 1fr',
    gap: '20px',
    '@media (max-width: 600px)': { // Cambia a una columna en pantallas móviles
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
    numSelected,
    titulo,
    handleOpenPopoverColumns,
    url,
    theme,
    headProyecto,
    estadoFiltro,
    onCambioEstado,
    onGoBack
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
      {numSelected > 0 ? (
        <Typography
          className={classes.title}
          color='inherit'
          variant='subtitle1'
          component='div'
        >
          {numSelected} selected
        </Typography>
      ) : (
        <>
          <Box className={classes.titleTop}>
            <Tooltip title='Volver'>
              <ArrowBackIos
                style={{cursor: 'pointer', fontSize: 30}}
                onClick={onGoBack}
              />
            </Tooltip>
            <Typography
              className={classes.title}
              variant='h2'
              id='tableTitle'
              component='div'
            >
              {titulo}
            </Typography>
            <Box className={classes.horizontalBottoms}>
              <HelpButton url={url} />
              <Tooltip
                title='Mostrar/Ocultar Columnas'
                onClick={handleOpenPopoverColumns}
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
                <IconButton
                  sx={{backgroundColor: theme.palette.colorFiltro,
                    color: 'white',
                    boxShadow:
                      '0px 3px 5px -1px rgb(0 0 0 / 30%), 0px 6px 10px 0px rgb(0 0 0 / 20%), 0px 1px 18px 0px rgb(0 0 0 / 16%)',
                    '&:hover': {
                      backgroundColor: theme.palette.colorHovers,
                      cursor: 'pointer',
                    },
                    padding: '13px',}}
                  aria-label='filter list'
                >
                  <TuneIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box className={classes.contenedorFiltrosP}>          
              <TextField
                  label='Proyecto'
                  value={headProyecto?.nombre_proyecto}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled
                  className={classes.inputFiltros}
                  variant='standard'
                  fullWidth
                  InputProps={{
                    inputComponent: Input,
                    disableUnderline: false,
                }}
                sx={{                
                  '& .MuiInput-underline:before': {
                    borderBottomColor: '#ccc',
                    marginBottom: -0.5,
                  },
                  '& .MuiInput-underline:hover:before': {
                    borderBottomColor: theme.palette.text.primary,
                  },
                  '& .MuiInput-underline:after': {
                    borderBottomColor: theme.palette.text.primary,
                  },
                }}
              />
              <TextField
                  label='Código'
                  value={headProyecto?.codigo_proyecto}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled
                  className={classes.inputFiltros}
                  variant='standard'
                  fullWidth
                  InputProps={{
                    inputComponent: Input,
                    disableUnderline: false,
                }}
                sx={{                
                  '& .MuiInput-underline:before': {
                    borderBottomColor: '#ccc',
                    marginBottom: -0.5,
                  },
                  '& .MuiInput-underline:hover:before': {
                    borderBottomColor: theme.palette.text.primary,
                  },
                  '& .MuiInput-underline:after': {
                    borderBottomColor: theme.palette.text.primary,
                  },
                }}
              />
          </Box>
          <Box className={classes.contenedorFiltrosP}>          
              <TextField
                  label='Tipo proyecto'
                  value={headProyecto?.tipo_proyecto}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled
                  className={classes.inputFiltros}
                  variant='standard'
                  fullWidth
                  InputProps={{
                    inputComponent: Input,
                    disableUnderline: false,
                }}
                sx={{                
                  '& .MuiInput-underline:before': {
                    borderBottomColor: '#ccc',
                    marginBottom: -0.5,
                  },
                  '& .MuiInput-underline:hover:before': {
                    borderBottomColor: theme.palette.text.primary,
                  },
                  '& .MuiInput-underline:after': {
                    borderBottomColor: theme.palette.text.primary,
                  },
                }}
              /> 
              <TextField
                label='Ciudad'
                value={headProyecto?.ciudad_proyecto}
                InputLabelProps={{
                  shrink: true,
                }}
                disabled
                className={classes.inputFiltros}
                variant='standard'
                fullWidth
                InputProps={{
                  inputComponent: Input,
                  disableUnderline: false,
              }}
              sx={{                
                '& .MuiInput-underline:before': {
                  borderBottomColor: '#ccc',
                  marginBottom: -0.5,
                },
                '& .MuiInput-underline:hover:before': {
                  borderBottomColor: theme.palette.text.primary,
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: theme.palette.text.primary,
                },
              }}
            />
            <Box display='grid'>
            </Box>
            
          </Box>
        </>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  handleOpenPopoverColumns: PropTypes.func.isRequired,
  limpiarFiltros: PropTypes.func.isRequired,
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

const ActividadPorProyecto = (props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { proyecto_id } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('');
  const [orderByToSend, setOrderByToSend] = React.useState('');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(1);
  // const [dense, setDense] = React.useState(false);
  const dense = true; //Borrar cuando se use el change
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const rowsPerPageOptions = [5, 10, 15, 25, 50];
  const [accion, setAccion] = useState('ver');
  const [ActividadPorProyectoSeleccionado, setActividadPorProyectoSeleccionado] = useState(0);
  const { rows, desde, hasta, ultima_pagina, total } = useSelector((state) => state.actividadPorProyecto);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const { message, error, messageType } = useSelector(({ common }) => common);

  const textoPaginacion = `Mostrando de ${desde} a ${hasta} de ${total} resultados - Página ${page} de ${ultima_pagina}`;
  // const {pathname} = useLocation();
  const [openPopOver, setOpenPopOver] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState(null);

  let columnasMostradasInicial = [];

  cells.forEach((cell) => {
    columnasMostradasInicial.push({
      id: cell.id,
      mostrar: cell.mostrarInicio,
      typeHead: cell.typeHead,
      label: cell.label,
      value: cell.value,
      align: cell.align,
      width: cell.width,
      cellColor: cell.cellColor,
    });
  });

  const [columnasMostradas, setColumnasMostradas] = useState(
    columnasMostradasInicial,
  );

  let vp = '15px';
  if (dense === true) {
    vp = '0px';
  }
  const classes = useStyles({ vp: vp });
  const dispatch = useDispatch();

  const { user } = useSelector(({ auth }) => auth);
  const { HeadActividadPorProyectoActual: headProyecto } = useSelector((state) => state.actividadPorProyecto);
  const { coleccionLigera: tiposProyectos } = useSelector((state) => state.tiposProyectos);
  const { coleccionLigera: etapasProyectos } = useSelector((state) => state.etapaProyecto);
  const { coleccionLigera: proyectos } = useSelector((state) => state.proyectos);
  const { coleccionLigera: ciudades } = useSelector((state) => state.ciudades);
  const [permisos, setPermisos] = useState('');
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    dispatch(onGetEtapasProyectos({id_tipo_proyecto:null}));    
    dispatch(onGetTiposProyectos());   
    dispatch(onGetProyectos());   
    dispatch(onGetCiudades());
    dispatch(onHead(proyecto_id));   
  }, [dispatch,proyecto_id]);

  useEffect(() => {
    user &&
      user.usuario.permisos.forEach((modulo) => {
        modulo.opciones.forEach((opcion) => {
          if (opcion.url === props.route.path) {
            setTitulo( 'Actividades ' + opcion.nombre);
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
    dispatch(onGetColeccionEjecutadas({ page, rowsPerPage, proyecto_id, orderByToSend }));
  }, [dispatch, page, rowsPerPage, orderByToSend, estadoFiltro]); 

  const updateColeccion = () => {
    setPage(1);
    dispatch(onGetColeccionEjecutadas({ page: 1, rowsPerPage, proyecto_id, orderByToSend }));
  };

  useEffect(() => {
    setPage(1)
  }, [orderByToSend]);

  const limpiarFiltros = () => {
    setIdEtapaProyecto('');
    setIdTipoProyecto('');
  };

  const changeOrderBy = (id) => {
    if (orderBy === id) {
      if (order === 'asc') {
        setOrder('desc');
        setOrderByToSend(id + ':desc');
      } else {
        setOrder('asc');
        setOrderByToSend(id + ':asc');
      }
    } else {
      setOrder('asc');
      setOrderBy(id);
      setOrderByToSend(id + ':asc');
    }
  };

  const onOpenEditActividadPorProyecto = (row) => {
    if(row.id){
      setActividadPorProyectoSeleccionado(row);
      setAccion('editar');
      setShowForm(true);
    }else{
      setActividadPorProyectoSeleccionado(row);
      setAccion('crear');
      setShowForm(true);
    }    
  };

  const handleClosePopover = () => {
    setOpenPopOver(false);
    setPopoverTarget(null);
  };

  const handleOpenPopoverColumns = (e) => {
    setPopoverTarget(e.currentTarget);
    setOpenPopOver(true);
  };

  const handleOnchangeMostrarColumna = (e) => {
    let aux = columnasMostradas;
    setColumnasMostradas(
      aux.map((column) => {
        if (column.id === e.target.id) {
          return { ...column, mostrar: !column.mostrar };
        } else {
          return column;
        }
      }),
    );
  };

  const showAllColumns = () => {
    let aux = columnasMostradas;
    setColumnasMostradas(
      aux.map((column) => {
        return { ...column, mostrar: true };
      }),
    );
  };

  const reiniciarColumns = () => {
    setColumnasMostradas(columnasMostradasInicial);
  };

  const onOpenViewActividadPorProyecto = (row) => {
    setShowForm(true); 
    setActividadPorProyectoSeleccionado(row);
    setAccion('ver');
  };

  const handleOnClose = () => {
    setShowForm(false);
    setActividadPorProyectoSeleccionado(0);
    setAccion('ver');
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const [showTable, setShowTable] = useState(true);
  useEffect(() => {
    if (rows.length === 0) {
      setShowTable(false);
    } else {
      setShowTable(true);
    }
  }, [rows]);

  const getRowKey = (row) =>
  row.id ?? `p${row.id_proyecto}-a${row.id_actividad_proyecto}-e${row.id_etapa_proyecto}`;

  const handleEstadoChange = (e) => {
    setEstadoFiltro(e.target.value);
    setPage(1);
  };

  const onGoBack = () => { 
		navigate('/avances-proyectos');
	}
  
  const visibleColumns = useMemo(
    () => columnasMostradas.filter((c) => c.mostrar),
    [columnasMostradas]
  );


  return (
    <div className={classes.root}>
      <Paper sx={{marginBottom: theme.spacing(2),}} className={classes.paper}>
        {permisos && (
          <EnhancedTableToolbar
            numSelected={selected.length}
            handleOpenPopoverColumns={handleOpenPopoverColumns}
            limpiarFiltros={limpiarFiltros}
            permisos={permisos}
            titulo={titulo}
            url={hUrl}
            theme={theme}
            tiposProyectos={tiposProyectos}
            etapasProyectos={etapasProyectos}
            headProyecto={headProyecto}
            estadoFiltro={estadoFiltro}
            onCambioEstado={handleEstadoChange}
            onGoBack={onGoBack}
          />
        )}
        {showTable && permisos ? (
          <Box 
            sx={{
              background: theme.palette.background.paper
            }}
            className={classes.marcoTabla}
          >
            <Box className={classes.paginacion}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%', // Asegura que ocupe todo el ancho
              gap: { xs: 2, sm: 0 }, // Espacio entre elementos en móvil
            }}>
              <Box
              sx={{
                width: { xs: '100%', sm: 'auto' }, // Ancho completo en móvil
                textAlign: { xs: 'center', sm: 'left' }, // Centrado en móvil
              }}>
                <p>{textoPaginacion}</p>
              </Box>
              <Box className={classes.paginacion}>
                <select
                  className={classes.rowsPerPageOptions}
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                >
                  {rowsPerPageOptions.map((option) => {
                    return (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    );
                  })}
                </select>
                <Pagination
                  showFirstButton
                  showLastButton
                  onChange={handleChangePage}
                  count={ultima_pagina}
                  page={page}
                />
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table
                className={classes.table}
                aria-labelledby='tableTitle'
                size={dense ? 'small' : 'medium'}
                aria-label='customized table'
              >
                <EnhancedTableHead
                  classes={classes}
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={changeOrderBy}
                  rowCount={rows.length}
                  columnasMostradas={columnasMostradas}
                />
                <TableBody>
                  {rows.map((row) => {
                    const isItemSelected = isSelected(row.name);

                    return (
                      <>
                      <StyledTableRow
                        hover
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={getRowKey(row)}
                        selected={isItemSelected}
                        className={classes.row}
                      >
                        {columnasMostradas.map((columna) => {
                          if (columna.mostrar) {
                            return (
                              <MyCell
                                useStyles={useStyles}
                                key={row.id + columna.id}
                                align={columna.align}
                                width={columna.width}
                                claseBase={classes.cell}
                                value={columna.value(row[columna.id], row)}
                                cellColor={
                                  columna.cellColor
                                    ? columna.cellColor(row[columna.id])
                                    : ''
                                }
                              />
                            );
                          } else {
                            return <th key={row.id + columna.id}></th>;
                          }
                        })}
                        
                      </StyledTableRow>
                                          {Boolean(row.observaciones) && (
                      <StyledTableRow key={`${getRowKey(row)}-obs`}>
                        <StyledTableCell
                          align="left"
                          colSpan={visibleColumns.length +1}
                          sx={{
                            backgroundColor: theme.palette.action.hover,
                            borderTop: '1px solid #e0e0e0',
                            whiteSpace: 'pre-wrap', // respeta saltos de línea
                            wordBreak: 'break-word',
                            p: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', gap: 1.5, fontStyle: 'italic' }}>
                              <Typography
                                variant="caption"
                                sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
                              >
                                Observación: 
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {typeof row.observaciones === 'string'
                                  ? (parse ? parse(row.observaciones) : row.observaciones)
                                  : row.observaciones}
                              </Typography>
                          </Box>
                        </StyledTableCell>
                      </StyledTableRow>
                    )}
                    </>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box className={classes.paginacion}
             sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%', // Asegura que ocupe todo el ancho
              gap: { xs: 2, sm: 0 }, // Espacio entre elementos en móvil
            }}>
              <Box
              sx={{
                width: { xs: '100%', sm: 'auto' }, // Ancho completo en móvil
                textAlign: { xs: 'center', sm: 'left' }, // Centrado en móvil
              }}>
                <p>{textoPaginacion}</p>
              </Box>
              <Box className={classes.paginacion}>
                <select
                  className={classes.rowsPerPageOptions}
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                >
                  {rowsPerPageOptions.map((option) => {
                    return (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    );
                  })}
                </select>
                <Pagination
                  showFirstButton
                  showLastButton
                  onChange={handleChangePage}
                  count={ultima_pagina}
                  page={page}
                />
              </Box>
            </Box>
          </Box>
        ) : permisos ? (
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
      </Paper>

      {showForm ? 
      (
        <ActividadPorProyectoCreador
          showForm={showForm}
          ActividadPorProyecto={ActividadPorProyectoSeleccionado}
          accion={accion}
          handleOnClose={handleOnClose}
          updateColeccion={updateColeccion}
          titulo={titulo}
          tiposProyectos={tiposProyectos}
          registros={rows}
          headProyecto={headProyecto}
          proyectos={proyectos}
          ciudades={ciudades}
        />
      ) : (
        ''
      )}

      <Popover
        id='popoverColumns'
        open={openPopOver}
        anchorEl={popoverTarget}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{display: 'grid',
            padding: '10px',
            color: theme.palette.grayBottoms,}}>
          {columnasMostradas.map((column) => {
            return (
              <FormControlLabel
                key={column.id}
                control={
                  <Switch
                    id={column.id}
                    checked={column.mostrar}
                    onChange={handleOnchangeMostrarColumna}
                  />
                }
                label={column.label}
              />
            );
          })}
          <Box>
            <Button onClick={showAllColumns}>Mostrar Todos</Button>
            <Button onClick={reiniciarColumns}>Reiniciar Vista</Button>
          </Box>
        </Box>
      </Popover>
      <AppMessageView
        variant={
          messageType === UPDATE_TYPE || messageType === CREATE_TYPE
            ? 'success'
            : 'error'
        }
        message={
          messageType === UPDATE_TYPE || messageType === CREATE_TYPE
            ? message
            : ''
        }
      />
      <AppMessageView
        variant={ messageType === ERROR_TYPE ? 'error' : 'success'}
        message={ messageType === ERROR_TYPE ? message : ''}
      />
    </div>
  );
};

ActividadPorProyecto.propTypes = {
  route: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }),
  permisos: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
};

export default ActividadPorProyecto;
