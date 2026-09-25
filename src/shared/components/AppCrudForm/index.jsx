// Contenedor de formulario con el mismo diseño de los módulos existentes:
// título, cuerpo con scroll y botones Guardar/Cancelar fijos al pie.
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Form } from 'formik';
import AppScrollbar from '@crema/components/AppScrollbar';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Fonts } from '../../constants/AppEnums';

const AppCrudForm = ({ titulo, accion, handleOnClose, saving, children }) => {
  const theme = useTheme();

  return (
    <Form noValidate autoComplete='off'>
      <AppScrollbar style={{ maxHeight: 600 }}>
        <Box py={5} px={{ xs: 5, lg: 8, xl: 10 }}>
          <Box component='h6' mb={{ xs: 4, xl: 6 }} fontSize={20} fontWeight={Fonts.MEDIUM}>
            {titulo}
          </Box>
          <Box
            px={{ md: 5, lg: 8, xl: 10 }}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              columnGap: 4,
              rowGap: 3,
              '& .campo-completo': { gridColumn: '1 / -1' },
            }}
          >
            {children}
          </Box>
        </Box>
      </AppScrollbar>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          pb: '20px',
          gap: '10px',
          pr: '20px',
          position: 'sticky',
          left: 0,
          bottom: 0,
        }}
      >
        {accion !== 'ver' && (
          <Button
            sx={{
              px: 15,
              color: 'white',
              '&:hover': { backgroundColor: theme.palette.colorHovers, cursor: 'pointer' },
              backgroundColor: theme.palette.primary.main,
            }}
            variant='contained'
            type='submit'
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
          >
            <IntlMessages id='boton.submit' />
          </Button>
        )}
        <Button
          sx={{
            px: 15,
            color: 'white !important',
            '&:hover': { backgroundColor: theme.palette.colorHovers, cursor: 'pointer' },
            backgroundColor: theme.palette.secondary.light,
          }}
          onClick={handleOnClose}
        >
          <IntlMessages id='boton.cancel' />
        </Button>
      </Box>
    </Form>
  );
};

AppCrudForm.propTypes = {
  titulo: PropTypes.string,
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  children: PropTypes.node,
};

export default AppCrudForm;
