/**
 * =========================================================
 * BOOK FORGE — Dynamic Theme Engine
 * Manages Light (Parchment), Dark (Obsidian Forge), and 3D (Spatial Tactile)
 * =========================================================
 */

const BookForgeTheme = (function () {
  const THEME_KEY = 'bookforge_theme';
  const VALID_THEMES = ['light', 'dark', '3d'];
  const DEFAULT_THEME = 'light';

  function getTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored && VALID_THEMES.includes(stored)) return stored;
    } catch (e) {}
    return DEFAULT_THEME;
  }

  function setTheme(theme) {
    if (!VALID_THEMES.includes(theme)) theme = DEFAULT_THEME;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}

    // Apply to both html and body for bulletproof selector matching
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }

    // Sync all theme switchers in the DOM
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      const t = btn.getAttribute('data-set-theme');
      if (t === theme) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // Notify listeners (charts, canvases, visualizers)
    window.dispatchEvent(new CustomEvent('bookforge_theme_change', { detail: { theme } }));
  }

  function init() {
    const currentTheme = getTheme();
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (document.body) {
      document.body.setAttribute('data-theme', currentTheme);
    }

    // Attach listeners on load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTheme(currentTheme);
        bindThemeButtons();
      });
    } else {
      setTheme(currentTheme);
      bindThemeButtons();
    }
  }

  function bindThemeButtons() {
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.removeEventListener('click', handleThemeClick);
      btn.addEventListener('click', handleThemeClick);
    });
  }

  function handleThemeClick(e) {
    const btn = e.currentTarget;
    const targetTheme = btn.getAttribute('data-set-theme');
    if (targetTheme) {
      setTheme(targetTheme);
      if (typeof BookClubUI !== 'undefined' && BookClubUI.showToast) {
        const themeLabels = { light: 'Light Parchment', dark: 'Dark Obsidian Forge', '3d': '3D Spatial Tactile' };
        BookClubUI.showToast(`Theme switched to: ${themeLabels[targetTheme] || targetTheme}`, 'info');
      }
    }
  }

  // Self-execute immediately
  init();

  return {
    getTheme,
    setTheme,
    init,
    bindThemeButtons,
    VALID_THEMES
  };
})();

// Global alias
window.BookForgeTheme = BookForgeTheme;
window.ThemeEngine = BookForgeTheme;
