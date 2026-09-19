import React, { useState, useEffect } from 'react';
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
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ProyectoFotoCreador from './FotoProyectoCreador';
import {
  onShow,
}  from '../../../@crema/redux/features/Proyecto/proyectosSlice';
import { onHead } from '../../../@crema/redux/features/actividadPorProyecto/actividadPorProyectoSlice';
import {onGetColeccion, onDelete } from '../../../@crema/redux/features/proyectoFoto/proyectoFotosSlice';
import { onGetColeccionLigera as onGetProyectos } from '../../../@crema/redux/features/Proyecto/proyectosSlice';
import { useDispatch, useSelector } from 'react-redux';
import IntlMessages from '../../../@crema/helpers/IntlMessages';
import Popover from '@mui/material/Popover';
import TuneIcon from '@mui/icons-material/Tune';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { ArrowBackIos } from '@mui/icons-material';
import TextField from '@mui/material/TextField';
import Swal from 'sweetalert2';
import {
  UPDATE_TYPE,
  CREATE_TYPE,
  DELETE_TYPE,
} from '../../../shared/constants/Constantes';
import AppMessageView from '@crema/components/AppMessageView';
import { useDebounce } from '../../../@crema/hooks/useDebounce';
import MyCell from '../../../shared/components/MyCell';
import moment from 'moment';
import HelpButton from '../../../shared/components/HelpButton';
import { useParams, useNavigate } from 'react-router-dom'; 
import defaultConfig from '@crema/constants/defaultConfig';

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
  '&:last-child td, &:last-child th': {
    border: 0,
    fontSize: 14,
  },
}));

// Wrapper para la miniatura con hover
const PreviewThumbWrapper = styled('div')(() => ({
  position: 'relative',
  width: 40,
  height: 40,
  overflow: 'visible',
  '& img': {
    width: 40,
    height: 40,
    objectFit: 'cover',
    borderRadius: 4,
    border: '0px solid #ddd',
    display: 'block',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  },
  '&:hover img': {
    transform: 'scale(1)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
    zIndex: 9999,
    position: 'relative',
  },
}));

