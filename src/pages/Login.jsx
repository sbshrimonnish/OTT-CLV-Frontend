import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Eye, EyeOff, LockKeyhole, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Login({ onSignIn }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('sbshrimonnish@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSSODropdown, setShowSSODropdown] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (onSignIn) onSignIn();
      navigate('/dashboard');
    }, 600);
  };

  const selectSSOAccount = (accEmail, accName) => {
    setEmail(accEmail);
    setShowSSODropdown(false);
    handleLogin();
  };

  return (
    <div className="login-wrapper">
      {/* Background Mesh & Glow */}
      <div className="login-bg-glow" />

      <div className="login-container">
        {/* Top Header Title & Subtitle */}
        <header className="login-header">
          <h1>Nexora AI: Explainable Customer Lifetime Value Prediction for SaaS &amp; OTT</h1>
          <p>
            Predict, explain, and act on customer lifetime value using gradient boosting +<br />
            SHAP explainability across 50,000+ accounts.
          </p>
        </header>

        {/* Main Login Card */}
        <div className="login-card-nexora">
          {/* Logo & Brand Title */}
          <div className="card-brand-row">
            <div className="brand-icon-box">
              <BrainCircuit size={24} color="#ffffff" />
            </div>
            <div className="brand-text-box">
              <span className="brand-title">Nexora AI</span>
              <span className="brand-tag">CUSTOMER LIFETIME VALUE</span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="welcome-heading">Welcome back</h2>
          <p className="welcome-sub">Sign in to your analytics workspace</p>

          {/* Google SSO Quick Selector */}
          <div className="sso-box-container">
            <button
              type="button"
              className="sso-account-pill"
              onClick={() => setShowSSODropdown(!showSSODropdown)}
            >
              <div className="sso-user-info">
                <div className="sso-avatar">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=ShriMonnish"
                    alt="User Avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="sso-avatar-fallback">SM</span>
                </div>
                <div className="sso-user-text">
                  <div className="sso-user-name">
                    Continue as Shri monnish
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  <div className="sso-user-email">sbshrimonnish@gmail.com</div>
                </div>
              </div>
              <div className="google-g-logo">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
            </button>

            {showSSODropdown && (
              <div className="sso-dropdown-menu">
                <div
                  className="sso-dropdown-item active"
                  onClick={() => selectSSOAccount('sbshrimonnish@gmail.com', 'Shri monnish')}
                >
                  <div className="sso-avatar-sm">SM</div>
                  <div>
                    <b>Shri monnish</b>
                    <small>sbshrimonnish@gmail.com</small>
                  </div>
                </div>
                <div
                  className="sso-dropdown-item"
                  onClick={() => selectSSOAccount('arjun.kumar@ottclv.in', 'Arjun Kumar')}
                >
                  <div className="sso-avatar-sm alt">AK</div>
                  <div>
                    <b>Arjun Kumar</b>
                    <small>arjun.kumar@ottclv.in (Lead Analyst)</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="login-divider">
            <span className="divider-line" />
            <span className="divider-text">or sign in with email</span>
            <span className="divider-line" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="nexora-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="text"
                className="nexora-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin"
              />
            </div>

            <div className="form-group">
              <div className="label-with-link">
                <label htmlFor="password">Password</label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-link">
                  Forgot password?
                </a>
              </div>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="nexora-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options-row">
              <label className="remember-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember this session</span>
              </label>
            </div>

            <button type="submit" className="submit-btn-gradient" disabled={loading}>
              {loading ? (
                <span className="btn-spinner">Connecting to workspace…</span>
              ) : (
                <>
                  Sign in to workspace <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              className="quick-demo-btn"
              onClick={() => handleLogin()}
              disabled={loading}
            >
              1-Click Demo Analyst Sign In
            </button>
          </form>

          {/* Card Footer */}
          <div className="nexora-card-footer">
            <span>Don't have an account?</span>{' '}
            <a href="#request" onClick={(e) => e.preventDefault()} className="request-access-link">
              Request Access
            </a>
          </div>
        </div>

        {/* Footer badges */}
        <footer className="login-footer-notes">
          <span><ShieldCheck size={14} /> Enterprise-Grade CLV Intelligence</span>
          <span>•</span>
          <span>FastAPI + ML Model Connected</span>
          <span>•</span>
          <span>Synthetic Research Portfolio</span>
        </footer>
      </div>
    </div>
  );
}
