// ===============================
// SimulacionPorProyectoForm.jsx (COMPLETO)
// REQUIERE: npm i recharts
// - Selector de tipo de gráfica funcional
// - Botón activo con color
// ===============================
import React, { useEffect, useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Input, Typography } from '@mui/material';
import { Form, useFormikContext } from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import AppScrollbar from '@crema/components/AppScrollbar';
import { useDispatch } from 'react-redux';
import { ArrowBackIos } from '@mui/icons-material';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Fonts } from '../../../../shared/constants/AppEnums';
import MyTextField from '../../../../shared/components/MyTextField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import MyDateField from '../../../../shared/components/MyDateField';
import MyCurrencyFieldPotencia from '../../../../shared/components/MyCurrencyFieldPotencia';
import MyCurrencyFieldMoneda from '../../../../shared/components/MyCurrencyFieldMoneda';
import TablaDetalleConceptos from '../TablaDetalleConceptos';
import { onGetColeccionLigera as onGetEtapasProyectos } from '../../../../@crema/redux/features/etapaProyecto/etapaProyectoSlice';
import BarChartIcon from '@mui/icons-material/BarChart';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import HorizontalSplitIcon from '@mui/icons-material/HorizontalSplit';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import { MODELO_COMERCIALIZACION_ENERGIA, DATO_BOOLEAN } from '../../../../shared/constants/ListaValores';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as TooltipRecharts,
   Cell,
} from 'recharts';


// =============================================================

const useStyles = makeStyles(() => ({
  bottomsGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: '20px',
    gap: '10px',
    paddingRight: '20px',
    position: 'sticky',
    left: 0,
    bottom: 0,
  },
  myTextField: {
    width: '100%',
    marginBottom: 5,
    height: '60px',
  },
}));

// =============================================================
// GRAFICAS
// =============================================================

const CHART_TYPES = {
  BAR_VERTICAL: 'BAR_VERTICAL',
  BAR_HORIZONTAL: 'BAR_HORIZONTAL',
  LINE: 'LINE',
  AREA: 'AREA',
};

const formatCOP = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return '';
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(num);
};

const buildSerieCajaLibreAcum = (detalle) => {
  if (!detalle || typeof detalle !== 'object') return [];
  const years = Array.isArray(detalle.years) ? detalle.years : [];
  const rows = Array.isArray(detalle.rows) ? detalle.rows : [];

  const rowCajaAcum =
    rows.find((r) => Number(r?.id_concepto_proyecto) === 55) ||
    rows.find((r) =>
      String(r?.concepto || '').toLowerCase().includes('flujo caja libre acumulado')
    );

  const valores = rowCajaAcum?.valores_por_anio || {};
  if (!rowCajaAcum || !years.length) return [];

  return years.map((y) => ({
    anio: String(y),
    valor: Number(valores?.[String(y)] ?? 0),
  }));
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid #ddd', p: 1, borderRadius: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        Año: {label}
      </Typography>
      <Typography variant="body2">Valor: {formatCOP(v)}</Typography>
    </Box>
  );
};

// =============================================================
// BOTONES GRAFICA
// =============================================================

const ChartToggleGroup = ({ value, onChange }) => {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_e, val) => val && onChange(val)}
      size="small"
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 0.25,
        '& .MuiToggleButton-root': {
          border: 'none',
          borderRadius: 1.5,
          mx: 0.25,
          px: 1,
          py: 0.5,
          color: 'text.secondary',
        },
        '& .MuiToggleButton-root.Mui-selected': {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': { bgcolor: 'primary.dark' },
        },
      }}
    >
      <Tooltip title="Barras verticales">
        <ToggleButton value={CHART_TYPES.BAR_VERTICAL}>
          <BarChartIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>

      <Tooltip title="Barras horizontales">
        <ToggleButton value={CHART_TYPES.BAR_HORIZONTAL}>
          <HorizontalSplitIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>

      <Tooltip title="Línea">
        <ToggleButton value={CHART_TYPES.LINE}>
          <ShowChartIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>

      <Tooltip title="Área">
        <ToggleButton value={CHART_TYPES.AREA}>
          <WaterfallChartIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

