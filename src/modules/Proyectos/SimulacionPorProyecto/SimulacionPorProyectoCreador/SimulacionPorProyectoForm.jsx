// ===============================
// ===============================

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Box, Button, Input } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Form, useFormikContext } from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import AppScrollbar from '@crema/components/AppScrollbar';
import { useDispatch } from 'react-redux';
import Tooltip from '@mui/material/Tooltip';
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
import MyCurrencyFieldConcepto from '../../../../shared/components/MyCurrencyFieldConceptos';
import MyCurrencyFieldPotenciaConcepto from '../../../../shared/components/MyCurrencyFieldPotenciaConcepto';
import MyCurrencyFieldConceptosPorcentaje from '../../../../shared/components/MyCurrencyFieldConceptosPorcentaje';
import { onGetColeccionLigera as onGetEtapasProyectos } from '../../../../@crema/redux/features/etapaProyecto/etapaProyectoSlice';
import { onGetConceptosSimulacion, onCalcularSimulacion } from '../../../../@crema/redux/features/conceptoPorProyecto/conceptoPorProyectoSlice';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { MODELO_COMERCIALIZACION_ENERGIA } from '../../../../shared/constants/ListaValores';

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
    paddingTop: '30px',
  },
  myTextField: {
    width: '100%',
    marginBottom: 5,
    height: '60px',
  },
  tableRowField: {
    width: '100%',
    marginBottom: 0,
    height: '28px',
  },
}));

