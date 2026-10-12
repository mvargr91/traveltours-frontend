// Tema del portal público (soporta modo claro y modo oscuro alineado con la marca).
// Los colores salen de Parametrización > Apariencia (apariencia.portal).
import { createTheme } from '@mui/material/styles';
import { APARIENCIA_BASE, textoSobre } from '../../constants/Apariencia';

export const getPortalTheme = (mode = 'light', portal = APARIENCIA_BASE.portal) => {
  const isDark = mode === 'dark';
  const colores = isDark ? portal.oscuro : portal.claro;

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: portal.primario,
        dark: portal.primarioOscuro,
        contrastText: textoSobre(portal.primario),
      },
      secondary: {
        main: colores.secundario,
      },
      text: {
        primary: colores.texto,
        secondary: colores.textoSecundario,
      },
      background: {
        default: colores.fondo,
        paper: colores.superficie,
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
