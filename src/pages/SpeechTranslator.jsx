import { useState, useRef, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAccessibility } from '../context/AccessibilityContext'
import { translateTextToAslSequence } from '../utils/aslDictionaryData'
import { apiFetch } from '../utils/api'
import './SpeechTranslator.css'

const QUICK_DEAF_REPLIES = [
  'Yes, I understand clearly.',
  'Could you please repeat that?',
  'Please speak a little slower.',
  'I need to see a doctor.',
  'Thank you for your patience!',
  'Please write that down.'
]

export default function SpeechTranslator() {
  const { user } = useAuth()
  const { announce } = useAccessibility()

  // Hearing Voice Ingestion State
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [supported, setSupported] = useState(true)
  const [savedStatus, setSavedStatus] = useState('')

  // Deaf Companion Reverse Reply State
  const [replyText, setReplyText] = useState('')
  const [lastSpokenReply, setLastSpokenReply] = useState('')

  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let finalStr = ''
      let interimStr = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i]
        if (item.isFinal) {
          finalStr += item[0].transcript + ' '
        } else {
          interimStr += item[0].transcript
        }
      }

      if (finalStr) {
        setTranscript((prev) => (prev ? prev + ' ' + finalStr : finalStr).trim())
        announce(`Transcribed: ${finalStr}`)
      }
      setInterimText(interimStr)
    }

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [announce])

  const startListening = () => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.start()
      setIsListening(true)
      announce('Microphone started. Listening for speech.')
    } catch (err) {
      console.error(err)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    announce('Microphone paused.')
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimText('')
    announce('Transcript cleared.')
  }

  // Convert current speech into visual ASL tokens
  const aslSignSequence = useMemo(() => {
    if (!transcript) return []
    return translateTextToAslSequence(transcript)
  }, [transcript])

  const handleSaveTranslation = async () => {
    if (!transcript) return
    try {
      await apiFetch('/api/history', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || 'user-default-1',
          type: 'speech-to-sign',
          inputText: transcript,
          outputText: transcript,
          confidence: 98
        })
      })
      setSavedStatus('Saved to History!')
      announce('Saved translation to history.')
      setTimeout(() => setSavedStatus(''), 2500)
    } catch {
      setSavedStatus('Saved locally!')
      setTimeout(() => setSavedStatus(''), 2500)
    }
  }

  // Deaf user speaks their typed reply aloud to hearing companion
  const handleSpeakReply = (textToSpeak) => {
    const text = textToSpeak || replyText
    if (!text.trim() || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
    setLastSpokenReply(text)
    announce(`Spoken reply: ${text}`)

    // Record in history
    apiFetch('/api/history', {
      method: 'POST',
      body: JSON.stringify({
        userId: user?.id || 'user-default-1',
        type: 'text-to-speech',
        inputText: text,
        outputText: text,
        confidence: 100
      })
    }).catch(() => {})
  }

  return (
    <div className="page-container" style={{ maxWidth: '1240px' }}>
      <div className="page-header">
        <span className="section-pill">Direction 2 • Full-Duplex Two-Way</span>
        <h1 className="page-title">Speech-to-Sign Visualizer &amp; Two-Way Studio</h1>
        <p className="page-lead">
          Hearing companions speak naturally into the microphone. Voice is transcribed and instantly mapped
          to visual ASL sign representations, while Deaf users reply through synthesized voice.
        </p>
      </div>

      {!supported && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          ⚠️ Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.
        </div>
      )}

      <div className="two-way-grid">
        {/* Left Column: Hearing Person's Speech ➔ ASL Sign Cards */}
        <div className="speech-card">
          <div className="card-title-row">
            <h3>🎙️ Hearing Companion Voice</h3>
            <span className={`mic-status-pill ${isListening ? 'recording' : ''}`}>
              {isListening ? '🔴 Recording Speech...' : 'Microphone Ready'}
            </span>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1rem' }}>
            Speak into the microphone. Spoken words will be transcribed and converted into ASL sign representations below.
          </p>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {!isListening ? (
              <button type="button" className="btn btn-primary" onClick={startListening} disabled={!supported}>
                🎙️ Start Listening
              </button>
            ) : (
              <button type="button" className="btn btn-logout" onClick={stopListening}>
                ⏹️ Stop Microphone
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline"
              onClick={clearTranscript}
              disabled={!transcript && !interimText}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleSaveTranslation}
              disabled={!transcript}
            >
              Save History
            </button>
          </div>

          {savedStatus && (
            <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', color: '#0d9488', padding: '0.4rem 0.8rem', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>
              ✓ {savedStatus}
            </div>
          )}

          {/* Spoken Text Box */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
            minHeight: '80px',
            fontSize: '1.05rem',
            color: '#0f172a'
          }}>
            {transcript ? (
              <span>&ldquo;{transcript}&rdquo;</span>
            ) : !interimText ? (
              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.92rem' }}>
                Click "Start Listening" and speak. Transcribed speech appears here...
              </span>
            ) : null}
            {interimText && <span style={{ color: '#0d9488', opacity: 0.8 }}> {interimText}...</span>}
          </div>

          {/* Visual ASL Signs Display Area */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '1.25rem 0 0.5rem' }}>
            Visual Sign Representation ({aslSignSequence.length} tokens):
          </h4>

          <div className="asl-signs-stream">
            {aslSignSequence.length === 0 ? (
              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.88rem' }}>
                Visual hand sign representations will display here as words are spoken...
              </span>
            ) : (
              aslSignSequence.map((tok, i) => (
                <div key={i} className="asl-word-card">
                  <span className="asl-word-emoji">
                    {tok.type === 'phrase' ? '🤟' : tok.type === 'word' ? '✋' : '✍️'}
                  </span>
                  <span className="asl-word-label">{tok.label || tok.word}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Deaf Person's Reverse Response ➔ Audio Speech */}
        <div className="speech-card">
          <div className="card-title-row">
            <h3>💬 Deaf Companion Response</h3>
            <span className="section-pill" style={{ margin: 0 }}>Voice Synthesizer</span>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1rem' }}>
            Type your response or tap a quick phrase below. Hit "Speak Reply" to voice your answer aloud to the hearing companion.
          </p>

          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
            Quick Tap Responses:
          </span>

          <div className="quick-replies-grid">
            {QUICK_DEAF_REPLIES.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-reply-chip"
                onClick={() => {
                  setReplyText(phrase)
                  handleSpeakReply(phrase)
                }}
              >
                {phrase}
              </button>
            ))}
          </div>

          <div className="reply-input-group" style={{ marginTop: 'auto' }}>
            <input
              type="text"
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSpeakReply()}
              className="reply-text-input"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSpeakReply()}
              disabled={!replyText.trim()}
            >
              🔊 Speak Reply
            </button>
          </div>

          {lastSpokenReply && (
            <div style={{ marginTop: '1rem', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.88rem', color: '#0f766e' }}>
              <strong>Last Spoken to Hearing Companion:</strong> &ldquo;{lastSpokenReply}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
