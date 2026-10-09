import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

export default function Settings() {
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
  const { language, setLanguage, t } = useI18n();

  const [activeTab, setActiveTab] = useState('tab-appearance');
  const [toast, setToast] = useState(null);

  // Preference fields
  const [prefWhatsApp, setPrefWhatsApp] = useState(true);
  const [prefSMS, setPrefSMS] = useState(true);
  const [prefReadReceipts, setPrefReadReceipts] = useState(true);
  const [prefSounds, setPrefSounds] = useState(true);
  const [prefPhoneNumber, setPrefPhoneNumber] = useState('+1 (555) 987-6543');
  const [prefFont, setPrefFont] = useState('serif');
  const [prefScale, setPrefScale] = useState('100');

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('bookforge_user_prefs') || '{}');
      if (prefs.whatsapp !== undefined) setPrefWhatsApp(prefs.whatsapp);
      if (prefs.sms !== undefined) setPrefSMS(prefs.sms);
      if (prefs.readReceipts !== undefined) setPrefReadReceipts(prefs.readReceipts);
      if (prefs.sounds !== undefined) setPrefSounds(prefs.sounds);
      if (prefs.phone) setPrefPhoneNumber(prefs.phone);
      if (prefs.font) setPrefFont(prefs.font);
      if (prefs.scale) setPrefScale(prefs.scale);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSavePreferences = () => {
    const prefs = {
      whatsapp: prefWhatsApp,
      sms: prefSMS,
      readReceipts: prefReadReceipts,
      sounds: prefSounds,
      phone: prefPhoneNumber.trim(),
      font: prefFont,
      scale: prefScale
    };
    localStorage.setItem('bookforge_user_prefs', JSON.stringify(prefs));
    showToastMsg('All preferences successfully saved and applied! ✓');
  };

  const handleClearChatCache = () => {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('bookforge_chat_')) localStorage.removeItem(k);
    });
    showToastMsg('Chat history cache has been cleared.');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all themes, language, and preferences to defaults?')) {
      setTheme('light');
      setLanguage('en');
      localStorage.removeItem('bookforge_user_prefs');
      setPrefWhatsApp(true);
      setPrefSMS(true);
      setPrefReadReceipts(true);
      setPrefSounds(true);
      setPrefPhoneNumber('+1 (555) 987-6543');
      setPrefFont('serif');
      setPrefScale('100');
      showToastMsg('Settings have been reset to factory defaults.');
    }
  };

  return (
    <div>
      <style>{`
        .settings-container {
          max-width: 980px;
          margin: 0 auto;
        }
        .settings-nav-tabs {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          border-bottom: 2px solid var(--line, #E7DCC8);
          margin-bottom: 24px;
          padding-bottom: 4px;
        }
        .settings-tab-btn {
          border: none;
          background: transparent;
          color: var(--ink-soft);
          font-family: var(--font-display, inherit);
          font-size: 1rem;
          font-weight: 700;
          padding: 10px 16px;
          cursor: pointer;
          border-radius: 10px 10px 0 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          position: relative;
          transition: all 0.2s ease;
        }
        .settings-tab-btn:hover {
          color: var(--brown-deep, #5C3A1E);
        }
        .settings-tab-btn.active {
          color: var(--brown-deep, #5C3A1E);
          background: rgba(217, 164, 65, 0.12);
          border-bottom: 3px solid var(--shell-gold, #D9A441);
        }
        body[data-theme="dark"] .settings-tab-btn.active {
          color: var(--shell-gold, #D9A441) !important;
          background: rgba(217, 164, 65, 0.15) !important;
        }
        .theme-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          margin-top: 14px;
        }
        @media (max-width: 768px) {
          .theme-cards-grid {
            grid-template-columns: 1fr;
          }
        }
        .theme-card-option {
          border: 2px solid var(--line, #E7DCC8);
          border-radius: 16px;
          padding: 16px;
          background: var(--card-bg, #FFFFFF);
          cursor: pointer;
          transition: all 0.22s ease;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .theme-card-option:hover {
          border-color: var(--shell-gold, #D9A441);
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
        }
        .theme-card-option.active {
          border-color: var(--shell-gold, #D9A441);
          box-shadow: 0 0 0 3px rgba(217, 164, 65, 0.3), 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        .theme-mini-preview {
          height: 90px;
          border-radius: 10px;
          margin-bottom: 14px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .preview-light {
          background: #FBF7EF;
          color: #2E251C;
        }
        .preview-dark {
          background: #0D1410;
          color: #F5F3EC;
          border-color: rgba(255, 255, 255, 0.1);
        }
        .preview-3d {
          background: radial-gradient(circle at 50% 20%, #1A2820 0%, #0F1712 100%);
          color: #FFFFFF;
          border: 1px solid rgba(245, 166, 35, 0.3);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.6);
        }
        .preview-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .preview-dot-row {
          display: flex;
          gap: 4px;
        }
        .preview-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.2);
        }
        .preview-dark .preview-dot {
          background: rgba(255, 255, 255, 0.3);
        }
        .preview-3d .preview-dot {
          background: #F5A623;
          box-shadow: 0 0 4px #F5A623;
        }
        .preview-fake-card {
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 0.68rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .preview-light .preview-fake-card {
          background: #FFFFFF;
          border: 1px solid #E7DCC8;
        }
        .preview-dark .preview-fake-card {
          background: #16241D;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .preview-3d .preview-fake-card {
          background: linear-gradient(145deg, #24352B, #16221A);
          border: 1px solid rgba(245, 166, 35, 0.3);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }
        .theme-card-title {
          font-weight: 800;
          font-size: 1.05rem;
          color: var(--ink);
          margin-bottom: 4px;
        }
        .theme-card-desc {
          font-size: 0.8rem;
          color: var(--ink-soft);
          line-height: 1.4;
          margin-bottom: 12px;
          flex: 1;
        }
        .lang-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 14px;
        }
        @media (max-width: 768px) {
          .lang-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .lang-card-option {
          border: 2px solid var(--line, #E7DCC8);
          border-radius: 12px;
          padding: 14px 16px;
          background: var(--card-bg, #FFFFFF);
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lang-card-option:hover {
          border-color: var(--shell-gold, #D9A441);
          transform: translateY(-2px);
        }
        .lang-card-option.active {
          border-color: var(--shell-gold, #D9A441);
          background: rgba(217, 164, 65, 0.1);
          box-shadow: 0 0 0 2px rgba(217, 164, 65, 0.25);
        }
        .lang-card-flag {
          font-size: 1.8rem;
        }
        .setting-switch-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--line, #E7DCC8);
        }
        .setting-switch-row:last-child {
          border-bottom: none;
        }
        .setting-text-col {
          flex: 1;
          padding-right: 20px;
        }
        .switch-toggle {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
          flex-shrink: 0;
        }
        .switch-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .switch-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #CBD5E1;
          transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 26px;
        }
        .switch-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input:checked + .switch-slider {
          background-color: #22C55E;
        }
        input:checked + .switch-slider:before {
          transform: translateX(24px);
        }
      `}</style>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'var(--brown-deep, #3D2314)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {toast}
        </div>
      )}

      {/* TOPBAR */}
      <div className="topbar">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Settings &amp; Preferences ⚙️</h1>
          <p className="text-soft" style={{ margin: '4px 0 0' }}>
            Theme selection, multilingual engine, WhatsApp integration, and display modes.
          </p>
        </div>
      </div>

      <div className="settings-container">
        {/* Settings Header */}
        <div className="flex-between mb-30" style={{ alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: '0 0 6px 0' }}>{t('settings.title', 'System & Reading Settings')}</h1>
            <p className="text-soft" style={{ margin: 0 }}>
              {t('settings.subtitle', 'Customize themes, language, communication preferences, and display modes.')}
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleSavePreferences}>
            <span>💾</span> <span>{t('settings.save', 'Save Preferences')}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="settings-nav-tabs">
          <button 
            type="button" 
            className={`settings-tab-btn ${activeTab === 'tab-appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('tab-appearance')}
          >
            <span>🎨</span> <span>{t('settings.tabAppearance', 'Theme & Visuals')}</span>
          </button>
          <button 
            type="button" 
            className={`settings-tab-btn ${activeTab === 'tab-language' ? 'active' : ''}`}
            onClick={() => setActiveTab('tab-language')}
          >
            <span>🌐</span> <span>{t('settings.tabLanguage', 'Language & Region')}</span>
          </button>
          <button 
            type="button" 
            className={`settings-tab-btn ${activeTab === 'tab-comm' ? 'active' : ''}`}
            onClick={() => setActiveTab('tab-comm')}
          >
            <span>💬</span> <span>{t('settings.tabComm', 'Communication & Alerts')}</span>
          </button>
          <button 
            type="button" 
            className={`settings-tab-btn ${activeTab === 'tab-reading' ? 'active' : ''}`}
            onClick={() => setActiveTab('tab-reading')}
          >
            <span>📖</span> <span>{t('settings.tabReading', 'Reading Preferences')}</span>
          </button>
          <button 
            type="button" 
            className={`settings-tab-btn ${activeTab === 'tab-account' ? 'active' : ''}`}
            onClick={() => setActiveTab('tab-account')}
          >
            <span>🛡️</span> <span>{t('settings.tabAccount', 'Privacy & Storage')}</span>
          </button>
        </div>

        {/* TAB 1: THEME & VISUAL EXPERIENCE */}
        {activeTab === 'tab-appearance' && (
          <div className="card panel settings-panel">
            <h3 style={{ marginTop: 0 }}>{t('settings.themeHeading', 'Interface Theme')}</h3>
            <p className="text-soft">{t('settings.themeDesc', 'Choose your preferred aesthetic style across all BOOK FORGE pages.')}</p>

            <div className="theme-cards-grid">
              {/* Light Theme */}
              <div 
                className={`theme-card-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => { setTheme('light'); showToastMsg('Theme updated to: LIGHT'); }}
              >
                <div className="theme-mini-preview preview-light">
                  <div className="preview-header-bar">
                    <span style={{ fontWeight: 700, fontSize: '0.72rem' }}>📖 BOOK FORGE</span>
                    <div className="preview-dot-row"><div className="preview-dot"></div><div className="preview-dot"></div></div>
                  </div>
                  <div className="preview-fake-card">
                    <span>The Silent Orchard</span>
                    <span style={{ color: '#B5652F' }}>100%</span>
                  </div>
                </div>
                <div className="theme-card-title">☀️ Light (Parchment)</div>
                <div className="theme-card-desc">Warm library cream aesthetic with ivory paper and terracotta accents. Gentle on eyes during the day.</div>
                <button type="button" className="btn btn-outline btn-sm btn-block" style={{ pointerEvents: 'none' }}>
                  {theme === 'light' ? '✓ Active Theme' : 'Activate LIGHT'}
                </button>
              </div>

              {/* Dark Theme */}
              <div 
                className={`theme-card-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => { setTheme('dark'); showToastMsg('Theme updated to: DARK'); }}
              >
                <div className="theme-mini-preview preview-dark">
                  <div className="preview-header-bar">
                    <span style={{ fontWeight: 700, fontSize: '0.72rem', color: '#F5A623' }}>🔥 BOOK FORGE</span>
                    <div className="preview-dot-row"><div className="preview-dot"></div><div className="preview-dot"></div></div>
                  </div>
                  <div className="preview-fake-card">
                    <span>Winter's Ledger</span>
                    <span style={{ color: '#F5A623' }}>75%</span>
                  </div>
                </div>
                <div className="theme-card-title">🌙 Dark (Obsidian Forge)</div>
                <div className="theme-card-desc">Rich midnight obsidian palette with deep forest emerald undertones and molten gold accents.</div>
                <button type="button" className="btn btn-outline btn-sm btn-block" style={{ pointerEvents: 'none' }}>
                  {theme === 'dark' ? '✓ Active Theme' : 'Activate DARK'}
                </button>
              </div>
            </div>

            {/* COLOR THEME & ACCENT PALETTES SECTION */}
            <div style={{ marginTop: '36px', paddingTop: '28px', borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>🎨 Color Theme & Accent Palette</h3>
                  <p className="text-soft" style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
                    Choose your primary literary color scheme. Colors adapt across all buttons, highlights, badges, and progress tracks in both Light and Dark modes.
                  </p>
                </div>
                {currColorThemeInfo && (
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(217, 164, 65, 0.15)',
                      color: 'var(--ink)',
                      border: '1px solid var(--line)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: currColorThemeInfo.primary }} />
                    Active: {currColorThemeInfo.name}
                  </span>
                )}
              </div>

              {/* Color Palettes Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                  gap: '16px',
                  marginTop: '16px'
                }}
              >
                {colorThemes.map((ct) => {
                  const isCurrent = colorTheme === ct.id;
                  return (
                    <div
                      key={ct.id}
                      onClick={() => {
                        setColorTheme(ct.id);
                        showToastMsg(`Color theme updated to: ${ct.name} ${ct.icon}`);
                      }}
                      style={{
                        border: isCurrent ? `2.5px solid ${ct.primary}` : '1.5px solid var(--line)',
                        borderRadius: '16px',
                        padding: '16px',
                        background: isCurrent ? 'rgba(217, 164, 65, 0.08)' : 'var(--card-bg, #FFFFFF)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isCurrent ? `0 0 0 3px ${ct.accent}40, 0 8px 20px rgba(0,0,0,0.08)` : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        {/* Swatch Bar */}
                        <div
                          style={{
                            height: '56px',
                            borderRadius: '10px',
                            background: `linear-gradient(135deg, ${ct.primary} 0%, ${ct.accent} 100%)`,
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 12px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                          }}
                        >
                          <span style={{ fontSize: '1.4rem' }}>{ct.icon}</span>
                          <span
                            style={{
                              background: 'rgba(255,255,255,0.25)',
                              color: '#fff',
                              borderRadius: '12px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backdropFilter: 'blur(4px)'
                            }}
                          >
                            Accent
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '0.98rem', color: 'var(--ink)' }}>{ct.name}</strong>
                          {isCurrent && <span style={{ color: ct.primary, fontWeight: 800 }}>✓</span>}
                        </div>
                        <p className="text-soft" style={{ fontSize: '0.78rem', margin: '0 0 12px', lineHeight: 1.4 }}>
                          {ct.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          width: '100%',
                          background: isCurrent ? ct.primary : 'transparent',
                          color: isCurrent ? '#FFFFFF' : ct.primary,
                          border: `1.5px solid ${ct.primary}`,
                          fontWeight: 700,
                          pointerEvents: 'none'
                        }}
                      >
                        {isCurrent ? '✓ Active Palette' : 'Select Palette'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Custom Accent Color Option Card */}
              <div
                style={{
                  marginTop: '18px',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: colorTheme === 'custom' ? `2px solid ${customColor}` : '1px solid var(--line)',
                  background: 'var(--card-bg, #FFFFFF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      showToastMsg('Custom color accent applied! 🎨');
                    }}
                    style={{
                      width: '42px',
                      height: '42px',
                      padding: 0,
                      border: '2px solid var(--line)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: 'none'
                    }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Custom Hex Color Picker</strong>
                    <p className="text-soft" style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>
                      Pick any custom hex accent color for personalized buttons and highlights.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <code style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.06)', fontWeight: 700 }}>
                    {customColor.toUpperCase()}
                  </code>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => {
                      setCustomColor(customColor);
                      showToastMsg('Custom accent activated!');
                    }}
                    style={{
                      background: colorTheme === 'custom' ? customColor : 'transparent',
                      color: colorTheme === 'custom' ? '#FFFFFF' : 'var(--ink)',
                      border: `1.5px solid ${customColor}`,
                      fontWeight: 700
                    }}
                  >
                    {colorTheme === 'custom' ? '✓ Custom Active' : 'Apply Custom'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTILINGUAL & REGION */}
        {activeTab === 'tab-language' && (
          <div className="card panel settings-panel">
            <h3 style={{ marginTop: 0 }}>{t('settings.langHeading', 'Platform Language')}</h3>
            <p className="text-soft">{t('settings.langDesc', 'Select your preferred reading guild language.')}</p>

            <div className="lang-cards-grid">
              {[
                { code: 'en', flag: '🇬🇧', name: 'English', desc: 'Default / International' },
                { code: 'es', flag: '🇪🇸', name: 'Español', desc: 'Spanish' },
                { code: 'fr', flag: '🇫🇷', name: 'Français', desc: 'French' },
                { code: 'de', flag: '🇩🇪', name: 'Deutsch', desc: 'German' },
                { code: 'ta', flag: '🇮🇳', name: 'தமிழ் (Tamil)', desc: 'தமிழ் இலக்கியம்' },
                { code: 'hi', flag: '🇮🇳', name: 'हिन्दी (Hindi)', desc: 'हिन्दी साहित्य' }
              ].map(lang => (
                <div 
                  key={lang.code}
                  className={`lang-card-option ${language === lang.code ? 'active' : ''}`}
                  onClick={() => { setLanguage(lang.code); showToastMsg(`Language updated to ${lang.name}!`); }}
                >
                  <span className="lang-card-flag">{lang.flag}</span>
                  <div>
                    <strong style={{ display: 'block' }}>{lang.name}</strong>
                    <span className="text-soft" style={{ fontSize: '0.78rem' }}>{lang.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMMUNICATION & WHATSAPP SETTINGS */}
        {activeTab === 'tab-comm' && (
          <div className="card panel settings-panel">
            <h3 style={{ marginTop: 0 }}>{t('settings.commHeading', 'Messaging & WhatsApp Integration')}</h3>
            <p className="text-soft">Configure WhatsApp notifications, in-app direct messaging, and SMS alerts.</p>

            <div className="setting-switch-row">
              <div className="setting-text-col">
                <strong style={{ display: 'block' }}>{t('settings.enableWhatsApp', 'Enable One-Click WhatsApp Actions')}</strong>
                <span className="text-soft" style={{ fontSize: '0.8rem' }}>Directly launch WhatsApp chats with club members and share reading progress to WhatsApp status.</span>
              </div>
              <label className="switch-toggle">
                <input 
                  type="checkbox" 
                  checked={prefWhatsApp} 
                  onChange={(e) => setPrefWhatsApp(e.target.checked)} 
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div className="setting-switch-row">
              <div className="setting-text-col">
                <strong style={{ display: 'block' }}>{t('settings.enableSMS', 'Enable Normal SMS / Mobile Triggers')}</strong>
                <span className="text-soft" style={{ fontSize: '0.8rem' }}>Allow triggering SMS texts for offline discussion reminders and mobile reading updates.</span>
              </div>
              <label className="switch-toggle">
                <input 
                  type="checkbox" 
                  checked={prefSMS} 
                  onChange={(e) => setPrefSMS(e.target.checked)} 
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div className="setting-switch-row">
              <div className="setting-text-col">
                <strong style={{ display: 'block' }}>{t('settings.readReceipts', 'Show Message Read Receipts (✓✓)')}</strong>
                <span className="text-soft" style={{ fontSize: '0.8rem' }}>Show double checkmarks when messages have been viewed by the recipient.</span>
              </div>
              <label className="switch-toggle">
                <input 
                  type="checkbox" 
                  checked={prefReadReceipts} 
                  onChange={(e) => setPrefReadReceipts(e.target.checked)} 
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div className="setting-switch-row">
              <div className="setting-text-col">
                <strong style={{ display: 'block' }}>{t('settings.soundEffects', 'Chat Sound Effects & Chimes')}</strong>
                <span className="text-soft" style={{ fontSize: '0.8rem' }}>Play an audible notification chime when receiving messages in discussions or DMs.</span>
              </div>
              <label className="switch-toggle">
                <input 
                  type="checkbox" 
                  checked={prefSounds} 
                  onChange={(e) => setPrefSounds(e.target.checked)} 
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line, #E7DCC8)' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Your WhatsApp / Mobile Phone Number:</label>
              <input 
                type="tel" 
                value={prefPhoneNumber} 
                onChange={(e) => setPrefPhoneNumber(e.target.value)} 
                style={{ maxWidth: 340, padding: 10, borderRadius: 8 }}
              />
              <p className="text-soft" style={{ fontSize: '0.78rem', marginTop: 4 }}>
                Used for WhatsApp reading circle invitations and SMS verification alerts.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: READING PREFERENCES */}
        {activeTab === 'tab-reading' && (
          <div className="card panel settings-panel">
            <h3 style={{ marginTop: 0 }}>Reading &amp; Typography Preferences</h3>
            <p className="text-soft">Fine-tune the typography and layout for book descriptions and reading sessions.</p>

            <div className="setting-switch-row">
              <div className="setting-text-col">
                <strong style={{ display: 'block' }}>Preferred Reading Typography</strong>
                <span className="text-soft" style={{ fontSize: '0.8rem' }}>Choose between classical Fraunces serif or clean Source Sans for titles.</span>
              </div>
              <select 
                value={prefFont} 
                onChange={(e) => setPrefFont(e.target.value)}
                style={{ maxWidth: 220, padding: '8px 12px', borderRadius: 8 }}
              >
                <option value="serif">Classical Literary Serif</option>
                <option value="sans">Modern Clean Sans</option>
              </select>
            </div>

            <div className="setting-switch-row">
              <div className="setting-text-col">
                <strong style={{ display: 'block' }}>Text Display Scale</strong>
                <span className="text-soft" style={{ fontSize: '0.8rem' }}>Adjust the sizing of reading cards and catalog summaries.</span>
              </div>
              <select 
                value={prefScale} 
                onChange={(e) => setPrefScale(e.target.value)}
                style={{ maxWidth: 220, padding: '8px 12px', borderRadius: 8 }}
              >
                <option value="100">Standard (100%)</option>
                <option value="90">Compact (90%)</option>
                <option value="115">Large &amp; Relaxed (115%)</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 5: PRIVACY & DATA */}
        {activeTab === 'tab-account' && (
          <div className="card panel settings-panel">
            <h3 style={{ marginTop: 0 }}>Privacy &amp; Local Storage</h3>
            <p className="text-soft">Manage local data, clear cache, and export your personal reading records.</p>

            <div className="setting-switch-row">
              <div className="setting-text-col">
                <strong style={{ display: 'block' }}>Clear Communications Cache</strong>
                <span className="text-soft" style={{ fontSize: '0.8rem' }}>Reset local message history and temporary chat attachments.</span>
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleClearChatCache}>
                Clear Chat Data
              </button>
            </div>

            <div className="setting-switch-row">
              <div className="setting-text-col">
                <strong style={{ display: 'block' }}>Reset All Settings to Factory Default</strong>
                <span className="text-soft" style={{ fontSize: '0.8rem' }}>Restores Light theme, English language, and default alert preferences.</span>
              </div>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={handleResetDefaults}
                style={{ color: '#EA580C', borderColor: '#EA580C' }}
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
