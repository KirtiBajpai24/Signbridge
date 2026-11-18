import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SignDictionary from '../components/SignDictionary'
import SignQuiz from '../components/SignQuiz'
import { ASL_ALPHABET } from '../utils/aslDictionaryData'
import { useAccessibility } from '../context/AccessibilityContext'
import './Pages.css'

export default function Dictionary() {
  const [activeTab, setActiveTab] = useState('lexicon') // 'lexicon' | 'alphabet' | 'quiz'
  const [selectedLetter, setSelectedLetter] = useState('A')
  const { announce } = useAccessibility()
  const navigate = useNavigate()

  const alphabetList = Object.keys(ASL_ALPHABET).map((key) => ASL_ALPHABET[key])
  const activeLetterData = ASL_ALPHABET[selectedLetter] || ASL_ALPHABET['A']

  const handleSpeakLetter = (letter) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(`Letter ${letter}`)
      window.speechSynthesis.speak(u)
    }
  }

  const handleSelectSignForPractice = (sign) => {
    announce(`Selected ${sign.word} for camera practice`)
    navigate('/live-translator', { state: { practiceTarget: sign.word } })
  }

  return (
    <div className="page-container" style={{ maxWidth: '1240px' }}>
      <div className="page-header">
        <span className="section-pill">Interactive ASL Academy</span>
        <h1 className="page-title">ASL Vocabulary & Learning Studio</h1>
        <p className="page-lead">
          Explore essential American Sign Language vocabulary, study the 26-letter manual fingerspelling alphabet,
          and test your knowledge with interactive quizzes.
        </p>
      </div>

      {/* Primary Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
        background: '#f1f5f9',
        padding: '0.4rem',
        borderRadius: '12px',
        width: 'fit-content',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => {
            setActiveTab('lexicon')
            announce('Viewing ASL Dictionary Lexicon')
          }}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '9px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'lexicon' ? '#ffffff' : 'transparent',
            color: activeTab === 'lexicon' ? '#0d9488' : '#64748b',
            boxShadow: activeTab === 'lexicon' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          📖 Vocabulary Lexicon
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('alphabet')
            announce('Viewing A to Z Fingerspelling Alphabet Chart')
          }}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '9px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'alphabet' ? '#ffffff' : 'transparent',
            color: activeTab === 'alphabet' ? '#0d9488' : '#64748b',
            boxShadow: activeTab === 'alphabet' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          🔤 A–Z Fingerspelling Chart
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('quiz')
            announce('Viewing Interactive ASL Knowledge Quiz')
          }}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '9px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'quiz' ? '#ffffff' : 'transparent',
            color: activeTab === 'quiz' ? '#0d9488' : '#64748b',
            boxShadow: activeTab === 'quiz' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          🎯 Interactive Quiz
        </button>
      </div>

      {/* Tab 1: Dictionary Lexicon */}
      {activeTab === 'lexicon' && (
        <div>
          <SignDictionary onSelectSignForPractice={handleSelectSignForPractice} />
        </div>
      )}

      {/* Tab 2: A–Z Fingerspelling Chart */}
      {activeTab === 'alphabet' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              American Sign Language (ASL) Manual Alphabet
            </h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
              Select any letter to view its anatomical handshape description, visual gesture, and pronunciation guidance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* 26 Letter Grid Selector */}
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Select Letter (A–Z):
              </span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
                gap: '0.5rem'
              }}>
                {alphabetList.map((item) => (
                  <button
                    key={item.letter}
                    type="button"
                    onClick={() => {
                      setSelectedLetter(item.letter)
                      handleSpeakLetter(item.letter)
                    }}
                    style={{
                      height: '52px',
                      borderRadius: '10px',
                      background: selectedLetter === item.letter ? '#0d9488' : '#f8fafc',
                      color: selectedLetter === item.letter ? '#ffffff' : '#1e293b',
                      border: selectedLetter === item.letter ? '2px solid #0d9488' : '1px solid #cbd5e1',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{item.letter}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Letter Detail Panel */}
            {activeLetterData && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="section-pill" style={{ margin: 0 }}>
                      Letter {activeLetterData.letter}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                      onClick={() => handleSpeakLetter(activeLetterData.letter)}
                    >
                      🔊 Speak
                    </button>
                  </div>

                  <div style={{
                    fontSize: '4.5rem',
                    textAlign: 'center',
                    margin: '1rem 0',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }}>
                    {activeLetterData.sign}
                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '0 0 0.5rem' }}>
                    Letter &ldquo;{activeLetterData.letter}&rdquo;
                  </h3>

                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    margin: '1.25rem 0'
                  }}>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0d9488', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                      Hand Formation:
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>
                      {activeLetterData.desc}
                    </p>
                  </div>

                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9rem',
                    color: '#1e40af'
                  }}>
                    <strong>💡 Memory Tip:</strong> {activeLetterData.hint}
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem' }}
                    onClick={() => {
                      navigate('/live-translator', { state: { practiceTarget: `Letter ${activeLetterData.letter}` } })
                    }}
                  >
                    📹 Practice Letter &ldquo;{activeLetterData.letter}&rdquo; in Live Camera
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Quiz */}
      {activeTab === 'quiz' && (
        <div>
          <SignQuiz />
        </div>
      )}
    </div>
  )
}
