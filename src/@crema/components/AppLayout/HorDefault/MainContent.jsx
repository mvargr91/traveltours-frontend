import React from 'react';
import { Box } from '@mui/material';
import PropsTypes from 'prop-types';

const MainContent = ({ children, ...rest }) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        width: { xs: '100%', lg: 'auto' },
        flexDirection: 'column',
        // En escritorio va al lado del menú lateral (en la misma fila); minWidth evita que las tablas anchas lo empujen.
        position: { xs: 'absolute', lg: 'relative' },
        minWidth: 0,
        transition: 'all 0.5s ease',
        '& .app-content, & .footerContainer': {
          px: 5,
          width: '100%',
          maxWidth: { lg: 1340, xl: 1420 },
          mx: 'auto',
        },
      }}
      className='mainContent'
      {...rest}
    >
      {children}
    </Box>
  );
};

export default MainContent;

MainContent.propTypes = {
  children: PropsTypes.node,
};
