import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAccessibility } from '../context/AccessibilityContext'
import { apiFetch } from '../utils/api'
import './History.css'

export default function History() {
  const { user } = useAuth()
  const { announce } = useAccessibility()
  const [historyItems, setHistoryItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMode, setSelectedMode] = useState('ALL')
  const [sortOrder, setSortOrder] = useState('desc') // 'desc' | 'asc'
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = useCallback((msg) => {
    setToastMessage(msg)
    announce(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }, [announce])

  // Fetch history from backend
  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const userId = user?.id || 'all'
      const res = await apiFetch(`/api/history?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        const list = data.history || (Array.isArray(data) ? data : [])
        setHistoryItems(list)
      } else {
        throw new Error('Could not fetch history')
      }
    } catch {
      // Fallback seed records
      setHistoryItems([
        {
          id: 'hist-1',
          type: 'sign-to-text',
          inputText: '🤟 (I Love You)',
          outputText: 'I love you',
          confidence: 96,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'hist-2',
          type: 'speech-to-sign',
          inputText: 'Where is the nearest doctor?',
          outputText: 'Where is the nearest doctor?',
          confidence: 98,
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'hist-3',
          type: 'video-to-text',
          inputText: 'Recorded clip (12s)',
          outputText: 'Hello, I need help finding the clinic.',
          confidence: 94,
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Delete a single item
  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/history/${id}`, { method: 'DELETE' })
    } catch {
      // Local fallback removal
    }
    setHistoryItems((prev) => prev.filter((item) => item.id !== id))
    showToast('Translation removed from history.')
  }

  // Clear all history
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire translation history? This cannot be undone.')) {
      return
    }
    try {
      const userId = user?.id || 'user-default-1'
      await apiFetch(`/api/history?userId=${userId}`, { method: 'DELETE' })
    } catch {
      // Local fallback
    }
    setHistoryItems([])
    showToast('All translation history cleared.')
  }

  // Read aloud via SpeechSynthesis
  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported on this browser.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
    showToast(`Speaking: "${text}"`)
  }

  // Copy text to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(
      () => showToast('Copied translation to clipboard!'),
      () => showToast('Failed to copy to clipboard.')
    )
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (historyItems.length === 0) {
      showToast('No history records to export.')
      return
    }
    const headers = ['ID', 'Timestamp', 'Modality', 'Input', 'Output Translation', 'Confidence']
    const rows = historyItems.map(item => [
      item.id,
      item.timestamp || '',
      item.type || item.mode || 'sign-to-text',
      `"${(item.inputText || '').replace(/"/g, '""')}"`,
      `"${(item.outputText || '').replace(/"/g, '""')}"`,
      item.confidence || ''
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `signbridge_history_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported history as CSV.')
  }

  // Export to JSON
  const handleExportJSON = () => {
    if (historyItems.length === 0) {
      showToast('No history records to export.')
      return
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historyItems, null, 2))
    const link = document.createElement('a')
    link.setAttribute('href', dataStr)
    link.setAttribute('download', `signbridge_history_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported history as JSON.')
  }

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return historyItems
      .filter((item) => {
        const itemText = (item.outputText || '') + ' ' + (item.inputText || '')
        const matchesSearch = itemText.toLowerCase().includes(searchTerm.toLowerCase().trim())
        const itemMode = item.type || item.mode || 'sign-to-text'
        const matchesMode = selectedMode === 'ALL' || itemMode === selectedMode
        return matchesSearch && matchesMode
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime()
        const timeB = new Date(b.timestamp || 0).getTime()
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
      })
  }, [historyItems, searchTerm, selectedMode, sortOrder])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = historyItems.length
    if (total === 0) return { total: 0, avgConfidence: 0, cameraCount: 0, speechCount: 0 }
    const totalConf = historyItems.reduce((acc, curr) => acc + (Number(curr.confidence) || 90), 0)
    const avg = Math.round(totalConf / total)
    const cameraCount = historyItems.filter(h => (h.type || h.mode || '').includes('sign')).length
    const speechCount = historyItems.filter(h => (h.type || h.mode || '').includes('speech')).length
    return {
      total,
      avgConfidence: avg,
      cameraCount,
      speechCount
    }
  }, [historyItems])

  const getPillClass = (type) => {
    const t = (type || '').toLowerCase()
    if (t.includes('speech')) return 'speech'
    if (t.includes('video')) return 'video'
    if (t.includes('text-to-sign')) return 'text'
    return 'camera'
  }

  const getConfidenceClass = (conf) => {
    const val = Number(conf) || 90
    if (val >= 90) return 'high'
    if (val >= 75) return 'medium'
    return 'low'
  }

  return (
    <div className="history-page">
      {/* 1. Header */}
      <div className="history-header">
        <span className="section-pill">Personal Audit Records</span>
        <h1 className="history-title">Translation History</h1>
        <p className="history-lead">
          Review, search, audio-playback, and export all past translations processed across live camera,
          speech transcription, recorded video, and text-to-sign visualizer.
        </p>
      </div>

      {/* 2. Summary Statistics Ribbon */}
      <div className="history-stats-ribbon">
        <div className="history-stat-card">
          <div className="history-stat-icon">📊</div>
          <div className="history-stat-meta">
            <span className="history-stat-num">{stats.total}</span>
            <span className="history-stat-label">Total Saved</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon">🎯</div>
          <div className="history-stat-meta">
            <span className="history-stat-num">{stats.avgConfidence}%</span>
            <span className="history-stat-label">Avg. Confidence</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon">📹</div>
          <div className="history-stat-meta">
            <span className="history-stat-num">{stats.cameraCount}</span>
            <span className="history-stat-label">Camera Signs</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon">🎙️</div>
          <div className="history-stat-meta">
            <span className="history-stat-num">{stats.speechCount}</span>
            <span className="history-stat-label">Speech Captions</span>
          </div>
        </div>
      </div>

      {/* 3. Main History Box */}
      <div className="history-main-box">
        {/* Toolbar & Filters */}
        <div className="history-toolbar">
          <div className="history-search-wrapper">
            <span className="history-search-icon">🔍</span>
            <input
              type="text"
              className="history-search-input"
              placeholder="Search translation content or signs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search translations"
            />
          </div>

          <div className="history-filter-controls">
            <select
              className="history-select"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              aria-label="Filter by translation mode"
            >
              <option value="ALL">All Modalities</option>
              <option value="sign-to-text">📹 Sign ➔ Text / Speech</option>
              <option value="speech-to-sign">🎙️ Speech ➔ Sign Visuals</option>
              <option value="video-to-text">🎬 Video ➔ Transcript</option>
              <option value="text-to-sign">✍️ Text ➔ Fingerspelling</option>
            </select>

            <select
              className="history-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Sort order"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>

            <button
              type="button"
              className="history-export-btn"
              onClick={handleExportCSV}
              title="Download records as CSV"
            >
              📥 CSV
            </button>

            <button
              type="button"
              className="history-export-btn"
              onClick={handleExportJSON}
              title="Download records as JSON"
            >
              📄 JSON
            </button>

            {historyItems.length > 0 && (
              <button
                type="button"
                className="history-clear-btn"
                onClick={handleClearAll}
                title="Clear all saved records"
              >
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {/* Table of Records */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <p>Loading your translation audit records...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="history-empty-state">
            <div className="history-empty-icon">📭</div>
            <h3>No Translation Records Found</h3>
            <p>
              {searchTerm || selectedMode !== 'ALL'
                ? 'No past translations match your current search and filter criteria.'
                : 'You have not saved any translations yet. Activate the live translator to begin generating records.'}
            </p>
            <Link to="/live-translator" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
              Launch Live Translator →
            </Link>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Modality</th>
                  <th>Input Source</th>
                  <th>Output Translation</th>
                  <th>Confidence</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((row) => (
                  <tr key={row.id}>
                    <td className="history-timestamp">
                      {row.timestamp ? (
                        <>
                          <div>{new Date(row.timestamp).toLocaleDateString()}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </>
                      ) : (
                        'Just now'
                      )}
                    </td>

                    <td>
                      <span className={`history-mode-pill ${getPillClass(row.type || row.mode)}`}>
                        {row.type || row.mode || 'sign-to-text'}
                      </span>
                    </td>

                    <td style={{ color: '#475569', maxWidth: '200px', wordBreak: 'break-word' }}>
                      {row.inputText || '—'}
                    </td>

                    <td className="history-output-text">
                      &ldquo;{row.outputText}&rdquo;
                    </td>

                    <td>
                      <div className={`history-confidence-badge ${getConfidenceClass(row.confidence)}`}>
                        <span className="confidence-dot" />
                        <span>{row.confidence ? `${row.confidence}%` : '95%'}</span>
                      </div>
                    </td>

                    <td>
                      <div className="history-row-actions">
                        <button
                          type="button"
                          className="history-icon-btn"
                          title="Speak translation aloud"
                          onClick={() => handleSpeak(row.outputText)}
                          aria-label={`Speak ${row.outputText}`}
                        >
                          🔊
                        </button>
                        <button
                          type="button"
                          className="history-icon-btn"
                          title="Copy translation text"
                          onClick={() => handleCopy(row.outputText)}
                          aria-label="Copy to clipboard"
                        >
                          📋
                        </button>
                        <button
                          type="button"
                          className="history-icon-btn danger"
                          title="Delete this record"
                          onClick={() => handleDelete(row.id)}
                          aria-label="Delete entry"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="history-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
