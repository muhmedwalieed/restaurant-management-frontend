import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { PALETTES } from '../theme/palettes.js';

const THEME_STORAGE_KEY = 'restaurant_saas_theme';
const PALETTE_STORAGE_KEY = 'restaurant_saas_palette';

const ThemeContext = createContext({
  theme: 'system',
  isDark: false,
  activePaletteId: 'obsidian-emerald',
  activePalette: PALETTES[0],
  palettes: PALETTES,
  setTheme: () => { },
  toggleTheme: () => { },
  setPalette: () => { },
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // Ignore storage errors
    }
    return 'light';
  });

  const [activePaletteId, setActivePaletteId] = useState(() => {
    try {
      const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
      if (stored && PALETTES.some((p) => p.id === stored)) {
        return stored;
      }
    } catch {
      // Ignore storage errors
    }
    return 'studio-clean';
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemIsDark(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const activePalette = useMemo(() => {
    return PALETTES.find((p) => p.id === activePaletteId) || PALETTES[0];
  }, [activePaletteId]);

  const isDark = useMemo(() => {
    if (activePalette.mode === 'light') return false;
    if (activePalette.mode === 'dark') return true;
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return systemIsDark;
  }, [theme, systemIsDark, activePalette]);

  // Apply theme class and CSS variables directly to :root in real time
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply palette CSS variables
    if (activePalette && activePalette.vars) {
      Object.entries(activePalette.vars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
      // Direct alias updates
      if (activePalette.vars['--bg-base']) root.style.setProperty('--bg', activePalette.vars['--bg-base']);
      if (activePalette.vars['--bg-surface']) {
        root.style.setProperty('--s1', activePalette.vars['--bg-surface']);
        root.style.setProperty('--s2', activePalette.vars['--bg-surface']);
      }
      if (activePalette.vars['--bg-surface-elevated']) root.style.setProperty('--s3', activePalette.vars['--bg-surface-elevated']);
      if (activePalette.vars['--border-default']) root.style.setProperty('--bd', activePalette.vars['--border-default']);
      if (activePalette.vars['--text-primary']) root.style.setProperty('--t1', activePalette.vars['--text-primary']);
      if (activePalette.vars['--text-muted']) root.style.setProperty('--t2', activePalette.vars['--text-muted']);
      if (activePalette.vars['--color-primary']) root.style.setProperty('--ac', activePalette.vars['--color-primary']);
      if (activePalette.vars['--ac-bg']) root.style.setProperty('--ac-bg', activePalette.vars['--ac-bg']);
      const textInv = activePalette.vars['--text-inverted'] || (activePalette.vars['--color-primary'] === '#ffffff' ? '#000000' : '#ffffff');
      root.style.setProperty('--ti', textInv);
      root.style.setProperty('--text-inverted', textInv);
    }
  }, [isDark, activePalette]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setPalette = useCallback((paletteId) => {
    const target = PALETTES.find((p) => p.id === paletteId);
    if (!target) return;
    setActivePaletteId(paletteId);
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, paletteId);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (isDark) {
      setPalette('studio-graphite');
    } else {
      setPalette('true-black-minimal');
    }
  }, [isDark, setPalette]);

  const contextValue = useMemo(
    () => ({
      theme,
      isDark,
      activePaletteId,
      activePalette,
      palettes: PALETTES,
      setTheme,
      toggleTheme,
      setPalette,
    }),
    [theme, isDark, activePaletteId, activePalette, setTheme, toggleTheme, setPalette]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
