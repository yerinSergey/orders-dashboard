import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { ReactNode } from 'react';
import { lightTheme, darkTheme, THEME_MODE } from './theme';
import { useThemeMode } from '@/hooks/useThemeMode';
import { ThemeContext } from './ThemeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode, toggleMode, setThemeMode, isDark } = useThemeMode();
  const theme = mode === THEME_MODE.DARK ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setThemeMode, isDark }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
