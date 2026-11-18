import { useEffect } from 'react'
import { useAccessibility } from '../../context/AccessibilityContext'
import './AccessibilityBar.css'

export default function AccessibilityBar() {
  const {
    fontSize,
    highContrast,
    dyslexicFont,
    reducedMotion,
    focusHighlight,
    soundFeedback,
    activeCount,
    isModalOpen,
    setFontSize,
    toggleHighContrast,
    toggleDyslexicFont,
    toggleReducedMotion,
    toggleFocusHighlight,
    toggleSoundFeedback,
    resetPreferences,
    openModal,
    closeModal,
    announce
  } = useAccessibility()

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, closeModal])

  const handleToggleContrast = () => {
    toggleHighContrast()
    announce(!highContrast ? 'High contrast enabled' : 'High contrast disabled')
  }

  const handleToggleDyslexic = () => {
    toggleDyslexicFont()
    announce(!dyslexicFont ? 'Dyslexia font enabled' : 'Dyslexia font disabled')
  }

  return (
    <>
      {/* Floating Quick Accessibility Button (FAB) */}
      <button
        className="a11y-fab"
        onClick={openModal}
        aria-label="Open accessibility settings menu"
        aria-haspopup="dialog"
        title="Accessibility Settings (WCAG 2.1 AA)"
      >
        <span className="a11y-fab-icon" aria-hidden="true">♿</span>
        <span>Accessibility</span>
        {activeCount > 0 && (
          <span className="a11y-fab-badge" aria-label={`${activeCount} settings active`}>
            {activeCount}
          </span>
        )}
      </button>

      {/* Accessibility Preferences Modal */}
      {isModalOpen && (
        <div
          className="a11y-modal-backdrop"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="a11y-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="a11y-modal-header">
              <div className="a11y-header-title-group">
                <span className="a11y-header-icon" aria-hidden="true">♿</span>
                <div>
                  <h2 id="a11y-title">Accessibility Preferences</h2>
                  <p>Customize your reading, motion, and contrast settings</p>
                </div>
              </div>
              <button
                className="a11y-close-btn"
                onClick={closeModal}
                aria-label="Close accessibility settings"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="a11y-modal-body">
              {/* 1. Text Size */}
              <div className="a11y-setting-row">
                <div className="a11y-setting-info">
                  <span className="a11y-setting-label">🔤 Text Sizing</span>
                  <span className="a11y-setting-desc">Adjust reading scale across all pages</span>
                </div>
                <div className="a11y-font-options" role="group" aria-label="Text size options">
                  <button
                    className={`a11y-font-btn ${fontSize === 'normal' ? 'active' : ''}`}
                    onClick={() => {
                      setFontSize('normal')
                      announce('Text size set to Normal 100%')
                    }}
                    aria-pressed={fontSize === 'normal'}
                  >
                    100%
                  </button>
                  <button
                    className={`a11y-font-btn ${fontSize === 'large' ? 'active' : ''}`}
                    onClick={() => {
                      setFontSize('large')
                      announce('Text size set to Large 112%')
                    }}
                    aria-pressed={fontSize === 'large'}
                  >
                    112%
                  </button>
                  <button
                    className={`a11y-font-btn ${fontSize === 'xlarge' ? 'active' : ''}`}
                    onClick={() => {
                      setFontSize('xlarge')
                      announce('Text size set to Extra Large 125%')
                    }}
                    aria-pressed={fontSize === 'xlarge'}
                  >
                    125%
                  </button>
                </div>
              </div>

              {/* 2. High Contrast Theme */}
              <div className="a11y-setting-row">
                <div className="a11y-setting-info">
                  <span className="a11y-setting-label">🌓 High Contrast Theme</span>
                  <span className="a11y-setting-desc">WCAG AAA compliant stark contrast for low-vision clarity</span>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={handleToggleContrast}
                    aria-label="Toggle high contrast theme"
                  />
                  <span className="a11y-slider"></span>
                </label>
              </div>

              {/* 3. Dyslexia-Friendly Typography */}
              <div className="a11y-setting-row">
                <div className="a11y-setting-info">
                  <span className="a11y-setting-label">📖 Dyslexia-Friendly Font</span>
                  <span className="a11y-setting-desc">Increases letter spacing and character distinction</span>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={dyslexicFont}
                    onChange={handleToggleDyslexic}
                    aria-label="Toggle dyslexia-friendly font"
                  />
                  <span className="a11y-slider"></span>
                </label>
              </div>

              {/* 4. Reduced Motion */}
              <div className="a11y-setting-row">
                <div className="a11y-setting-info">
                  <span className="a11y-setting-label">⏸️ Reduced Motion</span>
                  <span className="a11y-setting-desc">Suppresses animations and camera transitions for vestibular comfort</span>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={() => {
                      toggleReducedMotion()
                      announce(!reducedMotion ? 'Reduced motion enabled' : 'Reduced motion disabled')
                    }}
                    aria-label="Toggle reduced motion"
                  />
                  <span className="a11y-slider"></span>
                </label>
              </div>

              {/* 5. Enhanced Keyboard Focus */}
              <div className="a11y-setting-row">
                <div className="a11y-setting-info">
                  <span className="a11y-setting-label">⌨️ Enhanced Focus Outlines</span>
                  <span className="a11y-setting-desc">Bold 3.5px focus rings for easy keyboard navigation</span>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={focusHighlight}
                    onChange={() => {
                      toggleFocusHighlight()
                      announce(!focusHighlight ? 'Focus outlines enabled' : 'Focus outlines disabled')
                    }}
                    aria-label="Toggle enhanced focus outlines"
                  />
                  <span className="a11y-slider"></span>
                </label>
              </div>

              {/* 6. Audio Feedback */}
              <div className="a11y-setting-row">
                <div className="a11y-setting-info">
                  <span className="a11y-setting-label">🔊 Spoken Announcements</span>
                  <span className="a11y-setting-desc">Verbal cues when signs are recognized and controls updated</span>
                </div>
                <label className="a11y-switch">
                  <input
                    type="checkbox"
                    checked={soundFeedback}
                    onChange={() => {
                      toggleSoundFeedback()
                      announce(!soundFeedback ? 'Spoken announcements enabled' : 'Spoken announcements disabled')
                    }}
                    aria-label="Toggle spoken announcements"
                  />
                  <span className="a11y-slider"></span>
                </label>
              </div>

              {/* Live Preview Box */}
              <div className="a11y-preview-card" aria-hidden="true">
                <h4>Live Visual Preview</h4>
                <p className="a11y-preview-text">
                  "SignBridge empowers real-time two-way communication between sign language, text, and speech."
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="a11y-modal-footer">
              <button
                className="a11y-reset-btn"
                onClick={() => {
                  resetPreferences()
                  announce('Accessibility settings reset to default')
                }}
              >
                Reset to Default
              </button>
              <button
                className="a11y-done-btn"
                onClick={closeModal}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
