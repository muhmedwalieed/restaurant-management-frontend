import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { PALETTES } from '../theme/palettes.js';

const THEME_STORAGE_KEY = 'restaurant_saas_theme';
const PALETTE_STORAGE_KEY = 'restaurant_saas_palette';

// Relative luminance of a hex color (WCAG). Returns null for non-hex input.
const relativeLuminance = (hex) => {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!match) return null;
  let value = match[1];
  if (value.length === 3) value = value.split('').map((c) => c + c).join('');
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

const contrastRatio = (a, b) => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

// Picks the higher-contrast label color (near-black or white) for a background.
// 0.179 is the luminance where black and white text contrast equally.
const readableTextOn = (backgroundHex) => {
  const luminance = relativeLuminance(backgroundHex);
  if (luminance === null) return '#ffffff';
  return luminance > 0.179 ? '#0b1220' : '#ffffff';
};

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
      // Guarantee readable labels on primary-colored surfaces regardless of palette data.
      const primary = activePalette.vars['--color-primary'];
      const paletteInverted = activePalette.vars['--text-inverted'];
      const ratio = contrastRatio(primary, paletteInverted);
      // Only override when the palette's own pairing is unreadable (below 3:1),
      // so healthy palettes keep their intended look.
      const textInv = ratio !== null && ratio >= 3 ? paletteInverted : readableTextOn(primary);
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