const cells = [
  {
    id: 'nombre_foto',
    typeHead: 'string',
    label: 'Nombre',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'nombre_archivo_foto',
    typeHead: 'string',
    label: 'Nombre archivo',
    value: (value, row) => {
      if (!row?.id_proyecto) return value;

      const downloadUrl = `${defaultConfig.API_URL}/descargarFotoProyecto/${row?.id_proyecto}/${value}`;
      const previewUrl  = `${defaultConfig.API_URL}/verFotoProyecto/${row?.id_proyecto}/${value}`;

      return (
        <a
          href={downloadUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block' }}
        >
          <PreviewThumbWrapper>
            <img
              src={previewUrl}
              alt={row?.nombre_foto || value}
              title="Descargar"
            />
          </PreviewThumbWrapper>
        </a>
      );
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
    value: (value) => moment(value).format('YYYY-MM-DD HH:mm:ss'),
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
    value: (value) => moment(value).format('YYYY-MM-DD HH:mm:ss'),
    align: 'left',
    width: '180px',
    mostrarInicio: false,
  },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort, columnasMostradas } = props;

  return (
    <TableHead>
      <StyledTableRow className={classes.head}>
        <StyledTableCell
          align='center'
          style={{ fontWeight: 'bold' }}
          className={classes.headCell}
        >
          {'Acciones'}
        </StyledTableCell>
        {columnasMostradas.map((cell) => {
          if (cell.mostrar) {
            return (
              <StyledTableCell
                key={cell.id}
                style={{ fontWeight: 'bold' }}
                align={
                  cell.typeHead === 'string'
                    ? 'left'
                    : cell.typeHead === 'numeric'
                    ? 'right'
                    : 'center'
                }
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
    numSelected,
    titulo,
    onOpenAddProyectoFoto,
    handleOpenPopoverColumns,
    queryFilter,
    nombreFiltro,
    headProyecto,
    tipoLista,
    limpiarFiltros,
    permisos,
    url,
    theme,
    onGoBack,
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
              {permisos.indexOf('CrearFoto') >= 0 && (
                <Tooltip title='Subir Foto' onClick={onOpenAddProyectoFoto}>
                  <IconButton
                    sx={{backgroundColor: theme.palette.primary.main,
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
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
          <Box className={classes.contenedorFiltros}>          
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
          <Box className={classes.contenedorFiltros}>          
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

      {numSelected > 0 ? (
        <Tooltip title='Delete'>
          <IconButton aria-label='delete'>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        ''
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onOpenAddProyectoFoto: PropTypes.func.isRequired,
  handleOpenPopoverColumns: PropTypes.func.isRequired,
  queryFilter: PropTypes.func.isRequired,
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

const ProyectoFoto = (props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { proyecto_id } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('');
  const [orderByToSend, setOrderByToSend] = React.useState(
    'nombre:asc',
  );
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const dense = true;
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const rowsPerPageOptions = [5, 10, 15, 25, 50];

  const [accion, setAccion] = useState('ver');
  const [ProyectoFotoSeleccionado, setProyectoFotoSeleccionado] = useState(0);
  const { rows, desde, hasta, ultima_pagina, total } = useSelector((state) => state.proyectoFoto);
  const { coleccionLigera: proyectos } = useSelector((state) => state.proyectos);
  const { HeadActividadPorProyectoActual: headProyecto  } = useSelector((state) => state.actividadPorProyecto);
  const { message, error, messageType } = useSelector(({ common }) => common);

  useEffect(() => {
    if (message) {
      if (messageType === DELETE_TYPE) {
        Swal.fire({
          title: 'Eliminada',
          text: message,
          icon: 'success',
          background: theme.palette.background.default,
          color:theme.palette.text.primary,
          confirmButtonColor: theme.palette.background.primary,
        });
      }
    }
  }, [message, error]); 

  const textoPaginacion = `Mostrando de ${desde} a ${hasta} de ${total} resultados - Página ${page} de ${ultima_pagina}`;
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [asuntoFiltro, setAsuntoFiltro] = useState(''); // para evitar error
  const tipoLista = 'P';
  const debouncedName = useDebounce(nombreFiltro, 800);
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
  const [permisos, setPermisos] = useState('');
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    user &&
      user.usuario.permisos.forEach((modulo) => {
        modulo.opciones.forEach((opcion) => {
          if (opcion.url === '/proyectos') {
            setTitulo(`Fotos por ${opcion.nombre}`);
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
    dispatch(onGetColeccion({page, rowsPerPage, proyecto_id, orderByToSend}));
  }, [dispatch, page, rowsPerPage, debouncedName, orderByToSend, showForm, tipoLista]);

  const updateColeccion = () => {
    setPage(1);
    dispatch(onGetColeccion({page, rowsPerPage, proyecto_id, orderByToSend}));
  };

  useEffect(() => {
    dispatch(onShow(proyecto_id));    
    dispatch(onHead(proyecto_id));  
    dispatch(onGetProyectos());   
  }, [dispatch, proyecto_id]);

  useEffect(() => {
    setPage(1);
  }, [debouncedName, orderByToSend]);

  const queryFilter = (e) => {
    switch (e.target.name) {
      case 'nombreFiltro':
        setNombreFiltro(e.target.value);
        break;
      case 'asuntoFiltro':
        setAsuntoFiltro(e.target.value);
        break;
      default:
        break;
    }
  };

  const limpiarFiltros = () => {
    setNombreFiltro('');
    setAsuntoFiltro('');
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

  const onOpenEditProyectoFoto = (id) => {
    setProyectoFotoSeleccionado(id);
    setAccion('editar');
    setShowForm(true);
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

  const onDeleteProyectoFoto = (id) => {
    Swal.fire({
      title: 'Confirmar',
      text: '¿Seguro que desea eliminar la foto?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'SÍ',
      cancelButtonText: 'NO',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(onDelete({ id, updateColeccion }))        
      }
    });
  };
  
  const onGoBack = () => { 
    navigate('/proyectos');
  }

  const onOpenAddProyectoFoto = () => {
    setProyectoFotoSeleccionado(0);
    setAccion('crear');
    setShowForm(true);
  };

  const handleOnClose = () => {
    setShowForm(false);
    setProyectoFotoSeleccionado(0);
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
    setRowsPerPage(parseInt(event.target.value, 5));
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

  return (
    <div className={classes.root}>
      <Paper sx={{marginBottom: theme.spacing(2),}} className={classes.paper}>
        {permisos && (
          <EnhancedTableToolbar
            numSelected={selected.length}
            onOpenAddProyectoFoto={onOpenAddProyectoFoto}
            handleOpenPopoverColumns={handleOpenPopoverColumns}
            queryFilter={queryFilter}
            limpiarFiltros={limpiarFiltros}
            nombreFiltro={nombreFiltro}
            headProyecto={headProyecto}
            tipoLista={tipoLista}
            permisos={permisos}
            titulo={titulo}
            url={hUrl}
            theme={theme}
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
              width: '100%',
              gap: { xs: 2, sm: 0 },
            }}>
              <Box
              sx={{
                width: { xs: '100%', sm: 'auto' },
                textAlign: { xs: 'center', sm: 'left' },
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
                      <StyledTableRow
                        hover
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id_lista_documento}
                        selected={isItemSelected}
                        className={classes.row}
                      >
                        <StyledTableCell align='center' className={classes.acciones}>
                          
                          {permisos.indexOf('EliminarFoto') >= 0 && (
                            <Tooltip
                              title={<IntlMessages id='boton.eliminar' />}
                            >
                              <DeleteIcon
                                onClick={() => onDeleteProyectoFoto(row.id)}
                                sx={{'&:hover': {
                                  color: theme.palette.colorHovers,
                                  cursor: 'pointer',
                                },
                                color: theme.palette.redBottoms,}}
                              ></DeleteIcon>
                            </Tooltip>
                          )}
                        </StyledTableCell>

                        {columnasMostradas.map((columna) => {
                          if (columna.mostrar) {
                            return (
                              <MyCell
                                useStyles={useStyles}
                                key={row.id_lista_documento + columna.id}
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
              width: '100%',
              gap: { xs: 2, sm: 0 },
            }}>
              <Box
              sx={{
                width: { xs: '100%', sm: 'auto' },
                textAlign: { xs: 'center', sm: 'left' },
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
        <ProyectoFotoCreador
          showForm={showForm}
          ProyectoFoto={ProyectoFotoSeleccionado}
          accion={accion}
          handleOnClose={handleOnClose}
          updateColeccion={updateColeccion}
          titulo={titulo}
          headProyecto={headProyecto}
          proyectos={proyectos}
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
    </div>
  );
};

ProyectoFoto.propTypes = {
  route: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }),
  permisos: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

export default ProyectoFoto;
