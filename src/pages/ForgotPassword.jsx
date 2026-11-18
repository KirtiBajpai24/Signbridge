import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAccessibility } from '../context/AccessibilityContext'
import { apiFetch } from '../utils/api'
import { validateGmail, validateIndiaPhone } from '../utils/validation'
import './Auth.css'

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [serverMessage, setServerMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const { announce } = useAccessibility()
  const navigate = useNavigate()

  useEffect(() => {
    let timer = null
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [cooldown])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setError('')

    const trimmed = identifier.trim()
    if (!trimmed) {
      const msg = 'Please enter your registered Gmail address or Indian mobile number.'
      setError(msg)
      announce(msg)
      return
    }

    // Client-side format validation matching SignBridge standards
    if (trimmed.includes('@')) {
      const gCheck = validateGmail(trimmed)
      if (!gCheck.valid) {
        setError(gCheck.error)
        announce(gCheck.error)
        return
      }
    } else {
      const pCheck = validateIndiaPhone(trimmed)
      if (!pCheck.valid) {
        setError(pCheck.error)
        announce(pCheck.error)
        return
      }
    }

    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ identifier: trimmed })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch password reset instructions.')
      }

      setSubmitted(true)
      setServerMessage(data.message)
      setCooldown(60)
      announce('Password reset instructions dispatched. Please check your Gmail or SMS.')
    } catch (err) {
      setError(err.message || 'Network error occurred. Please try again.')
      announce('Error: ' + (err.message || 'Failed to request reset.'))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    if (cooldown > 0 || loading) return
    handleSubmit()
  }

  return (
    <div className="auth-page">
      <div className="auth-card" role="region" aria-labelledby="forgot-heading">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <span>🛡️</span> SignBridge Security
          </div>
          <h1 id="forgot-heading">
            {submitted ? 'Check Your Inbox' : 'Reset Password'}
          </h1>
          <p>
            {submitted
              ? 'We have dispatched instructions to your registered contact.'
              : 'Enter your registered Gmail or Indian mobile number to receive your reset link and code.'}
          </p>
        </div>

        {/* Security Policy Badge */}
        <div
          style={{
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
          }}
        >
          <span>🇮🇳</span>
          <span>
            <strong>Verified Auth:</strong> Only real Gmails (<code>@gmail.com</code>) and Indian mobile numbers (<code>+91</code>) are authorized.
          </span>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert" aria-live="polite">
            <span className="auth-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div className="auth-success-banner" role="status" aria-live="polite">
              <span className="auth-success-icon">📩</span>
              <div style={{ textAlign: 'left' }}>
                <strong>Request Dispatched</strong>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.86rem', opacity: 0.95 }}>
                  {serverMessage}
                </p>
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                color: '#334155',
                lineHeight: 1.5,
                textAlign: 'left'
              }}
            >
              <p style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>Next Steps:</p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>Check your inbox or SMS message for the single-use verification code.</li>
                <li>The reset link and 6-digit code expire in <strong>15 minutes</strong>.</li>
                <li>Never share your verification code with anyone.</li>
              </ul>
            </div>

            <button
              type="button"
              className="auth-submit-btn"
              onClick={() =>
                navigate(`/reset-password?identifier=${encodeURIComponent(identifier.trim())}`)
              }
            >
              Enter Verification Code & Set New Password →
            </button>

            <div style={{ marginTop: '1.25rem', fontSize: '0.88rem' }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: cooldown > 0 ? '#94a3b8' : '#0d9488',
                  fontWeight: 600,
                  cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                  padding: 0
                }}
              >
                {cooldown > 0
                  ? `Resend code in ${cooldown}s`
                  : loading
                  ? 'Resending...'
                  : 'Didn’t receive it? Resend instructions'}
              </button>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/login" className="auth-back-link">
                ← Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="forgot-identifier">
                Registered Gmail Address or Indian Mobile (+91)
              </label>
              <div className="form-input-wrapper">
                <input
                  id="forgot-identifier"
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  <span>Dispatching reset instructions...</span>
                </>
              ) : (
                <span>Send Reset Instructions →</span>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link to="/login" className="auth-back-link">
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
          Need assistance? <Link to="/help">Contact SignBridge Support</Link>
        </div>
      </div>
    </div>
  )
}
