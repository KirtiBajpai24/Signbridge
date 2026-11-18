import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../utils/api'
import { validateGmail, validateIndiaPhone } from '../utils/validation'

export default function UserHistoryModal({ isOpen, onClose, user, onUserChange }) {
  const [activeTab, setActiveTab] = useState('history') // 'history' | 'quiz' | 'account'
  const [historyItems, setHistoryItems] = useState([])
  const [quizScores, setQuizScores] = useState([])
  const [loading, setLoading] = useState(false)

  // Auth form states
  const [authMode, setAuthMode] = useState('login') // 'login' | 'register'
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  // Fetch history and scores from backend
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const userId = user?.id || 'user-default-1'
      const [histRes, quizRes] = await Promise.all([
        apiFetch(`/api/history?userId=${userId}`),
        apiFetch(`/api/quiz/scores?userId=${userId}`)
      ])

      if (histRes.ok) {
        const histData = await histRes.json()
        setHistoryItems(histData.history || [])
      }
      if (quizRes.ok) {
        const quizData = await quizRes.json()
        setQuizScores(quizData.scores || [])
      }
    } catch (err) {
      console.warn('Backend fetch error (using local state):', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, fetchData])

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your translation history?')) return
    try {
      await apiFetch(`/api/history?userId=${user?.id || 'user-default-1'}`, { method: 'DELETE' })
      setHistoryItems([])
    } catch (err) {
      console.error('Failed to clear history:', err)
      setHistoryItems([])
    }
  }

  const handleDeleteItem = async (id) => {
    try {
      await apiFetch(`/api/history/${id}`, { method: 'DELETE' })
      setHistoryItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error('Failed to delete item:', err)
      setHistoryItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')

    const trimmedEmail = emailInput.trim()
    const trimmedPass = passwordInput.trim()

    if (!trimmedEmail || !trimmedPass) {
      setAuthError('Please fill in both email and password.')
      return
    }

    const gCheck = validateGmail(trimmedEmail)
    if (!gCheck.valid) {
      setAuthError(gCheck.error)
      return
    }

    let pCheck = null
    if (authMode === 'register') {
      if (!nameInput.trim() || !phoneInput.trim()) {
        setAuthError('All fields including Indian mobile number (+91) are required.')
        return
      }
      pCheck = validateIndiaPhone(phoneInput.trim())
      if (!pCheck.valid) {
        setAuthError(pCheck.error)
        return
      }
    }

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = authMode === 'login'
      ? { identifier: gCheck.email, email: gCheck.email, password: trimmedPass }
      : { name: nameInput.trim(), email: gCheck.email, phone: pCheck.display, password: trimmedPass }

    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed')
        return
      }

      onUserChange(data.user)
      setActiveTab('history')
      fetchData()
    } catch (err) {
      console.error('Auth error:', err)
      setAuthError(err.message || 'Authentication error. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-user-pill">
            <span className="user-avatar">{user?.avatar || '👤'}</span>
            <div>
              <h4>{user?.name || 'SignBridge Member'}</h4>
              <span>{user?.email || 'Logged in locally'}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Modal Tabs */}
        <div className="modal-tabs">
          <button
            className={`m-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 Translation History ({historyItems.length})
          </button>
          <button
            className={`m-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            🏆 Quiz Scores ({quizScores.length})
          </button>
          <button
            className={`m-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            ⚙️ Account & Switch User
          </button>
        </div>

        {/* Tab 1: Translation History */}
        {activeTab === 'history' && (
          <div className="modal-tab-body">
            <div className="tab-actions-bar">
              <span>Saved from Camera & Voice Translations</span>
              {historyItems.length > 0 && (
                <button className="clear-all-btn" onClick={handleClearHistory}>
                  🗑️ Clear All
                </button>
              )}
            </div>

            {loading ? (
              <div className="modal-loading">Loading history...</div>
            ) : historyItems.length > 0 ? (
              <div className="history-list">
                {historyItems.map((item) => (
                  <div key={item.id} className="history-row-card">
                    <div className="history-row-top">
                      <span className={`type-tag ${item.type}`}>
                        {item.type === 'sign-to-text' ? '🤟 Camera ➔ Text' : '🎤 Speech ➔ Sign'}
                      </span>
                      <span className="history-time">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        className="delete-item-btn"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete entry"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="history-content">
                      <div className="hist-input">{item.inputText}</div>
                      <div className="hist-arrow">➔</div>
                      <div className="hist-output">"{item.outputText}"</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="modal-empty-state">
                <p>No translation history yet!</p>
                <span>Translations from your camera and voice will automatically appear here.</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Quiz Scores */}
        {activeTab === 'quiz' && (
          <div className="modal-tab-body">
            <div className="tab-actions-bar">
              <span>Your ASL Knowledge Mastery Records</span>
            </div>

            {quizScores.length > 0 ? (
              <div className="scores-list">
                {quizScores.map((scoreItem) => (
                  <div key={scoreItem.id} className="score-row-card">
                    <div>
                      <strong>{scoreItem.category || 'ASL Quiz'}</strong>
                      <span>{new Date(scoreItem.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="score-pill-val">
                      {scoreItem.score} / {scoreItem.total}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="modal-empty-state">
                <p>No quiz scores recorded yet.</p>
                <span>Take the ASL Quiz below to test your skills and save your scores!</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Account & Switch User */}
        {activeTab === 'account' && (
          <div className="modal-tab-body">
            <div className="auth-card">
              <div className="auth-mode-switch">
                <button
                  type="button"
                  className={authMode === 'login' ? 'active' : ''}
                  onClick={() => setAuthMode('login')}
                >
                  Log In
                </button>
                <button
                  type="button"
                  className={authMode === 'register' ? 'active' : ''}
                  onClick={() => setAuthMode('register')}
                >
                  Create New Account
                </button>
              </div>

              {authError && <div className="auth-err-msg">{authError}</div>}

              <form onSubmit={handleAuthSubmit} className="auth-form">
                {authMode === 'register' && (
                  <>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Alex Johnson"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Indian Mobile Number (+91)</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Gmail Address (@gmail.com)</label>
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="auth-submit-btn">
                  {authMode === 'login' ? 'Log In to SignBridge' : 'Register & Start Tracking'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
