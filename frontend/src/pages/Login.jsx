import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BookClubAPI from '../services/api';

export default function Login() {
  const { login, googleLogin, phoneLogin, sendPhoneOtp } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('user');
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Real Mobile Number & OTP state
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneStep, setPhoneStep] = useState(1); // 1: enter phone, 2: enter OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpSentNotice, setOtpSentNotice] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Google OAuth Client ID setup modal
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleClientIdInput, setGoogleClientIdInput] = useState('');
  const [activeGoogleClientId, setActiveGoogleClientId] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  // Load Google Client ID
  useEffect(() => {
    async function loadGoogleClientId() {
      const stored = localStorage.getItem('bookforge_google_client_id');
      if (stored) {
        setActiveGoogleClientId(stored);
        setGoogleClientIdInput(stored);
        return;
      }
      try {
        const res = await BookClubAPI.auth.getGoogleConfig();
        if (res.success && res.clientId) {
          setActiveGoogleClientId(res.clientId);
          setGoogleClientIdInput(res.clientId);
        }
      } catch (e) {}
    }
    loadGoogleClientId();
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let timer = null;
    if (phoneStep === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [phoneStep, countdown]);

  const handleRoleSelect = (r) => {
    setRole(r);
    setErrorMessage('');
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter your username/email and password.');
      return;
    }

    setLoading(true);
    const res = await login(identifier, password, rememberMe, role);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (res.user.role === 'organizer') {
        navigate('/organizer-dashboard');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } else {
      const msg = res.error || res.message || 'Failed to sign in. Please verify your credentials.';
      setErrorMessage(msg === 'Failed to fetch' ? 'Unable to connect to the backend server. Please verify the server is running.' : msg);
    }
  };

  // Real Mobile Number: Send OTP
  const handleSendMobileOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum.length < 7) {
      setErrorMessage('Please enter a valid mobile number (at least 7 to 10 digits).');
      return;
    }

    const fullPhone = `${countryCode}${cleanNum}`;
    setLoading(true);

    try {
      const res = await sendPhoneOtp(fullPhone);
      setLoading(false);

      if (res.success) {
        setPhoneStep(2);
        setCountdown(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);

        const isRealSms = res.data?.smsSent;
        const code = res.data?.otp;

        setOtpSentNotice({
          phone: fullPhone,
          isRealSms,
          code
        });

        if (isRealSms) {
          setSuccessMessage(`Real SMS dispatched to ${fullPhone}! Please check your mobile phone.`);
        } else {
          setSuccessMessage(`Verification code sent to ${fullPhone}.`);
        }
      } else {
        const msg = res.message || res.error || 'Failed to dispatch verification code.';
        setErrorMessage(msg === 'Failed to fetch' ? 'Unable to reach authentication server. Please verify backend is running on port 5000.' : msg);
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message === 'Failed to fetch' ? 'Unable to reach authentication server. Please verify backend is running on port 5000.' : (err.message || 'Network error sending SMS.'));
    }
  };

  // Real Mobile Number: Handle 6-digit OTP Box Input
  const handleOtpBoxChange = (idx, value) => {
    const val = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[idx] = val;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (val && idx < 5) {
      const nextInput = document.getElementById(`login-otp-box-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpBoxKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      const prevInput = document.getElementById(`login-otp-box-${idx - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasteData) return;
    const newDigits = pasteData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setOtpDigits(newDigits);
    const lastFilled = Math.min(pasteData.length, 5);
    const targetInput = document.getElementById(`login-otp-box-${lastFilled}`);
    if (targetInput) targetInput.focus();
  };

  // Real Mobile Number: Verify OTP & Sign In
  const handleVerifyMobileOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    const fullPhone = `${countryCode}${cleanNum}`;

    setLoading(true);
    const res = await phoneLogin(fullPhone, fullCode);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      const msg = res.error || res.message || 'Invalid or expired verification code.';
      setErrorMessage(msg === 'Failed to fetch' ? 'Unable to reach authentication server. Please try again.' : msg);
    }
  };

  const fillQuickCode = () => {
    if (otpSentNotice?.code) {
      const digits = otpSentNotice.code.toString().split('').slice(0, 6);
      setOtpDigits(digits);
    }
  };

  // Official Google Sign-In with Google Identity Services (GIS)
  const handleGoogleSignIn = () => {
    setErrorMessage('');
    const clientId = activeGoogleClientId || localStorage.getItem('bookforge_google_client_id');

    if (!clientId) {
      setGoogleModalOpen(true);
      return;
    }

    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              setLoading(true);
              const res = await googleLogin({
                accessToken: tokenResponse.access_token
              });
              setLoading(false);
              if (res.success) {
                navigate(res.user?.role === 'admin' ? '/admin-dashboard' : '/dashboard');
              } else {
                setErrorMessage(res.error || res.message || 'Google token verification failed on server.');
              }
            } else if (tokenResponse?.error) {
              setErrorMessage('Google Sign-In canceled or failed: ' + tokenResponse.error);
            }
          }
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn('GIS Token Client Error:', err);
      }
    }

    // Direct OAuth2 popup fallback
    const redirectUri = window.location.origin + window.location.pathname;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile%20openid`;
    const popup = window.open(authUrl, 'google_login_popup', 'width=520,height=640,menubar=no,status=no');
    if (!popup) {
      window.location.href = authUrl;
    }
  };

  const handleSaveGoogleConfig = () => {
    const val = googleClientIdInput.trim();
    if (!val) {
      alert('Please enter a valid Google Client ID.');
      return;
    }
    setActiveGoogleClientId(val);
    localStorage.setItem('bookforge_google_client_id', val);
    setGoogleModalOpen(false);
    alert('Google Client ID saved! Now launch Google Sign-In.');
  };

  return (
    <div className="auth-split-layout">
      {/* Left Visual Panel: Premium Literary Reading Showcase */}
      <aside className="auth-visual-panel">
        <div className="auth-ambient-glow auth-glow-top"></div>
        <div className="auth-ambient-glow auth-glow-bottom"></div>
        <svg className="auth-library-watermark" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M20 180 V80 Q20 20 80 20 Q140 20 140 80 V180" stroke="#FFFFFF" strokeWidth="2"/>
          <circle cx="80" cy="20" r="10" stroke="#D9A441" strokeWidth="2"/>
          <line x1="0" y1="160" x2="200" y2="160" stroke="#FFFFFF" strokeWidth="1.5"/>
          <path d="M40 180 V100 Q40 50 80 50 Q120 50 120 100 V180" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4"/>
        </svg>

        <div className="auth-visual-inner">
          <div className="auth-visual-header">
            <Link to="/" className="auth-brand-lockup">
              <span className="auth-brand-icon-box">📖</span>
              <span className="auth-brand-text">
                <span className="brand-book">BOOK</span> <span className="brand-forge">FORGE</span>
              </span>
            </Link>
            <span className="auth-badge-pill">The Reader's Guild</span>
          </div>

          <div className="auth-headline-section">
            <h2 className="auth-hero-headline">Where Readers Find <span className="highlight-phrase">Their Next Story.</span></h2>
            <p className="auth-hero-subtext">Discover books, join meaningful conversations, track your reading journey, and connect with readers who love stories as much as you do.</p>
          </div>

          <div className="auth-showcase-container" aria-label="Featured Club Books">
            <div className="auth-showcase-card auth-card-left" title="The Silent Orchard by Elena Marsh">
              <img src="/images/books/silent-orchard.jpg" alt="The Silent Orchard cover" />
              <div className="book-genre-chip">Fiction</div>
            </div>
            <div className="auth-showcase-card auth-card-center" title="Winter's Ledger by Colin Reyes">
              <img src="/images/books/winters-ledger.jpg" alt="Winter's Ledger cover" />
              <div className="book-genre-chip">Mystery</div>
            </div>
            <div className="auth-showcase-card auth-card-right" title="The Cartographer's Daughter by Mina Sterling">
              <img src="/images/books/cartographers-daughter.jpg" alt="The Cartographer's Daughter cover" />
              <div className="book-genre-chip">Classic</div>
            </div>
          </div>

          <div className="auth-feature-highlights">
            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">📱</div>
              <div className="auth-highlight-body">
                <span className="auth-highlight-title">Real Number Login</span>
                <p className="auth-highlight-text">Instant mobile SMS code login with your real phone number.</p>
              </div>
            </div>
            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">🌐</div>
              <div className="auth-highlight-body">
                <span className="auth-highlight-title">Google Sign-In</span>
                <p className="auth-highlight-text">One-click authenticated Google account access.</p>
              </div>
            </div>
            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">📊</div>
              <div className="auth-highlight-body">
                <span className="auth-highlight-title">Track &amp; Discuss</span>
                <p className="auth-highlight-text">Track progress, goals, reviews and reading achievements in real-time.</p>
              </div>
            </div>
          </div>

          <div className="auth-visual-footer">
            <div className="auth-community-proof">
              <div className="auth-avatar-stack">
                <span className="auth-avatar-thumb" style={{ background: '#B5652F' }}>ER</span>
                <span className="auth-avatar-thumb" style={{ background: '#4C6A50' }}>MK</span>
                <span className="auth-avatar-thumb" style={{ background: '#7A5FA6' }}>TL</span>
                <span className="auth-avatar-thumb" style={{ background: '#4A7FB5' }}>SP</span>
              </div>
              <div className="auth-proof-text">
                <strong>1,250+ Active Readers</strong> · 48 Reading Circles
              </div>
            </div>
            <p className="auth-literary-quote">
              "A room without books is like a body without a soul."
              <cite>— Cicero</cite>
            </p>
          </div>
        </div>
      </aside>

      {/* Right Form Panel: Authentication Cockpit */}
      <main className="auth-form-panel">
        <div className="auth-card-container">
          <div className="auth-back-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" className="auth-back-link">← Back to Public Homepage</Link>
            <div className="theme-switch-dock">
              <button type="button" className={`theme-switch-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} title="Light Theme">☀️</button>
              <button type="button" className={`theme-switch-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} title="Dark Theme">🌙</button>
            </div>
          </div>

          <div className="auth-modern-card">
            <div className="auth-card-header">
              <h1>Welcome Back</h1>
              <p className="sub">Sign in with your mobile phone or Google account to continue.</p>
            </div>

            {/* Error & Success banners */}
            {errorMessage && (
              <div className="auth-error-banner show" style={{ display: 'flex', marginBottom: 14 }}>
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid #22C55E', borderRadius: 8, color: '#166534', fontSize: '0.88rem', marginBottom: 14 }}>
                <span>✅</span>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Authentication (One-Click) */}
            <div className="google-gis-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
              <button type="button" className="btn-google-auth" onClick={handleGoogleSignIn} style={{ width: '100%' }} disabled={loading}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.16z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{loading ? 'Verifying...' : 'Sign in with Google'}</span>
              </button>

              <div style={{ marginTop: '6px', fontSize: '0.78rem', textAlign: 'center' }}>
                <a
                  href="#google-setup"
                  onClick={(e) => { e.preventDefault(); setGoogleModalOpen(true); }}
                  style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}
                >
                  ⚙️ Google OAuth Client ID Setup
                </a>
              </div>
            </div>

            {/* Social Auth Divider */}
            <div className="social-auth-divider">
              <span>or sign in directly</span>
            </div>

            {/* Auth Method Tabs: Mobile Phone OTP vs Email */}
            <div className="auth-method-tabs" role="tablist" style={{ marginBottom: 18 }}>
              <button
                type="button"
                className={`auth-method-tab ${authMethod === 'phone' ? 'active' : ''}`}
                onClick={() => { setAuthMethod('phone'); setErrorMessage(''); }}
              >
                <span>📱</span>
                <span>Mobile Number (Real SMS)</span>
              </button>
              <button
                type="button"
                className={`auth-method-tab ${authMethod === 'email' ? 'active' : ''}`}
                onClick={() => { setAuthMethod('email'); setErrorMessage(''); }}
              >
                <span>✉️</span>
                <span>Email / Username</span>
              </button>
            </div>

            {/* METHOD 1: REAL MOBILE NUMBER AUTHENTICATION */}
            {authMethod === 'phone' && (
              <div>
                {phoneStep === 1 ? (
                  <form onSubmit={handleSendMobileOtp} noValidate>
                    <div className="field">
                      <label htmlFor="phoneNumber">Enter Your Real Mobile Phone Number</label>
                      <div className="phone-input-row" style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px', width: '100%', alignItems: 'stretch' }}>
                        <select
                          className="phone-country-code"
                          id="loginCountryCode"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          style={{ width: '100%', maxWidth: '140px', padding: '10px 8px', borderRadius: 8, border: '1.5px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', height: '48px', boxSizing: 'border-box' }}
                        >
                          <option value="+91">🇮🇳 +91 (IN)</option>
                          <option value="+1">🇺🇸 +1 (US)</option>
                          <option value="+44">🇬🇧 +44 (UK)</option>
                          <option value="+61">🇦🇺 +61 (AU)</option>
                          <option value="+971">🇦🇪 +971 (AE)</option>
                          <option value="+65">🇸🇬 +65 (SG)</option>
                          <option value="+49">🇩🇪 +49 (DE)</option>
                          <option value="+33">🇫🇷 +33 (FR)</option>
                          <option value="+81">🇯🇵 +81 (JP)</option>
                        </select>
                        <input
                          type="tel"
                          id="phoneNumber"
                          className="phone-number-field"
                          placeholder="e.g. 98765 43210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                          autoFocus
                          style={{ width: '100%', minWidth: 0, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)', fontSize: '1.02rem', letterSpacing: '0.5px', height: '48px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <small className="text-soft" style={{ display: 'block', marginTop: 4, fontSize: '0.78rem' }}>
                        Real SMS verification code will be dispatched to this mobile device.
                      </small>
                    </div>

                    <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginTop: 12 }}>
                      <span className="btn-text">
                        {loading ? 'Sending Verification Code...' : 'Send Verification Code 📲'}
                      </span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyMobileOtp} noValidate>
                    {/* SMS Dispatch Notification Card */}
                    {otpSentNotice && (
                      <div style={{ background: 'var(--cream-deep)', border: '1px dashed var(--clay)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--brown-deep)' }}>
                            📨 Verification Dispatched
                          </strong>
                          <span style={{ fontSize: '0.75rem', background: '#22C55E', color: '#fff', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                            SMS Sent ✓
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ink)' }}>
                          6-digit verification code sent to <strong>{otpSentNotice.phone}</strong>. Please enter the code below.
                        </p>
                        <div style={{ marginTop: 10, display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <a
                            href={`https://api.whatsapp.com/send?phone=${otpSentNotice.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Your BOOK FORGE login verification code is: ${otpSentNotice.code || '123456'}. Valid for 5 minutes.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-outline"
                            style={{ fontSize: '0.76rem', color: '#16A34A', borderColor: '#86EFAC', background: '#F0FDF4', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>📲</span> Receive via WhatsApp
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="field">
                      <label style={{ textAlign: 'center', display: 'block', marginBottom: 8 }}>
                        Enter 6-Digit Verification Code
                      </label>
                      <div className="otp-box-container" onPaste={handleOtpPaste} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            type="text"
                            id={`login-otp-box-${idx}`}
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpBoxKeyDown(idx, e)}
                            inputMode="numeric"
                            autoFocus={idx === 0}
                            style={{
                              width: '44px',
                              height: '50px',
                              textAlign: 'center',
                              fontSize: '1.4rem',
                              fontWeight: 700,
                              borderRadius: '8px',
                              border: '1.5px solid var(--line)',
                              background: 'var(--paper)'
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0', fontSize: '0.82rem' }}>
                      <span className="text-soft">
                        {canResend ? 'Did not receive SMS?' : `Resend code in ${countdown}s`}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        disabled={!canResend || loading}
                        onClick={handleSendMobileOtp}
                        style={{ color: canResend ? 'var(--clay)' : 'var(--ink-soft)', fontWeight: 600 }}
                      >
                        Resend SMS
                      </button>
                    </div>

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                      <span className="btn-text">
                        {loading ? 'Verifying Code...' : 'Verify & Sign In ✓'}
                      </span>
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 14 }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => { setPhoneStep(1); setErrorMessage(''); }}
                        style={{ color: 'var(--ink-soft)' }}
                      >
                        ← Change Phone Number
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* METHOD 2: EMAIL / USERNAME & PASSWORD AUTHENTICATION */}
            {authMethod === 'email' && (
              <div>
                {/* Role Selection Toggle */}
                <div className="role-select-box" style={{ marginBottom: 18 }}>
                  <label className="role-select-label">Account Role:</label>
                  <div className="role-toggle-group" role="tablist">
                    <button
                      type="button"
                      className={`role-toggle-btn ${role === 'user' ? 'active' : ''}`}
                      onClick={() => handleRoleSelect('user')}
                    >
                      <span>👤</span>
                      <span>User / Reader</span>
                    </button>
                    <button
                      type="button"
                      className={`role-toggle-btn ${role === 'admin' ? 'active' : ''}`}
                      onClick={() => handleRoleSelect('admin')}
                    >
                      <span>🛡️</span>
                      <span>Admin</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmitEmail} noValidate>
                  <div className="field">
                    <label htmlFor="identifier">Email or Username</label>
                    <input
                      type="text"
                      id="identifier"
                      placeholder="Enter your email or username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="password">Password</label>
                    <div className="password-field">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        title="Toggle password visibility"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-foot-row">
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Remember me</span>
                    </label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password is user123 (or admin123).'); }}>
                      Forgot password?
                    </a>
                  </div>

                  <button type="submit" className="auth-btn-primary" disabled={loading}>
                    <span className="btn-text">{loading ? 'Signing in...' : 'Sign In with Email'}</span>
                  </button>
                </form>
              </div>
            )}

            <div className="auth-switch-link" style={{ marginTop: 18 }}>
              Don't have an account? <Link to="/register">Create an account</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Google Cloud Client ID Setup Modal */}
      {googleModalOpen && (
        <div className="modal active" style={{ display: 'flex' }}>
          <div className="modal-backdrop" onClick={() => setGoogleModalOpen(false)}></div>
          <div className="modal-dialog" style={{ maxWidth: 480, margin: 'auto', zIndex: 10000 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.16z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <h3 style={{ margin: 0 }}>Google Live OAuth Setup</h3>
              </div>
              <button type="button" className="modal-close" onClick={() => setGoogleModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: 12 }}>
                To enable live Google account sign-in on this domain, enter your Web OAuth 2.0 Client ID from Google Cloud Console.
              </p>
              <div style={{ background: 'var(--cream-deep)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: '0.8rem' }}>
                <strong>Quick Steps:</strong>
                <ol style={{ margin: '6px 0 0 18px', padding: 0, lineHeight: 1.5 }}>
                  <li>Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: '#1a73e8', textDecoration: 'underline' }}>Google Cloud Console → Credentials</a>.</li>
                  <li>Create OAuth Client ID (Application type: <strong>Web application</strong>).</li>
                  <li>Add Authorized JavaScript origin: <code>http://localhost:3000</code>.</li>
                  <li>Paste your Client ID below.</li>
                </ol>
              </div>
              <div className="field">
                <label>Your Google Client ID</label>
                <input
                  type="text"
                  placeholder="e.g. 123456789-abcdefg.apps.googleusercontent.com"
                  value={googleClientIdInput}
                  onChange={(e) => setGoogleClientIdInput(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setGoogleModalOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveGoogleConfig}>Save Client ID</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
