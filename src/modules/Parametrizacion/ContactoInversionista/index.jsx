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
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuItem from '@mui/material/MenuItem';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { TIPO_DOCUMENTO, TIPO_CONTACTOS } from '../../../shared/constants/ListaValores';
import InversionistaContactoCreador from './ContactoInversionistaCreador';
import {onGetColeccion, onDelete, onGetColeccionLigera} from '../../../@crema/redux/features/inversionistaContacto/inversionistaContactosSlice';
import { onShow } from '../../../@crema/redux/features/inversionista/inversionistasSlice';
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

const cells = [
  {
    id: 'tipo_documento_cont',
    typeHead: 'string',
    label: 'Tipo documento',
     value: (value) => TIPO_DOCUMENTO.map((estado) => estado.id === value ? estado.nombre : ''),
    align: 'left',
    mostrarInicio: false,
  },
  {
    id: 'numero_documento_cont',
    typeHead: 'string',
    label: 'Documento',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'nombre_contacto',
    typeHead: 'string',
    label: 'Nombre',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'tipo_contacto',
    typeHead: 'string',
    label: 'Tipo',
    value: (value) => TIPO_CONTACTOS.map((estado) => estado.id === value ? estado.nombre : ''),
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'cargo_contacto',
    typeHead: 'string',
    label: 'Cargo',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'email_contacto',
    typeHead: 'string',
    label: 'Correo electrónico',
    value: (value) => value,
    align: 'left',
    mostrarInicio: false,
  },
  {
    id: 'telefono_contacto',
    typeHead: 'string',
    label: 'Teléfono',
    value: (value) => value,
    align: 'left',
    mostrarInicio: false,
  },
  {
    id: 'telefono_celular_contacto',
    typeHead: 'string',
    label: 'Teléfono celular',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'estado',
    typeHead: 'string',
    label: 'Estado',
    value: (value) => (value === 1 ? 'Activo' : 'Inactivo'),
    align: 'center',
    mostrarInicio: false,
    cellColor: (value) => (value === 1 ? 'green' : 'red'),
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
  contenedorFiltrosNombre: {
    width: '90%',
    display: 'grid',
    gridTemplateColumns: '8fr 1fr',
    gap: '20px',
    '@media (max-width: 600px)': { // Cambia a una columna en pantallas móviles
      gridTemplateColumns: '1fr',
    },
    marginTop:10
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
    onOpenAddInversionistaContacto,
    handleOpenPopoverColumns,
    queryFilter,
    nombreFiltro,
    tipoLista,
    selectedRow,
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
              {permisos.indexOf('CrearCont') >= 0 && (
                <Tooltip title='Crear Inversionista Contacto' onClick={onOpenAddInversionistaContacto}>
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
                label='Tipo documento'
                onChange={queryFilter}
                 value={TIPO_DOCUMENTO.find(doc => doc.id === selectedRow?.tipo_documento)?.nombre ?? ''}
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
                  label='Número documento'
                  name='documentoFiltro'
                  id='documentoFiltro'
                  onChange={queryFilter}
                  value={selectedRow?.numero_documento}
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
            <Box className={classes.contenedorFiltrosNombre}>          
              <TextField
                label='Nombre'
                name='nombreFiltro'
                id='nombreFiltro'
                onChange={queryFilter}
                value={selectedRow?.nombre}
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
  onOpenAddInversionistaContacto: PropTypes.func.isRequired,
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

const InversionistaContacto = (props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { inversionista_id } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('');
  const [orderByToSend, setOrderByToSend] = React.useState(
    'nombre_contacto:asc',
  );
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(1);
  // const [dense, setDense] = React.useState(false);
  const dense = true; //Borrar cuando se use el change
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const rowsPerPageOptions = [5, 10, 15, 25, 50];

  const [accion, setAccion] = useState('ver');
  const [InversionistaContactoSeleccionado, setInversionistaContactoSeleccionado] = useState(0);
  const { rows, desde, hasta, ultima_pagina, total } = useSelector((state) => state.inversionistasContacto);
  const selectedRow = useSelector((state) =>  state.inversionistas.InversionistaActual);  
  const contactos = useSelector((state) =>  state.inversionistasContacto.coleccionLigera);  
  const { message, error, messageType } = useSelector(({ common }) => common);

  console.log(contactos);

  useEffect(() => {
    if (message) {
      if (messageType === DELETE_TYPE) {
        Swal.fire({
          title: 'Eliminado',
          text: message,
          icon: 'success',
          confirmButtonColor: '#3085d6',
          background: theme.palette.background.default,
          color:theme.palette.text.primary,
        });
        
      }
    }
  }, [message, error]); 

  const textoPaginacion = `Mostrando de ${desde} a ${hasta} de ${total} resultados - Página ${page} de ${ultima_pagina}`;
  const [nombreFiltro, setNombreFiltro] = useState('');
  const tipoLista = 'I';
  const debouncedName = useDebounce(nombreFiltro, 800);
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
  const [permisos, setPermisos] = useState('');
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    user &&
      user.usuario.permisos.forEach((modulo) => {
        modulo.opciones.forEach((opcion) => {
          if (opcion.url === '/inversionistas') {
            setTitulo(`${opcion.nombre} - Contactos `);
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
    dispatch(onGetColeccion({page, rowsPerPage, inversionista_id, orderByToSend}));
    dispatch(onGetColeccionLigera(inversionista_id));
    
  }, [dispatch, page, rowsPerPage, debouncedName, orderByToSend, showForm]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateColeccion = () => {
    setPage(1);
    dispatch(onGetColeccion({page, rowsPerPage, inversionista_id, orderByToSend}));
  };

  useEffect(() => {
    dispatch(onShow(inversionista_id));
  }, [dispatch, inversionista_id]);

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

  const onOpenEditInversionistaContacto = (id) => {
    setInversionistaContactoSeleccionado(id);
    setAccion('editar');
    setShowForm(true);
  };

  const onOpenViewInversionistaContacto  = (id) => {
    setInversionistaContactoSeleccionado(id);
    setAccion('ver');
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



  const onDeleteInversionistaContacto = (id) => {
    Swal.fire({
      title: 'Confirmar',
      text: '¿Seguro que desea eliminar el contacto?',
      icon: 'warning',
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
		navigate('/inversionistas');
	}
  

  const onOpenAddInversionistaContacto = () => {
    setInversionistaContactoSeleccionado(0);
    setAccion('crear');
    setShowForm(true);
  };

  const handleOnClose = () => {
    setShowForm(false);
    setInversionistaContactoSeleccionado(0);
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

  
  return (
    <div className={classes.root}>
      <Paper sx={{marginBottom: theme.spacing(2),}} className={classes.paper}>
        {permisos && (
          <EnhancedTableToolbar
            numSelected={selected.length}
            onOpenAddInversionistaContacto={onOpenAddInversionistaContacto}
            handleOpenPopoverColumns={handleOpenPopoverColumns}
            queryFilter={queryFilter}
            limpiarFiltros={limpiarFiltros}
            nombreFiltro={nombreFiltro}
            tipoLista={tipoLista}
            selectedRow={selectedRow}
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
                      <StyledTableRow
                        hover
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id_lista_contacto}
                        selected={isItemSelected}
                        className={classes.row}
                      >
                        <StyledTableCell align='center' className={classes.acciones}>
                          {permisos.indexOf('ModificarCont') >= 0 && (
                            <Tooltip title={<IntlMessages id='boton.editar' />}>
                              <EditIcon
                                onClick={() => onOpenEditInversionistaContacto(row.id)}
                                sx={{'&:hover': {
                                  cursor: 'pointer',
                                  color: theme.palette.primary.main,
                                },
                                color: theme.palette.colorHovers,
                              }}
                              ></EditIcon>
                            </Tooltip>
                          )}
                          {permisos.indexOf('ListarCont') >= 0 && (
                            <Tooltip title={<IntlMessages id='boton.ver' />}>
                              <VisibilityIcon
                                onClick={() => onOpenViewInversionistaContacto(row.id)}
                                sx={{'&:hover': {
                                  color: theme.palette.colorHovers,
                                  cursor: 'pointer',
                                },
                                color: theme.palette.grayBottoms,}}
                              ></VisibilityIcon>
                            </Tooltip>
                          )}
                          {permisos.indexOf('EliminarCont') >= 0 && (
                            <Tooltip
                              title={<IntlMessages id='boton.eliminar' />}
                            >
                              <DeleteIcon
                                onClick={() => onDeleteInversionistaContacto(row.id)}
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
                                key={row.id_lista_contacto + columna.id}
                                align={columna.align}
                                width={columna.width}
                                claseBase={classes.cell}
                                value={columna.value(row[columna.id], row)} // ← Pasamos `row`
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
        <InversionistaContactoCreador
          showForm={showForm}
          InversionistaContacto={InversionistaContactoSeleccionado}
          accion={accion}
          handleOnClose={handleOnClose}
          updateColeccion={updateColeccion}
          titulo={titulo}
          inversionista={selectedRow}
          contactos={contactos}
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

InversionistaContacto.propTypes = {
  route: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }),
  permisos: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

export default InversionistaContacto;
