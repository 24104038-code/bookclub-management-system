import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import BookClubAPI from '../services/api';

export default function Register() {
  const { register, googleLogin, phoneLogin, sendPhoneOtp } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Registration Mode: 'phone' | 'email'
  const [regMode, setRegMode] = useState('phone');

  // Email form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [favoriteGenre, setFavoriteGenre] = useState('Fantasy');
  const [avatarSelect, setAvatarSelect] = useState('initials');
  const [bio, setBio] = useState('');
  const [terms, setTerms] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [bannerSuccess, setBannerSuccess] = useState('');

  // Mobile registration state
  const [phoneFullName, setPhoneFullName] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneStep, setPhoneStep] = useState(1);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpSentNotice, setOtpSentNotice] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { width: '0%', text: 'Enter password', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { width: '25%', text: 'Weak password', color: '#C0554A' };
    if (score === 2) return { width: '55%', text: 'Moderate password', color: '#D9A441' };
    return { width: '100%', text: 'Strong password', color: '#4C6A50' };
  };
  const strength = getPasswordStrength();

  // Google Setup Modal state
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleClientIdInput, setGoogleClientIdInput] = useState('');
  const [activeGoogleClientId, setActiveGoogleClientId] = useState('');

  // Resolve Google Client ID
  useEffect(() => {
    async function loadGoogleClientId() {
      // 1. Check environment variable
      const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (envId) {
        setActiveGoogleClientId(envId);
        setGoogleClientIdInput(envId);
        return;
      }

      // 2. Check backend configuration
      try {
        const res = await BookClubAPI.auth.getGoogleConfig();
        if (res.success && res.clientId) {
          setActiveGoogleClientId(res.clientId);
          setGoogleClientIdInput(res.clientId);
          return;
        }
      } catch (e) {}

      // 3. Fallback to localStorage
      const stored = localStorage.getItem('bookforge_google_client_id');
      if (stored) {
        setActiveGoogleClientId(stored);
        setGoogleClientIdInput(stored);
      }
    }
    loadGoogleClientId();
  }, []);

  // Phone countdown timer
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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setBannerError('');
    setBannerSuccess('');
    const errors = {};

    if (!fullName.trim()) errors.fullName = 'Full name is required';
    if (!username.trim()) errors.username = 'Username is required';
    else if (username.length < 3) errors.username = 'Username must be at least 3 characters';
    if (!email.trim()) errors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!terms) errors.terms = 'You must agree to the community guidelines';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await register({
        name: fullName,
        username,
        email,
        password,
        favoriteGenre,
        bio,
        avatarStyle: avatarSelect
      });

      if (res.success) {
        navigate('/dashboard');
      } else {
        setBannerError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setBannerError(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mobile: Send OTP
  const handleSendMobileRegOtp = async (e) => {
    e?.preventDefault();
    setBannerError('');
    setBannerSuccess('');

    if (!phoneFullName.trim()) {
      setBannerError('Please enter your full name.');
      return;
    }

    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum.length < 7) {
      setBannerError('Please enter a valid mobile number.');
      return;
    }

    const fullPhone = `${phoneCountryCode}${cleanNum}`;
    setIsSubmitting(true);

    try {
      const res = await sendPhoneOtp(fullPhone);
      setIsSubmitting(false);

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
          setBannerSuccess(`Real SMS verification code dispatched to ${fullPhone}!`);
        } else {
          setBannerSuccess(`Verification code sent to ${fullPhone}.`);
        }
      } else {
        setBannerError(res.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setBannerError(err.message || 'Error sending SMS.');
    }
  };

  const handleOtpBoxChange = (idx, value) => {
    const val = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[idx] = val;
    setOtpDigits(newDigits);

    if (val && idx < 5) {
      const nextInput = document.getElementById(`reg-otp-box-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpBoxKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      const prevInput = document.getElementById(`reg-otp-box-${idx - 1}`);
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
    const targetInput = document.getElementById(`reg-otp-box-${lastFilled}`);
    if (targetInput) targetInput.focus();
  };

  const handleVerifyMobileRegOtp = async (e) => {
    e.preventDefault();
    setBannerError('');
    setBannerSuccess('');

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setBannerError('Please enter the complete 6-digit verification code.');
      return;
    }

    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    const fullPhone = `${phoneCountryCode}${cleanNum}`;

    setIsSubmitting(true);
    const res = await phoneLogin(fullPhone, fullCode, phoneFullName.trim());
    setIsSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setBannerError(res.error || res.message || 'Invalid or expired verification code.');
    }
  };

  const fillQuickCode = () => {
    if (otpSentNotice?.code) {
      const digits = otpSentNotice.code.toString().split('').slice(0, 6);
      setOtpDigits(digits);
    }
  };

  const handleGoogleRegister = () => {
    setBannerError('');
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
              setIsSubmitting(true);
              const res = await googleLogin({
                accessToken: tokenResponse.access_token
              });
              setIsSubmitting(false);
              if (res.success) {
                navigate('/dashboard');
              } else {
                setBannerError(res.error || res.message || 'Google registration verification failed.');
              }
            } else if (tokenResponse?.error) {
              setBannerError('Google registration canceled or failed: ' + tokenResponse.error);
            }
          }
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn('GIS Token Client Error:', err);
      }
    }

    const redirectUri = window.location.origin + window.location.pathname;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile%20openid`;
    const popup = window.open(authUrl, 'google_reg_popup', 'width=520,height=640,menubar=no,status=no');
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
    alert('Google Client ID saved! Now click Register with Google.');
  };

  const handleQuickGoogleDemo = async () => {
    setGoogleModalOpen(false);
    setIsSubmitting(true);
    const res = await googleLogin({
      email: 'newreader.google@example.com',
      name: 'Google Reader',
      googleId: 'google_demo_' + Date.now(),
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    });
    setIsSubmitting(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setBannerError(res.error || 'Quick Google demo login failed.');
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Visual Panel */}
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
            <h2 className="auth-hero-headline">Create Your <span className="highlight-phrase">Reading Identity.</span></h2>
            <p className="auth-hero-subtext">Join our community of book lovers. Track pages, write reviews, earn achievement badges, and participate in lively circle discussions.</p>
          </div>

          <div className="auth-feature-highlights">
            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">📱</div>
              <div className="auth-highlight-body">
                <span className="auth-highlight-title">Real Number Registration</span>
                <p className="auth-highlight-text">Instant account creation with your real phone number and SMS code.</p>
              </div>
            </div>
            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">🌐</div>
              <div className="auth-highlight-body">
                <span className="auth-highlight-title">Google Sign-In</span>
                <p className="auth-highlight-text">One-click authenticated Google account setup.</p>
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

      {/* Right Form Panel: Registration Flow */}
      <main className="auth-form-panel">
        <div className="auth-card-container wide">
          <div className="auth-back-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" className="auth-back-link">← Back to Public Homepage</Link>
            <div className="theme-switch-dock">
              <button type="button" className={`theme-switch-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} title="Light Theme">☀️</button>
              <button type="button" className={`theme-switch-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} title="Dark Theme">🌙</button>
            </div>
          </div>

          <div className="auth-modern-card">
            <div className="auth-card-header">
              <h1>Join BOOK FORGE</h1>
              <p className="sub">Set up your reader profile and start discovering stories.</p>
            </div>

            {bannerError && (
              <div className="alert alert-error" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#FDF2F2', border: '1px solid #F87171', color: '#991B1B' }}>
                {bannerError}
              </div>
            )}
            {bannerSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid #22C55E', borderRadius: 8, color: '#166534', fontSize: '0.88rem', marginBottom: 14 }}>
                <span>✅</span>
                <span>{bannerSuccess}</span>
              </div>
            )}

            {/* Google Registration */}
            <div className="google-gis-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
              <button type="button" className="btn-google-auth" onClick={handleGoogleRegister} style={{ width: '100%' }} disabled={isSubmitting}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.16z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{isSubmitting ? 'Registering with Google...' : 'Register with Google'}</span>
              </button>

              <div style={{ marginTop: '6px', fontSize: '0.78rem', textAlign: 'center' }}>
                <a href="#google-setup" onClick={(e) => { e.preventDefault(); setGoogleModalOpen(true); }} style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
                  ⚙️ Google OAuth Client ID Setup
                </a>
              </div>
            </div>

            {/* Social Auth Divider */}
            <div className="social-auth-divider">
              <span>or create account with</span>
            </div>

            {/* Auth Method Tabs: Mobile vs Email */}
            <div className="auth-method-tabs" role="tablist" style={{ marginBottom: 18 }}>
              <button
                type="button"
                className={`auth-method-tab ${regMode === 'phone' ? 'active' : ''}`}
                onClick={() => { setRegMode('phone'); setBannerError(''); }}
              >
                <span>📱</span>
                <span>Mobile Number (Real SMS)</span>
              </button>
              <button
                type="button"
                className={`auth-method-tab ${regMode === 'email' ? 'active' : ''}`}
                onClick={() => { setRegMode('email'); setBannerError(''); }}
              >
                <span>✉️</span>
                <span>Email Registration</span>
              </button>
            </div>

            {/* TAB 1: REAL MOBILE REGISTRATION */}
            {regMode === 'phone' && (
              <div>
                {phoneStep === 1 ? (
                  <form onSubmit={handleSendMobileRegOtp} noValidate>
                    <div className="field">
                      <label htmlFor="phoneFullName">Your Full Name</label>
                      <input
                        type="text"
                        id="phoneFullName"
                        value={phoneFullName}
                        onChange={(e) => setPhoneFullName(e.target.value)}
                        placeholder="e.g. Maya Lin"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="phoneNumber">Enter Your Real Mobile Phone Number</label>
                      <div className="phone-input-row" style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px', width: '100%', alignItems: 'stretch' }}>
                        <select
                          className="phone-country-code"
                          id="registerCountryCode"
                          value={phoneCountryCode}
                          onChange={(e) => setPhoneCountryCode(e.target.value)}
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
                          style={{ width: '100%', minWidth: 0, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)', fontSize: '1.02rem', letterSpacing: '0.5px', height: '48px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <small className="text-soft" style={{ display: 'block', marginTop: 4, fontSize: '0.78rem' }}>
                        Real SMS verification code will be dispatched to this mobile phone.
                      </small>
                    </div>

                    <button type="submit" className="auth-btn-primary" disabled={isSubmitting} style={{ marginTop: 14 }}>
                      <span className="btn-text">
                        {isSubmitting ? 'Sending Code...' : 'Send Verification Code 📲'}
                      </span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyMobileRegOtp} noValidate>
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
                            href={`https://api.whatsapp.com/send?phone=${otpSentNotice.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Your BOOK FORGE registration verification code is: ${otpSentNotice.code || '123456'}. Valid for 5 minutes.`)}`}
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
                            id={`reg-otp-box-${idx}`}
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
                        disabled={!canResend || isSubmitting}
                        onClick={handleSendMobileRegOtp}
                        style={{ color: canResend ? 'var(--clay)' : 'var(--ink-soft)', fontWeight: 600 }}
                      >
                        Resend SMS
                      </button>
                    </div>

                    <button type="submit" className="auth-btn-primary" disabled={isSubmitting}>
                      <span className="btn-text">
                        {isSubmitting ? 'Verifying...' : 'Verify & Complete Registration ✓'}
                      </span>
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 14 }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => { setPhoneStep(1); setBannerError(''); }}
                        style={{ color: 'var(--ink-soft)' }}
                      >
                        ← Change Phone Number
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: EMAIL REGISTRATION */}
            {regMode === 'email' && (
              <form id="registerForm" onSubmit={handleEmailSubmit} noValidate>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Elena Ramos"
                      required
                    />
                    {fieldErrors.fullName && <span className="field-error" style={{ color: '#C0554A', fontSize: '0.78rem' }}>{fieldErrors.fullName}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. elenareads"
                      required
                    />
                    {fieldErrors.username && <span className="field-error" style={{ color: '#C0554A', fontSize: '0.78rem' }}>{fieldErrors.username}</span>}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@example.com"
                    required
                  />
                  {fieldErrors.email && <span className="field-error" style={{ color: '#C0554A', fontSize: '0.78rem' }}>{fieldErrors.email}</span>}
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="password">Password</label>
                    <div className="password-field">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: strength.width, background: strength.color }}></div>
                    </div>
                    <span className="strength-text" style={{ fontSize: '0.75rem', color: strength.color || 'var(--ink-soft)' }}>
                      {strength.text}
                    </span>
                    {fieldErrors.password && <span className="field-error" style={{ color: '#C0554A', fontSize: '0.78rem', display: 'block' }}>{fieldErrors.password}</span>}
                  </div>

                  <div className="field">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                    />
                    {fieldErrors.confirmPassword && <span className="field-error" style={{ color: '#C0554A', fontSize: '0.78rem' }}>{fieldErrors.confirmPassword}</span>}
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="favoriteGenre">Primary Favorite Genre</label>
                    <select
                      id="favoriteGenre"
                      value={favoriteGenre}
                      onChange={(e) => setFavoriteGenre(e.target.value)}
                    >
                      <option value="Fiction">Fiction</option>
                      <option value="Fantasy">Fantasy & Lore</option>
                      <option value="Mystery">Mystery & Thriller</option>
                      <option value="Classic">Classics & Poetry</option>
                      <option value="Non-Fiction">Non-Fiction & Science</option>
                      <option value="Philosophy">Philosophy & Essays</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Avatar Style</label>
                    <div className="avatar-picker-mini" style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      {['initials', 'ER', 'MK', 'SP'].map((style) => (
                        <button
                          key={style}
                          type="button"
                          className={`avatar-choice ${avatarSelect === style ? 'selected' : ''}`}
                          onClick={() => setAvatarSelect(style)}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            border: avatarSelect === style ? '2px solid var(--clay)' : '1px solid var(--line)',
                            background: 'var(--cream-deep)',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          {style === 'initials' ? (fullName ? fullName.charAt(0).toUpperCase() : 'U') : style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="bio">Short Reader Bio (Optional)</label>
                  <textarea
                    id="bio"
                    rows="2"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us what books you love, favorite authors, or what you're currently reading..."
                  ></textarea>
                </div>

                <div className="form-foot-row" style={{ marginTop: '12px' }}>
                  <label className="checkbox-row" style={{ alignItems: 'flex-start' }}>
                    <input
                      type="checkbox"
                      id="terms"
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.85rem' }}>
                      I agree to the <a href="#guidelines" onClick={(e) => { e.preventDefault(); alert('BOOK FORGE is a welcoming, respectful community for literary discussion.'); }}>Book Club Community Guidelines</a> and Privacy Policy.
                    </span>
                  </label>
                </div>
                {fieldErrors.terms && <span className="field-error" style={{ color: '#C0554A', fontSize: '0.78rem', display: 'block', marginTop: '-6px' }}>{fieldErrors.terms}</span>}

                <button type="submit" className="auth-btn-primary" disabled={isSubmitting} style={{ marginTop: '16px' }}>
                  <span className="btn-text">{isSubmitting ? 'Creating profile...' : 'Create Account with Email'}</span>
                </button>
              </form>
            )}

            <div className="auth-switch-link" style={{ marginTop: 18 }}>
              Already have an account? <Link to="/login">Sign in here</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Google Cloud Client ID Setup Modal */}
      {googleModalOpen && (
        <div className="google-modal-overlay show" role="dialog" aria-modal="true">
          <div className="google-modal-card" style={{ padding: '24px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.16z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <strong style={{ fontSize: '1.05rem' }}>Google Live OAuth Setup</strong>
              </div>
              <button type="button" className="google-modal-close" onClick={() => setGoogleModalOpen(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: 12 }}>
              To enable live Google account registration on this domain, enter your Web OAuth 2.0 Client ID from Google Cloud Console.
            </p>
            <div style={{ background: 'var(--surface-secondary, #f8f9fa)', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.8rem', color: 'var(--ink)' }}>
              <strong>Quick Steps:</strong>
              <ol style={{ margin: '6px 0 0 18px', padding: 0, lineHeight: 1.5 }}>
                <li>Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: '#1a73e8', textDecoration: 'underline' }}>Google Cloud Console → Credentials</a>.</li>
                <li>Create OAuth Client ID (Application type: <strong>Web application</strong>).</li>
                <li>Add Authorized JavaScript origin: <code>http://localhost:3000</code>.</li>
                <li>Paste your Client ID below.</li>
              </ol>
            </div>
            <div className="field" style={{ marginBottom: '14px' }}>
              <label>Your Google Client ID</label>
              <input
                type="text"
                value={googleClientIdInput}
                onChange={(e) => setGoogleClientIdInput(e.target.value)}
                placeholder="e.g. 123456789-abcdefg.apps.googleusercontent.com"
                style={{ width: '100%', padding: '10px', fontFamily: 'monospace', fontSize: '0.82rem', border: '1px solid var(--line)', borderRadius: '6px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleQuickGoogleDemo}>
                ⚡ Instant Test Demo
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setGoogleModalOpen(false)}>Cancel</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveGoogleConfig}>Save &amp; Connect Google</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
