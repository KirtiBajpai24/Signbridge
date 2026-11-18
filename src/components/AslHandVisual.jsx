import './AslHandVisual.css'

export default function AslHandVisual({ item, activeLetterIndex = 0, onSelectLetter }) {
  if (!item) return null

  // If item is a fingerspelled word container
  const isFingerspellWord = item.type === 'fingerspell_word'
  const letters = item.letters || []
  const currentLetterObj = letters[activeLetterIndex] || letters[0]

  return (
    <div className="asl-visual-container">
      {isFingerspellWord ? (
        // Fingerspelling Multi-letter view
        <div className="fs-card">
          <div className="fs-header">
            <span className="fs-word-title">Word: "{item.word}"</span>
            <span className="fs-badge">Fingerspelling ({letters.length} letters)</span>
          </div>

          {currentLetterObj && (
            <div className="fs-current-letter-box">
              <div className="fs-letter-badge">{currentLetterObj.letter}</div>
              <div className="fs-letter-sign-large">{currentLetterObj.sign}</div>
              <p className="fs-letter-desc">{currentLetterObj.desc}</p>
              {currentLetterObj.hint && (
                <div className="fs-letter-hint">
                  <span>💡 Tip:</span> {currentLetterObj.hint}
                </div>
              )}
            </div>
          )}

          {/* Letter Thumbnails Bar */}
          <div className="fs-letter-thumbs">
            {letters.map((l, idx) => (
              <button
                key={idx}
                type="button"
                className={`fs-thumb-btn ${idx === activeLetterIndex ? 'active' : ''}`}
                onClick={() => onSelectLetter && onSelectLetter(idx)}
              >
                <span className="thumb-char">{l.letter}</span>
                <span className="thumb-sign">{l.sign}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Standard Concept Sign View (e.g. GOOD, DAY, HELLO)
        <div className="concept-sign-card">
          <div className="concept-top-row">
            <span className="concept-category-tag">{item.category || 'ASL Sign'}</span>
            {item.motion && (
              <div className="concept-motion-indicator" title="Movement direction">
                <span>Motion:</span>
                <strong>{item.motion}</strong>
              </div>
            )}
          </div>

          <div className="concept-hero-icon-wrapper">
            <div className="concept-hero-icon">{item.sign}</div>
            <div className="concept-hand-aura"></div>
          </div>

          <h2 className="concept-hero-label">{item.label}</h2>

          <div className="concept-desc-box">
            <div className="desc-heading">Hand Formation & Motion:</div>
            <p className="desc-text">{item.desc}</p>
          </div>
        </div>
      )}
    </div>
  )
}
