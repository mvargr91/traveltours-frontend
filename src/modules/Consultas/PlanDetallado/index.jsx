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
import ExcelIcon from '@mui/icons-material/FileCopy'; 
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MenuItem from '@mui/material/MenuItem';
import {onGetColeccionPlan as onGetColeccion , onDelete} from '../../../@crema/redux/features/planDetallado/planDetalladoSlice';
import {onGetColeccionLigera as onGetInversionistas} from '../../../@crema/redux/features/inversionista/inversionistasSlice';
import {onGetColeccionLigeraDisponible as onGetProyectos} from '../../../@crema/redux/features/Proyecto/proyectosSlice';
import { useDispatch, useSelector } from 'react-redux';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IntlMessages from '../../../@crema/helpers/IntlMessages';
import Popover from '@mui/material/Popover';
import TuneIcon from '@mui/icons-material/Tune';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import PaymentsIcon from '@mui/icons-material/Payments';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddTaskIcon from '@mui/icons-material/AddTask';
import TextField from '@mui/material/TextField';
import {
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import Swal from 'sweetalert2';
import {
  UPDATE_TYPE,
  CREATE_TYPE,
  DELETE_TYPE,
} from '../../../shared/constants/Constantes';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Form, Formik } from 'formik';
import MyAutocomplete from '../../../shared/components/MyAutoComplete';
import AppMessageView from '@crema/components/AppMessageView';
import { useDebounce } from '../../../@crema/hooks/useDebounce';
import MyCell from '../../../shared/components/MyCell';
import moment from 'moment';
import HelpButton from '../../../shared/components/HelpButton';
import parse from 'html-react-parser';
import { useNavigate ,useLocation} from 'react-router-dom';
import { ESTADOS_PLAN_DETALLADO_INVERSIONES, TIPOS_VALOR  } from '../../../shared/constants/ListaValores';
import { formatCurrency } from '../../../shared/hooks/formatCurrency';
import ProyectoCreador from '../../Proyectos/Proyecto/ProyectoCreador';
import MUIAutocomplete from '../../../shared/components/MUIAutocomplete';
import defaultConfig from '@crema/constants/defaultConfig';


