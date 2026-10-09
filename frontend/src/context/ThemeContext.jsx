import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_KEY = 'bookforge_theme';
const COLOR_THEME_KEY = 'bookforge_color_theme';
const CUSTOM_COLOR_KEY = 'bookforge_custom_color';

// 3D theme has been removed. Only Light and Dark are valid base modes.
const VALID_THEMES = ['light', 'dark'];
const DEFAULT_THEME = 'light';

export const COLOR_THEMES = [
  {
    id: 'terracotta',
    name: 'Terracotta Gold',
    icon: '🏺',
    primary: '#B5652F',
    primaryHover: '#8C3E14',
    accent: '#D9A441',
    accentLight: '#E9C6A5',
    desc: 'Classic Book Forge warmth: Terracotta clay & golden guild highlights'
  },
  {
    id: 'emerald',
    name: 'Forest Emerald',
    icon: '🌲',
    primary: '#2D6A4F',
    primaryHover: '#1B4332',
    accent: '#52B788',
    accentLight: '#B7E4C7',
    desc: 'Deep woodland pine, botanical jade, and fresh reading serenity'
  },
  {
    id: 'sapphire',
    name: 'Ocean Sapphire',
    icon: '🌊',
    primary: '#1D4ED8',
    primaryHover: '#1E3A8A',
    accent: '#38BDF8',
    accentLight: '#BAE6FD',
    desc: 'Scholarly royal cobalt, deep ocean blue, and luminous sapphire'
  },
  {
    id: 'ruby',
    name: 'Royal Ruby',
    icon: '🍷',
    primary: '#9B1B30',
    primaryHover: '#7F1D1D',
    accent: '#E11D48',
    accentLight: '#FECDD3',
    desc: 'Velvety crimson, leather-bound classics, and imperial scarlet'
  },
  {
    id: 'amethyst',
    name: 'Mystic Amethyst',
    icon: '🔮',
    primary: '#6D28D9',
    primaryHover: '#4C1D95',
    accent: '#A855F7',
    accentLight: '#DDD6FE',
    desc: 'Enchanted fantasy violet, mystical lavender, and royal amethyst'
  },
  {
    id: 'sepia',
    name: 'Vintage Sepia',
    icon: '🍂',
    primary: '#92400E',
    primaryHover: '#78350F',
    accent: '#D97706',
    accentLight: '#FDE68A',
    desc: 'Warm antique parchment amber, golden oak, and vintage library glow'
  },
  {
    id: 'teal',
    name: 'Nordic Teal',
    icon: '🦚',
    primary: '#0F766E',
    primaryHover: '#115E59',
    accent: '#14B8A6',
    accentLight: '#99F6E4',
    desc: 'Cool Nordic sea-glass cyan, calming mint, and modern elegance'
  }
];

export function ThemeProvider({ children }) {
  // Base theme: light or dark (3d is removed and converted to dark)
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === '3d') return 'dark';
      if (stored && VALID_THEMES.includes(stored)) return stored;
    } catch (e) {}
    return DEFAULT_THEME;
  });

  // Color theme: terracotta, emerald, sapphire, ruby, amethyst, sepia, teal, or custom
  const [colorTheme, setColorThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(COLOR_THEME_KEY);
      if (stored && (COLOR_THEMES.some((c) => c.id === stored) || stored === 'custom')) {
        return stored;
      }
    } catch (e) {}
    return 'terracotta';
  });

  const [customColor, setCustomColorState] = useState(() => {
    try {
      return localStorage.getItem(CUSTOM_COLOR_KEY) || '#2563EB';
    } catch {
      return '#2563EB';
    }
  });

  const setTheme = (newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) newTheme = DEFAULT_THEME;
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch (e) {}
  };

  const setColorTheme = (newColorTheme) => {
    setColorThemeState(newColorTheme);
    try {
      localStorage.setItem(COLOR_THEME_KEY, newColorTheme);
    } catch (e) {}
  };

  const setCustomColor = (hex) => {
    setCustomColorState(hex);
    setColorThemeState('custom');
    try {
      localStorage.setItem(CUSTOM_COLOR_KEY, hex);
      localStorage.setItem(COLOR_THEME_KEY, 'custom');
    } catch (e) {}
  };

  // Apply theme & color theme CSS attributes and CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }
    window.dispatchEvent(new CustomEvent('bookforge_theme_change', { detail: { theme } }));
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color-theme', colorTheme);
    if (document.body) {
      document.body.setAttribute('data-color-theme', colorTheme);
    }

    let activePalette = COLOR_THEMES.find((c) => c.id === colorTheme);

    if (colorTheme === 'custom' && customColor) {
      activePalette = {
        primary: customColor,
        primaryHover: customColor,
        accent: customColor,
        accentLight: customColor
      };
    }

    if (activePalette) {
      const root = document.documentElement;
      root.style.setProperty('--clay', activePalette.primary);
      root.style.setProperty('--clay-light', activePalette.accentLight);
      root.style.setProperty('--gold', activePalette.accent);
      root.style.setProperty('--shell-gold', activePalette.accent);
      root.style.setProperty('--shell-gold-deep', activePalette.primary);
      root.style.setProperty('--brown', activePalette.accent);
      root.style.setProperty('--primary', activePalette.primary);
      root.style.setProperty('--primary-hover', activePalette.primaryHover);
      root.style.setProperty('--theme-color-primary', activePalette.primary);
      root.style.setProperty('--theme-color-accent', activePalette.accent);
    }

    window.dispatchEvent(new CustomEvent('bookforge_color_theme_change', { detail: { colorTheme } }));
  }, [colorTheme, customColor]);

  const currColorThemeInfo =
    COLOR_THEMES.find((c) => c.id === colorTheme) ||
    (colorTheme === 'custom'
      ? { id: 'custom', name: 'Custom Palette', icon: '🎨', primary: customColor, accent: customColor }
      : COLOR_THEMES[0]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themes: VALID_THEMES,
        colorTheme,
        setColorTheme,
        colorThemes: COLOR_THEMES,
        currColorThemeInfo,
        customColor,
        setCustomColor
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
