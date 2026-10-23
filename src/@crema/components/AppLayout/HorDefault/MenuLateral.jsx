// Menú del panel en vertical, fijo a la izquierda en pantallas grandes (lg+). Con el logo arriba y los módulos
// del usuario (sus permisos) como grupos desplegables. En pantallas pequeñas no se pinta: allí el menú es el
// cajón (AppSidebar) que abre el botón de la cabecera.
import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import AppScrollbar from '../../AppScrollbar';
import MainSidebar from '../components/MainSidebar';
import VerticalNav from '../components/VerticalNav';
import AppLogo from '../components/AppLogo';

export const ANCHO_MENU = 280;
const ALTO_LOGO = 70; // igual a la cabecera (AppHeader)

const MenuLateral = ({ routesConfig }) => (
  // Reserva el ancho en la fila; el menú en sí queda fijo (SidebarWrapper es position: fixed en lg).
  <Box sx={{ display: { xs: 'none', lg: 'block' }, width: ANCHO_MENU, flexShrink: 0 }}>
    <MainSidebar>
      <Box
        sx={{
          height: ALTO_LOGO,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
          // El logo de la cabecera mide 65 px de alto: aquí se reduce para que quepa sin cortarse.
          '& .app-logo': { height: ALTO_LOGO, py: 1.5 },
          '& .app-logo img': { height: 46 },
        }}
      >
        <AppLogo />
      </Box>
      <AppScrollbar sx={{ py: 2, height: `calc(100vh - ${ALTO_LOGO}px) !important` }} scrollToTop={false}>
        <VerticalNav routesConfig={routesConfig} />
      </AppScrollbar>
    </MainSidebar>
  </Box>
);

MenuLateral.propTypes = {
  routesConfig: PropTypes.array,
};

export default MenuLateral;
