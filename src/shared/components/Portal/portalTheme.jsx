// Tema del portal público (soporta modo claro y modo oscuro alineado con la marca).
import { createTheme } from '@mui/material/styles';
import { COLORES_MARCA } from '../../constants/Marca';

export const getPortalTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: COLORES_MARCA.azul,
        dark: COLORES_MARCA.azulOscuro,
        contrastText: '#fff',
      },
      secondary: {
        main: isDark ? '#c084fc' : '#732982',
      },
      text: {
        primary: isDark ? '#F8FAFC' : COLORES_MARCA.texto,
        secondary: isDark ? '#94A3B8' : '#4B5563',
      },
      background: {
        default: isDark ? '#0f172a' : '#F7F9FB',
        paper: isDark ? '#1e293b' : '#FFFFFF',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: "'Be Vietnam', 'Roboto', sans-serif",
      h1: { fontWeight: 700, fontSize: '2.6rem', lineHeight: 1.15 },
      h2: { fontWeight: 700, fontSize: '1.9rem' },
      h3: { fontWeight: 600, fontSize: '1.4rem' },
      h4: { fontWeight: 600, fontSize: '1.15rem' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0 8px 24px rgba(0, 0, 0, 0.45)'
              : '0 4px 20px rgba(15, 40, 60, 0.08)',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

const portalTheme = getPortalTheme('light');
export default portalTheme;
