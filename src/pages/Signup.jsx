import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAccessibility } from '../context/AccessibilityContext'
import { validateGmail, validateIndiaPhone } from '../utils/validation'
import './Auth.css'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signup } = useAuth()
  const { announce } = useAccessibility()
  const navigate = useNavigate()

  // Real-time password validation indicators
  const rules = useMemo(() => {
    return {
      minLength: password.length >= 6,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumberOrSymbol: /[\d\W]/.test(password),
      matches: password.length > 0 && password === confirmPassword
    }
  }, [password, confirmPassword])

  const strength = useMemo(() => {
    if (!password) return { label: '', level: '' }
    const score = [rules.minLength, rules.hasLetter, rules.hasNumberOrSymbol].filter(Boolean).length
    if (score === 1) return { label: 'Weak', level: 'weak' }
    if (score === 2) return { label: 'Fair', level: 'fair' }
    return { label: 'Strong', level: 'strong' }
  }, [password, rules])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !password || !confirmPassword) {
      setError('Please fill in all required fields including your Gmail and Indian mobile number.')
      return
    }

    // 1. Strict Real Gmail Validation
    const gCheck = validateGmail(trimmedEmail)
    if (!gCheck.valid) {
      setError(gCheck.error)
      announce(gCheck.error)
      return
    }

    // 2. Strict Indian Mobile Validation (+91)
    const pCheck = validateIndiaPhone(trimmedPhone)
    if (!pCheck.valid) {
      setError(pCheck.error)
      announce(pCheck.error)
      return
    }

    if (!rules.minLength) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await signup(trimmedName, gCheck.email, password, pCheck.display)
      announce(`Account created successfully! Welcome to SignBridge, ${res?.user?.name || trimmedName}.`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'An error occurred during account creation. Please try again.')
      announce('Registration failed: ' + (err.message || 'Please check your information.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" role="region" aria-labelledby="signup-heading">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <span>✨</span> SignBridge Registration
          </div>
          <h1 id="signup-heading">Create Your Account</h1>
          <p>Join the next generation of accessible, AI-powered two-way communication.</p>
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
            <strong>Required Auth:</strong> Only real Gmail addresses (<code>@gmail.com</code>) and Indian mobile numbers (<code>+91</code>) are accepted.
          </span>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert" aria-live="polite">
            <span className="auth-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>
            <div className="form-input-wrapper">
              <input
                id="signup-name"
                type="text"
                className="form-input"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Gmail Address (@gmail.com)</label>
            <div className="form-input-wrapper">
              <input
                id="signup-email"
                type="email"
                className="form-input"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-phone">
              Indian Mobile Number <span style={{ fontWeight: 700, color: '#0d9488' }}>(+91 Required for Instant SMS)</span>
            </label>
            <div className="form-input-wrapper">
              <input
                id="signup-phone"
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210 or 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
              />
            </div>
          </div>


          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="form-input-wrapper">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input has-toggle"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {password && (
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

          <div className="form-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <div className="form-input-wrapper">
              <input
                id="signup-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input has-toggle"
                placeholder="Re-enter password"
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

            {/* Validation Checklist */}
            <ul className="password-checklist">
              <li className={rules.minLength ? 'met' : ''}>
                <span>{rules.minLength ? '✓' : '○'}</span>
                <span>At least 6 characters</span>
              </li>
              <li className={rules.hasLetter && rules.hasNumberOrSymbol ? 'met' : ''}>
                <span>{rules.hasLetter && rules.hasNumberOrSymbol ? '✓' : '○'}</span>
                <span>Contains letters & numbers/symbols</span>
              </li>
              {confirmPassword && (
                <li className={rules.matches ? 'met' : ''}>
                  <span>{rules.matches ? '✓' : '○'}</span>
                  <span>Passwords match</span>
                </li>
              )}
            </ul>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create SignBridge Account →</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  )
}
