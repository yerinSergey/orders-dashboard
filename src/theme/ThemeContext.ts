import { createContext, useContext } from 'react';
import type { ThemeMode } from './theme';

export interface ThemeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
