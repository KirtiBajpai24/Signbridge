import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAccessibility } from '../context/AccessibilityContext'
import { validateGmail, validateIndiaPhone } from '../utils/validation'
import './Auth.css'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [notifNotice, setNotifNotice] = useState('')

  const { login } = useAuth()
  const { announce } = useAccessibility()
  const navigate = useNavigate()
  const location = useLocation()

  const destination = location.state?.from?.pathname || '/dashboard'
  const successMessage = location.state?.successMessage

  useEffect(() => {
    if (successMessage) {
      announce(successMessage)
    }
  }, [successMessage, announce])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotifNotice('')

    const trimmedIdent = identifier.trim()
    if (!trimmedIdent || !password) {
      setError('Please provide your registered Gmail / Indian mobile number and password.')
      return
    }

    // Client-side format validation
    if (trimmedIdent.includes('@')) {
      const gCheck = validateGmail(trimmedIdent)
      if (!gCheck.valid) {
        setError(gCheck.error)
        announce(gCheck.error)
        return
      }
    } else {
      const pCheck = validateIndiaPhone(trimmedIdent)
      if (!pCheck.valid) {
        setError(pCheck.error)
        announce(pCheck.error)
        return
      }
    }

    setLoading(true)
    try {
      const loginResult = await login(trimmedIdent, password)
      const user = loginResult?.user || loginResult
      const notifs = loginResult?.notifications || loginResult?.notification

      if (user.email && user.phone) {
        setNotifNotice(`Security login alerts dispatched to ${user.email} and ${user.phone}!`)
      } else if (user.email) {
        setNotifNotice(`Security login alert sent to Gmail: ${user.email}`)
      } else if (user.phone) {
        setNotifNotice(`Security login SMS sent to ${user.phone}`)
      }

      announce(`Welcome back, ${user.name || 'User'}! Redirecting to dashboard.`)
      setTimeout(() => {
        navigate(destination, { replace: true })
      }, 700)
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your Gmail/phone and password.')
      announce('Login failed: ' + (err.message || 'Invalid credentials.'))
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" role="region" aria-labelledby="login-heading">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <span>🛡️</span> SignBridge Identity
          </div>
          <h1 id="login-heading">Welcome Back</h1>
          <p>Sign in using your registered Gmail address or Indian mobile number.</p>
        </div>

        {/* Security Policy Badge */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          fontSize: '0.85rem',
          color: '#475569',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>🇮🇳</span>
          <span>
            <strong>Verified Auth:</strong> Only real Gmails (<code>@gmail.com</code>) and Indian mobile numbers (<code>+91</code>) are authorized.
          </span>
        </div>

        {successMessage && (
          <div className="auth-success-banner" role="status" aria-live="polite">
            <span className="auth-success-icon">✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="auth-error-banner" role="alert" aria-live="polite">
            <span className="auth-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {notifNotice && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #6ee7b7',
            color: '#047857',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            marginBottom: '1rem',
            textAlign: 'center'
          }} role="status">
            ✅ {notifNotice}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-identifier">Registered Gmail Address or Indian Mobile (+91)</label>
            <div className="form-input-wrapper">
              <input
                id="login-identifier"
                type="text"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="you@gmail.com or +91 98765 43210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>
            <div className="form-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input has-toggle ${error ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner" aria-hidden="true" />
                <span>Signing in & authenticating...</span>
              </>
            ) : (
              <span>Sign In to SignBridge →</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create one now</Link>
        </div>
      </div>
    </div>
  )
}
