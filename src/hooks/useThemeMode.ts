import { useState, useEffect, useCallback } from 'react';
import { THEME_MODE, type ThemeMode } from '@/theme/theme';

const THEME_STORAGE_KEY = 'orders-dashboard-theme';

function getInitialTheme(): ThemeMode {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === THEME_MODE.LIGHT || stored === THEME_MODE.DARK) {
      return stored;
    }

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_MODE.DARK;
    }
  }

  return THEME_MODE.LIGHT;
}

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);

  // Persist to localStorage when mode changes
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setMode(e.matches ? THEME_MODE.DARK : THEME_MODE.LIGHT);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === THEME_MODE.LIGHT ? THEME_MODE.DARK : THEME_MODE.LIGHT));
  }, []);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  return {
    mode,
    toggleMode,
    setThemeMode,
    isDark: mode === THEME_MODE.DARK,
  };
}