const SimulacionPorProyectoForm = (props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const classes = useStyles(props);

  const formik = useFormikContext();
  if (!formik) return null;

  const { setFieldValue, values: formikValues } = formik;

  const {
    accion,
    initialValues,
    titulo,
    values,
    proyectos,
    headProyecto,
    selectedRow,
    precioEnergia, // no usado acá (compatibilidad)
    porcentajeIncrementoPrecio, // no usado acá (compatibilidad)
    porcentajePerdidaEficiencia,
    porcentajeIPC,
    porcentajeOportunidad,
    savePayload,
    guardadoOk: guardadoOkProp,
    idConceptoKwhBolsa,
    idConceptoPrecioBolsa,
    idConceptoKwhComunidad,
    idConceptoPrecioComunidad,
    idVentaBolsa,
    idVentaComunidad,
  } = props;

  const [disabled, setDisabled] = useState(false);
  const [proyectoId, setProyectoId] = useState(false);

  // Spinner/Backdrop esperando back
  const [loadingCalc, setLoadingCalc] = useState(false);

  // Mostrar resultados solo tras guardar OK
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [hideGuardar, setHideGuardar] = useState(false);

  // KPI snapshot (opcional)
  const [resultKPI, setResultKPI] = useState({ vpn: 0, tir: 0, pbt: 0 });

  // Debounce “terminó de digitar”
  const timerRef = useRef(null);
  const DEBOUNCE_MS = 1100;

  // Evitar doble request simultáneo
  const recalculandoRef = useRef(false);

  // Bloquear watchers mientras carga inicial
  const bootLoadedRef = useRef(false);

  // Activar watchers solo cuando ya terminó de cargar plantilla
  const watchReadyRef = useRef(false);

  // Mantener últimos valores para que “la primera vez” sí dispare
  const lastModeloRef = useRef(undefined);
  const lastAniosDepRef = useRef(undefined);

  // id depreciación si viene del back
  const idDepreciacionRef = useRef(null);

  // manual por fila (id_concepto_proyecto)
  const touchedSimuladosRef = useRef(new Set());

  // conceptos BD en ref
  const conceptosDBRef = useRef([]);
  const simIdRef = useRef(null);

  // Llena los datos de porcentajes perdida eficiencia, ipc y tasa de oportunidad
  useEffect(() => {
    setFieldValue('porcentaje_perdida_efic', porcentajePerdidaEficiencia, false);
    setFieldValue('porcentaje_IPC', porcentajeIPC, false);
    setFieldValue('porcentaje_tasa_oportunidad', porcentajeOportunidad, false);
  }, [porcentajePerdidaEficiencia, porcentajeIPC, porcentajeOportunidad]);

  // Ref con valores más recientes (evitar closures viejos en debounce)
  const latestValuesRef = useRef(formikValues);
  useEffect(() => {
    latestValuesRef.current = formikValues;
  }, [formikValues]);

  useEffect(() => {
    const simId = selectedRow?.simulacion?.id ?? null;
    if (simIdRef.current === simId) return;

    simIdRef.current = simId;
    conceptosDBRef.current = Array.isArray(selectedRow?.conceptos) ? selectedRow.conceptos : [];
  }, [selectedRow?.simulacion?.id, selectedRow?.conceptos]);

  useEffect(() => {
    setProyectoId(headProyecto?.id_proyecto);
  }, [headProyecto?.id_proyecto]);

  useEffect(() => {
    if (accion === 'ver' || initialValues.estado === '0') setDisabled(true);
  }, [initialValues.estado, accion]);

  useEffect(() => {
    if (values.id_tipo_proyecto) {
      dispatch(onGetEtapasProyectos({ id_tipo_proyecto: values.id_tipo_proyecto }));
    }
  }, [dispatch, values.id_tipo_proyecto]);

  // ==========================================================
  // Helpers
  // ==========================================================
  const getRowKey = (c) => Number(c?.id_concepto_proyecto ?? c?.id ?? 0);

  const toNumberOrNull = (v) => {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return Number.isNaN(v) ? null : v;

    let str = String(v).trim();
    if (!str) return null;

    let isNegative = false;
    if (/^\(.*\)$/.test(str)) {
      isNegative = true;
      str = str.replace(/[()]/g, '');
    }

    str = str.replace(/\s/g, '').replace(/\$/g, '');

    const dotCount = (str.match(/\./g) || []).length;
    const commaCount = (str.match(/,/g) || []).length;

    const lastDot = str.lastIndexOf('.');
    const lastComma = str.lastIndexOf(',');
    const hasDot = lastDot !== -1;
    const hasComma = lastComma !== -1;

    const isThousandSep = (sep) => {
      const idx = str.lastIndexOf(sep);
      if (idx === -1) return false;
      const right = str.slice(idx + 1).replace(/[^\d]/g, '');
      return right.length === 3;
    };

    if (hasDot && hasComma) {
      const decPos = Math.max(lastDot, lastComma);
      let intPart = str.slice(0, decPos);
      let decPart = str.slice(decPos + 1);

      intPart = intPart.replace(/[^\d]/g, '');
      decPart = decPart.replace(/[^\d]/g, '');

      if (!intPart && !decPart) return null;

      const normalized = decPart ? `${intPart}.${decPart}` : intPart;
      const n = Number(normalized);
      if (Number.isNaN(n)) return null;
      return isNegative ? -n : n;
    }

    if (hasDot && !hasComma) {
      if (dotCount > 1 || isThousandSep('.')) {
        const digits = str.replace(/[^\d]/g, '');
        if (!digits) return null;
        const n = Number(digits);
        return isNegative ? -n : n;
      }
      const normalized = str.replace(/[^\d.]/g, '');
      const n = Number(normalized);
      if (Number.isNaN(n)) return null;
      return isNegative ? -n : n;
    }

    if (!hasDot && hasComma) {
      if (commaCount > 1 || isThousandSep(',')) {
        const digits = str.replace(/[^\d]/g, '');
        if (!digits) return null;
        const n = Number(digits);
        return isNegative ? -n : n;
      }
      const normalized = str.replace(/[^\d,]/g, '').replace(',', '.');
      const n = Number(normalized);
      if (Number.isNaN(n)) return null;
      return isNegative ? -n : n;
    }

    const digits = str.replace(/[^\d]/g, '');
    if (!digits) return null;
    const n = Number(digits);
    return isNegative ? -n : n;
  };

  const isEmptyMoney = (v) => {
    if (v === null || v === undefined) return true;
    if (typeof v === 'string') {
      const s = v.trim();
      if (s === '') return true;
      const digits = s.replace(/[^\d]/g, '');
      return digits.length === 0;
    }
    return false;
  };

  const isZeroMoney = (v) => {
    const n = toNumberOrNull(v);
    return n === null || n === 0;
  };

  // NO mezclar ids: id_concepto_proyecto (fila/plantilla) y id_concepto (catálogo)
  const normalizeConcepto = (c) => {
    const obj = { ...c };

    const idConceptoProyecto = obj.id_concepto_proyecto ?? obj.id ?? null; // fila/plantilla
    const idConceptoCatalogo = obj.id_concepto ?? null; // catálogo

    const porcentajeNum = toNumberOrNull(obj.porcentaje);
    const valorNum = toNumberOrNull(obj.valor);
    const simNum = toNumberOrNull(obj.valor_simulado);

    return {
      ...obj,
      id_concepto_proyecto: idConceptoProyecto,
      id_concepto: idConceptoCatalogo,

      secuencia: Number(obj.secuencia ?? 0),
      concepto: obj.concepto ?? obj.nombre ?? '',
      es_editable: Boolean(obj.es_editable),
      indentado: Boolean(obj.indentado),

      porcentaje: porcentajeNum === null ? '' : porcentajeNum,
      valor: valorNum === null ? '' : obj.valor,
      valor_simulado: simNum === null ? '' : obj.valor_simulado,

      simulado_manual: Boolean(obj.simulado_manual),
    };
  };

  const applyDBValuesToPlantilla = (plantilla = [], db = []) => {
    const map = new Map();
    (db || []).forEach((c) => map.set(Number(c.id_concepto_proyecto), c));

    return (plantilla || []).map((row) => {
      const id = Number(row.id_concepto_proyecto);
      const saved = map.get(id);
      if (!saved) return row;

      return normalizeConcepto({
        ...row,
        porcentaje: saved.porcentaje ?? row.porcentaje,
        valor: saved.valor_mensual_concepto ?? row.valor,
        valor_simulado: saved.valor_concepto_proyecto ?? row.valor_simulado,
        simulado_manual: Boolean(saved.simulado_manual),
      });
    });
  };

  const getDepreciacionRowId = (conceptos = []) => {
    const byRef = Number(idDepreciacionRef.current || 0);
    if (byRef) return byRef;

    const norm = (s) =>
      String(s ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const byName = (conceptos || []).find((c) => norm(c?.concepto) === 'depreciacion');
    if (byName?.id_concepto_proyecto) return Number(byName.id_concepto_proyecto);

    const byContains = (conceptos || []).find((c) => norm(c?.concepto).includes('depreci'));
    if (byContains?.id_concepto_proyecto) return Number(byContains.id_concepto_proyecto);

    const bySeq = (conceptos || []).find((c) => Number(c?.secuencia) === 70 && norm(c?.concepto).includes('depreci'));
    if (bySeq?.id_concepto_proyecto) return Number(bySeq.id_concepto_proyecto);

    return null;
  };

  const mergeConceptos = (actuales = [], calculados = []) => {
    const mapActuales = new Map();
    (actuales || []).forEach((c) => mapActuales.set(getRowKey(c), c));

    return (calculados || []).map((calc) => {
      const cCalc = normalizeConcepto(calc);
      const id = getRowKey(cCalc);
      const cAct = mapActuales.get(id);

      const esManual = touchedSimuladosRef.current.has(id) || !!cAct?.simulado_manual;

      const porcentajeKeep = cAct?.porcentaje ?? cCalc?.porcentaje ?? '';
      const valorKeep = cAct?.valor ?? cCalc?.valor ?? '';

      if (esManual) {
        return {
          ...cCalc,
          porcentaje: porcentajeKeep,
          valor: valorKeep,
          valor_simulado: cAct?.valor_simulado ?? cCalc?.valor_simulado ?? '',
          simulado_manual: true,
        };
      }

      return {
        ...cCalc,
        porcentaje: porcentajeKeep,
        valor: valorKeep,
        simulado_manual: false,
        valor_simulado: cCalc?.valor_simulado ?? cAct?.valor_simulado ?? '',
      };
    });
  };

  // ==========================================================
  // FILTRO VISUAL por MODELO usando id_concepto_proyecto (props)
  // ==========================================================
  const numOr0 = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Cuando modelo = CE => ocultar Bolsa
  const IDS_SOLO_BO_PROY = useMemo(() => {
    return new Set([numOr0(idConceptoKwhBolsa), numOr0(idConceptoPrecioBolsa), numOr0(idVentaBolsa)].filter(Boolean));
  }, [idConceptoKwhBolsa, idConceptoPrecioBolsa, idVentaBolsa]);

  // Cuando modelo = BO => ocultar Comunidad
  const IDS_SOLO_CE_PROY = useMemo(() => {
    return new Set([numOr0(idConceptoKwhComunidad), numOr0(idConceptoPrecioComunidad), numOr0(idVentaComunidad)].filter(Boolean));
  }, [idConceptoKwhComunidad, idConceptoPrecioComunidad, idVentaComunidad]);

  const aplicaAlModelo = useCallback(
    (row, modelo) => {
      const m = String(modelo || '').trim().toUpperCase();

      const idConceptoProyecto = Number(row?.id_concepto_proyecto ?? row?.id ?? 0);

      // si no tiene id (headers/totales), no ocultes
      if (!idConceptoProyecto) return true;

      if (m === 'CE') return !IDS_SOLO_BO_PROY.has(idConceptoProyecto); // oculta bolsa
      if (m === 'BO') return !IDS_SOLO_CE_PROY.has(idConceptoProyecto); // oculta comunidad

      return true;
    },
    [IDS_SOLO_BO_PROY, IDS_SOLO_CE_PROY],
  );

  // Lista visible preservando el índice real de Formik
  const conceptosVisibles = useMemo(() => {
    const modelo = formikValues?.indicativo_modelo_ccial ?? null;
    const conceptos = Array.isArray(formikValues?.conceptos) ? formikValues.conceptos : [];

    return conceptos
      .map((row, idx) => ({ row, idx }))
      .filter(({ row }) => aplicaAlModelo(row, modelo));
  }, [formikValues?.conceptos, formikValues?.indicativo_modelo_ccial, aplicaAlModelo]);

  // ==========================================================
  // KPI payload helper
  // ==========================================================
  const unwrapPayload = (payload) => {
    if (!payload) return {};
    return payload?.datos ?? payload?.data?.datos ?? payload?.data ?? payload;
  };

  const applyResultadosFromBack = (payloadAny) => {
    const data = unwrapPayload(payloadAny);
    const vpn = data?.vpn ?? data?.Valor_VPN_proyecto ?? 0;
    const tir = data?.tir ?? data?.porcentaje_TIR_proyecto ?? 0;
    const pbt = data?.pbt ?? data?.anios_PBT ?? 0;

    setFieldValue('Valor_VPN_proyecto', vpn, false);
    setFieldValue('porcentaje_TIR_proyecto', tir, false);
    setFieldValue('anios_PBT', pbt, false);
    setResultKPI({ vpn, tir, pbt });
  };

  // Cuando el creador marque guardadoOk, bloquear y ocultar guardar
  useEffect(() => {
    if (guardadoOkProp) {
      setGuardadoOk(true);
      setHideGuardar(true);
      setDisabled(true);
      recalculandoRef.current = true; // frena futuros cálculos
    }
  }, [guardadoOkProp]);

  // Cuando llegue el payload del GUARDADO, aplicar KPI
  useEffect(() => {
    if (!savePayload) return;

    setGuardadoOk(true);
    setHideGuardar(true);
    setDisabled(true);
    recalculandoRef.current = true;

    applyResultadosFromBack(savePayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savePayload]);

  // ==========================================================
  // Persistencia de si una fila venía inicialmente con porcentaje o valor
  // ==========================================================
  const initialLocksRef = useRef(new Map());
  const bootKeyRef = useRef(null);

  useEffect(() => {
    const key = `${accion ?? ''}-${values?.id_tipo_proyecto ?? ''}-${values?.id ?? 'new'}`;
    if (bootKeyRef.current !== key) {
      bootKeyRef.current = key;
      initialLocksRef.current = new Map();
    }
  }, [accion, values?.id_tipo_proyecto, values?.id]);

  useEffect(() => {
    const rows = formikValues?.conceptos ?? [];
    if (!Array.isArray(rows) || rows.length === 0) return;

    for (const row of rows) {
      const rowId = getRowKey(row);
      if (!rowId) continue;

      if (!initialLocksRef.current.has(rowId)) {
        const initHasPorcentaje = !isZeroMoney(row?.porcentaje);
        const initHasValor = !isEmptyMoney(row?.valor);
        initialLocksRef.current.set(rowId, { initHasPorcentaje, initHasValor });
      }
    }
  }, [formikValues?.conceptos]);

  const getInitLock = useCallback((row) => {
    const rowId = getRowKey(row);
    if (!rowId) return { initHasPorcentaje: false, initHasValor: false };
    return initialLocksRef.current.get(rowId) ?? { initHasPorcentaje: false, initHasValor: false };
  }, []);

  const hasRowError = (row) => Boolean(String(row?.error ?? '').trim());
  const getTipoValor = (row) => String(row?.indicativo_tipo_valor ?? 'V').toUpperCase();

  // ==========================================================
  // Debounce + Cálculo (se frena si guardadoOk)
  // ==========================================================
  const scheduleCalculo = (ms = DEBOUNCE_MS) => {
    if (guardadoOk) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      calcularAhora();
    }, ms);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Render input simulado según tipo
  const renderInputSimulado = ({ row, i, rowId, disabledSimulado, rowHasError }) => {
    const tipo = getTipoValor(row);

    const commonSx = {
      marginTop: 0,
      marginBottom: 0,
      '& .MuiInputBase-root': { padding: 0, height: '28px', borderBottom: '1px solid #e0e0e0' },
      '& .MuiInputBase-root:hover': { borderBottom: '1px solid #e0e0e0' },
      '& .MuiInputBase-root.Mui-disabled': { borderBottom: '1px solid #e0e0e0' },
      '& .MuiInputBase-input': { padding: 0, textAlign: 'right' },
    };

    const markManualAndSchedule = (raw) => {
      if (rowId) touchedSimuladosRef.current.add(rowId);
      if (rowHasError) setFieldValue(`conceptos[${i}].error`, null, false);
      setFieldValue(`conceptos[${i}].valor_simulado`, raw, false);
      setFieldValue(`conceptos[${i}].simulado_manual`, true, false);
      scheduleCalculo();
    };

    if (tipo === 'R') {
      return (
        <MyCurrencyFieldConceptosPorcentaje
          label=''
          name={`conceptos[${i}].valor_simulado`}
          disabled={disabledSimulado}
          className={classes.tableRowField}
          variant='standard'
          fullWidth
          margin='none'
          inputProps={{ style: { textAlign: 'right' } }}
          InputLabelProps={{ shrink: true, style: { textAlign: 'right', width: '100%' } }}
          sx={commonSx}
          onChange={(e) => {
            const raw = e?.target?.value ?? '';
            markManualAndSchedule(raw);
          }}
        />
      );
    }

    if (tipo === 'C') {
      return (
        <MyCurrencyFieldPotenciaConcepto
          label=''
          name={`conceptos[${i}].valor_simulado`}
          disabled={disabledSimulado}
          className={classes.tableRowField}
          variant='standard'
          step='any'
          margin='none'
          inputProps={{ style: { textAlign: 'right' } }}
          InputLabelProps={{ shrink: true, style: { textAlign: 'right', width: '100%' } }}
          onChange={(e) => {
            const raw = e?.target?.value ?? '';
            markManualAndSchedule(raw);
          }}
        />
      );
    }

    return (
      <MyCurrencyFieldConcepto
        label=''
        name={`conceptos[${i}].valor_simulado`}
        disabled={disabledSimulado}
        className={classes.tableRowField}
        variant='standard'
        fullWidth
        margin='none'
        inputProps={{ style: { textAlign: 'right' } }}
        InputLabelProps={{ shrink: true, style: { textAlign: 'right', width: '100%' } }}
        sx={commonSx}
        onChange={(e) => {
          const raw = e?.target?.value ?? '';
          markManualAndSchedule(raw);
        }}
      />
    );
  };

  // ==========================================================
  // buildParams: NO FILTRA (manda conceptos completos al back)
  // ==========================================================
  const buildParams = (vals) => {
    const emptyToNull = (vv) => (vv === '' || vv === undefined ? null : vv);

    const conceptosFuente = Array.isArray(vals?.conceptos) ? vals.conceptos : [];

    // manda TODO el arreglo (aunque esté oculto visualmente)
    const conceptos = conceptosFuente.map((c) => ({
      ...c,
      id_concepto_proyecto: c.id_concepto_proyecto,
      id_concepto: c.id_concepto ?? null,
      secuencia: Number(c.secuencia ?? 0),
      porcentaje: isEmptyMoney(c.porcentaje) ? null : toNumberOrNull(c.porcentaje) ?? null,
      valor: isEmptyMoney(c.valor) ? null : toNumberOrNull(c.valor) ?? null,
      valor_simulado: isEmptyMoney(c.valor_simulado) ? null : toNumberOrNull(c.valor_simulado) ?? null,
      simulado_manual: !!c.simulado_manual,
    }));

    return {
      id: emptyToNull(vals.id),
      id_proyecto: Number(vals.id_proyecto),
      indicativo_modelo_ccial: vals.indicativo_modelo_ccial,
      porcentaje_perdida_efic: isEmptyMoney(vals.porcentaje_perdida_efic) ? null : toNumberOrNull(vals.porcentaje_perdida_efic),
      valor_total_proyecto: isEmptyMoney(vals.valor_total_proyecto) ? null : toNumberOrNull(vals.valor_total_proyecto),
      porcentaje_IPC: isEmptyMoney(vals.porcentaje_IPC) ? null : toNumberOrNull(vals.porcentaje_IPC),
      anios_depreciacion: isEmptyMoney(vals.anios_depreciacion) ? null : toNumberOrNull(vals.anios_depreciacion),
      porcentaje_tasa_oportunidad: isEmptyMoney(vals.porcentaje_tasa_oportunidad) ? null : toNumberOrNull(vals.porcentaje_tasa_oportunidad),
      accion: vals.accion ?? accion ?? null,
      conceptos,
    };
  };

  const calcularAhora = async () => {
    if (guardadoOk) return;
    const vals = latestValuesRef.current;

    if (disabled) return;
    if (!bootLoadedRef.current) return;

    if (!vals?.id_proyecto) return;
    if (!vals?.id_tipo_proyecto) return;
    if (!vals?.indicativo_modelo_ccial) return;
    if (!Array.isArray(vals?.conceptos) || vals.conceptos.length === 0) return;

    if (recalculandoRef.current) return;

    try {
      recalculandoRef.current = true;
      setLoadingCalc(true);

      const params = buildParams(vals);
      const res = await dispatch(onCalcularSimulacion({ params }));
      const payload = res?.payload;

      const idDep = payload?.meta?.id_concepto_depreciacion ?? payload?.data?.meta?.id_concepto_depreciacion ?? null;
      if (idDep) idDepreciacionRef.current = Number(idDep);

      const data = unwrapPayload(payload);
      const conceptosResp =
        payload?.conceptos ||
        payload?.conceptos_simulacion ||
        payload?.data?.conceptos ||
        payload?.data?.conceptos_simulacion ||
        data?.conceptos;

      if (Array.isArray(conceptosResp)) {
        const merged = mergeConceptos(vals.conceptos, conceptosResp);
        setFieldValue('conceptos', merged, false);
      }
    } finally {
      setLoadingCalc(false);
      recalculandoRef.current = false;
    }
  };

  // ==========================================================
  // Cargar plantilla + BD
  // ==========================================================
  useEffect(() => {
    if (!values.id_tipo_proyecto) return;

    bootLoadedRef.current = false;
    watchReadyRef.current = false;
    lastModeloRef.current = undefined;
    lastAniosDepRef.current = undefined;

    dispatch(
      onGetConceptosSimulacion({
        id_tipo_proyecto: values.id_tipo_proyecto,
        id_simulacion: values.id || null,
      }),
    ).then((res) => {
      const payload = res?.payload;

      const conceptosRaw = Array.isArray(payload) ? payload : payload?.conceptos || payload?.conceptos_pantalla || [];
      const plantilla = (conceptosRaw || []).map(normalizeConcepto);

      const db = conceptosDBRef.current || [];
      const finalRows = db.length ? applyDBValuesToPlantilla(plantilla, db) : plantilla;

      touchedSimuladosRef.current = new Set((finalRows || []).filter((r) => !!r.simulado_manual).map((r) => getRowKey(r)));

      const locks = new Map();
      for (const r of finalRows) {
        const id = getRowKey(r);
        if (!id) continue;
        locks.set(id, {
          initHasPorcentaje: !isZeroMoney(r?.porcentaje),
          initHasValor: !isEmptyMoney(r?.valor),
        });
      }
      initialLocksRef.current = locks;

      setFieldValue('conceptos', finalRows, false);
      setFieldValue('accion', accion, false);

      // si el back manda ocultos por otro mecanismo, lo conservas
      const ocultos = payload?.arreglo_conceptos || [];
      if (Array.isArray(ocultos) && ocultos.length) setFieldValue('arreglo_conceptos', ocultos, false);

      bootLoadedRef.current = true;

      const nowVals = latestValuesRef.current;
      lastModeloRef.current = nowVals?.indicativo_modelo_ccial ?? null;
      lastAniosDepRef.current = toNumberOrNull(nowVals?.anios_depreciacion);

      watchReadyRef.current = true;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    values.id_tipo_proyecto,
    values.id,
    precioEnergia,
    porcentajeIncrementoPrecio,
  ]);

  // ==========================================================
  // WATCHERS
  // ==========================================================
  useEffect(() => {
    if (disabled) return;
    if (guardadoOk) return;
    if (!watchReadyRef.current) return;

    const modelo = formikValues.indicativo_modelo_ccial ?? null;

    if (lastModeloRef.current === undefined) {
      lastModeloRef.current = modelo;
      return;
    }

    if (modelo !== lastModeloRef.current) {
      lastModeloRef.current = modelo;
      scheduleCalculo(250);
    }
  }, [formikValues.indicativo_modelo_ccial, disabled, guardadoOk]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (disabled) return;
    if (guardadoOk) return;
    if (!watchReadyRef.current) return;

    const anios = toNumberOrNull(formikValues.anios_depreciacion);

    if (lastAniosDepRef.current === undefined) {
      lastAniosDepRef.current = anios;
      return;
    }

    if (anios !== lastAniosDepRef.current) {
      lastAniosDepRef.current = anios;

      const idDepRow = getDepreciacionRowId(formikValues.conceptos);
      if (idDepRow) {
        const nuevos = (formikValues.conceptos || []).map((c) => {
          const key = getRowKey(c);
          if (Number(key) !== Number(idDepRow)) return c;

          touchedSimuladosRef.current.delete(key);
          return { ...c, simulado_manual: false, porcentaje: null, valor: null, valor_simulado: null };
        });

        setFieldValue('conceptos', nuevos, false);
      }

      scheduleCalculo();
    }
  }, [formikValues.anios_depreciacion, disabled, guardadoOk]); // eslint-disable-line react-hooks/exhaustive-deps

  // ==========================================================
  // Navegación
  // ==========================================================
  const onGoBack = () => {
    navigate('/simulaciones-por-proyectos/' + proyectoId);
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <Form className='' noValidate autoComplete='off'>
      <Backdrop open={loadingCalc} sx={{ zIndex: (t) => t.zIndex.modal + 1 }}>
        <CircularProgress />
      </Backdrop>

      <AppScrollbar style={{ maxHeight: 'auto' }}>
        <Box py={5} px={{ xs: 5, lg: 8, xl: 10 }}>
          <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Tooltip title='Volver'>
              <ArrowBackIos style={{ cursor: 'pointer', fontSize: 30 }} onClick={onGoBack} />
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
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 } }}
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
                name='updated_at'
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

              <MyCurrencyFieldPesos
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 } }}
                className={classes.myTextField}
                label='Perdida eficiencia sistema(%)'
                name='porcentaje_perdida_efic'
                disabled={disabled}
                required
                onChange={(e) => {
                  setFieldValue('porcentaje_perdida_efic', e?.target?.value ?? '', false);
                  scheduleCalculo();
                }}
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <MyCurrencyFieldMoneda
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                className={classes.myTextField}
                label='Valor total proyecto'
                name='valor_total_proyecto'
                disabled
              />
              <MyCurrencyFieldPesos
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4  }}
                className={classes.myTextField}
                label='Tasa oportunidad(%)'
                name='porcentaje_tasa_oportunidad'
                disabled={disabled}
                onChange={(e) => {
                  setFieldValue('porcentaje_tasa_oportunidad', e?.target?.value ?? '', false);
                  scheduleCalculo();
                }}
                required
              />
              <MyCurrencyFieldPesos
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 } }}
                className={classes.myTextField}
                label='IPC(%)'
                name='porcentaje_IPC'
                disabled={disabled}
                required
                onChange={(e) => {
                  setFieldValue('porcentaje_IPC', e?.target?.value ?? '', false);
                  scheduleCalculo();
                }}
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              

              
              <MyCurrencyField
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4   }}
                className={classes.myTextField}
                label='Años depreciacion'
                name='anios_depreciacion'
                disabled={disabled}
                onChange={(e) => {
                  setFieldValue('anios_depreciacion', e?.target?.value ?? '', false);
                  scheduleCalculo();
                }}
                required
              />
            </Box>

            {/* ===============================
                Tabla conceptos (FILTRADA SOLO EN UI)
            =============================== */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 15 }}>
                <MyTextField label='Concepto' name='__h_conc' disabled />
                <MyTextField
                  label='Porcentaje'
                  name='__h_pct'
                  disabled
                  inputProps={{ style: { textAlign: 'right' } }}
                  InputLabelProps={{ style: { textAlign: 'right', width: '100%' } }}
                />
                <MyTextField
                  label='Valor Mensual'
                  name='__h_val'
                  disabled
                  inputProps={{ style: { textAlign: 'right' } }}
                  InputLabelProps={{ style: { textAlign: 'right', width: '100%' } }}
                />
                <MyTextField
                  label='Valor simulado'
                  name='__h_sim'
                  disabled
                  inputProps={{ style: { textAlign: 'right' } }}
                  InputLabelProps={{ style: { textAlign: 'right', width: '100%' } }}
                />
              </Box>

              {/* Render con índice real de Formik */}
              {conceptosVisibles.map(({ row, idx: i }) => {
                const esDetalle = row.indicativo_tipo_linea === 'D';
                const rowId = getRowKey(row);
                const currentRow = formikValues.conceptos?.[i] || row;
                const rowHasError = hasRowError(currentRow);
                const errorMsg = String(currentRow?.error ?? '').trim();

                const { initHasPorcentaje, initHasValor } = getInitLock(currentRow);

                const disablePorcentaje = !row.es_editable || disabled || !initHasPorcentaje;
                const disableValorMensual = !row.es_editable || disabled || !initHasValor;
                const disableSimulado = !row.es_editable || disabled;

                return (
                  <React.Fragment key={`sim-${row.id_concepto_proyecto}-${row.secuencia}-${i}`}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 15 }}>
                      <MyTextField
                        label=''
                        name={`conceptos[${i}].concepto`}
                        disabled
                        className={classes.tableRowField}
                        variant='standard'
                        margin='none'
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          marginTop: 0,
                          marginBottom: 0,
                          '& .MuiInputBase-root': { padding: 0, height: '28px' },
                          '& .MuiInputBase-input': { padding: 0, paddingLeft: esDetalle ? theme.spacing(6) : 0 },
                          '& .MuiInput-underline:before': { borderBottom: 'none' },
                          '& .MuiInput-underline:hover:before': { borderBottom: 'none' },
                          '& .MuiInput-underline:after': { borderBottom: 'none' },
                        }}
                      />

                      {row.porcentaje == null ? (
                        <MyTextField
                          label=''
                          name={`__pct_${i}`}
                          value=''
                          disabled
                          className={classes.tableRowField}
                          variant='standard'
                          margin='none'
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ style: { textAlign: 'right' } }}
                          sx={{
                            marginTop: 0,
                            marginBottom: 0,
                            '& .MuiInputBase-root': { padding: 0, height: '28px' },
                            '& .MuiInputBase-input': { padding: 0, textAlign: 'right' },
                            '& .MuiInput-underline:before': { borderBottomColor: '#e0e0e0' },
                            '& .MuiInput-underline:hover:before': { borderBottomColor: '#e0e0e0' },
                            '& .MuiInput-underline:after': { borderBottomColor: '#e0e0e0' },
                          }}
                        />
                      ) : (
                        <MyCurrencyFieldConceptosPorcentaje
                          label=''
                          name={`conceptos[${i}].porcentaje`}
                          disabled={disablePorcentaje}
                          className={classes.tableRowField}
                          variant='standard'
                          fullWidth
                          margin='none'
                          inputProps={{ style: { textAlign: 'right' } }}
                          InputLabelProps={{ shrink: true, style: { textAlign: 'right', width: '100%' } }}
                          onChange={(e) => {
                            const raw = e?.target?.value ?? '';
                            const pct = toNumberOrNull(raw);
                            setFieldValue(`conceptos[${i}].porcentaje`, raw === '' ? '' : pct ?? '', false);
                            setFieldValue(`conceptos[${i}].valor`, null, false);
                            if (rowId) touchedSimuladosRef.current.delete(rowId);
                            setFieldValue(`conceptos[${i}].simulado_manual`, false, false);
                            setFieldValue(`conceptos[${i}].valor_simulado`, null, false);
                            scheduleCalculo();
                          }}
                          sx={{
                            marginTop: 0,
                            marginBottom: 0,
                            '& .MuiInputBase-root': { padding: 0, height: '28px', borderBottom: '1px solid #e0e0e0' },
                            '& .MuiInputBase-root:hover': { borderBottom: '1px solid #e0e0e0' },
                            '& .MuiInputBase-root.Mui-disabled': { borderBottom: '1px solid #e0e0e0' },
                            '& .MuiInputBase-input': { padding: 0, textAlign: 'right' },
                          }}
                        />
                      )}

                      <MyCurrencyFieldConcepto
                        label=''
                        name={`conceptos[${i}].valor`}
                        disabled={disableValorMensual}
                        className={classes.tableRowField}
                        variant='standard'
                        fullWidth
                        margin='none'
                        inputProps={{ style: { textAlign: 'right' } }}
                        InputLabelProps={{ shrink: true, style: { textAlign: 'right', width: '100%' } }}
                        sx={{
                          marginTop: 0,
                          marginBottom: 0,
                          '& .MuiInputBase-root': { padding: 0, height: '28px', borderBottom: '1px solid #e0e0e0' },
                          '& .MuiInputBase-root:hover': { borderBottom: '1px solid #e0e0e0' },
                          '& .MuiInputBase-root.Mui-disabled': { borderBottom: '1px solid #e0e0e0' },
                          '& .MuiInputBase-input': { padding: 0, textAlign: 'right' },
                        }}
                        onChange={(e) => {
                          const raw = e?.target?.value ?? '';
                          setFieldValue(`conceptos[${i}].valor`, raw, false);
                          setFieldValue(`conceptos[${i}].porcentaje`, null, false);
                          if (rowId) touchedSimuladosRef.current.delete(rowId);
                          setFieldValue(`conceptos[${i}].simulado_manual`, false, false);
                          setFieldValue(`conceptos[${i}].valor_simulado`, null, false);
                          scheduleCalculo();
                        }}
                      />

                      {renderInputSimulado({
                        row: currentRow,
                        i,
                        rowId,
                        disabledSimulado: disableSimulado,
                        rowHasError,
                      })}
                    </Box>

                    {rowHasError && (
                      <Box sx={{ gridColumn: '1 / -1', fontSize: 12, color: theme.palette.error.main }}>
                        {errorMsg}
                      </Box>
                    )}
                  </React.Fragment>
                );
              })}
            </Box>

            {/* ===============================
              RESULTADOS SOLO SI GUARDÓ OK
            =============================== */}
            {guardadoOk && (
              <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mt: 2, mb: 2 }}>
                <MyCurrencyFieldMoneda
                  sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                  className={classes.myTextField}
                  label='VPN'
                  name='Valor_VPN_proyecto'
                  disabled
                />

                <MyCurrencyFieldPesos className={classes.myTextField} label='TIR (%)' name='porcentaje_TIR_proyecto' disabled />

                <MyCurrencyFieldPotencia
                  sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                  className={classes.myTextField}
                  label='PBT (Años)'
                  name='anios_PBT'
                  disabled
                />
              </Box>
            )}
          </Box>

          {/* ===============================
              BOTONES: ocultar Guardar al guardar OK
          =============================== */}
          <Box className={classes.bottomsGroup}>
            {accion !== 'ver' && !hideGuardar ? (
              <Button
                sx={{
                  paddingLeft: 15,
                  paddingRight: 15,
                  color: 'white',
                  '&:hover': { backgroundColor: theme.palette.colorHovers, cursor: 'pointer', boxShadow: 'none' },
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: 'none',
                }}
                variant='contained'
                type='submit'
              >
                <IntlMessages id='boton.submit' />
              </Button>
            ) : null}

            {
              !hideGuardar ? (
                <Button
                  sx={{
                    paddingLeft: 15,
                    paddingRight: 15,
                    color: 'white !important',
                    '&:hover': { backgroundColor: theme.palette.colorHovers, cursor: 'pointer' },
                    backgroundColor: theme.palette.secondary.light,
                  }}
                  onClick={onGoBack}
                >
                  Cancelar
                </Button>
              ) : (
                <Button
                  sx={{
                    paddingLeft: 15,
                    paddingRight: 15,
                    color: 'white !important',
                    '&:hover': { backgroundColor: theme.palette.colorHovers, cursor: 'pointer' },
                    backgroundColor: theme.palette.secondary.light,
                  }}
                  onClick={onGoBack}
                >
                  Terminar
                </Button>
              )
            }
            
          </Box>
        </Box>
      </AppScrollbar>
    </Form>
  );
};

SimulacionPorProyectoForm.propTypes = {
  handleOnClose: PropTypes.func,
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
  proyectos: PropTypes.any,
  headProyecto: PropTypes.any,
  selectedRow: PropTypes.any,
  porcentajePerdidaEficiencia: PropTypes.any,
  precioEnergia: PropTypes.any,
  porcentajeIPC: PropTypes.any,
  porcentajeIncrementoPrecio: PropTypes.any,
  porcentajeOportunidad: PropTypes.any,
  savePayload: PropTypes.any,
  guardadoOk: PropTypes.bool,
  idConceptoKwhBolsa: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  idConceptoPrecioBolsa: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  idConceptoKwhComunidad: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  idConceptoPrecioComunidad: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  idVentaBolsa:PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  idVentaComunidad: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default SimulacionPorProyectoForm;