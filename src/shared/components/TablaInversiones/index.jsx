import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ProyectoCreador from '../../../modules/Proyectos/Proyecto/ProyectoCreador';

const TablaInversiones = ({ proyectos = [], onChangeInversiones, valorTotalDisponible = 0 }) => {
  const theme = useTheme();
  const [carrito, setCarrito] = useState([]);
  const [valoresIngresados, setValoresIngresados] = useState({});
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [accion, setAccion] = useState('ver');
  const [showProyecto, setShowProyecto] = useState(false);

  const total = carrito.reduce((sum, item) => sum + Number(item.valor || 0), 0);

  const estaEnCarrito = (proyectoId) => carrito.some(p => p.id === proyectoId);

  const handleCheckbox = (proyecto) => {
    const valor = Number(valoresIngresados[proyecto.id] || 0);
    if (valor <= 0) return;

    const disponible = proyecto.saldo_por_invertir - (carrito.find(p => p.id === proyecto.id)?.valor || 0);
    if (valor > disponible) return;    

    const nuevoCarrito = [...carrito, { ...proyecto, valor }];
    setCarrito(nuevoCarrito);
    onChangeInversiones(nuevoCarrito);
    setValoresIngresados(prev => ({ ...prev, [proyecto.id]: '' }));
  };

  const eliminarDelCarrito = (proyectoId) => {
    const actualizado = carrito.filter(p => p.id !== proyectoId);
    setCarrito(actualizado);
    onChangeInversiones(actualizado);
  };

  const handleValorChange = (proyectoId, valor) => {
    const limpio = valor.replace(/[^\d]/g, '');
    setValoresIngresados(prev => ({ ...prev, [proyectoId]: limpio }));
  };

  const handleVerProyecto = (proyectoId) => {
    setProyectoSeleccionado(proyectoId);
    setAccion('ver');
    setShowProyecto(true);
  };

  const handleOnCloseProyecto = () => {
    setShowProyecto(false);
    setProyectoSeleccionado(null);
  };

  return (
    <Box mt={4} sx={{ display: 'flex', gap: 10, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* 📦 Proyectos disponibles */}
      <Box flex={1}>
        <Typography variant='h2' gutterBottom>Proyectos disponibles</Typography>
        <TableContainer
          style={{
            maxHeight: 280,
            overflowY: 'auto',
            // border: '1px solid #ccc',
            // borderRadius: 8,
          }}
        >
          <Table size='small' stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Acciones</TableCell>
                <TableCell>Identificador</TableCell>
                <TableCell>Valor disponible</TableCell>
                <TableCell>Valor inversión</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proyectos.map((proyecto) => {
                const valor = valoresIngresados[proyecto.id] || '';
                const yaEnCarrito = estaEnCarrito(proyecto.id);
                const disponible = proyecto.saldo_por_invertir - (carrito.find(p => p.id === proyecto.id)?.valor || 0);
                const hayError = Number(valor) > disponible;
                return (
                  <React.Fragment key={proyecto.id}>
                    <TableRow sx={{ height: 72 }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <IconButton onClick={() => handleVerProyecto(proyecto.id)}>
                            <VisibilityIcon
                              sx={{
                                color: theme.palette.grayBottoms,
                                '&:hover': { color: theme.palette.primary.main }
                              }}
                            />
                          </IconButton>
                          <Checkbox
                            checked={yaEnCarrito}
                            onChange={() => handleCheckbox(proyecto)}
                            disabled={!(valor > 0)}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{proyecto.codigo_proyecto || '-'}</TableCell>
                      <TableCell>{disponible.toLocaleString('es-CO')}</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <TextField
                          fullWidth
                          style={{ border: '1px solid #ccc' }}
                          variant="outlined"
                          size="small"
                          type="text"
                          value={new Intl.NumberFormat('es-CO').format(valor || 0)}
                          onChange={(e) => handleValorChange(proyecto.id, e.target.value)}
                          inputProps={{ inputMode: 'numeric' }}
                          disabled={yaEnCarrito}
                          error={hayError}
                        />
                      </TableCell>
                    </TableRow>

                    {hayError && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography variant="caption" color="error" sx={{ ml: 2, float: 'right' }}>
                            Valor supera el disponible ({disponible.toLocaleString('es-CO')})
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 🧾 Inversiones agregadas */}
      <Box flex={1}>
        <Typography variant='h2' gutterBottom>Inversiones</Typography>
        <TableContainer >
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Acciones</TableCell>
                <TableCell>Identificador</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Valor inversión</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {carrito.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <IconButton onClick={() => eliminarDelCarrito(item.id)}>
                      <DeleteIcon sx={{ color: theme.palette.redBottoms, '&:hover': { color: theme.palette.colorHovers } }} />
                    </IconButton>
                  </TableCell>
                  <TableCell>{item.codigo_proyecto || '-'}</TableCell>
                  <TableCell>{item.nombre || '-'}</TableCell>
                  <TableCell>{Number(item.valor).toLocaleString('es-CO')}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3}><strong>Total invertido</strong></TableCell>
                <TableCell><strong>{total.toLocaleString('es-CO')}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Modal proyecto */}
      {showProyecto && (
        <ProyectoCreador
          showForm={showProyecto}
          Proyecto={proyectoSeleccionado}
          accion={accion}
          handleOnClose={handleOnCloseProyecto}
        />
      )}
    </Box>
  );
};

export default TablaInversiones;
