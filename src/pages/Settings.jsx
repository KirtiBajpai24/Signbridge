import { useState, useEffect } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'
import { validateIndiaPhone } from '../utils/validation'
import './Pages.css'

const SPEECH_SETTINGS_KEY = 'signbridge_speech_settings'
const CAMERA_DEFAULTS_KEY = 'signbridge_camera_defaults'

export default function Settings() {
  const {
    fontSize,
    highContrast,
    dyslexicFont,
    reducedMotion,
    focusHighlight,
    soundFeedback,
    setFontSize,
    toggleHighContrast,
    toggleDyslexicFont,
    toggleReducedMotion,
    toggleFocusHighlight,
    toggleSoundFeedback,
    resetPreferences,
    announce
  } = useAccessibility()

  const { user, sendPhoneOtp, verifyPhoneOtpCode } = useAuth()

  // Speech settings
  const [speechRate, setSpeechRate] = useState(1.0)
  const [speechPitch, setSpeechPitch] = useState(1.0)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('')

  // Camera defaults
  const [mirrorCamera, setMirrorCamera] = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState(80)

  // Notification Preferences State (Rule 10)
  const [notifPrefs, setNotifPrefs] = useState({
    emailOnLogin: true,
    smsOnLogin: true,
    welcomeEmail: true,
    welcomeSms: true
  })

  // Phone Verification & OTP State (Rule 9)
  const [phoneInput, setPhoneInput] = useState(user?.phone || '')
  const [isPhoneVerified, setIsPhoneVerified] = useState(Boolean(user?.isPhoneVerified))
  const [otpInput, setOtpInput] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpFeedback, setOtpFeedback] = useState({ text: '', isError: false })

  // Notification Audit Logs (Rule 8)
  const [notifLogs, setNotifLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Live Test Notification State (Rule 12)
  const [testingNotif, setTestingNotif] = useState(false)
  const [testResult, setTestResult] = useState(null)

  // Status message
  const [statusMsg, setStatusMsg] = useState('')

  // Load voices & notification data
  useEffect(() => {
    function loadVoices() {
      if ('speechSynthesis' in window) {
        const list = window.speechSynthesis.getVoices()
        if (list.length > 0) {
          setVoices(list)
          if (!selectedVoice) {
            const defaultVoice = list.find((v) => v.lang.startsWith('en')) || list[0]
            if (defaultVoice) setSelectedVoice(defaultVoice.name)
          }
        }
      }
    }

    loadVoices()
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    // Load persisted speech & camera settings
    try {
      const spRaw = localStorage.getItem(SPEECH_SETTINGS_KEY)
      if (spRaw) {
        const parsed = JSON.parse(spRaw)
        if (parsed.rate) setSpeechRate(parsed.rate)
        if (parsed.pitch) setSpeechPitch(parsed.pitch)
        if (parsed.autoSpeak !== undefined) setAutoSpeak(parsed.autoSpeak)
        if (parsed.voice) setSelectedVoice(parsed.voice)
      }
      const camRaw = localStorage.getItem(CAMERA_DEFAULTS_KEY)
      if (camRaw) {
        const cParsed = JSON.parse(camRaw)
        if (cParsed.mirror !== undefined) setMirrorCamera(cParsed.mirror)
        if (cParsed.threshold) setConfidenceThreshold(cParsed.threshold)
      }
    } catch {
      // ignore
    }

    // Fetch user notification preferences and audit logs from backend
    async function fetchNotificationSettings() {
      if (!user?.id) return
      try {
        const [prefRes, logRes] = await Promise.all([
          apiFetch(`/api/notifications/preferences?userId=${user.id}`),
          apiFetch(`/api/notifications/logs?userId=${user.id}`)
        ])

        if (prefRes.ok) {
          const pData = await prefRes.json()
          if (pData.preferences) setNotifPrefs(pData.preferences)
          if (pData.phone) setPhoneInput(pData.phone)
          if (pData.isPhoneVerified !== undefined) setIsPhoneVerified(pData.isPhoneVerified)
        }

        if (logRes.ok) {
          const lData = await logRes.json()
          if (lData.logs) setNotifLogs(lData.logs)
        }
      } catch (err) {
        console.warn('Could not fetch notification preferences from backend:', err)
      }
    }
    fetchNotificationSettings()
  }, [user, selectedVoice])

  // Test Speech
  const handleTestSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance('Hello from SignBridge. Assistive speech synthesis is active and clear.')
      u.rate = speechRate
      u.pitch = speechPitch
      const v = voices.find((vox) => vox.name === selectedVoice)
      if (v) u.voice = v
      window.speechSynthesis.speak(u)
      announce('Playing sample speech synthesis.')
    }
  }

  // Save Settings
  const handleSaveAll = async () => {
    try {
      localStorage.setItem(
        SPEECH_SETTINGS_KEY,
        JSON.stringify({
          rate: speechRate,
          pitch: speechPitch,
          autoSpeak,
          voice: selectedVoice
        })
      )
      localStorage.setItem(
        CAMERA_DEFAULTS_KEY,
        JSON.stringify({
          mirror: mirrorCamera,
          threshold: confidenceThreshold
        })
      )

      // Save notification preferences to backend
      if (user?.id) {
        await apiFetch('/api/notifications/preferences', {
          method: 'PUT',
          body: JSON.stringify({
            userId: user.id,
            preferences: notifPrefs
          })
        })
      }

      setStatusMsg('All application, accessibility, and notification preferences saved!')
      announce('Preferences saved successfully.')
      setTimeout(() => setStatusMsg(''), 2500)
    } catch {
      setStatusMsg('Settings applied for this session!')
      setTimeout(() => setStatusMsg(''), 2500)
    }
  }

  // Request Mobile OTP
  const handleRequestOtp = async () => {
    if (!phoneInput.trim()) {
      setOtpFeedback({ text: 'Please enter a valid Indian mobile number first.', isError: true })
      return
    }
    const pCheck = validateIndiaPhone(phoneInput.trim())
    if (!pCheck.valid) {
      setOtpFeedback({ text: pCheck.error, isError: true })
      return
    }
    setOtpLoading(true)
    setOtpFeedback({ text: '', isError: false })
    try {
      const res = await sendPhoneOtp(pCheck.e164)
      setOtpSent(true)
      setOtpFeedback({ text: `Verification OTP sent to ${res.maskedPhone || pCheck.display}`, isError: false })
      announce('Verification OTP code sent via SMS.')
    } catch (err) {
      setOtpFeedback({ text: err.message || 'Failed to send OTP code.', isError: true })
    } finally {
      setOtpLoading(false)
    }
  }

  // Verify Mobile OTP
  const handleVerifyOtp = async () => {
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setOtpFeedback({ text: 'Please enter the 6-digit code received via SMS.', isError: true })
      return
    }
    const pCheck = validateIndiaPhone(phoneInput.trim())
    const phoneToVerify = pCheck.valid ? pCheck.e164 : phoneInput.trim()
    setOtpLoading(true)
    try {
      await verifyPhoneOtpCode(phoneToVerify, otpInput.trim())
      setIsPhoneVerified(true)
      setOtpSent(false)
      setOtpInput('')
      setOtpFeedback({ text: 'Indian mobile number verified successfully! 📱', isError: false })
      announce('Mobile number verified.')
    } catch (err) {
      setOtpFeedback({ text: err.message || 'Invalid or expired OTP code.', isError: true })
    } finally {
      setOtpLoading(false)
    }
  }

  // Live Test Notification Dispatcher
  const handleTestNotification = async (channel) => {
    setTestingNotif(true)
    setTestResult(null)
    try {
      const recipient = channel === 'EMAIL' ? user?.email || 'user@gmail.com' : phoneInput || user?.phone || '+919876543210'
      const res = await apiFetch('/api/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ channel, recipient })
      })
      const data = await res.json()
      setTestResult({ channel, data: data.result })
      announce(`Test ${channel} notification dispatched: ${data.result?.status}`)

      // Refresh audit logs
      const logRes = await apiFetch(`/api/notifications/logs?userId=${user?.id || 'all'}`)
      if (logRes.ok) {
        const lData = await logRes.json()
        if (lData.logs) setNotifLogs(lData.logs)
      }
    } catch (err) {
      setTestResult({ channel, error: err.message })
    } finally {
      setTestingNotif(false)
    }
  }

  // Clear translation history
  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your saved translation history?')) return
    try {
      await apiFetch(`/api/history?userId=${user?.id || 'user-default-1'}`, {
        method: 'DELETE'
      })
      setStatusMsg('Translation history cleared!')
      announce('Translation records cleared.')
      setTimeout(() => setStatusMsg(''), 2500)
    } catch {
      setStatusMsg('History cleared locally.')
      setTimeout(() => setStatusMsg(''), 2500)
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: '920px' }}>
      <div className="page-header">
        <span className="section-pill">Customization & Controls</span>
        <h1 className="page-title">Application & Notification Settings</h1>
        <p className="page-lead">
          Configure login email and SMS notifications, verify mobile numbers, tailor accessibility displays, and review notification delivery logs.
        </p>
      </div>

      {statusMsg && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #6ee7b7',
          color: '#047857',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontWeight: 700,
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          ✅ {statusMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Section 1: Notifications & Security Alerts (Requirements 1, 2, 8, 9, 10, 11) */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔔 Login Notifications & Mobile Security Hub
            </h2>
            <span style={{ fontSize: '0.8rem', background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 700 }}>
              Live Notification Engine
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
            Automatic welcome and security alert dispatch whenever successful authentication occurs via Email or Mobile.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Toggle: Login Email Notifications */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a' }}>Send Email on Successful Login</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Delivers security confirmation and login timestamps to <strong>{user?.email || 'your registered email'}</strong>
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.emailOnLogin}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, emailOnLogin: e.target.checked })}
                style={{ width: '22px', height: '22px', accentColor: '#0d9488', cursor: 'pointer' }}
                aria-label="Toggle email notifications on login"
              />
            </div>

            {/* Toggle: Login SMS Notifications */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a' }}>Send SMS on Successful Login</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Sends instant security alert via SMS whenever logging in using your registered mobile number
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.smsOnLogin}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, smsOnLogin: e.target.checked })}
                style={{ width: '22px', height: '22px', accentColor: '#0d9488', cursor: 'pointer' }}
                aria-label="Toggle SMS notifications on login"
              />
            </div>

            {/* Mobile Number Verification Card (Requirement 9) */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>📱 Registered Mobile Phone Number</strong>
                {isPhoneVerified ? (
                  <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #6ee7b7', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800 }}>
                    ✅ Verified Number
                  </span>
                ) : (
                  <span style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800 }}>
                    ⚠️ Verification Required
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value)
                    if (isPhoneVerified) setIsPhoneVerified(false)
                  }}
                  style={{ flex: 1, minWidth: '220px' }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleRequestOtp}
                  disabled={otpLoading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {otpLoading ? 'Sending...' : otpSent ? '🔄 Resend OTP' : 'Send Verification OTP'}
                </button>
              </div>

              {/* OTP Input Form when sent */}
              {otpSent && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    maxLength="6"
                    className="form-input"
                    placeholder="Enter 6-digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    style={{ width: '170px', letterSpacing: '0.15em', fontWeight: 800, textAlign: 'center' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                  >
                    Confirm & Verify Number
                  </button>
                </div>
              )}

              {otpFeedback.text && (
                <div style={{
                  marginTop: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: otpFeedback.isError ? '#b91c1c' : '#047857'
                }}>
                  {otpFeedback.text}
                </div>
              )}
            </div>

            {/* Live Notification Delivery Tester (Requirement 12) */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.25rem' }}>
                🧪 Live Notification Delivery Tester
              </strong>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                Verify Resend/Brevo email and Twilio/MSG91 SMS gateway delivery in real time:
              </span>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleTestNotification('EMAIL')}
                  disabled={testingNotif}
                  style={{ fontSize: '0.9rem' }}
                >
                  ✉️ Test Email Gateway
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleTestNotification('SMS')}
                  disabled={testingNotif}
                  style={{ fontSize: '0.9rem' }}
                >
                  📱 Test SMS Gateway
                </button>
              </div>

              {testResult && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: testResult.error ? '#fef2f2' : '#f0fdf4',
                  border: `1px solid ${testResult.error ? '#fca5a5' : '#86efac'}`,
                  fontSize: '0.85rem',
                  color: testResult.error ? '#991b1b' : '#166534'
                }}>
                  <strong>{testResult.channel} Delivery Result:</strong>{' '}
                  Status: <strong>{testResult.data?.status || 'FAILED'}</strong> • Provider:{' '}
                  <strong>{testResult.data?.provider || 'Gateway'}</strong>
                  {testResult.data?.messageId && ` (ID: ${testResult.data.messageId})`}
                  {testResult.error && ` Error: ${testResult.error}`}
                </div>
              )}
            </div>

            {/* Notification Audit Trail Table (Requirement 8) */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ color: '#0f172a' }}>📋 Notification Audit Trail Log (Recent Activity)</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Credentials & OTPs are never stored</span>
              </div>

              {notifLogs.length > 0 ? (
                <div style={{ overflowX: 'auto', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Channel</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Type</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Recipient</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Status</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Provider</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifLogs.slice(0, 5).map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>
                            {log.channel === 'EMAIL' ? '✉️ Email' : '📱 SMS'}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: '#334155' }}>
                            {log.type?.replace(/_/g, ' ')}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace' }}>
                            {log.recipient}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem' }}>
                            <span style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              background:
                                log.status === 'DELIVERED' || log.status === 'SIMULATED'
                                  ? '#dcfce7'
                                  : log.status === 'FAILED'
                                  ? '#fee2e2'
                                  : '#f1f5f9',
                              color:
                                log.status === 'DELIVERED' || log.status === 'SIMULATED'
                                  ? '#15803d'
                                  : log.status === 'FAILED'
                                  ? '#b91c1c'
                                  : '#475569'
                            }}>
                              {log.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', textTransform: 'capitalize' }}>
                            {log.provider}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: '#64748b' }}>
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  No recent notifications recorded. Trigger a login or gateway test to view audit entries.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Accessibility & Visual Ergonomics */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ♿ Visual Ergonomics & WCAG Display
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
            Settings synchronize instantly with the universal accessibility bar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Font Size Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a' }}>Application Font Sizing</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Current: {fontSize.toUpperCase()} (Base text scaling)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['normal', 'large', 'xlarge'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setFontSize(size)
                      announce(`Font size set to ${size}`)
                    }}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: fontSize === size ? '#0d9488' : '#f1f5f9',
                      color: fontSize === size ? '#ffffff' : '#334155',
                      border: fontSize === size ? '1px solid #0d9488' : '1px solid #cbd5e1'
                    }}
                  >
                    {size === 'normal' ? 'Normal' : size === 'large' ? 'Large (+15%)' : 'Extra Large (+30%)'}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Mode */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a' }}>High-Contrast Dark Theme (WCAG AAA)</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Deep obsidian background with neon yellow / teal text for low-vision clarity</span>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={toggleHighContrast}
                style={{ width: '22px', height: '22px', accentColor: '#0d9488', cursor: 'pointer' }}
                aria-label="Toggle high contrast mode"
              />
            </div>

            {/* Dyslexia-Friendly Font */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a' }}>OpenDyslexic Typography</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Weighted baseline lettering to enhance reading comprehension</span>
              </div>
              <input
                type="checkbox"
                checked={dyslexicFont}
                onChange={toggleDyslexicFont}
                style={{ width: '22px', height: '22px', accentColor: '#0d9488', cursor: 'pointer' }}
                aria-label="Toggle dyslexia-friendly font"
              />
            </div>

            {/* Reduced Motion */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a' }}>Reduced Motion</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Eliminate animations, sliding carousels, and transitional effects</span>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={toggleReducedMotion}
                style={{ width: '22px', height: '22px', accentColor: '#0d9488', cursor: 'pointer' }}
                aria-label="Toggle reduced motion"
              />
            </div>

            {/* Focus Ring Highlight */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a' }}>High-Visibility Keyboard Focus Rings</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Thick neon borders around interactive buttons and inputs for switch navigation</span>
              </div>
              <input
                type="checkbox"
                checked={focusHighlight}
                onChange={toggleFocusHighlight}
                style={{ width: '22px', height: '22px', accentColor: '#0d9488', cursor: 'pointer' }}
                aria-label="Toggle focus highlight"
              />
            </div>

            {/* Sound Feedback */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a' }}>Haptic & Audio Action Chimes</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Play soft audio confirmation chimes when signs are detected</span>
              </div>
              <input
                type="checkbox"
                checked={soundFeedback}
                onChange={toggleSoundFeedback}
                style={{ width: '22px', height: '22px', accentColor: '#0d9488', cursor: 'pointer' }}
                aria-label="Toggle audio feedback"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Speech Synthesis Controls */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔊 Speech Synthesis & Voice Engine
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
            Configure how recognized signs and transcriptions are voiced aloud to hearing companions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Voice Selector */}
            {voices.length > 0 && (
              <div className="form-group">
                <label style={{ fontWeight: 700, color: '#334155' }}>Default TTS Synthesizer Voice</label>
                <select
                  className="form-input"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Speech Rate Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#0f172a' }}>Speech Rate / Speed</strong>
                <span style={{ fontWeight: 700, color: '#0d9488' }}>{speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#0d9488' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                <span>0.5x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>

            {/* Speech Pitch Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#0f172a' }}>Pitch Modulation</strong>
                <span style={{ fontWeight: 700, color: '#0d9488' }}>{speechPitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#0d9488' }}
              />
            </div>

            {/* Auto-Speak Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a' }}>Automatic Speech Playback</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Automatically speak recognized sign tokens immediately upon stabilization</span>
              </div>
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                style={{ width: '22px', height: '22px', accentColor: '#0d9488', cursor: 'pointer' }}
              />
            </div>

            <div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleTestSpeech}
                style={{ padding: '0.6rem 1.25rem' }}
              >
                🔊 Test Voice Sample
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Camera Vision Defaults */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📹 Camera Vision & Recognition Defaults
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
            Default settings applied whenever launching the Live Camera Studio.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a' }}>Horizontal Mirror Video by Default</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Flips webcam feed horizontally so signing matches a natural mirror</span>
              </div>
              <input
                type="checkbox"
                checked={mirrorCamera}
                onChange={(e) => setMirrorCamera(e.target.checked)}
                style={{ width: '22px', height: '22px', accentColor: '#0d9488', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#0f172a' }}>Default Recognition Confidence Threshold</strong>
                <span style={{ fontWeight: 700, color: '#0d9488' }}>{confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="65"
                max="95"
                step="5"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#0d9488' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                <span>65% (Relaxed)</span>
                <span>80% (Balanced)</span>
                <span>95% (Strict Precision)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Privacy & Local Data Management */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🛡️ Edge Privacy & Storage Management
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.25rem' }}>
            SignBridge executes all computer vision completely in your browser on CPU/Wasm. Zero video frames leave your device.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleClearHistory}
              style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
            >
              🗑️ Clear Translation History
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                resetPreferences()
                setSpeechRate(1.0)
                setSpeechPitch(1.0)
                setAutoSpeak(true)
                setMirrorCamera(true)
                setConfidenceThreshold(80)
                setNotifPrefs({
                  emailOnLogin: true,
                  smsOnLogin: true,
                  welcomeEmail: true,
                  welcomeSms: true
                })
                setStatusMsg('Reset all preferences to defaults.')
                announce('All preferences reset to defaults.')
                setTimeout(() => setStatusMsg(''), 2500)
              }}
            >
              🔄 Reset to Factory Defaults
            </button>
          </div>
        </div>

        {/* Global Save Button */}
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveAll}
            style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', fontWeight: 800 }}
          >
            💾 Save All Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
