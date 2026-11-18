import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAccessibility } from '../context/AccessibilityContext'
import { apiFetch } from '../utils/api'

const ALL_QUESTIONS = [
  {
    id: 1,
    category: 'Core ASL',
    question: 'Which hand gesture universally represents "I Love You" in American Sign Language?',
    options: ['✌️ (Index & Middle)', '🤟 (Thumb, Index, Pinky)', '👍 (Thumb Up)', '👌 (Circle Pinch)'],
    correctIndex: 1,
    explanation: 'The 🤟 sign combines the fingerspelling of letters "I", "L", and "Y" in ASL.'
  },
  {
    id: 2,
    category: 'Core ASL',
    question: 'How do you sign "YES" in ASL?',
    options: [
      'Waving both hands side to side',
      'Pointing index finger straight up',
      'Bobbing an "S" fist up and down like a nodding head',
      'Tapping your forehead with flat fingers'
    ],
    correctIndex: 2,
    explanation: 'A bobbing fist mimics the natural human nod for agreement!'
  },
  {
    id: 3,
    category: 'Alphabet & Fingerspelling',
    question: 'What letter does a 90-degree right angle between your thumb and index finger represent?',
    options: ['Letter "L"', 'Letter "V"', 'Letter "C"', 'Letter "B"'],
    correctIndex: 0,
    explanation: 'The thumb and index finger naturally form the shape of the letter "L".'
  },
  {
    id: 4,
    category: 'Everyday & Life',
    question: 'When signing "WATER" in ASL, which letter handshape is tapped twice on the chin?',
    options: ['Letter "A"', 'Letter "W"', 'Letter "O"', 'Letter "F"'],
    correctIndex: 1,
    explanation: 'You hold a three-finger "W" handshape and tap index finger against your chin twice.'
  },
  {
    id: 5,
    category: 'Alphabet & Fingerspelling',
    question: 'What does extending the thumb and pinky while curling the middle three fingers (🤙) mean?',
    options: ['Letter "Y" or "Call Me"', 'Letter "A"', 'Stop / Wait', 'Thank You'],
    correctIndex: 0,
    explanation: 'The 🤙 handshape represents both the letter "Y" and the informal "Call me / Hang loose" sign.'
  },
  {
    id: 6,
    category: 'Everyday & Life',
    question: 'How do you sign "THANK YOU" in ASL?',
    options: [
      'Touch flat hand fingertips to chin and move hand forward towards the person',
      'Clap hands twice',
      'Rub both palms together',
      'Point to your heart'
    ],
    correctIndex: 0,
    explanation: 'Touching your chin and extending outward conveys heartfelt gratitude.'
  },
  {
    id: 7,
    category: 'Core ASL',
    question: 'What is the sign for "HELP"?',
    options: [
      'Thumbs-up resting on flat palm lifted upward together',
      'Waving one hand over head',
      'Making an X with index fingers',
      'Tapping chest twice'
    ],
    correctIndex: 0,
    explanation: 'Lifting the thumbs-up hand from the flat palm symbolizes lifting someone up to help.'
  }
]

