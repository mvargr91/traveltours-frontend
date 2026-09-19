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
import { ArrowBackIos } from '@mui/icons-material';
import {onGetColeccion, onDelete} from '../../../@crema/redux/features/planDetallado/planDetalladoSlice';
import { useDispatch, useSelector } from 'react-redux';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IntlMessages from '../../../@crema/helpers/IntlMessages';
import Popover from '@mui/material/Popover';
import TuneIcon from '@mui/icons-material/Tune';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import TextField from '@mui/material/TextField';
import Swal from 'sweetalert2';
import {
  UPDATE_TYPE,
  CREATE_TYPE,
  DELETE_TYPE,
} from '../../../shared/constants/Constantes';
import { Form, Formik } from 'formik';
import AppMessageView from '@crema/components/AppMessageView';
import { useDebounce } from '../../../@crema/hooks/useDebounce';
import MyCell from '../../../shared/components/MyCell';
import moment from 'moment';
import HelpButton from '../../../shared/components/HelpButton';
import parse from 'html-react-parser';
import { TIPO_DOCUMENTO, TIPO_CUENTA, DATO_BOOLEAN , TIPOS_VALOR, ESTADOS_PLAN_DETALLADO_INVERSIONES} from '../../../shared/constants/ListaValores';
import { formatCurrency, formatCurrencyDecimal } from '../../../shared/hooks/formatCurrency';
import { useParams, useNavigate } from 'react-router-dom'; 

const cells = [
  {
    id: 'codigo_proyecto',
    typeHead: 'string',
    label: 'Codigo proyecto',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'fecha_vencimiento',
    typeHead: 'string',
    label: 'Fecha <br> vencimiento',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'tipo_concepto',
    typeHead: 'string',
    label: 'Tipo <br> concepto',
    value: (value) =>  TIPOS_VALOR.map((estado) => estado.id === value ? estado.nombre : ''),
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'valor_concepto',
    typeHead: 'numeric',
    label: 'Valor <br> concepto',
    value: (value) =>  value != null ? formatCurrency(value) : 0, 
    align: 'right',
    mostrarInicio: true,
  },
  {
    id: 'valor_ret_fuente',
    typeHead: 'numeric',
    label: 'Valor <br>retención Fte',
    value: (value) =>  value != null ? formatCurrency(value) : 0, 
    align: 'right',
    mostrarInicio: true,
  },
  {
    id: 'porcentaje_ret_fuente',
    typeHead: 'numeric',
    label: 'Porcentaje <br>retención fte',
    value: (value) => value != null ? formatCurrencyDecimal(value) + '%' : '0%',    
    align: 'right',
    mostrarInicio: true,
  },
  {
    id: 'valor_calculado',
    typeHead: 'numeric',
    label: 'Valor a<br> pagar',
    value: (value) =>  value != null ? formatCurrency(value) : 0, 
    align: 'right',
    mostrarInicio: true,
  },
  {
    id: 'estado_plan',
    typeHead: 'string',
    label: 'Estado',
    value: (value) => ESTADOS_PLAN_DETALLADO_INVERSIONES.map((estado) => estado.id === value ? estado.nombre : ''),
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.primary,  
    whiteSpace: 'normal', 
    lineHeight: '1.2', 
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
                  {parse(cell.label)}
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
    gridTemplateColumns: '2fr 4fr 4fr 4fr',
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
    queryFilter,
    nombreFiltro,
    estadoFiltro,
    fechaHastaFiltro,
    fechaDesdeFiltro,
    limpiarFiltros,
    permisos,
    url,
    theme,
    rows,
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
            </Box>
          </Box>
          <Box className={classes.contenedorFiltros}> 
             <TextField
                label='Inversion'
                name='inversionFiltro'
                id='inversionFiltro'
                onChange={queryFilter}
                value={rows[0]?.id_inversion}
                className={classes.inputFiltros}
                disabled={true}
                variant='standard'
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  disableUnderline: true, // Deshabilita la línea predeterminada
                  sx: {
                    borderBottom: '1px solid '+theme.palette.primary.main, // Línea siempre visible y gruesa
                    '&:hover:not(.Mui-disabled):before': {
                      borderBottom: '2px solid ' +theme.palette.primary.main, // Línea visible al pasar el ratón
                    },
                  },
                }}
              />         
              <TextField
                label='Inversionista'
                name='nombreFiltro'
                id='nombreFiltro'
                onChange={queryFilter}
                value={rows[0]?.inversionista}
                className={classes.inputFiltros}
                disabled={true}
                variant='standard'
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  disableUnderline: true, // Deshabilita la línea predeterminada
                  sx: {
                    borderBottom: '1px solid '+theme.palette.primary.main, // Línea siempre visible y gruesa
                    '&:hover:not(.Mui-disabled):before': {
                      borderBottom: '2px solid ' +theme.palette.primary.main, // Línea visible al pasar el ratón
                    },
                  },
                }}
              />
              <TextField
                label='Fecha Inversión'
                name='estadoFiltro'
                id='estadoFiltro'
                type='date'
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={queryFilter}
                value={rows[0]?.fecha_inversion}
                className={classes.inputFiltros}
                variant='standard'
                disabled={true}
                InputProps={{
                  disableUnderline: true, // Deshabilita la línea predeterminada
                  sx: {
                    borderBottom: '1px solid '+theme.palette.primary.main, // Línea siempre visible y gruesa
                    '&:hover:not(.Mui-disabled):before': {
                      borderBottom: '2px solid ' +theme.palette.primary.main, // Línea visible al pasar el ratón
                    },
                  },
                }}
              />
            <TextField
              label='Valor inversion:'
              name='fechaHastaFiltro'
              id='fechaHastaFiltro'
              disabled={true}
              onChange={queryFilter}
              value={formatCurrency(rows[0]?.valor_inversion)}
              className={classes.inputFiltros}
              variant='standard'
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
  handleOpenPopoverColumns: PropTypes.func.isRequired,
  queryFilter: PropTypes.func.isRequired,
  limpiarFiltros: PropTypes.func.isRequired,
  inversionFiltro: PropTypes.string.isRequired,
  nombreFiltro: PropTypes.string.isRequired,
  estadoFiltro: PropTypes.string.isRequired,
  fechaHastaFiltro: PropTypes.string.isRequired,
  fechaDesdeFiltro: PropTypes.string.isRequired,
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