const SimulacionPorInversionistaForm = (props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formik = useFormikContext();
  if (!formik) return null;
  const { setFieldValue, values: formikValues } = formik;
  const {
    handleOnClose,
    accion,
    initialValues,
    titulo,
    values,
    proyectos,
    selectedRow,
    savePayload,
    parametroConstantes,
  } = props;

  const [disabled, setDisabled] = useState(false);
  const [proyectoId, setProyectoId] = useState(false);
  const [Id, setId] = useState(false);

  // ============================================
  // GRAFICOS
  // ===========================================

  const [chartType, setChartType] = useState(CHART_TYPES.AREA);

  const detalleRaw = selectedRow?.detalle_conceptos ?? null;
  const dataCajaLibreAcum = useMemo(() => buildSerieCajaLibreAcum(detalleRaw), [detalleRaw]);

  const onChangeChartType = (_e, next) => {
    if (next) setChartType(next);
  };

  // ============================================
  // CONCEPTOS BD EN REF
  // ============================================
  const conceptosDBRef = useRef([]);
  const simIdRef = useRef(null);


  useEffect(() => {
    const simId = selectedRow?.simulacion?.id ?? null;
    if (simIdRef.current === simId) return;

    simIdRef.current = simId;
    conceptosDBRef.current = Array.isArray(selectedRow?.conceptos) ? selectedRow.conceptos : [];
  }, [selectedRow?.simulacion?.id, selectedRow?.conceptos]);

  useEffect(() => {
    setProyectoId(selectedRow?.id_proyecto);
    setId(selectedRow?.id);
  }, [selectedRow?.id_proyecto]);

  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') setDisabled(true);
  }, [initialValues.estado, accion]);

  useEffect(() => {
    if (values.id_tipo_proyecto) {
      dispatch(onGetEtapasProyectos({ id_tipo_proyecto: values.id_tipo_proyecto }));
    }
  }, [dispatch, values.id_tipo_proyecto]);



  // ============================================
  // CONCEPTOS
  // ============================================

  const detalleConceptos = useMemo(() => {
    
    const fromSelected =
      selectedRow?.simulacion_detalle?.detalle_conceptos ||
      selectedRow?.simulacion?.detalle_conceptos ||
      selectedRow?.detalle_conceptos;

    return fromSelected || null;
  }, [savePayload, selectedRow]);


  const classes = useStyles(props);
  const hasData = dataCajaLibreAcum.length > 0;

  // Separar positivos y negativos para Line y Area
  const dataSeparada = useMemo(() => {
    if (!dataCajaLibreAcum.length) return [];

    const resultado = [];

    for (let i = 0; i < dataCajaLibreAcum.length; i++) {
      const actual = dataCajaLibreAcum[i];
      const siguiente = dataCajaLibreAcum[i + 1];

      const valorActual = Number(actual.valor ?? 0);

      resultado.push({
        ...actual,
        positivo: valorActual >= 0 ? valorActual : null,
        negativo: valorActual < 0 ? valorActual : null,
      });

      if (!siguiente) continue;

      const valorSiguiente = Number(siguiente.valor ?? 0);

      const cambiaSigno =
        (valorActual < 0 && valorSiguiente > 0) ||
        (valorActual > 0 && valorSiguiente < 0);

      if (cambiaSigno) {
        const proporcion = Math.abs(valorActual) / (Math.abs(valorActual) + Math.abs(valorSiguiente));

        const anioActual = Number(actual.anio);
        const anioSiguiente = Number(siguiente.anio);

        const anioCruce =
          !Number.isNaN(anioActual) && !Number.isNaN(anioSiguiente)
            ? anioActual + (anioSiguiente - anioActual) * proporcion
            : `${actual.anio}-${siguiente.anio}-cruce`;

        resultado.push({
          anio: anioCruce,
          valor: 0,
          positivo: 0,
          negativo: 0,
          esCruce: true,
        });
      }
    }

    return resultado;
}, [dataCajaLibreAcum]);

  return (
    <Form className='' noValidate autoComplete='off'>
      <AppScrollbar style={{ maxHeight: 'auto' }}>
        <Box py={5} px={{ xs: 5, lg: 8, xl: 10 }}>
          <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Tooltip title='Volver'>
              <ArrowBackIos style={{ cursor: 'pointer', fontSize: 30 }} onClick={handleOnClose} />
            </Tooltip>
            <Box component='h6' mb={{ xs: 4, xl: 6 }} fontSize={20} fontWeight={Fonts.MEDIUM} style={{ flex: '1 1 100%', fontWeight: 'bold' }}>
              {titulo}
            </Box>
          </Box>

          <Box px={{ md: 5, lg: 8, xl: 10 }}>
            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <FormikAutocomplete
                options={proyectos}
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                name='id_proyecto'
                label='Proyecto'
                InputLabelProps={{ shrink: true }}
                disabled
                className={classes.myTextField}
                variant='standard'
                fullWidth
              />
              <MyTextField 
                className={classes.myTextField} 
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                label='Código Proyecto' 
                name='codigo_proyecto' 
                disabled 
                InputLabelProps={{ shrink: true }} 
              />
              <FormikAutocomplete
                options={accion !== 'ver' ? MODELO_COMERCIALIZACION_ENERGIA.filter((item) => item.estado === 1) : MODELO_COMERCIALIZACION_ENERGIA}
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }}}
                name='indicativo_modelo_ccial'
                label='Modelo comercializacion *'
                disabled={disabled}
                className={classes.myTextField}
                variant='standard'
                fullWidth
                required
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <MyDateField
                name='fecha'
                label='Fecha'
                disabled
                fullWidth
                variant='standard'
                InputProps={{ inputComponent: Input, disableUnderline: false }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#ccc', marginBottom: -0.1 },
                  '& .MuiInput-underline:hover:before': { borderBottomColor: theme.palette.text.primary },
                  '& .MuiInput-underline:after': { borderBottomColor: theme.palette.text.primary },
                  [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 
                }}
              />
              <MyCurrencyFieldPotencia
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                className={classes.myTextField}
                label='Potencia del sistema kWp'
                name='potencia'
                disabled
                required
              />
              <MyCurrencyFieldMoneda
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }}}
                className={classes.myTextField}
                label='Valor total proyecto'
                name='valor_total_proyecto'
                disabled
              />  
            </Box>
            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr' }}>
              <MyTextField
                className={classes.myTextField}
                label='Nombre inversionista'
                name='nombre_inversionista'
                disabled={disabled}
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <MyTextField
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                className={classes.myTextField}
                label='Teléfono'
                name='telefono_inversionista'
                disabled={disabled}
              />

              <MyTextField
                className={classes.myTextField}
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                label='Correo electrónico'
                name='email_inversionista'
                disabled={disabled}
              />
              <MyCurrencyFieldPesos
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }}}
                className={classes.myTextField}
                label='Porcentaje inversión (%)'
                name='porcentaje_part_inversionista'
                disabled={disabled}
                onChange={(e) => {
                  setFieldValue('porcentaje_part_inversionista', e?.target?.value ?? '', false);
                }}
                required
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              

              <MyCurrencyFieldMoneda
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                className={classes.myTextField}
                label='Valor inversión'
                name='valor_part_inversionista'
                disabled={disabled}
                onChange={(e) => {
                  setFieldValue('valor_part_inversionista', e?.target?.value ?? '', false);
                }}
              />
              <FormikAutocomplete
                options={accion !== 'ver' ? DATO_BOOLEAN.filter((item) => item.estado === 1) : DATO_BOOLEAN}
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                name='indicativo_beneficio_trib'
                label='Beneficio tributario *'
                disabled={disabled}
                className={classes.myTextField}
                variant='standard'
                fullWidth
                required
              />
            </Box>
             
              <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 2,
                mt: 2,
                mb: 2,
              }}
            >
              <MyCurrencyFieldMoneda
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                className={classes.myTextField}
                label='VPN'
                name='Valor_VPN_proyecto'
                disabled
              />

              <MyCurrencyFieldPesos
                className={classes.myTextField}
                label='TIR (%)'
                name='porcentaje_TIR_proyecto'
                disabled
              />
              <MyCurrencyFieldPotencia
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 } }}
                className={classes.myTextField}
                label='PBT (Años)'
                name='anios_PBT'
                disabled
              />
            </Box>


            {/* ===============================
                TABLA CONCEPTOS
            =============================== */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                Conceptos
              </Typography>
              <Box sx={{ mt: 2 }}>
                <TablaDetalleConceptos detalle={detalleConceptos} parametroConstantes={parametroConstantes} />
              </Box>
            </Box>
            {/* ===============================
            RESULTADOS GRAFICA DE CAJA LIBRE ACUMULADA
            =============================== */}
            {/* --------- CONTROLES GRAFICA --------- */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, mt: 5  }}>
              <Typography variant="h2" fontWeight={700}>
                Flujo caja libre acumulado
              </Typography>

              <ChartToggleGroup value={chartType} onChange={setChartType} />
            </Box>
            {/* --------- GRAFICA --------- */}
            {!hasData ? (
              <Typography>No hay datos para graficar</Typography>
            ) : (
              <Box sx={{ width: '100%', height: 480 }}>

              <ResponsiveContainer width="100%" height="100%">
                {/* ==========================
                    BARRAS VERTICALES
                ========================== */}
                {chartType === CHART_TYPES.BAR_VERTICAL && (
                  <BarChart data={dataCajaLibreAcum}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="anio" />
                    <YAxis tickFormatter={formatCOP} width={110} tickMargin={10} />
                    <TooltipRecharts content={<CustomTooltip />} />

                    <Bar dataKey="valor">
                      {dataCajaLibreAcum.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.valor < 0
                              ? theme.palette.error.main
                              : theme.palette.success.main
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}

                {/* ==========================
                    BARRAS HORIZONTALES
                ========================== */}
                {chartType === CHART_TYPES.BAR_HORIZONTAL && (
                  <BarChart data={dataCajaLibreAcum} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatCOP} />
                    <YAxis type="category" dataKey="anio" />
                    <TooltipRecharts content={<CustomTooltip />} />

                    <Bar dataKey="valor">
                      {dataCajaLibreAcum.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.valor < 0
                              ? theme.palette.error.main
                              : theme.palette.success.main
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}

                {/* ==========================
                    AREA
                ========================== */}
                {chartType === CHART_TYPES.AREA && (
                  <AreaChart data={dataSeparada}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="anio" />
                    <YAxis tickFormatter={formatCOP} width={110} tickMargin={10} />
                    <TooltipRecharts content={<CustomTooltip />} />

                    <Area
                      type="monotone"
                      dataKey="positivo"
                      stroke={theme.palette.success.main}
                      fill={theme.palette.success.light}
                    />
                    <Area
                      type="monotone"
                      dataKey="negativo"
                      stroke={theme.palette.error.main}
                      fill={theme.palette.error.light}
                    />
                  </AreaChart>
                )}

                {/* ==========================
                    LINEA
                ========================== */}
                {chartType === CHART_TYPES.LINE && (
                  <LineChart data={dataSeparada}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="anio" />
                    <YAxis tickFormatter={formatCOP} width={110} tickMargin={10} />
                    <TooltipRecharts content={<CustomTooltip />} />

                    <Line
                      type="monotone"
                      dataKey="positivo"
                      stroke={theme.palette.success.main}
                      dot={true}
                      strokeWidth={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="negativo"
                      stroke={theme.palette.error.main}
                      dot={true}
                      strokeWidth={2}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
              </Box>
            )}
          </Box>
        


        
        </Box>
        {/* ===============================
          BOTONES VOLVER
        =============================== */}
        <Box className={classes.bottomsGroup}>
          <Button
            sx={{
              paddingLeft: 15,
              paddingRight: 15,
              color: 'white !important',
              '&:hover': { backgroundColor: theme.palette.colorHovers, cursor: 'pointer' },
              backgroundColor: theme.palette.secondary.light,
            }}
            onClick={handleOnClose}
          >
            <IntlMessages id='boton.cancel' />  
          </Button>
        </Box>
      </AppScrollbar>

      
    </Form>
  );
};

SimulacionPorInversionistaForm.propTypes = {
  handleOnClose: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
  proyectos: PropTypes.any,
  selectedRow: PropTypes.any,
  porcentajePerdidaEficiencia: PropTypes.any,
  porcentajeDescuentoTarifa: PropTypes.any,
  precioEnergia: PropTypes.any,
  porcentajeIPC: PropTypes.any,
  porcentajeIncrementoPrecio: PropTypes.any,
  savePayload: PropTypes.any,
  guardadoOk: PropTypes.bool,
};

export default SimulacionPorInversionistaForm;
