import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Box, Button, Input } from '@mui/material';
import { Form, useFormikContext } from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import AppScrollbar from '@crema/components/AppScrollbar';
import Tooltip from '@mui/material/Tooltip';
import { ArrowBackIos } from '@mui/icons-material';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Fonts } from '../../../../shared/constants/AppEnums';
import MyTextField from '../../../../shared/components/MyTextField';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import MyDateField from '../../../../shared/components/MyDateField';
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import MyCurrencyFieldMoneda from '../../../../shared/components/MyCurrencyFieldMoneda';
import MyCurrencyFieldConcepto from '../../../../shared/components/MyCurrencyFieldConceptos';
import MyCurrencyFieldPotenciaConcepto from '../../../../shared/components/MyCurrencyFieldPotenciaConcepto';
import MyCurrencyFieldPotencia from '../../../../shared/components/MyCurrencyFieldPotencia';
import MyCurrencyFieldConceptosPorcentaje from '../../../../shared/components/MyCurrencyFieldConceptosPorcentaje';
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
  const classes = useStyles(props);

  const formik = useFormikContext();
  if (!formik) return null;

  const { setFieldValue, values: formikValues } = formik;

  const {
    accion,
    titulo,
    proyectos,
    headProyecto,
    selectedRow,
    savePayload,
    guardadoOk: guardadoOkProp,
    idConceptoKwhBolsa,
    idConceptoPrecioBolsa,
    idConceptoKwhComunidad,
    idConceptoPrecioComunidad,
    idVentaBolsa,
    idVentaComunidad,
    id_simulacion,
  } = props;

  const [disabled, setDisabled] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [hideGuardar, setHideGuardar] = useState(false);
  const [proyectoId, setProyectoId] = useState(false);

  const recalcRef = useRef(false);
  const sourceCambioInversionRef = useRef(null);
  const bootLoadedRef = useRef(false);
  const conceptosPersistidosRef = useRef([]);

  useEffect(() => {
    setProyectoId(headProyecto?.id_proyecto);
  }, [headProyecto?.id_proyecto]);

  useEffect(() => {
    if (accion === 'ver' || formikValues?.estado === '0') {
      setDisabled(true);
    }
  }, [accion, formikValues?.estado]);

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

  const numOr0 = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const normalizeConcepto = useCallback((c) => {
    const obj = { ...c };

    const porcentajeNum = toNumberOrNull(obj.porcentaje);
    const valorMensualNum = toNumberOrNull(obj.valor_mensual_concepto ?? obj.valor);
    const valorSimuladoNum = toNumberOrNull(obj.valor_simulado);
    const valorOriginalNum =
      toNumberOrNull(obj.valor_original) ??
      toNumberOrNull(obj.valor_simulado) ??
      0;

    return {
      ...obj,
      id_concepto_proyecto: obj.id_concepto_proyecto ?? obj.id ?? null,
      id_concepto: obj.id_concepto ?? null,
      secuencia: Number(obj.secuencia ?? 0),
      concepto: obj.concepto ?? obj.nombre ?? '',
      indicativo_tipo_linea: obj.indicativo_tipo_linea ?? '',
      indicativo_tipo_concepto: obj.indicativo_tipo_concepto ?? '',
      indicativo_tipo_valor: obj.indicativo_tipo_valor ?? 'V',
      es_editable: Boolean(obj.es_editable),
      indentado: Boolean(obj.indentado ?? (obj.indicativo_tipo_linea === 'D')),
      porcentaje: porcentajeNum === null ? '' : porcentajeNum,
      valor: valorMensualNum === null ? '' : valorMensualNum,
      valor_mensual_concepto: valorMensualNum === null ? '' : valorMensualNum,
      valor_original: valorOriginalNum === null ? '' : valorOriginalNum,
      valor_simulado: valorSimuladoNum === null ? '' : valorSimuladoNum,
      simulado_manual: false,
    };
  }, []);

  const recalcularConceptosInversionista = useCallback(
    (conceptos = [], porcentaje = 0) => {
      const pct = Number(porcentaje || 0);

      return (conceptos || []).map((c) => {
        const valorOriginalBase =
          toNumberOrNull(c?.valor_original) ??
          toNumberOrNull(c?.valor_simulado) ??
          0;

        const tipo = String(c?.indicativo_tipo_valor ?? '').toUpperCase();

        if (['C', 'V'].includes(tipo)) {
          return {
            ...c,
            valor_original: valorOriginalBase,
            valor_simulado: (valorOriginalBase * pct) / 100,
          };
        }

        return {
          ...c,
          valor_original: valorOriginalBase,
          valor_simulado: valorOriginalBase,
        };
      });
    },
    [],
  );

  const IDS_SOLO_BO_PROY = useMemo(() => {
    return new Set(
      [numOr0(idConceptoKwhBolsa), numOr0(idConceptoPrecioBolsa), numOr0(idVentaBolsa)].filter(Boolean),
    );
  }, [idConceptoKwhBolsa, idConceptoPrecioBolsa, idVentaBolsa]);

  const IDS_SOLO_CE_PROY = useMemo(() => {
    return new Set(
      [numOr0(idConceptoKwhComunidad), numOr0(idConceptoPrecioComunidad), numOr0(idVentaComunidad)].filter(Boolean),
    );
  }, [idConceptoKwhComunidad, idConceptoPrecioComunidad, idVentaComunidad]);

  const aplicaAlModelo = useCallback(
    (row, modelo) => {
      const m = String(modelo || '').trim().toUpperCase();
      const idConceptoProyecto = Number(row?.id_concepto_proyecto ?? row?.id ?? 0);

      if (!idConceptoProyecto) return true;
      if (m === 'CE') return !IDS_SOLO_BO_PROY.has(idConceptoProyecto);
      if (m === 'BO') return !IDS_SOLO_CE_PROY.has(idConceptoProyecto);

      return true;
    },
    [IDS_SOLO_BO_PROY, IDS_SOLO_CE_PROY],
  );

  const conceptosVisibles = useMemo(() => {
    const modelo = formikValues?.indicativo_modelo_ccial ?? null;
    const conceptos = Array.isArray(formikValues?.conceptos) ? formikValues.conceptos : [];

    return conceptos
      .map((row, idx) => ({ row, idx }))
      .filter(({ row }) => aplicaAlModelo(row, modelo));
  }, [formikValues?.conceptos, formikValues?.indicativo_modelo_ccial, aplicaAlModelo]);

  useEffect(() => {
    const conceptosOrigen = Array.isArray(selectedRow?.conceptos) ? selectedRow.conceptos : [];
    const conceptosActuales = Array.isArray(formikValues?.conceptos) ? formikValues.conceptos : [];

    if (conceptosOrigen.length > 0) {
      conceptosPersistidosRef.current = conceptosOrigen;
    }

    if (!conceptosOrigen.length) return;
    if (conceptosActuales.length > 0 && bootLoadedRef.current) return;

    const finalRows = conceptosOrigen.map((c) =>
      normalizeConcepto({
        ...c,
        valor: c.valor_mensual_concepto ?? c.valor ?? 0,
        valor_mensual_concepto: c.valor_mensual_concepto ?? c.valor ?? 0,
        valor_original: c.valor_original ?? c.valor_simulado ?? 0,
        valor_simulado: c.valor_simulado ?? 0,
        porcentaje: c.porcentaje ?? 0,
      }),
    );

    conceptosPersistidosRef.current = finalRows;
    setFieldValue('conceptos', finalRows, false);
    bootLoadedRef.current = true;
  }, [selectedRow?.conceptos, formikValues?.conceptos, setFieldValue, normalizeConcepto]);

  useEffect(() => {
    if (recalcRef.current) return;

    const valorTotal = Number(toNumberOrNull(formikValues?.valor_total_proyecto) || 0);
    const porcentaje = Number(toNumberOrNull(formikValues?.porcentaje_part_inversionista) || 0);
    const valorInversion = Number(toNumberOrNull(formikValues?.valor_part_inversionista) || 0);
    const conceptos = Array.isArray(formikValues?.conceptos) && formikValues.conceptos.length > 0
      ? formikValues.conceptos
      : conceptosPersistidosRef.current;

    if (!Array.isArray(conceptos) || conceptos.length === 0) return;

    recalcRef.current = true;

    if (sourceCambioInversionRef.current === 'porcentaje') {
      const nuevoValor = valorTotal > 0 ? (valorTotal * porcentaje) / 100 : 0;
      const nuevosConceptos = recalcularConceptosInversionista(conceptos, porcentaje);

      conceptosPersistidosRef.current = nuevosConceptos;
      setFieldValue('valor_part_inversionista', nuevoValor, false);
      setFieldValue('conceptos', nuevosConceptos, false);
    }

    if (sourceCambioInversionRef.current === 'valor') {
      const nuevoPorcentaje = valorTotal > 0 ? (valorInversion / valorTotal) * 100 : 0;
      const nuevosConceptos = recalcularConceptosInversionista(conceptos, nuevoPorcentaje);

      conceptosPersistidosRef.current = nuevosConceptos;
      setFieldValue('porcentaje_part_inversionista', nuevoPorcentaje, false);
      setFieldValue('conceptos', nuevosConceptos, false);
    }

    sourceCambioInversionRef.current = null;
    recalcRef.current = false;
  }, [
    formikValues?.porcentaje_part_inversionista,
    formikValues?.valor_part_inversionista,
    formikValues?.valor_total_proyecto,
    formikValues?.conceptos,
    setFieldValue,
    recalcularConceptosInversionista,
  ]);

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

    if (Array.isArray(data?.conceptos) && data.conceptos.length > 0) {
      const normalizados = data.conceptos.map((c) => normalizeConcepto(c));
      conceptosPersistidosRef.current = normalizados;
      setFieldValue('conceptos', normalizados, false);
    }
  };

  useEffect(() => {
    if (guardadoOkProp) {
      setGuardadoOk(true);
      setHideGuardar(true);
      setDisabled(true);
    }
  }, [guardadoOkProp]);

  useEffect(() => {
    if (!savePayload) return;

    setGuardadoOk(true);
    setHideGuardar(true);
    setDisabled(true);
    applyResultadosFromBack(savePayload);
  }, [savePayload]); // eslint-disable-line react-hooks/exhaustive-deps

  const getTipoValor = (row) => String(row?.indicativo_tipo_valor ?? 'V').toUpperCase();

  const renderValorSimulado = ({ row, i }) => {
    const tipo = getTipoValor(row);

    const commonProps = {
      label: '',
      name: `conceptos[${i}].valor_simulado`,
      disabled: true,
      className: classes.tableRowField,
      variant: 'standard',
      fullWidth: true,
      margin: 'none',
      inputProps: { style: { textAlign: 'right' } },
      InputLabelProps: { shrink: true, style: { textAlign: 'right', width: '100%' } },
      sx: {
        marginTop: 0,
        marginBottom: 0,
        '& .MuiInputBase-root': {
          padding: 0,
          height: '28px',
          borderBottom: '1px solid #e0e0e0',
        },
        '& .MuiInputBase-root:hover': {
          borderBottom: '1px solid #e0e0e0',
        },
        '& .MuiInputBase-root.Mui-disabled': {
          borderBottom: '1px solid #e0e0e0',
        },
        '& .MuiInputBase-input': {
          padding: 0,
          textAlign: 'right',
          borderBottom: '0px !important',
        },
      },
    };

    if (tipo === 'R') {
      return <MyCurrencyFieldConceptosPorcentaje {...commonProps} />;
    }

    if (tipo === 'C') {
      return <MyCurrencyFieldPotenciaConcepto {...commonProps} />;
    }

    return <MyCurrencyFieldConcepto {...commonProps} />;
  };

  const onGoBack = () => {
    navigate('/simulaciones-por-inversionista/' + selectedRow?.simulacion?.id_simulacion_origen + '/' + proyectoId + '/' + selectedRow?.simulacion?.indicativo_modelo_ccial); 
  };

  console.log(conceptosVisibles)

  return (
    <Form noValidate autoComplete='off'>
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
                options={MODELO_COMERCIALIZACION_ENERGIA}
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 } }}
                name='indicativo_modelo_ccial'
                label='Modelo comercialización'
                disabled
                className={classes.myTextField}
                variant='standard'
                fullWidth
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
                required
              />
            </Box>
            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <MyTextField
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                className={classes.myTextField}
                label='Teléfono'
                name='telefono_inversionista'
                disabled={disabled}
                required
              />

              <MyTextField
                className={classes.myTextField}
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                label='Correo electrónico'
                required
                name='email_inversionista'
                disabled={disabled}
              />
              <MyCurrencyFieldPesos
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 } }}
                className={classes.myTextField}
                label='Porcentaje inversión (%)'
                name='porcentaje_part_inversionista'
                disabled={disabled}
                onChange={(e) => {
                  sourceCambioInversionRef.current = 'porcentaje';
                  setFieldValue('porcentaje_part_inversionista', e?.target?.value ?? '', false);
                }}
                required
              />
            </Box>

            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              

              <MyCurrencyFieldMoneda
                className={classes.myTextField}
                sx={{ [theme.breakpoints.up('xl')]: { marginBottom: 5 }, paddingRight: 4 }}
                label='Valor inversión'
                name='valor_part_inversionista'
                disabled={disabled}
                required
                onChange={(e) => {
                  sourceCambioInversionRef.current = 'valor';
                  setFieldValue('valor_part_inversionista', e?.target?.value ?? '', false);
                }}
              />
            </Box>

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

              {conceptosVisibles.map(({ row, idx: i }) => {
                const esDetalle = row.indicativo_tipo_linea === 'D';

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
                          '& .MuiInputBase-input': {
                            padding: 0,
                            paddingLeft: esDetalle ? theme.spacing(6) : 0,
                          },
                          '& .MuiInput-underline:before': { borderBottom: 'none' },
                          '& .MuiInput-underline:hover:before': { borderBottom: 'none' },
                          '& .MuiInput-underline:after': { borderBottom: 'none' },
                        }}
                      />

                      <MyCurrencyFieldConceptosPorcentaje
                        label=''
                        name={`conceptos[${i}].porcentaje`}
                        disabled
                        className={classes.tableRowField}
                        variant='standard'
                        fullWidth
                        margin='none'
                        inputProps={{ style: { textAlign: 'right' } }}
                        InputLabelProps={{ shrink: true, style: { textAlign: 'right', width: '100%' } }}
                        sx={{
                          marginTop: 0,
                          marginBottom: 0,
                          '& .MuiInputBase-root': {
                            padding: 0,
                            height: '28px',
                            borderBottom: '1px solid #e0e0e0',
                          },
                          '& .MuiInputBase-root:hover': {
                            borderBottom: '1px solid #e0e0e0',
                          },
                          '& .MuiInputBase-root.Mui-disabled': {
                            borderBottom: '1px solid #e0e0e0',
                          },
                          '& .MuiInputBase-input': { padding: 0, textAlign: 'right' },
                        }}
                      />

                      <MyCurrencyFieldConcepto
                        label=''
                        name={`conceptos[${i}].valor_mensual_concepto`}
                        disabled
                        className={classes.tableRowField}
                        variant='standard'
                        fullWidth
                        margin='none'
                        inputProps={{ style: { textAlign: 'right' } }}
                        InputLabelProps={{ shrink: true, style: { textAlign: 'right', width: '100%' } }}
                        sx={{
                          marginTop: 0,
                          marginBottom: 0,
                          '& .MuiInputBase-root': {
                            padding: 0,
                            height: '28px',
                            borderBottom: '1px solid #e0e0e0',
                          },
                          '& .MuiInputBase-root:hover': {
                            borderBottom: '1px solid #e0e0e0',
                          },
                          '& .MuiInputBase-root.Mui-disabled': {
                            borderBottom: '1px solid #e0e0e0',
                          },
                          '& .MuiInputBase-input': { padding: 0, textAlign: 'right' },
                        }}
                      />

                      {renderValorSimulado({ row, i })}
                    </Box>
                  </React.Fragment>
                );
              })}
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

              <MyTextField
                className={classes.myTextField}
                label='TIR (%)'
                name='porcentaje_TIR_proyecto'
                disabled
              />

              <MyTextField
                className={classes.myTextField}
                label='PBT (Años)'
                name='anios_PBT'
                disabled
              />
            </Box>
          </Box>

          <Box className={classes.bottomsGroup}>
            {accion !== 'ver' && !hideGuardar ? (
              <Button
                sx={{
                  paddingLeft: 15,
                  paddingRight: 15,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.colorHovers,
                    cursor: 'pointer',
                    boxShadow: 'none',
                  },
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: 'none',
                }}
                variant='contained'
                type='submit'
              >
                <IntlMessages id='boton.submit' />
              </Button>
            ) : null}

            {!hideGuardar ? (
              <Button
                sx={{
                  paddingLeft: 15,
                  paddingRight: 15,
                  color: 'white !important',
                  '&:hover': {
                    backgroundColor: theme.palette.colorHovers,
                    cursor: 'pointer',
                  },
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
                  '&:hover': {
                    backgroundColor: theme.palette.colorHovers,
                    cursor: 'pointer',
                  },
                  backgroundColor: theme.palette.secondary.light,
                }}
                onClick={onGoBack}
              >
                Terminar
              </Button>
            )}
          </Box>
        </Box>
      </AppScrollbar>
    </Form>
  );
};

SimulacionPorProyectoForm.propTypes = {
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  selectedRow: PropTypes.any,
  proyectos: PropTypes.any,
  headProyecto: PropTypes.any,
  savePayload: PropTypes.any,
  guardadoOk: PropTypes.bool,
  idConceptoKwhBolsa: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  idConceptoPrecioBolsa: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  idConceptoKwhComunidad: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  idConceptoPrecioComunidad: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  idVentaBolsa: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  idVentaComunidad: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default SimulacionPorProyectoForm;