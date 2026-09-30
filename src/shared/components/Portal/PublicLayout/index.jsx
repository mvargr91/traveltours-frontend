// Layout del portal público: encabezado, contenido y footer con soporte para tema claro y oscuro de la marca.
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import AppSuspense from '@crema/components/AppSuspense';
import AppErrorBoundary from '@crema/components/AppErrorBoundary';
import AppMessageView from '@crema/components/AppMessageView';
import { useThemeContext } from '@crema/context/AppContextProvider/ThemeContextProvider';
import { getPortalTheme } from '../portalTheme';
import PortalHeader from '../PortalHeader';
import PortalFooter from '../PortalFooter';
import { ERROR_TYPE } from '../../../constants/Constantes';

const PublicLayout = ({ children }) => {
  const { message, messageType } = useSelector(({ common }) => common);
  const { themeMode } = useThemeContext();
  const theme = useMemo(() => getPortalTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          color: 'text.primary',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        <PortalHeader />
        <Box component='main' sx={{ flex: 1 }}>
          <AppSuspense>
            <AppErrorBoundary>{children}</AppErrorBoundary>
          </AppSuspense>
        </Box>
        <PortalFooter />
        <AppMessageView variant={messageType === ERROR_TYPE ? 'error' : 'success'} message={message || ''} />
      </Box>
    </ThemeProvider>
  );
};

PublicLayout.propTypes = {
  children: PropTypes.node,
};

export default PublicLayout;