const Inversion = (props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { inversion_id } = useParams();
  const id_proyecto = '';
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
  const [InversionSeleccionado, setInversionSeleccionado] = useState(0);
  const { rows, desde, hasta, ultima_pagina, total } = useSelector((state) => state.planDetallado);
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
        updateColeccion();
      }
    }
  }, [message, error]); 

  const textoPaginacion = `Mostrando de ${desde} a ${hasta} de ${total} resultados - Página ${page} de ${ultima_pagina}`;
  const [inversionFiltro, setInversionFiltro] = useState('');
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [fechaHastaFiltro, setFechaHastaFiltro] = useState('');
  const [fechaDesdeFiltro, setFechaDesdeFiltro] = useState('');
  const debouncedName = useDebounce(nombreFiltro, 800);
  const debouncedEstado = useDebounce(estadoFiltro, 800);
  const debouncedInitialDate = useDebounce(fechaHastaFiltro, 800);
  const debouncedFinalDate = useDebounce(fechaDesdeFiltro, 800);
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
          if (opcion.url === '/inversiones') {
            setTitulo(`${opcion.nombre} - Plan detallado `);
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
    dispatch(onGetColeccion({page, rowsPerPage, inversion_id, id_proyecto, nombreFiltro, estadoFiltro, fechaDesdeFiltro, fechaHastaFiltro, orderByToSend}));
  }, [dispatch, page, rowsPerPage, inversion_id, id_proyecto, debouncedName, debouncedEstado, debouncedFinalDate, debouncedInitialDate, orderByToSend, showForm]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateColeccion = () => {
    setPage(1);
    dispatch(onGetColeccion({page, rowsPerPage, inversion_id, id_proyecto, nombreFiltro, estadoFiltro, fechaDesdeFiltro, fechaHastaFiltro, orderByToSend}));
  };
  useEffect(() => {
    setPage(1);
  }, [debouncedName, debouncedEstado, debouncedInitialDate, debouncedFinalDate, orderByToSend]);

  const queryFilter = (e) => {
    switch (e.target.name) {
      case 'nombreFiltro':
        setNombreFiltro(e.target.value);
        break;
      case 'inversionFiltro':
        setInversionFiltro(e.target.value);
        break;
      case 'estadoFiltro':
        setEstadoFiltro(e.target.value);
        break;
      case 'fechaDesdeFiltro':
        setFechaDesdeFiltro(e.target.value);
        break;
      case 'fechaHastaFiltro':
        setFechaHastaFiltro(e.target.value);
        break;
      default:
        break;
    }
  };

  const limpiarFiltros = () => {
    setInversionFiltro('');
    setNombreFiltro('');
    setEstadoFiltro('');
    setFechaDesdeFiltro('');
    setFechaHastaFiltro('');
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

  const onOpenEditInversion = (id) => {
    setInversionSeleccionado(id);
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

  const onOpenViewInversion = (id) => {
    setInversionSeleccionado(id);
    setAccion('ver');
    setShowForm(true);
  };

  const onDeleteInversion = (id) => {
    Swal.fire({
      title: 'Confirmar',
      text: '¿Seguro Que Desea Eliminar el inversion?',
      allowEscapeKey: false,
      allowEnterKey: false,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'NO',
      confirmButtonText: 'SI',
      background: theme.palette.background.default,
      color:theme.palette.text.primary,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(onDelete({id, updateColeccion}));
      }
    });
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

  const onGoBack = () => { 
		navigate('/inversiones');
	}
  

  
  return (
    <div className={classes.root}>
      <Paper sx={{marginBottom: theme.spacing(2),}} className={classes.paper}>
        {permisos && (
          <EnhancedTableToolbar
            numSelected={selected.length}
            handleOpenPopoverColumns={handleOpenPopoverColumns}
            queryFilter={queryFilter}
            limpiarFiltros={limpiarFiltros}
            inversionFiltro={inversionFiltro}
            nombreFiltro={nombreFiltro}
            estadoFiltro={estadoFiltro}
            fechaHastaFiltro={fechaHastaFiltro}
            fechaDesdeFiltro={fechaDesdeFiltro}       
            permisos={permisos}
            titulo={titulo}
            url={hUrl}
            theme={theme}
            rows={rows}
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
                        key={row.id}
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
                                value={columna.value(row[columna.id])}
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

Inversion.propTypes = {
  route: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }),
  permisos: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
};

export default Inversion;
