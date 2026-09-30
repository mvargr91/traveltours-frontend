import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useThemeContext, useThemeActionsContext } from '@crema/context/AppContextProvider/ThemeContextProvider';
import { ThemeMode } from '@crema/constants/AppEnums';

const AppThemeModeSwitcher = ({ showLabel = false, size = 'medium', sx = {}, ...rest }) => {
  const { themeMode } = useThemeContext();
  const { updateThemeMode } = useThemeActionsContext();
  const isDark = themeMode === ThemeMode.DARK;

  const toggleTheme = (e) => {
    e?.stopPropagation?.();
    updateThemeMode(isDark ? ThemeMode.LIGHT : ThemeMode.DARK);
  };

  const title = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  if (showLabel) {
    return (
      <Box
        onClick={toggleTheme}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          py: 1,
          px: 1.5,
          borderRadius: 2,
          '&:hover': {
            bgcolor: 'action.hover',
          },
          ...sx,
        }}
        {...rest}
      >
        {isDark ? (
          <LightModeOutlinedIcon sx={{ color: '#FBBF24', fontSize: 22 }} />
        ) : (
          <DarkModeOutlinedIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
        )}
        <Typography variant='body2' sx={{ fontWeight: 500 }}>
          {isDark ? 'Modo claro' : 'Modo oscuro'}
        </Typography>
      </Box>
    );
  }

  return (
    <Tooltip title={title} arrow>
      <IconButton
        onClick={toggleTheme}
        size={size}
        aria-label={title}
        sx={{
          transition: 'all 0.25s ease-in-out',
          color: isDark ? '#FBBF24' : 'text.secondary',
          bgcolor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(0, 0, 0, 0.04)',
          '&:hover': {
            bgcolor: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(0, 0, 0, 0.08)',
            transform: 'rotate(15deg) scale(1.05)',
          },
          ...sx,
        }}
        {...rest}
      >
        {isDark ? (
          <LightModeOutlinedIcon sx={{ fontSize: size === 'small' ? 20 : 22 }} />
        ) : (
          <DarkModeOutlinedIcon sx={{ fontSize: size === 'small' ? 20 : 22 }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

AppThemeModeSwitcher.propTypes = {
  showLabel: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  sx: PropTypes.object,
};

export default AppThemeModeSwitcher;
