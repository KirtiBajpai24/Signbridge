import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAccessibility } from '../context/AccessibilityContext'
import { apiFetch } from '../utils/api'
import { validateGmail, validateIndiaPhone } from '../utils/validation'
import './Auth.css'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token') || ''
  const idFromUrl = searchParams.get('id') || ''
  const identifierFromUrl = searchParams.get('identifier') || ''

  const [identifier, setIdentifier] = useState(identifierFromUrl)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { announce } = useAccessibility()
  const navigate = useNavigate()

  // Real-time password validation indicators
  const rules = useMemo(() => {
    return {
      minLength: newPassword.length >= 6,
      hasLetter: /[a-zA-Z]/.test(newPassword),
      hasNumberOrSymbol: /[\d\W]/.test(newPassword),
      matches: newPassword.length > 0 && newPassword === confirmPassword
    }
  }, [newPassword, confirmPassword])

  const strength = useMemo(() => {
    if (!newPassword) return { label: '', level: '' }
    const score = [rules.minLength, rules.hasLetter, rules.hasNumberOrSymbol].filter(Boolean).length
    if (score === 1) return { label: 'Weak', level: 'weak' }
    if (score === 2) return { label: 'Fair', level: 'fair' }
    return { label: 'Strong', level: 'strong' }
  }, [newPassword, rules])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!tokenFromUrl) {
      const trimmedIdent = identifier.trim()
      const trimmedCode = code.trim()

      if (!trimmedIdent) {
        const msg = 'Please enter your registered Gmail address or Indian mobile number.'
        setError(msg)
        announce(msg)
        return
      }

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

      if (!trimmedCode || trimmedCode.length !== 6 || !/^\d+$/.test(trimmedCode)) {
        const msg = 'Please enter a valid 6-digit verification code.'
        setError(msg)
        announce(msg)
        return
      }
    }

    if (!rules.minLength) {
      const msg = 'New password must be at least 6 characters long.'
      setError(msg)
      announce(msg)
      return
    }

    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match. Please verify your confirmation.'
      setError(msg)
      announce(msg)
      return
    }

    setLoading(true)
    try {
      const payload = {
        newPassword
      }

      if (tokenFromUrl) {
        payload.token = tokenFromUrl
        if (idFromUrl) payload.id = idFromUrl
      } else {
        payload.identifier = identifier.trim()
        payload.code = code.trim()
      }

      const res = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.')
      }

      announce('Your password has been reset successfully! Redirecting to sign in.')
      navigate('/login', {
        replace: true,
        state: {
          successMessage: 'Password reset successfully! Please sign in with your new password.'
        }
      })
    } catch (err) {
      setError(err.message || 'An error occurred while resetting your password.')
      announce('Reset password error: ' + (err.message || 'Verification failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" role="region" aria-labelledby="reset-heading">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <span>🔑</span> Password Recovery
          </div>
          <h1 id="reset-heading">Set New Password</h1>
          <p>
            {tokenFromUrl
              ? 'Authorized reset link verified. Choose a strong, memorable password.'
              : 'Enter your 6-digit verification code and choose a new password.'}
          </p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert" aria-live="polite">
            <span className="auth-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* If no token in URL, prompt for identifier and 6-digit code */}
          {!tokenFromUrl && (
            <>
              <div className="form-group">
                <label htmlFor="reset-identifier">
                  Registered Gmail Address or Indian Mobile (+91)
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="reset-identifier"
                    type="text"
                    className="form-input"
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
                  <label htmlFor="reset-code">6-Digit Verification Code</label>
                  <Link to="/forgot-password" className="forgot-password-link">
                    Resend code?
                  </Link>
                </div>
                <div className="form-input-wrapper">
                  <input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="form-input code-input"
                    placeholder="••••••"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {tokenFromUrl && (
            <div
              style={{
                background: '#f0fdfa',
                border: '1px solid #ccfbf1',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.85rem',
                color: '#0f766e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>🔒</span>
              <span>Reset link authenticated via secure single-use token.</span>
            </div>
          )}

          {/* New Password */}
          <div className="form-group">
            <label htmlFor="reset-new-password">New Password</label>
            <div className="form-input-wrapper">
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input has-toggle"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
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

            {/* Password Strength Meter */}
            {newPassword && (
              <div className="password-strength-container">
                <div className="password-strength-bar-track">
                  <div className={`password-strength-fill ${strength.level}`} />
                </div>
                <div className="password-strength-label">
                  <span>Strength</span>
                  <span>{strength.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="form-group">
            <label htmlFor="reset-confirm-password">Confirm New Password</label>
            <div className="form-input-wrapper">
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input has-toggle"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {/* Real-time Validation Checklist */}
          {newPassword && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.82rem',
                color: '#475569'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                <span>{rules.minLength ? '✅' : '⚪'}</span>
                <span style={{ color: rules.minLength ? '#166534' : undefined }}>
                  At least 6 characters
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                <span>{rules.hasLetter ? '✅' : '⚪'}</span>
                <span style={{ color: rules.hasLetter ? '#166534' : undefined }}>
                  Contains at least one letter
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                <span>{rules.hasNumberOrSymbol ? '✅' : '⚪'}</span>
                <span style={{ color: rules.hasNumberOrSymbol ? '#166534' : undefined }}>
                  Contains a number or symbol
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>{rules.matches ? '✅' : '⚪'}</span>
                <span style={{ color: rules.matches ? '#166534' : undefined }}>
                  Passwords match
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner" aria-hidden="true" />
                <span>Updating password...</span>
              </>
            ) : (
              <span>Reset Password & Sign In →</span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link to="/login" className="auth-back-link">
            ← Cancel & Back to Sign In
          </Link>
        </div>

        <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
          Remember your password? <Link to="/login">Sign in now</Link>
        </div>
      </div>
    </div>
  )
}
