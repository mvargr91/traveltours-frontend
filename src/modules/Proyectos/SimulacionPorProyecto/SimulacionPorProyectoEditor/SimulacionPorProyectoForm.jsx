// ===============================
// SimulacionPorProyectoForm.jsx (COMPLETO)
// FIX:
// - Recalcular SOLO cuando ya terminó de cargar la info (BD/plantilla)
// - En EDITAR: carga conceptos desde selectedRow.conceptos (sin recalcular al inicio)
// - En EDITAR: también hidrata VPN / TIR / PBT desde selectedRow.simulacion (si vienen)
// - Tras GUARDAR: hidrata VPN/TIR/PBT y reemplaza conceptos por los procesados del back
// - VPN/TIR/PBT SIEMPRE visibles en esta UI (disabled)
// - No convierte null a 0 (se queda null/'' para que se vea vacío)
// ===============================

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
    porcentajePerdidaEficiencia,
    precioEnergia,
    porcentajeIPC,
    porcentajeIncrementoPrecio, 
    savePayload,
    guardadoOk: guardadoOkProp,
  } = props;

  const [disabled, setDisabled] = useState(false);
  const [proyectoId, setProyectoId] = useState(false);

  // Spinner/Backdrop esperando back
  const [loadingCalc, setLoadingCalc] = useState(false);

  // Mostrar resultados solo tras guardar OK
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [hideGuardar, setHideGuardar] = useState(false);

  // Debounce
  const timerRef = useRef(null);
  const DEBOUNCE_MS = 1100;

  // Evitar doble request simultáneo
  const recalculandoRef = useRef(false);

  // Locks de “boot”
  const bootLoadedRef = useRef(false);
  const watchReadyRef = useRef(false);
  const bootingRef = useRef(false);

  // Mantener últimos valores para que “la primera vez” no dispare
  const lastModeloRef = useRef(undefined);
  const lastAniosDepRef = useRef(undefined);

  // id depreciación si viene del back
  const idDepreciacionRef = useRef(null);

  // manual por fila
  const touchedSimuladosRef = useRef(new Set());

  // conceptos BD en ref
  const conceptosDBRef = useRef([]);
  const simIdRef = useRef(null);

  // Ref con valores más recientes (evitar closures viejos)
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
    else setDisabled(false);
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

  const normalizeConcepto = (c) => {
    const obj = { ...c };
    obj.id_concepto = obj.id_concepto ?? obj.id_concepto_proyecto ?? obj.id ?? null;

    const porcentajeNum = toNumberOrNull(obj.porcentaje);
    const valorNum = toNumberOrNull(obj.valor);
    const simNum = toNumberOrNull(obj.valor_simulado);

    return {
      ...obj,
      secuencia: Number(obj.secuencia ?? 0),
      concepto: obj.concepto ?? obj.nombre ?? '',
      es_editable: Boolean(obj.es_editable),
      indentado: Boolean(obj.indentado),

      // vacío se queda vacío
      porcentaje: porcentajeNum === null ? '' : porcentajeNum,

      // vacío se queda vacío
      valor: valorNum === null ? '' : obj.valor,

      // vacío se queda vacío
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
  // Resultados (VPN/TIR/PBT) + conceptos procesados
  // ==========================================================
  const unwrapPayload = (payload) => {
    if (!payload) return null;
    return payload?.datos ?? payload?.data?.datos ?? payload?.data ?? payload;
  };

  const applyResultadosFromBack = (payloadAny) => {
    const data = unwrapPayload(payloadAny);
    if (!data) return;

    // NO forzar a 0: si no hay dato, queda null
    const vpn = data?.vpn ?? data?.Valor_VPN_proyecto ?? null;
    const tir = data?.tir ?? data?.porcentaje_TIR_proyecto ?? null;
    const pbt = data?.pbt ?? data?.anios_PBT ?? null;

    setFieldValue('Valor_VPN_proyecto', vpn, false);
    setFieldValue('porcentaje_TIR_proyecto', tir, false);
    setFieldValue('anios_PBT', pbt, false);

    if (data?.indicativo_modelo_ccial != null) {
      setFieldValue('indicativo_modelo_ccial', data.indicativo_modelo_ccial ?? '', false);
    }
    if (data?.porcentaje_perdida_efic != null) {
      setFieldValue('porcentaje_perdida_efic', data.porcentaje_perdida_efic ?? '', false);
    }
    if (data?.porcentaje_tasa_oportunidad != null) {
      setFieldValue('porcentaje_tasa_oportunidad', data.porcentaje_tasa_oportunidad ?? '', false);
    }
    if (data?.porcentaje_IPC != null) {
      setFieldValue('porcentaje_IPC', data.porcentaje_IPC ?? '', false);
    }
    if (data?.anios_depreciacion != null) {
      setFieldValue('anios_depreciacion', data.anios_depreciacion ?? '', false);
    }
    if (data?.porcentaje_reduccion_tarifa != null) {
      setFieldValue('porcentaje_reduccion_tarifa', data.porcentaje_reduccion_tarifa ?? '', false);
    }
    

    // si vienen conceptos procesados, reemplaza la tabla
    if (Array.isArray(data?.conceptos)) {
      const finalRows = data.conceptos.map(normalizeConcepto);
      setFieldValue('conceptos', finalRows, false);

      // refrescar locks y manuales en base a lo que venga del back
      touchedSimuladosRef.current = new Set(
        finalRows.filter((r) => !!r.simulado_manual).map((r) => getRowKey(r)),
      );

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
    }
  };

  useEffect(() => {
    if (guardadoOkProp) {
      setGuardadoOk(true);
      setHideGuardar(true);
      setDisabled(true);
      recalculandoRef.current = true;
    } else {
      setGuardadoOk(false);
      setHideGuardar(false);
    }
  }, [guardadoOkProp]);

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
  // Locks (porcentaje / valor) según lo que venía inicialmente
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

  const getTipoValor = (row) => String(row?.indicativo_tipo_valor ?? 'V').toUpperCase();

  const scheduleCalculo = (ms = DEBOUNCE_MS) => {
    if (guardadoOk) return;
    if (disabled) return;

    if (bootingRef.current) return;
    if (!bootLoadedRef.current) return;
    if (!watchReadyRef.current) return;

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

  // ==========================================================
  // Render input valor_simulado según tipo
  // ==========================================================
  const renderInputSimulado = ({ row, i, rowId, disabledSimulado }) => {
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
      if (bootingRef.current) return;
      if (rowId) touchedSimuladosRef.current.add(rowId);
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
          onChange={(e) => markManualAndSchedule(e?.target?.value ?? '')}
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
          onChange={(e) => markManualAndSchedule(e?.target?.value ?? '')}
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
        step='any'
        fullWidth
        margin='none'
        inputProps={{ style: { textAlign: 'right' } }}
        InputLabelProps={{ shrink: true, style: { textAlign: 'right', width: '100%' } }}
        sx={commonSx}
        onChange={(e) => markManualAndSchedule(e?.target?.value ?? '')}
      />
    );
  };

  // ==========================================================
  // CARGA DE CONCEPTOS: CREAR vs EDITAR
  // ==========================================================
  useEffect(() => {
    if (!values.id_tipo_proyecto) return;

    bootingRef.current = true;

    bootLoadedRef.current = false;
    watchReadyRef.current = false;
    lastModeloRef.current = undefined;
    lastAniosDepRef.current = undefined;

    if (timerRef.current) clearTimeout(timerRef.current);

    const finalizarBoot = () => {
      setTimeout(() => {
        bootLoadedRef.current = true;

        const nowVals = latestValuesRef.current;
        lastModeloRef.current = nowVals?.indicativo_modelo_ccial ?? null;
        lastAniosDepRef.current = toNumberOrNull(nowVals?.anios_depreciacion);

        watchReadyRef.current = true;
        bootingRef.current = false;
      }, 0);
    };

    // ==========================
    // EDITAR
    // ==========================
    if (accion === 'editar') {
      const conceptosEdit = Array.isArray(selectedRow?.conceptos) ? selectedRow.conceptos : [];
      if (!conceptosEdit.length) return;

      const finalRows = conceptosEdit.map(normalizeConcepto);

      touchedSimuladosRef.current = new Set(
        finalRows.filter((r) => !!r.simulado_manual).map((r) => getRowKey(r)),
      );

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

      // hidratar VPN/TIR/PBT desde BD si vienen en selectedRow.simulacion
      applyResultadosFromBack(selectedRow?.simulacion);

      finalizarBoot();
      return;
    }

    // ==========================
    // CREAR/VER
    // ==========================
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

      touchedSimuladosRef.current = new Set(
        (finalRows || []).filter((r) => !!r.simulado_manual).map((r) => getRowKey(r)),
      );

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

      if (accion === 'crear') {
        setFieldValue('porcentaje_perdida_efic', porcentajePerdidaEficiencia, false);
        setFieldValue('porcentaje_IPC', porcentajeIPC, false);
      }

      finalizarBoot();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accion,
    values.id_tipo_proyecto,
    values.id,
    selectedRow?.conceptos,
    selectedRow?.simulacion,
    porcentajePerdidaEficiencia,
    porcentajeIPC,
  ]);

  // ==========================================================
  // Construcción params + cálculo
  // ==========================================================
  const buildParams = (vals) => {
    const emptyToNull = (vv) => (vv === '' || vv === undefined ? null : vv);

    const conceptos = (vals.conceptos || []).map((c) => ({
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
      porcentaje_reduccion_tarifa: isEmptyMoney(vals.porcentaje_reduccion_tarifa) ? null : toNumberOrNull(vals.porcentaje_reduccion_tarifa),
      porcentaje_IPC: isEmptyMoney(vals.porcentaje_IPC) ? null : toNumberOrNull(vals.porcentaje_IPC),
      anios_depreciacion: isEmptyMoney(vals.anios_depreciacion) ? null : toNumberOrNull(vals.anios_depreciacion),
      porcentaje_tasa_oportunidad: isEmptyMoney(vals.porcentaje_tasa_oportunidad) ? null : toNumberOrNull(vals.porcentaje_tasa_oportunidad),
      conceptos,
    };
  };

  const calcularAhora = async () => {
    if (guardadoOk) return;
    const vals = latestValuesRef.current;

    if (disabled) return;

    if (bootingRef.current) return;
    if (!bootLoadedRef.current) return;
    if (!watchReadyRef.current) return;

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
  // WATCHERS (solo después del boot)
  // ==========================================================
  useEffect(() => {
    if (disabled) return;
    if (guardadoOk) return;
    if (bootingRef.current) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikValues.indicativo_modelo_ccial, disabled, guardadoOk]);

  useEffect(() => {
    if (disabled) return;
    if (guardadoOk) return;
    if (bootingRef.current) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikValues.anios_depreciacion, disabled, guardadoOk]);

  // ==========================================================
  // Navegación
  // ==========================================================
  const onGoBack = () => {
    navigate('/simulaciones-por-proyectos/' + proyectoId);
  };

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

            <Box
              component='h6'
              mb={{ xs: 4, xl: 6 }}
              fontSize={20}
              fontWeight={Fonts.MEDIUM}
              style={{ flex: '1 1 100%', fontWeight: 'bold' }}
            >
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
                  if (bootingRef.current) return;
                  setFieldValue('porcentaje_perdida_efic', e?.target?.value ?? '', false);
                  scheduleCalculo();
                }}
              />
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
                required
                onChange={(e) => {
                  if (bootingRef.current) return;
                  setFieldValue('porcentaje_tasa_oportunidad', e?.target?.value ?? '', false);
                  scheduleCalculo();
                }}
              />
              <MyCurrencyFieldPesos
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }}}
                className={classes.myTextField}
                label='IPC(%)'
                name='porcentaje_IPC'
                disabled={disabled}
                required
                onChange={(e) => {
                  if (bootingRef.current) return;
                  setFieldValue('porcentaje_IPC', e?.target?.value ?? '', false);
                  scheduleCalculo();
                }}
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>       
              <MyCurrencyField
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4  }}
                className={classes.myTextField}
                label='Años depreciacion'
                name='anios_depreciacion'
                disabled={disabled}
                onChange={(e) => {
                  if (bootingRef.current) return;
                  setFieldValue('anios_depreciacion', e?.target?.value ?? '', false);
                  scheduleCalculo();
                }}
                required
              />
            </Box>
            {/* ===============================
              Tabla conceptos
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

              {formikValues.conceptos?.map((row, i) => {
                const esDetalle = row.indicativo_tipo_linea === 'D';
                const rowId = getRowKey(row);
                const currentRow = formikValues.conceptos?.[i] || row;

                const { initHasPorcentaje, initHasValor } = getInitLock(currentRow);

                const disablePorcentaje = !row.es_editable || disabled || !initHasPorcentaje;
                const disableValorMensual = !row.es_editable || disabled || !initHasValor;
                const disableSimulado = !row.es_editable || disabled;

                return (
                  <Box
                    key={`sim-${row.id_concepto_proyecto}-${row.secuencia}-${i}`}
                    sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 15 }}
                  >
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
                          if (bootingRef.current) return;
                          const raw = e?.target?.value ?? '';
                          const pct = toNumberOrNull(raw);
                          setFieldValue(`conceptos[${i}].porcentaje`, raw === '' ? '' : (pct ?? ''), false);
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
                        if (bootingRef.current) return;
                        const raw = e?.target?.value ?? '';
                        setFieldValue(`conceptos[${i}].valor`, raw, false);
                        setFieldValue(`conceptos[${i}].porcentaje`, null, false);
                        if (rowId) touchedSimuladosRef.current.delete(rowId);
                        setFieldValue(`conceptos[${i}].simulado_manual`, false, false);
                        setFieldValue(`conceptos[${i}].valor_simulado`, null, false);
                        scheduleCalculo();
                      }}
                    />

                    {renderInputSimulado({ row: currentRow, i, rowId, disabledSimulado: disableSimulado })}
                  </Box>
                );
              })}
            </Box>
             {/* ===============================
              RESULTADOS (VPN/TIR/PBT) - SIEMPRE visibles (disabled)
            =============================== */}
            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, mt: 2 }}>
              <MyCurrencyFieldMoneda className={classes.myTextField} label='VPN' name='Valor_VPN_proyecto' disabled />
              <MyCurrencyFieldPesos className={classes.myTextField} label='TIR (%)' name='porcentaje_TIR_proyecto' disabled />
              <MyCurrencyFieldPotencia className={classes.myTextField} label='PBT (años)' name='anios_PBT' disabled />
            </Box>
          </Box>

          {/* BOTONES */}
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
              <IntlMessages id='boton.cancel' />
            </Button>
          </Box>
        </Box>
      </AppScrollbar>
    </Form>
  );
};

SimulacionPorProyectoForm.propTypes = {
  accion: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
  proyectos: PropTypes.any,
  headProyecto: PropTypes.any,
  selectedRow: PropTypes.any,
  porcentajePerdidaEficiencia: PropTypes.any,
  porcentajeIPC: PropTypes.any,
  porcentajeIncrementoPrecio: PropTypes.any,
  savePayload: PropTypes.any,
  guardadoOk: PropTypes.bool,
};

export default SimulacionPorProyectoForm;
