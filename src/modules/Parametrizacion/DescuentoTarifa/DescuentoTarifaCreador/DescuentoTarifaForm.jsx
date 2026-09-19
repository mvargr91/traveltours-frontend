import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { Form } from 'formik';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { ArrowBackIos } from '@mui/icons-material';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Fonts } from '../../../../shared/constants/AppEnums';
import MyCurrencyFieldPesos from '../../../../shared/components/MyCurrencyFieldPesos';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { textAlign } from '@mui/system';

const useStyles = makeStyles(() => ({
  bottomsGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: '20px',
    gap: '10px',
    paddingRight: '20px',
  },
  tableContainer: {
    overflowX: 'auto',
    marginTop: '20px',
    marginBottom: '10px',
  },
  table: {
    borderCollapse: 'collapse',
    minWidth: '900px',
    width: '100%',
  },
  th: {
    padding: '3px',
    backgroundColor: '#f5f5f5',
    whiteSpace: 'nowrap',
    textAlign: 'start',
  },
  thanio: {
    padding: '3px',
    backgroundColor: '#f5f5f5',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  td: {
    padding: '0px',
    margin: 0,
  },
  tdanio:{
     textAlign: 'center',    
  },
  input: {
    width: '100%',
    padding: '0px',
    margin: 0,
    textAlign: 'end',
  },
}));

const DescuentoTarifaForm = ({
  values,
  setFieldValue,
  titulo,
  isSubmitting,
  permisos,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const classes = useStyles();

  const columnas = values?.columnas || [];
  const filas = values?.filas || [];

  const onGoBack = () => {
    navigate('/descuentos-tarifas');
  };

  const handleChangeCelda = (filaIndex, colIndex, value) => {
    const limpio = value === '' ? null : value;

    setFieldValue(
      `filas[${filaIndex}].valores[${colIndex}].porcentaje_descuento`,
      limpio
    );
  };

  return (
    <Form noValidate autoComplete='off'>
      <Box py={5} px={{ xs: 5, lg: 8, xl: 10 }}>
        <Box
          component='h6'
          mb={{ xs: 4, xl: 6 }}
          fontSize={20}
          fontWeight={Fonts.MEDIUM}
        >
          {titulo}
        </Box>
        <>
          <Box className={classes.tableContainer}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th className={classes.thanio} >                      
                    <Typography variant='caption' fontWeight={500}>
                          {'Años '} <br />{'permanencia '}
                    </Typography>
                  </th>
                  {columnas.map((col) => (
                    <th
                      key={col.numero_nivel}
                      className={classes.th}
                    >
                      <Box>
                        <Typography variant='caption' fontWeight={500}>
                          {'Nivel consumo '} <br />
                        </Typography>
                        <Typography variant='caption' fontWeight={500}>
                          {col.titulo}
                        </Typography>
                      </Box>
                    </th>
                  ))}
                </tr>
              </thead>

            { 
              permisos.indexOf('Listar') >= 0 && (
                <tbody>
                  {filas.map((fila, filaIndex) => (
                    <tr key={fila.numero_anio}>
                      <td className={classes.tdanio}>
                        <Typography fontWeight={500}>
                          {fila.numero_anio}
                        </Typography>
                      </td>

                      {fila.valores.map((celda, colIndex) => (
                        <td
                          className={classes.td}
                          key={`${fila.numero_anio}-${celda.numero_nivel}`}
                        >
                          <MyCurrencyFieldPesos
                            className={classes.td}
                            label=''
                            name={`filas[${filaIndex}].valores[${colIndex}].porcentaje_descuento`}
                            disabled={permisos.indexOf('CrearModificarEliminar') >= 0 ? false : true}
                        />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              )
            }
            </table>
          </Box>
        </>
        
      </Box>

      <Box className={classes.bottomsGroup}>
          <Button
            sx={{
              paddingLeft: 15,
              paddingRight: 15,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.colorHovers,
                cursor: 'pointer',
              },
              backgroundColor: theme.palette.primary.main,
            }}
            variant='contained'
            type='submit'
            disabled={isSubmitting}
          >
            <IntlMessages id='boton.submit' />
          </Button>
      </Box>
    </Form>
  );
};

DescuentoTarifaForm.propTypes = {
  values: PropTypes.object.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  titulo: PropTypes.string.isRequired,
  accion: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  isSubmitting: PropTypes.bool,
};

DescuentoTarifaForm.defaultProps = {
  loading: false,
  isSubmitting: false,
};

export default DescuentoTarifaForm;