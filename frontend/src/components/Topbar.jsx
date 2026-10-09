import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, subtitle, actions, onMobileMenuToggle, onOpenSearch }) {
  const {
    theme,
    setTheme,
    colorTheme,
    setColorTheme,
    colorThemes,
    currColorThemeInfo,
    customColor,
    setCustomColor
  } = useTheme();

  const { language, setLanguage, languages, t } = useI18n();
  const { user } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);

  const colorMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target)) {
        setColorMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currLangInfo = languages[language] || { name: 'English', flag: '🇬🇧' };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMobileMenuToggle} aria-label="Open navigation menu">
          <span></span><span></span><span></span>
        </button>
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="sub">{subtitle}</p>}
        </div>
      </div>

      <div className="topbar-right">
        {onOpenSearch && (
          <button type="button" className="search-trigger-btn" onClick={onOpenSearch}>
            <span>🔎</span>
            <span className="search-trigger-text">{t('topbar.searchPlaceholder', 'Search catalog, groups, clubs in Book Forge...')}</span>
            <kbd className="search-kbd">{t('topbar.ctrlK', 'Ctrl K')}</kbd>
          </button>
        )}

        {/* Base Theme Switcher: Light vs Dark (3D has been removed) */}
        <div className="theme-switch-dock" title="Switch Theme (Light, Dark)">
          <button
            type="button"
            className={`theme-switch-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
            title="Light Parchment Theme"
          >
            ☀️ <span>{t('theme.light', 'Light')}</span>
          </button>
          <button
            type="button"
            className={`theme-switch-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
            title="Dark Obsidian Theme"
          >
            🌙 <span>{t('theme.dark', 'Dark')}</span>
          </button>
        </div>

        {/* Color Theme & Palette Picker Dropdown */}
        <div className="color-theme-dock" ref={colorMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="color-theme-trigger"
            onClick={() => {
              setColorMenuOpen(!colorMenuOpen);
              setLangMenuOpen(false);
            }}
            title="Change Color Theme & Palette"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 11px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              background: 'rgba(0, 0, 0, 0.18)',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              transition: 'all 0.2s ease'
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: currColorThemeInfo?.primary || '#B5652F',
                boxShadow: `0 0 6px ${currColorThemeInfo?.accent || '#D9A441'}`,
                display: 'inline-block',
                flexShrink: 0
              }}
            />
            <span>{currColorThemeInfo?.icon} {currColorThemeInfo?.name}</span>
            <span style={{ fontSize: '0.7rem' }}>▾</span>
          </button>

          {colorMenuOpen && (
            <div
              className="color-theme-dropdown show"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '240px',
                background: 'var(--paper, #FFFFFF)',
                border: '1px solid var(--line, #E7DCC8)',
                borderRadius: '14px',
                boxShadow: '0 14px 32px rgba(0, 0, 0, 0.25)',
                padding: '6px 0',
                zIndex: 1100,
                color: 'var(--ink, #2E251C)'
              }}
            >
              <div
                style={{
                  padding: '8px 14px 6px',
                  borderBottom: '1px solid var(--line)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--ink-soft)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px'
                }}
              >
                🎨 Select Color Theme
              </div>
              <div style={{ maxHeight: '270px', overflowY: 'auto', padding: '4px 0' }}>
                {colorThemes.map((ct) => {
                  const isActive = colorTheme === ct.id;
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => {
                        setColorTheme(ct.id);
                        setColorMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 14px',
                        background: isActive ? 'rgba(217, 164, 65, 0.16)' : 'transparent',
                        border: 'none',
                        color: 'var(--ink)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.84rem',
                        fontWeight: isActive ? 700 : 500,
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: ct.primary,
                          border: `2px solid ${ct.accent}`,
                          flexShrink: 0,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ct.icon} {ct.name}
                        </div>
                      </div>
                      {isActive && (
                        <span style={{ color: ct.primary, fontWeight: 800, fontSize: '0.9rem' }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex Color Picker */}
              <div
                style={{
                  padding: '10px 14px',
                  borderTop: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  fontSize: '0.82rem',
                  background: 'rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    style={{
                      width: '26px',
                      height: '26px',
                      padding: 0,
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: 'none'
                    }}
                    title="Choose custom accent color"
                  />
                  <span style={{ fontWeight: 600 }}>Custom Accent</span>
                </div>
                {colorTheme === 'custom' && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--clay)', fontWeight: 700 }}>Active</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Language Switcher Dropdown */}
        <div className="lang-switch-dock" ref={langMenuRef}>
          <button
            type="button"
            className="lang-select-trigger"
            onClick={() => {
              setLangMenuOpen(!langMenuOpen);
              setColorMenuOpen(false);
            }}
            title="Select Language"
          >
            <span>{currLangInfo.flag} {currLangInfo.name}</span> ▾
          </button>
          {langMenuOpen && (
            <ul className="lang-dropdown-menu show">
              {Object.entries(languages).map(([code, info]) => (
                <li key={code}>
                  <button
                    type="button"
                    className={`lang-dropdown-item ${language === code ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(code);
                      setLangMenuOpen(false);
                    }}
                  >
                    <span>{info.flag}</span>
                    <span className="lang-name">{info.name}</span>
                    <span className="lang-native">({info.native})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Topbar Quick Action Icons */}
        <div className="topbar-actions-dock">
          <Link to="/notifications" className="topbar-icon-btn" title="Notifications" aria-label="Notifications">
            <span>🔔</span>
            <span className="topbar-badge">2</span>
          </Link>
          <Link to="/messages" className="topbar-icon-btn" title="Direct Messages & WhatsApp" aria-label="Messages">
            <span>💬</span>
          </Link>
          <Link to="/settings" className="topbar-icon-btn" title="Settings" aria-label="Settings">
            <span>⚙️</span>
          </Link>
        </div>

        {actions && (
          <div className="topbar-custom-actions">
            {actions}
          </div>
        )}

        {/* User Profile Avatar Link */}
        <Link to="/profile" className="topbar-icon-btn user-top-chip" title="Profile" aria-label="Profile">
          <span className="avatar-chip-xs">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name || 'User Profile'} />
            ) : (
              user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'JR')
            )}
          </span>
        </Link>
      </div>
    </div>
  );
}