const cells = [
  {
    id: 'inversionista_gestor',
    typeHead: 'string',
    label: 'Inversionista/Gestor',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
    {
    id: 'id_inversion',
    typeHead: 'numeric',
    label: 'Inversión',
    value: (value) => value,
    align: 'right',
    mostrarInicio: true,
  },
  {
    id: 'codigo_proyecto',
    typeHead: 'string',
    label: 'Proyecto',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'fecha_vencimiento',
    typeHead: 'string',
    label: 'Fecha vcmto.',
    value: (value) => value,
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'tipo_concepto',
    typeHead: 'string',
    label: 'Tipo',
    value: (value) => TIPOS_VALOR.map((estado) => estado.id === value ? estado.nombre : ''),
    align: 'left',
    mostrarInicio: true,
  },
  {
    id: 'valor_concepto',
    typeHead: 'numeric',
    label: 'Valor',
    value: (value) => formatCurrency(value),
    align: 'right',
    mostrarInicio: true,
  },
  {
    id: 'valor_ret_fuente',
    typeHead: 'numeric',
    label: 'Ret. fuente',
    value: (value) => formatCurrency(value),
    align: 'right',
    mostrarInicio: true,
  },
  {
    id: 'valor_calculado',
    typeHead: 'numeric',
    label: 'Valor a pagar',
    value: (value) => formatCurrency(value),
    align: 'right',
    mostrarInicio: true,
  },
  {
    id: 'fecha_pago',
    typeHead: 'string',
    label: 'Fecha pago',
    value: (value) => value,
    align: 'left',
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
  contenedorFiltrosFechas: {
    width: '85%',
    display: 'grid',
    gridTemplateColumns: '4fr 4fr 4fr 4fr 1fr',
    gap: '20px',
    '@media (max-width: 600px)': { // Cambia a una columna en pantallas móviles
      gridTemplateColumns: '1fr',
    },
    paddingTop: 20
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
    setIdInversionista,
    idInversionista ,
    setIdProyecto,
    idProyecto ,
    estadoFiltro,
    tipoFiltro,
    inversionistas,
    proyectos,
    queryFilter,
    fechaHastaFiltro,
    fechaDesdeFiltro,
    fechaPagoHastaFiltro,
    fechaPagoDesdeFiltro,
    formatFechaInput,
    fechaError,
    mensajeFechaError,
    fechaPagoError,
    mensajeFechaPagoError,
    limpiarFiltros,
    permisos,
    url,
    theme,
    realizarBusqueda,
    mostrarResultados,
  } = props;

  const filtros = {
    id_proyecto: idProyecto,
    id_inversionista: idInversionista,
    tipo: estadoFiltro,
    estado: tipoFiltro,
    fechaDesde: fechaDesdeFiltro,
    fechaHasta: fechaHastaFiltro,
    fechaPagoDesde: fechaPagoDesdeFiltro,
    fechaPagoHasta: fechaPagoHastaFiltro,
  };

  const queryParams = Object.entries(filtros)
    .filter(([_, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const urlExportacion = `${defaultConfig.API_URL}/exportar-plan-detallado` + (queryParams ? `?${queryParams}` : '');
  
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
            <Typography
              className={classes.title}
              variant='h2'
              id='tableTitle'
              component='div'
            >
              {titulo}
            </Typography>
            <Box className={classes.horizontalBottoms}>
              { 
              mostrarResultados && (                
                  <Formik>
                    <Form>                
                      {permisos?.indexOf('Exportar') >= 0 && (
                        <Tooltip
                          title='Exportar'
                          component='a'
                          className={classes.linkDocumento}
                          href={urlExportacion}>
                        <IconButton
                            sx={{
                              backgroundColor: theme.palette.colorFiltro,
                              color: 'white',
                              boxShadow:
                                '0px 3px 5px -1px rgb(0 0 0 / 30%), 0px 6px 10px 0px rgb(0 0 0 / 20%), 0px 1px 18px 0px rgb(0 0 0 / 16%)',
                              '&:hover': {
                                backgroundColor: theme.palette.colorHovers,
                                cursor: 'pointer',
                              },
                              padding: '13px',}}
                            aria-label='filter list'>
                            <Box component='span' 
                            sx={{
                              position: 'absolute',
                              color: theme.palette.colorFiltro,
                              '&:hover': {
                                color: theme.palette.colorHovers,
                                cursor: 'pointer',
                              },
                              fontSize: '14px',
                              top: '19px',
                              fontWeight: 'bold',
                            }}>
                              X
                            </Box>
                            <ExcelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Form>
                  </Formik>
                )
              }
                            
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
            <MUIAutocomplete
              label="Identificación Proyecto"
              options={proyectos}
              value={proyectos.find((i) => i.id === idProyecto) || null}
              onChange={(_, option) => setIdProyecto(option?.id ?? null)}
              getOptionLabel={(opt) => opt?.codigo_proyecto || ''}
            />  
            <MUIAutocomplete
              label="Inversionista"
              options={inversionistas}
              value={inversionistas.find((i) => i.id === idInversionista) || null}
              onChange={(_, option) => setIdInversionista(option?.id ?? null)}
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
          <Box className={classes.contenedorFiltros}>         
            <TextField
              label='Tipo concepto'
              name='estadoFiltro'
              id='estadoFiltro'
              select
              fullWidth
              variant='standard'
              onChange={queryFilter}
              value={estadoFiltro}
              SelectProps={{
                IconComponent: ArrowDropDownIcon,
                native: false,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      maxHeight: 250,
                    },
                  },
                },
              }}              
              InputProps={{
                inputComponent: Input,
                disableUnderline: false,
              }}
              sx={{
                '& .MuiInput-underline:before': {
                  borderBottomColor: '#ccc',
                },
                '& .MuiInput-underline:hover:before': {
                  borderBottomColor: theme.palette.text.primary,
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: theme.palette.text.primary,
                },
                '& .MuiSelect-icon': {
                    color: theme.palette.text.primary,
                  },
              }}
            >
              {TIPOS_VALOR.map((estado) => (
                <MenuItem key={estado.id} value={estado.id}>
                  {estado.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label='Estado Plan'
              name='tipoFiltro'
              id='tipoFiltro'
              select
              fullWidth
              variant='standard'
              onChange={queryFilter}
              value={tipoFiltro}
              SelectProps={{
                IconComponent: ArrowDropDownIcon,
                native: false,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      maxHeight: 250,
                    },
                  },
                },
              }}              
              InputProps={{
                inputComponent: Input,
                disableUnderline: false,
              }}
              sx={{
                '& .MuiInput-underline:before': {
                  borderBottomColor: '#ccc',
                },
                '& .MuiInput-underline:hover:before': {
                  borderBottomColor: theme.palette.text.primary,
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: theme.palette.text.primary,
                },
                '& .MuiSelect-icon': {
                    color: theme.palette.text.primary,
                  },
              }}
            >
              {ESTADOS_PLAN_DETALLADO_INVERSIONES.map((estado) => (
                <MenuItem key={estado.id} value={estado.id}>
                  {estado.nombre}
                </MenuItem>
              ))}
            </TextField>
            <Box display='grid'>
              <Box display='flex' mb={2}>
                <Tooltip title='Buscar Filtros' onClick={realizarBusqueda}>
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
                     aria-label='buscar'
                  >
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
          <Box className={classes.contenedorFiltrosFechas}>   
            <TextField
              label='Fecha vcmto desde'
              name='fechaDesdeFiltro'
              id='fechaDesdeFiltro'
              onChange={queryFilter}
              type='date'
              InputLabelProps={{
                shrink: true,
              }}
              value={formatFechaInput(fechaDesdeFiltro)}
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
            <TextField
              label='Fecha vcmto hasta'
              name='fechaHastaFiltro'
              id='fechaHastaFiltro'
              type='date'
              InputLabelProps={{
                shrink: true,
              }}
              error={fechaError}
              helperText={fechaError ? mensajeFechaError : ''}
              onChange={queryFilter}
              value={formatFechaInput(fechaHastaFiltro)}
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
            <TextField
              label='Fecha pago desde'
              name='fechaPagoDesdeFiltro'
              id='fechaPagoDesdeFiltro'
              onChange={queryFilter}
              type='date'
              InputLabelProps={{
                shrink: true,
              }}
              value={formatFechaInput(fechaPagoDesdeFiltro)}
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
            <TextField
              label='Fecha pago hasta'
              name='fechaPagoHastaFiltro'
              id='fechaPagoHastaFiltro'
              type='date'
              InputLabelProps={{
                shrink: true,
              }}
              error={fechaPagoError}
              helperText={fechaPagoError ? mensajeFechaPagoError : ''}
              onChange={queryFilter}
              value={formatFechaInput(fechaPagoHastaFiltro)}
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
          <Box></Box>
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
  nombreFiltro: PropTypes.string.isRequired,
  estadoFiltro: PropTypes.string.isRequired,
  tipoFiltro: PropTypes.string.isRequired,
  fechaHastaFiltro: PropTypes.string.isRequired,
  fechaPagoDesdeFiltro: PropTypes.string.isRequired,
  fechaPagoHastaFiltro: PropTypes.string.isRequired,
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
  const location = useLocation();
  const [locationState, setLocationState] = useState(location.state);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('');
  const [orderByToSend, setOrderByToSend] = React.useState(
    '',
  );
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(1);
  // const [dense, setDense] = React.useState(false);
  const dense = true; //Borrar cuando se use el change
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const rowsPerPageOptions = [5, 10, 15, 25, 50];
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [showProyecto, setShowProyecto] = useState(false);
  const [accion, setAccion] = useState('ver');
  const { rows, desde, hasta, ultima_pagina, total } = useSelector((state) => state.planDetallado);
  const { coleccionLigera: inversionistas } = useSelector((state) => state.inversionistas);
  const { coleccionLigera: proyectos } = useSelector((state) => state.proyectos);
  const { message, error, messageType } = useSelector(({ common }) => common);
  const [idInversionista,   setIdInversionista]   = useState(null);
  const [idProyecto,   setIdProyecto]   = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [fechaError, setFechaError] = useState(false);
  const [mensajeFechaError, setMensajeFechaError] = useState('');
  const [fechaPagoError, setFechaPagoError] = useState(false);
  const [mensajeFechaPagoError, setMensajeFechaPagoError] = useState('');
  const [filtrosDesdeDetalle, setFiltrosDesdeDetalle] = useState(false);
  const [stateHandled, setStateHandled] = useState(false);
  const textoPaginacion = `Mostrando de ${desde} a ${hasta} de ${total} resultados - Página ${page} de ${ultima_pagina}`;
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [proyectoFiltro, setProyectoFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [fechaHastaFiltro, setFechaHastaFiltro] = useState('');
  const [fechaDesdeFiltro, setFechaDesdeFiltro] = useState('');
  const [fechaPagoHastaFiltro, setFechaPagoHastaFiltro] = useState('');
  const [fechaPagoDesdeFiltro, setFechaPagoDesdeFiltro] = useState('');
  const debouncedName = useDebounce(nombreFiltro, 800);
  const debouncedEstado = useDebounce(estadoFiltro, 800);
  const debouncedTipo = useDebounce(tipoFiltro, 800);
  const debouncedInitialDate = useDebounce(fechaHastaFiltro, 800);
  const debouncedFinalDate = useDebounce(fechaDesdeFiltro, 800);
  const debouncedInitialDatePago = useDebounce(fechaPagoHastaFiltro, 800);
  const debouncedFinalDatePago = useDebounce(fechaPagoDesdeFiltro, 800);
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
  const STORAGE_KEY = 'filtros_inversion_plan';

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
    if (mostrarResultados) {
      dispatch(
        onGetColeccion({
          page,
          rowsPerPage,
          idInversionista,
          idProyecto,
          estadoFiltro,
          tipoFiltro,
          fechaDesdeFiltro,
          fechaHastaFiltro,
          fechaPagoDesdeFiltro,
          fechaPagoHastaFiltro,
          orderByToSend,
        })
      );
    }
  }, [dispatch, 
  page, 
  rowsPerPage, 
  debouncedName, 
  debouncedEstado, 
  debouncedTipo, 
  idInversionista, 
  idProyecto, 
  estadoFiltro, 
  tipoFiltro, 
  debouncedFinalDate, 
  debouncedInitialDate, 
  debouncedFinalDatePago, 
  debouncedInitialDatePago, 
  orderByToSend, 
  mostrarResultados]);
  
  useEffect(() => {
    dispatch(onGetInversionistas());
    dispatch(onGetProyectos());
  }, [dispatch, page, rowsPerPage, debouncedName, debouncedEstado, debouncedTipo, idInversionista, idProyecto, estadoFiltro, tipoFiltro, debouncedFinalDate, debouncedInitialDate, debouncedFinalDatePago, debouncedInitialDatePago, orderByToSend]); // eslint-disable-line react-hooks/exhaustive-deps

  const queryFilter = (e) => {
    const { name, value } = e.target;

    // Temporalmente actualiza el valor
    if (name === 'fechaDesdeFiltro') {
      setFechaDesdeFiltro(value);
  
      // Validar si ya hay una fechaHasta
      if (fechaHastaFiltro && value > fechaHastaFiltro) {
        setFechaError(true);
        setMensajeFechaError('Fecha Desde no puede ser mayor que Fecha Hasta');
      } else {
        setFechaError(false);
        setMensajeFechaError('');
      }
    }
  
    if (name === 'fechaHastaFiltro') {
      setFechaHastaFiltro(value);
  
      // Validar contra fechaDesde
      if (fechaDesdeFiltro && fechaDesdeFiltro > value) {
        setFechaError(true);
        setMensajeFechaError('Fecha Hasta no puede ser menor que Fecha Desde');
      } else {
        setFechaError(false);
        setMensajeFechaError('');
      }
    }

        // Temporalmente actualiza el valor
    if (name === 'fechaPagoDesdeFiltro') {
      setFechaPagoDesdeFiltro(value);
  
      // Validar si ya hay una fechaHasta
      if (fechaPagoHastaFiltro && value > fechaPagoHastaFiltro) {
        setFechaPagoError(true);
        setMensajeFechaPagoError('Fecha Pago Desde no puede ser mayor que Fecha Pago Hasta');
      } else {
        setFechaPagoError(false);
        setMensajeFechaPagoError('');
      }
    }
  
    if (name === 'fechaPagoHastaFiltro') {
      setFechaPagoHastaFiltro(value);
  
      // Validar contra fechaDesde
      if (fechaPagoDesdeFiltro && fechaPagoDesdeFiltro > value) {
        setFechaPagoError(true);
        setMensajeFechaPagoError('Fecha Pago Hasta no puede ser menor que Fecha Pago Desde');
      } else {
        setFechaPagoError(false);
        setMensajeFechaPagoError('');
      }
    }
    
    if (name === 'nombreFiltro') {
      setNombreFiltro(value);
    }
  
    if (name === 'proyectoFiltro') {
      setProyectoFiltro(value);
    }

    if (name === 'estadoFiltro') {
      setEstadoFiltro(value);
    }

    if (name === 'tipoFiltro') {
      setTipoFiltro(value);
    }


  };
  
  const limpiarFiltros = () => {
    setNombreFiltro('');
    setProyectoFiltro('');
    setIdInversionista('');
    setIdProyecto('');
    setEstadoFiltro('');
    setTipoFiltro('');
    setFechaDesdeFiltro('');
    setFechaHastaFiltro('');
    setFechaPagoDesdeFiltro('');
    setFechaPagoHastaFiltro('');
    setFechaPagoError(false);
    setMensajeFechaPagoError('');
    setFechaError(false);
    setMensajeFechaError('');
    setMostrarResultados(false);
    setShowTable(false);

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



 const realizarBusqueda = () => {
    const hayFiltro = idProyecto || idInversionista || estadoFiltro || tipoFiltro || fechaDesdeFiltro || fechaPagoDesdeFiltro;

    if (!hayFiltro) {
      Swal.fire({
        title: 'Filtros requeridos',
        text: 'Debe especificar al menos un criterio de búsqueda.',
        allowEscapeKey: false,
        allowEnterKey: false,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'NO',
        confirmButtonText: 'SI',
        background: theme.palette.background.default,
        color:theme.palette.text.primary,
      });
      return;
    }

    setMostrarResultados(true);
    setPage(1);
    dispatch(
      onGetColeccion({
        page: 1,
        rowsPerPage,
        idInversionista,
        idProyecto,
        estadoFiltro,
        tipoFiltro,
        fechaDesdeFiltro,
        fechaHastaFiltro,
        fechaPagoDesdeFiltro,
        fechaPagoHastaFiltro,
        orderByToSend,
      })
    );
  };

  useEffect(() => {
    if (!stateHandled && locationState) {
      setFiltrosDesdeDetalle(locationState);
      setStateHandled(true);
    }
  }, [locationState, stateHandled, navigate, location.pathname]);

  useEffect(() => {
    if (filtrosDesdeDetalle) {
      setIdInversionista(filtrosDesdeDetalle.idInversionista || '');
      setEstadoFiltro(filtrosDesdeDetalle.estadoFiltro || '');
      setTipoFiltro(filtrosDesdeDetalle.tipoFiltro || '');
      setFechaDesdeFiltro(filtrosDesdeDetalle.fechaDesdeFiltro);
      setFechaHastaFiltro(filtrosDesdeDetalle.fechaHastaFiltro);
      setFechaPagoDesdeFiltro(filtrosDesdeDetalle.fechaPagoDesdeFiltro);
      setFechaPagoHastaFiltro(filtrosDesdeDetalle.fechaPagoHastaFiltro);
      setMostrarResultados(true);
    }
  }, [filtrosDesdeDetalle]);
  
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

  const [showTable, setShowTable] = useState(false);
  useEffect(() => {
    if (rows.length === 0) {
      setShowTable(false);
    } else {
      setShowTable(true);
    }
  }, [rows]);

  const formatFechaInput = (fecha) => {
    if (!fecha) return '';
    if (fecha.includes('/')) {
      const [day, month, year] = fecha.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  
    const date = new Date(fecha);
    if (!isNaN(date)) {
      return date.toISOString().slice(0, 10);
    }
  
    return '';
  };

  const handleOnCloseProyecto = () => {
    setShowProyecto(false);
    setProyectoSeleccionado(null);
  };

  const onOpenViewInversion = (id) => {
    navigate(`/consulta-plan-detallado/ver/${id}`, {state: {
      idInversionista,
      idProyecto,
      estadoFiltro,
      tipoFiltro,
      fechaDesdeFiltro,
      fechaHastaFiltro,
      fechaPagoDesdeFiltro,
      fechaPagoHastaFiltro,
    }});
  };

  useEffect(() => {
    limpiarFiltros();
  }, []);
  
  return (
    <div className={classes.root}>
      <Paper sx={{marginBottom: theme.spacing(2),}} className={classes.paper}>
        {permisos && (
          <EnhancedTableToolbar
            numSelected={selected.length}
            handleOpenPopoverColumns={handleOpenPopoverColumns}
            queryFilter={queryFilter}
            inversionistas={inversionistas}
            proyectos={proyectos}
            limpiarFiltros={limpiarFiltros}
            setIdInversionista={setIdInversionista}
            idInversionista={idInversionista}
            setIdProyecto={setIdProyecto}
            idProyecto={idProyecto}
            estadoFiltro={estadoFiltro}
            tipoFiltro={tipoFiltro}
            nombreFiltro={nombreFiltro}
            setNombreFiltro={setNombreFiltro}
            proyectoFiltro={proyectoFiltro}
            setProyectoFiltro={setProyectoFiltro}
            fechaHastaFiltro={fechaHastaFiltro}
            fechaDesdeFiltro={fechaDesdeFiltro} 
            fechaPagoHastaFiltro={fechaPagoHastaFiltro}
            fechaPagoDesdeFiltro={fechaPagoDesdeFiltro} 
            formatFechaInput={formatFechaInput}   
            fechaError={fechaError}
            mensajeFechaError={mensajeFechaError}
            fechaPagoError={fechaPagoError}
            mensajeFechaPagoError={mensajeFechaPagoError}
            permisos={permisos}
            titulo={titulo}
            url={hUrl}
            theme={theme}
            realizarBusqueda={realizarBusqueda}
            mostrarResultados={mostrarResultados}
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
                        <StyledTableCell align='center' className={classes.acciones}>
                          {permisos.indexOf('Listar') >= 0 && (
                            <Tooltip title={<IntlMessages id='boton.ver' />}>
                              <VisibilityIcon
                                onClick={() => onOpenViewInversion(row.id)}
                                sx={{'&:hover': {
                                  color: theme.palette.colorHovers,
                                  cursor: 'pointer',
                                },
                                color: theme.palette.grayBottoms,}}
                              ></VisibilityIcon>
                            </Tooltip>
                          )}   
                        </StyledTableCell>
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
      {/* Modal proyecto */}
      {showProyecto && (
        <ProyectoCreador
          showForm={showProyecto}
          Proyecto={proyectoSeleccionado}
          accion={accion}
          handleOnClose={handleOnCloseProyecto}
        />
      )}
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
