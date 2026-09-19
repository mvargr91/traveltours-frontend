// TablaDetalleConceptos.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.common.black,
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    background: '#fff',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '11px',
    whiteSpace: 'nowrap',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-child td, &:last-child th': { border: 0 },
}));

const stickyLeftSx = {
  position: 'sticky',
  left: 0,
  zIndex: 4,
  background: '#fff',
  boxShadow: '2px 0 5px -2px rgba(0,0,0,0.12)',
};

const stickyHeadSx = {
  position: 'sticky',
  top: 0,
  zIndex: 3,
  background: '#fff',
};

const stickyHeadLeftSx = {
  ...stickyHeadSx,
  ...stickyLeftSx,
  zIndex: 5,
};

// =====================
// Helpers
// =====================
function normConceptName(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * ===========================
 * FORMATTERS
 * (si viene null/undefined -> vacío)
 * ===========================
 */
function toNumberOrNull(v) {
  if (v === null || v === undefined || v === '') return null;

  // ya viene number
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;

  // normalizar string estilo es-CO: "1.234,56" -> "1234.56"
  const s = String(v).trim();
  if (!s) return null;

  const normalized = s
    .replace(/\s/g, '')
    .replace(/\$/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function moneyFormatter(v) {
  const n = toNumberOrNull(v);
  if (n === null) return '';
  return Math.round(n).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

function percentFormatter(v) {
  const n = toNumberOrNull(v);
  if (n === null) return '';
  return `${n.toLocaleString('es-CO', { maximumFractionDigits: 0 })}%`;
}

function quantityFormatter(v) {
  const n = toNumberOrNull(v);
  if (n === null) return '';
  return n.toLocaleString('es-CO', { maximumFractionDigits: 2 });
}

/**
 * Formateo por atributo indicativo_tipo_valor:
 *  V = Valor (moneda)
 *  R = Ratio/Porcentaje
 *  C = Cantidad (número)
 *  P = Precio (número) 
 */
function getTipoValor(row) {
  return String(row?.indicativo_tipo_valor ?? 'V').toUpperCase();
}

function getFormatterByTipoValor(row) {
  const tipo = getTipoValor(row);
  if (tipo === 'R') return percentFormatter;
  if (tipo === 'C') return quantityFormatter;
  if (tipo === 'P') return quantityFormatter; 
  return moneyFormatter; // default V
}

/**
 * Indentación: si es detalle (indicativo_tipo_linea === 'D') o indentado === true
 */
function isDetalleRow(row) {
  return (
    String(row?.indicativo_tipo_linea ?? '').toUpperCase() === 'D' ||
    !!row?.indentado
  );
}

function getConceptId(row) {
  const n = Number(row?.id_concepto_proyecto);
  return Number.isFinite(n) ? n : null;
}

/**
 *
 * Solo totaliza si tipo valor es C o V
 */
function tipoValorTieneTotal(row) {
  const tipo = getTipoValor(row);
  return tipo === 'C' || tipo === 'V';
}

// =====================
// Componente
// =====================
const TablaDetalleConceptos = ({ detalle }) => {
  const years = useMemo(() => {
    const ys = Array.isArray(detalle?.years) ? detalle.years : [];
    return ys
      .map((y) => Number(y))
      .filter((y) => !Number.isNaN(y))
      .sort((a, b) => a - b);
  }, [detalle?.years]);

  // Columnas "Año 1..Año N"
  const cols = useMemo(
    () =>
      years.map((realYear, idx) => ({
        realYear,
        label: `Año ${idx + 1}`,
      })),
    [years]
  );

  const rows = useMemo(
    () => (Array.isArray(detalle?.rows) ? detalle.rows : []),
    [detalle?.rows]
  );

  if (!cols.length || !rows.length) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', maxHeight: 'auto' }}>
          <Table size="small" aria-label="detalle conceptos">
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ ...stickyHeadLeftSx, minWidth: 260 }}>
                  Concepto
                </StyledTableCell>

                {cols.map((c) => (
                  <StyledTableCell
                    key={c.realYear}
                    align="right"
                    sx={{ ...stickyHeadSx, minWidth: 120 }}
                  >
                    {c.label}
                  </StyledTableCell>
                ))}

                <StyledTableCell align="right" sx={{ ...stickyHeadSx, minWidth: 140 }}>
                  Totales
                </StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* ====== FILA AÑO REAL ====== */}
              <StyledTableRow>
                <StyledTableCell sx={{ ...stickyLeftSx, minWidth: 260, fontWeight: 700 }}>
                  Año
                </StyledTableCell>

                {cols.map((c) => (
                  <StyledTableCell key={c.realYear} align="right" sx={{ fontWeight: 700 }}>
                    {c.realYear}
                  </StyledTableCell>
                ))}

                <StyledTableCell align="right" />
              </StyledTableRow>

              {/* ====== FILAS DE CONCEPTOS ====== */}
              {rows.map((r) => {
                const fmt = getFormatterByTipoValor(r);
                const key = getConceptId(r) ?? `${r?.secuencia}-${normConceptName(r?.concepto)}`;
                const esDetalle = isDetalleRow(r);

                return (
                  <StyledTableRow key={key}>
                    <StyledTableCell
                      sx={{
                        ...stickyLeftSx,
                        minWidth: 260,
                        pl: esDetalle ? 4 : 1.5,
                        fontWeight: esDetalle ? 400 : 700,
                      }}
                    >
                      {r?.concepto}
                    </StyledTableCell>

                    {cols.map((c) => {
                      const val = r?.valores_por_anio?.[String(c.realYear)];
                      return (
                        <StyledTableCell key={c.realYear} align="right">
                          {fmt(val)}
                        </StyledTableCell>
                      );
                    })}

                    {/* ✅ Totales SOLO si tipo_valor es C o V */}
                    <StyledTableCell align="right">
                      {tipoValorTieneTotal(r) ? fmt(r?.total) : ''}
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

TablaDetalleConceptos.propTypes = {
  detalle: PropTypes.shape({
    years: PropTypes.array,
    rows: PropTypes.array,
    totales_por_anio: PropTypes.object,
  }),
};

export default TablaDetalleConceptos;
