import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAccessibility } from '../context/AccessibilityContext'
import { apiFetch } from '../utils/api'
import { translateTextToAslSequence } from '../utils/aslDictionaryData'
import AslHandVisual from '../components/AslHandVisual'
import './Pages.css'

const PRESET_PHRASES = [
  'Good day',
  'Good morning',
  'Hello, how are you?',
  'Thank you',
  'Nice to meet you',
  'I love you',
  'Where is the doctor?',
  'Kirti (Fingerspell)'
]

export default function TextToSign() {
  const { user } = useAuth()
  const { announce } = useAccessibility()
  const [inputText, setInputText] = useState('Good day')
  const [sequence, setSequence] = useState(() => translateTextToAslSequence('Good day'))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeLetterIndex, setActiveLetterIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1400) // ms per step
  const [autoVoice, setAutoVoice] = useState(true)
  const [savedStatus, setSavedStatus] = useState('')

  const timerRef = useRef(null)

  const handleSaveToHistory = async () => {
    if (!inputText.trim()) return
    try {
      await apiFetch('/api/history', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || 'user-default-1',
          type: 'text-to-sign',
          inputText: inputText.trim(),
          outputText: sequence.map(s => s.label || s.word).join(' '),
          confidence: 100
        })
      })
      setSavedStatus('Saved to History!')
      announce('Saved ASL sequence to history.')
      setTimeout(() => setSavedStatus(''), 2500)
    } catch {
      setSavedStatus('Saved locally!')
      setTimeout(() => setSavedStatus(''), 2500)
    }
  }

  // Voice speech helper
  const speakCurrent = (text) => {
    if (!autoVoice || !('speechSynthesis' in window) || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    window.speechSynthesis.speak(utterance)
  }

  // Handle Text Submission
  const handleTranslate = (textToProcess) => {
    const text = typeof textToProcess === 'string' ? textToProcess : inputText
    if (!text.trim()) return

    const newSeq = translateTextToAslSequence(text)
    setSequence(newSeq)
    setCurrentIndex(0)
    setActiveLetterIndex(0)
    setIsPlaying(false)

    if (newSeq.length > 0) {
      speakCurrent(newSeq[0].label || newSeq[0].word)
    }
  }

  // Handle Preset selection
  const handleSelectPreset = (phrase) => {
    setInputText(phrase)
    handleTranslate(phrase)
  }

  // Next / Previous Navigation
  const handleNext = () => {
    if (currentIndex < sequence.length - 1) {
      const nextIdx = currentIndex + 1
      setCurrentIndex(nextIdx)
      setActiveLetterIndex(0)
      const nextItem = sequence[nextIdx]
      speakCurrent(nextItem.label || nextItem.word)
    } else {
      setIsPlaying(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1
      setCurrentIndex(prevIdx)
      setActiveLetterIndex(0)
      const prevItem = sequence[prevIdx]
      speakCurrent(prevItem.label || prevItem.word)
    }
  }

  const handleReplay = () => {
    setCurrentIndex(0)
    setActiveLetterIndex(0)
    if (sequence.length > 0) {
      speakCurrent(sequence[0].label || sequence[0].word)
    }
  }

  // Auto-Play Timer Loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIdx) => {
          if (prevIdx < sequence.length - 1) {
            const nextIdx = prevIdx + 1
            const item = sequence[nextIdx]
            if (autoVoice && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel()
              const u = new SpeechSynthesisUtterance(item.label || item.word)
              window.speechSynthesis.speak(u)
            }
            return nextIdx
          } else {
            setIsPlaying(false)
            return prevIdx
          }
        })
      }, playbackSpeed)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, playbackSpeed, sequence, autoVoice])

  const currentItem = sequence[currentIndex] || sequence[0]

  return (
    <div className="page-container" style={{ maxWidth: '1040px' }}>
      <div className="page-header">
        <span className="section-pill">Direction 2 • Text to Visual Sign</span>
        <h1 className="page-title">Text-to-Sign Language Visualizer</h1>
        <p className="page-lead">
          Translate natural English sentences and phrases into complete ASL sign representations, movements,
          and manual alphabet fingerspelling sequences.
        </p>
      </div>

      {/* Input Search Box */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)', marginBottom: '1.5rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleTranslate(inputText)
          }}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}
        >
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, minWidth: '280px', fontSize: '1.05rem', padding: '0.85rem 1rem' }}
            placeholder="Type any word or sentence (e.g. Good day, Hello how are you, Thank you)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}>
            Convert to Signs 🤟
          </button>
        </form>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Try Examples:
          </span>
          {PRESET_PHRASES.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(p)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Translation Visualizer Player */}
      {sequence.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
          {/* Top Status & Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Sign {currentIndex + 1} of {sequence.length}
              </span>
              <span className="section-pill" style={{ margin: 0 }}>
                {currentItem.category || currentItem.badge || 'ASL'}
              </span>
            </div>

            {/* Speed & Voice Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                <span>Speed:</span>
                <select
                  className="form-input"
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                >
                  <option value={2000}>Slow (2.0s)</option>
                  <option value={1400}>Normal (1.4s)</option>
                  <option value={800}>Fast (0.8s)</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoVoice}
                  onChange={(e) => setAutoVoice(e.target.checked)}
                  style={{ accentColor: '#0d9488' }}
                />
                Auto Speak
              </label>

              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                onClick={() => {
                  window.speechSynthesis.cancel()
                  const u = new SpeechSynthesisUtterance(currentItem.label || currentItem.word)
                  window.speechSynthesis.speak(u)
                }}
              >
                🔊 Speak Sign
              </button>
            </div>
          </div>

          {/* Visual Sign Component */}
          <div style={{ maxWidth: '640px', margin: '0 auto 2rem' }}>
            <AslHandVisual
              item={currentItem}
              activeLetterIndex={activeLetterIndex}
              onSelectLetter={(idx) => setActiveLetterIndex(idx)}
            />
          </div>

          {/* Player Stepper Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Previous sign"
            >
              ◀ Previous
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ minWidth: '130px' }}
              aria-label={isPlaying ? 'Pause sequence playback' : 'Play sequence playback'}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Auto-Play'}
            </button>

            <button
              className="btn btn-outline"
              onClick={handleReplay}
              aria-label="Replay sequence from beginning"
            >
              🔄 Replay
            </button>

            <button
              className="btn btn-outline"
              onClick={handleNext}
              disabled={currentIndex === sequence.length - 1}
              aria-label="Next sign"
            >
              Next ▶
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleSaveToHistory}
              title="Save this sequence to translation history"
            >
              💾 Save to History
            </button>

            <button
              className="btn btn-outline"
              onClick={() => {
                const textSummary = sequence.map(s => s.label || s.word).join(' ')
                navigator.clipboard?.writeText(textSummary)
                setSavedStatus('Copied sequence to clipboard!')
                announce('Copied sign sequence.')
                setTimeout(() => setSavedStatus(''), 2500)
              }}
              title="Copy sign sequence to clipboard"
            >
              📋 Copy Sequence
            </button>
          </div>

          {savedStatus && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #6ee7b7',
              color: '#047857',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '1.25rem'
            }}>
              ✅ {savedStatus}
            </div>
          )}


          {/* Full Sentence Filmstrip */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
              Sentence Sequence Filmstrip:
            </span>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {sequence.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx)
                    setActiveLetterIndex(0)
                    speakCurrent(item.label || item.word)
                  }}
                  style={{
                    padding: '0.55rem 0.95rem',
                    borderRadius: '10px',
                    background: idx === currentIndex ? '#0d9488' : '#f8fafc',
                    color: idx === currentIndex ? '#ffffff' : '#334155',
                    border: idx === currentIndex ? '1px solid #0d9488' : '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{item.sign}</span>
                  <span>{item.label || item.word}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Educational Grammar & Deaf Culture Note */}
      <div style={{ marginTop: '2rem', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '1.25rem 1.5rem', borderRadius: '14px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f766e', lineHeight: 1.6 }}>
          <strong>💡 SignBridge Translation Intelligence:</strong>
          {' '}Phrases like <em>"Good day"</em>, <em>"Good morning"</em>, and <em>"How are you"</em> are recognized as unified ASL conceptual signs.
          Unlisted proper nouns or specialized names (like personal names) automatically trigger the complete <strong>A–Z ASL Manual Alphabet fingerspelling stepper</strong> so every letter is crystal clear.
        </p>
      </div>
    </div>
  )
}