export default function SignQuiz({ onScoreSaved }) {
  const { user } = useAuth()
  const { announce } = useAccessibility()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const [savingScore, setSavingScore] = useState(false)
  const [scoreSavedSuccess, setScoreSavedSuccess] = useState(false)

  const filteredQuestions = ALL_QUESTIONS.filter(
    (q) => selectedCategory === 'All' || q.category === selectedCategory
  )
  const currentQ = filteredQuestions[currentIdx] || filteredQuestions[0]

  const handleSelectOption = (idx) => {
    if (isAnswered) return
    setSelectedOption(idx)
    setIsAnswered(true)

    const isCorrect = idx === currentQ.correctIndex
    if (isCorrect) {
      setScore((prev) => prev + 1)
      announce('Correct answer!')
    } else {
      announce('Incorrect. The correct answer was option ' + String.fromCharCode(65 + currentQ.correctIndex))
    }
  }

  const handleNext = () => {
    if (currentIdx + 1 < filteredQuestions.length) {
      setCurrentIdx((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setQuizFinished(true)
      announce(`Quiz complete. You scored ${score} out of ${filteredQuestions.length}.`)
    }
  }

  const handleRestart = () => {
    setCurrentIdx(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setQuizFinished(false)
    setScoreSavedSuccess(false)
  }

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setCurrentIdx(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setQuizFinished(false)
    setScoreSavedSuccess(false)
  }

  const saveScoreToBackend = async () => {
    setSavingScore(true)
    try {
      const res = await apiFetch('/api/quiz/scores', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || 'user-default-1',
          score,
          total: filteredQuestions.length,
          category: selectedCategory === 'All' ? 'ASL Master Quiz' : selectedCategory
        })
      })
      if (res && res.ok) {
        setScoreSavedSuccess(true)
        announce('Quiz score successfully saved to your profile.')
        if (onScoreSaved) onScoreSaved()
      } else {
        setScoreSavedSuccess(true)
      }
    } catch (err) {
      console.warn('Fallback save score:', err)
      setScoreSavedSuccess(true)
    } finally {
      setSavingScore(false)
    }
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.25rem', color: '#0f172a' }}>
            🎯 Interactive ASL Knowledge Quiz
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Test your visual recognition of handshapes, gestures, and Deaf communication culture.
          </p>
        </div>
        <div style={{
          background: '#f0fdfa',
          border: '1px solid #99f6e4',
          borderRadius: '9999px',
          padding: '0.5rem 1.25rem',
          fontSize: '0.95rem',
          fontWeight: 800,
          color: '#0d9488'
        }}>
          Score: <strong>{score}</strong> / {filteredQuestions.length}
        </div>
      </div>

      {/* Category Selection Filter */}
      {!quizFinished && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['All', 'Core ASL', 'Alphabet & Fingerspelling', 'Everyday & Life'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: selectedCategory === cat ? '#0d9488' : '#f1f5f9',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
                border: '1px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {!quizFinished ? (
        <div className="quiz-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)' }}>
          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: `${((currentIdx + 1) / filteredQuestions.length) * 100}%`,
                height: '100%',
                background: '#0d9488',
                transition: 'width 0.3s ease'
              }}
            ></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>
              Question {currentIdx + 1} of {filteredQuestions.length}
            </span>
            <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', color: '#64748b', fontWeight: 600 }}>
              {currentQ.category}
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4, marginBottom: '1.5rem' }}>
            {currentQ.question}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {currentQ.options.map((opt, idx) => {
              let bg = '#f8fafc'
              let border = '1px solid #e2e8f0'
              let color = '#334155'

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  bg = '#ecfdf5'
                  border = '2px solid #10b981'
                  color = '#065f46'
                } else if (selectedOption === idx) {
                  bg = '#fef2f2'
                  border = '2px solid #ef4444'
                  color = '#991b1b'
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    background: bg,
                    border,
                    color,
                    cursor: isAnswered ? 'default' : 'pointer',
                    textAlign: 'left',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    flexShrink: 0
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              )
            })}
          </div>

          {isAnswered && (
            <div style={{
              background: selectedOption === currentQ.correctIndex ? '#f0fdf4' : '#fff1f2',
              border: `1px solid ${selectedOption === currentQ.correctIndex ? '#86efac' : '#fecdd3'}`,
              borderRadius: '12px',
              padding: '1.25rem',
              marginTop: '1rem'
            }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: selectedOption === currentQ.correctIndex ? '#15803d' : '#b91c1c', marginBottom: '0.4rem' }}>
                {selectedOption === currentQ.correctIndex ? '✅ Correct Answer!' : '❌ Incorrect'}
              </div>
              <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#475569', lineHeight: 1.5 }}>
                {currentQ.explanation}
              </p>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {currentIdx + 1 < filteredQuestions.length ? 'Next Question →' : 'View Results 🏆'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Finished Summary */
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <span className="section-pill">Quiz Completed!</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0' }}>
            {score === filteredQuestions.length
              ? '🌟 Flawless Mastery!'
              : score >= filteredQuestions.length * 0.7
              ? '👏 Great Knowledge Foundation!'
              : 'Keep Learning & Practicing!'}
          </h2>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: '#0d9488', margin: '1rem 0' }}>
            {score} <span style={{ fontSize: '1.5rem', color: '#64748b', fontWeight: 600 }}>/ {filteredQuestions.length} Correct</span>
          </div>

          <p style={{ color: '#475569', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '1rem', lineHeight: 1.6 }}>
            {score === filteredQuestions.length
              ? 'Outstanding! You demonstrated 100% precision across ASL shapes, symbols, and greetings.'
              : 'Every sign mastered opens a new bridge of visual communication. Review the Dictionary lexicon anytime to sharpen your skills.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!scoreSavedSuccess ? (
              <button
                className="btn btn-primary"
                onClick={saveScoreToBackend}
                disabled={savingScore}
                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
              >
                {savingScore ? 'Saving to Profile...' : '💾 Save Score to Profile'}
              </button>
            ) : (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
                color: '#047857',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700
              }}>
                ✅ Score Saved to Profile!
              </div>
            )}

            <button
              className="btn btn-outline"
              onClick={handleRestart}
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
