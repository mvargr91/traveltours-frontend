import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import defaultConfig, {
  defaultTheme,
  backgroundLight,
  backgroundDark,
  textDark,
  textLight,
} from "@crema/constants/defaultConfig";
import PropTypes from "prop-types";
import { LayoutDirection, ThemeMode } from "@crema/constants/AppEnums";

const getSavedThemeMode = () => {
  try {
    const saved = localStorage.getItem("crema-theme-mode");
    if (saved && (saved === ThemeMode.DARK || saved === ThemeMode.LIGHT)) {
      return saved;
    }
  } catch (e) {
    console.error("Error reading theme mode from localStorage", e);
  }
  return defaultConfig.themeMode;
};

const getInitialTheme = (mode) => {
  const isDark = mode === ThemeMode.DARK;
  return {
    ...defaultTheme.theme,
    palette: {
      ...defaultTheme.theme.palette,
      mode: isDark ? ThemeMode.DARK : ThemeMode.LIGHT,
      background: isDark ? backgroundDark : backgroundLight,
      text: isDark ? textDark : textLight,
      divider: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(224, 224, 224, 1)",
    },
  };
};

const initialMode = getSavedThemeMode();

const ThemeContext = createContext({
  theme: getInitialTheme(initialMode),
  themeStyle: defaultConfig.themeStyle,
  themeMode: initialMode,
});
const ThemeActionsContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const useThemeActionsContext = () => useContext(ThemeActionsContext);

const ThemeContextProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(getSavedThemeMode);
  const [theme, setTheme] = useState(() => getInitialTheme(themeMode));
  const [themeStyle, updateThemeStyle] = useState(defaultConfig.themeStyle);

  const updateTheme = useCallback((newTheme) => {
    setTheme(newTheme);
  }, []);

  const updateThemeMode = useCallback((mode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem("crema-theme-mode", mode);
    } catch (e) {
      console.error("Error saving theme mode to localStorage", e);
    }
  }, []);

  useEffect(() => {
    const isDark = themeMode === ThemeMode.DARK;
    document.body.classList.toggle("dark-mode", isDark);

    setTheme((prevTheme) => {
      if (prevTheme.palette.mode === themeMode) {
        return prevTheme;
      }
      return {
        ...prevTheme,
        palette: {
          ...prevTheme.palette,
          mode: isDark ? ThemeMode.DARK : ThemeMode.LIGHT,
          background: isDark ? backgroundDark : backgroundLight,
          text: isDark ? textDark : textLight,
          divider: isDark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(224, 224, 224, 1)",
        },
      };
    });
  }, [themeMode]);

  useEffect(() => {
    if (theme.direction === LayoutDirection.RTL) {
      document.body.setAttribute("dir", LayoutDirection.RTL);
    } else {
      document.body.setAttribute("ltr", LayoutDirection.LTR);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeStyle,
        themeMode,
      }}
    >
      <ThemeActionsContext.Provider
        value={{
          updateTheme,
          updateThemeStyle,
          updateThemeMode,
        }}
      >
        {children}
      </ThemeActionsContext.Provider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;

ThemeContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
