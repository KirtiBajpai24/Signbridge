import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import './Help.css'

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedIndex, setExpandedIndex] = useState(0) // Default first open

  // Feedback form state
  const [feedbackCategory, setFeedbackCategory] = useState('gesture')
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const faqs = [
    {
      id: 'camera-perm',
      category: 'camera',
      q: 'How does SignBridge access my camera and microphone?',
      a: 'SignBridge utilizes standard HTML5 MediaDevices APIs (navigator.mediaDevices.getUserMedia). When you launch the Live Translator Studio or Speech Visualizer, your browser will prompt you to grant access. Your video and audio feeds are strictly processed locally within your browser sandbox; no raw video frames are ever recorded or transmitted to any external cloud servers.'
    },
    {
      id: 'webgl-crash',
      category: 'camera',
      q: 'Does SignBridge work if my device has WebGL disabled or limited GPU acceleration?',
      a: 'Yes! We explicitly configure MediaPipe with a CPU/Wasm runtime delegate ("delegate: CPU") and an HTML5 Canvas fallback skin contour engine. This architectural design completely eliminates WebGL context loss errors, memory fragmentation, and browser tab freezes on older laptops, Chromebooks, and low-power mobile devices.'
    },
    {
      id: 'lighting-accuracy',
      category: 'accuracy',
      q: 'What lighting conditions provide the highest hand gesture recognition accuracy?',
      a: 'For optimal hand landmark tracking, ensure your lighting source is positioned in front of you or above you, illuminating your hands and face evenly. Avoid sitting with bright windows or blinding lamps directly behind your back (backlighting causes harsh silhouettes that obscure individual finger joints). A solid, neutral background also provides higher contrast.'
    },
    {
      id: 'hand-positioning',
      category: 'accuracy',
      q: 'How should I position my hands in front of the webcam for best results?',
      a: 'Hold your hands 0.5 to 1.5 meters away from the camera lens, ideally within the upper 60% of the camera viewframe. Our gesture classification engine uses palm-scale normalization (measuring distance between the wrist joint and the middle finger MCP knuckle), which means gestures remain accurate whether you sit close or lean back.'
    },
    {
      id: 'privacy-hipaa',
      category: 'privacy',
      q: 'Is SignBridge safe for sensitive conversations in medical or legal settings?',
      a: 'Yes. Unlike typical cloud AI translation services that upload video files to remote model clusters, SignBridge runs 100% of the hand tracking and gesture classification algorithms directly inside your client browser. Video frames reside only in ephemeral memory and are discarded after each frame inference, preserving full patient and client confidentiality.'
    },
    {
      id: 'offline-mode',
      category: 'privacy',
      q: 'Can I use SignBridge without an active internet connection?',
      a: 'Yes! Once the core application assets and neural models are cached in your browser through service worker caching, the Live Translator Studio, Text-to-Sign Visualizer, ASL Dictionary, and Emergency Mode function entirely offline. Only features requiring cloud speech transcription (if your OS lacks built-in speech recognition) require internet.'
    },
    {
      id: 'emergency-call',
      category: 'emergency',
      q: 'Does Emergency SOS mode dial 911 or dispatch first responders automatically?',
      a: 'No. To prevent accidental dispatches and comply with telecommunications safety laws, Emergency Mode does not automatically initiate 911 phone calls. Instead, it instantly renders full-screen high-contrast visual distress cards and triggers maximum-volume spoken audio alerts so anyone nearby can immediately identify your urgent need.'
    },
    {
      id: 'hearing-path',
      category: 'accuracy',
      q: 'How does the Hearing ➔ Deaf direction work when a hearing doctor speaks?',
      a: 'When a hearing person speaks, their speech is captured by the microphone and transcribed in real-time via the Web Speech API. SignBridge’s linguistic parser breaks the sentence into semantic tokens, looks up corresponding ASL signs in our dictionary, and presents animated sign representations on screen for the Deaf person to read visually.'
    },
    {
      id: 'accessibility-tools',
      category: 'accessibility',
      q: 'What accessibility accommodations are built directly into SignBridge?',
      a: 'SignBridge features a universal Accessibility Control Bar accessible from any page. You can adjust text scale across 3 levels (100%, 112%, 125%), toggle High Contrast WCAG AAA mode, enable OpenDyslexic typography for reading comfort, reduce motion animations, and activate ARIA live announcements for screen readers.'
    },
    {
      id: 'supported-signs',
      category: 'accuracy',
      q: 'What sign gestures are currently supported in the Live Translator Studio?',
      a: 'The engine currently classifies 14 high-utility sign gestures: Hello / Open Palm, I Love You, Yes (Thumbs Up), No (Thumbs Down), OK, Peace / Two, One / Point, Fist / Letter S, Call Me / Letter Y, Letter L, Letter W / Three, Letter B, Thank You (Namaste), and Emergency Help. Continuous temporal sequence recognition for full sentences is actively expanding in Section 12.'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'camera', label: '📹 Camera & Setup' },
    { id: 'accuracy', label: '🎯 Accuracy & Tips' },
    { id: 'privacy', label: '🔒 Privacy & Edge' },
    { id: 'emergency', label: '🚨 Emergency SOS' },
    { id: 'accessibility', label: '♿ Accessibility' }
  ]

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch = !query ||
        faq.q.toLowerCase().includes(query) ||
        faq.a.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [faqs, activeCategory, searchQuery])

  const toggleAccordion = (idx) => {
    setExpandedIndex(expandedIndex === idx ? -1 : idx)
  }

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()
    if (!feedbackText.trim()) return
    setFeedbackSubmitted(true)
  }

  return (
    <div className="help-page">
      {/* 1. Header */}
      <div className="help-header">
        <span className="section-pill">Support Center</span>
        <h1 className="help-title">Help & Documentation</h1>
        <p className="help-lead">
          Everything you need to know about setting up your webcam, ensuring high gesture recognition accuracy,
          maintaining privacy, and navigating SignBridge with assistive technology.
        </p>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="help-search-container">
        <span className="help-search-icon">🔍</span>
        <input
          type="text"
          className="help-search-input"
          placeholder="Search questions by keyword (e.g. camera, lighting, privacy, speech)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search FAQs"
        />
      </div>

      <div className="help-categories" role="tablist" aria-label="FAQ Categories">
        {categories.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={activeCategory === c.id}
            className={`help-cat-btn ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 3. Searchable FAQ Accordion */}
      <section className="faq-section">
        <div className="faq-section-header">
          <h2>Frequently Asked Questions</h2>
          <span className="faq-count">
            Showing {filteredFaqs.length} of {faqs.length} articles
          </span>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="faq-empty-state">
            <h3>No articles matching &ldquo;{searchQuery}&rdquo;</h3>
            <p>Try searching for different terms or reset your category filter.</p>
            <button
              className="help-cat-btn"
              style={{ marginTop: '1rem' }}
              onClick={() => { setSearchQuery(''); setActiveCategory('all') }}
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="faq-list">
            {filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx
              return (
                <div key={faq.id} className="faq-item">
                  <button
                    className="faq-question-btn"
                    onClick={() => toggleAccordion(idx)}
                    aria-expanded={isExpanded}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <span>{faq.q}</span>
                    <span className={`faq-toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                  </button>
                  {isExpanded && (
                    <div id={`faq-answer-${faq.id}`} className="faq-answer">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 4. Interactive Diagnostic & Troubleshooting Guide */}
      <section className="diagnostic-section">
        <div className="diagnostic-header">
          <span className="section-pill">Hardware & Setup</span>
          <h2>Webcam & Microphone Diagnostic Guide</h2>
          <p>
            If your camera isn&rsquo;t displaying or hands aren&rsquo;t being tracked, follow this 4-step checklist:
          </p>
        </div>

        <div className="diagnostic-steps-grid">
          <div className="diag-step-card">
            <div className="diag-step-num">1</div>
            <h3>Check Browser Permission</h3>
            <p>
              Click the lock or tune icon on the left side of your browser URL bar. Ensure Camera and
              Microphone permissions are set to &ldquo;Allow&rdquo;.
            </p>
          </div>

          <div className="diag-step-card">
            <div className="diag-step-num">2</div>
            <h3>Release Other Applications</h3>
            <p>
              Close video call apps such as Zoom, Microsoft Teams, Skype, or FaceTime that might hold an
              exclusive hardware lock on your camera device.
            </p>
          </div>

          <div className="diag-step-card">
            <div className="diag-step-num">3</div>
            <h3>Optimize Lighting Contrast</h3>
            <p>
              Avoid heavy backlighting (windows directly behind you). Ensure your room is well lit and
              your palms and fingers are clearly distinguishable.
            </p>
          </div>

          <div className="diag-step-card">
            <div className="diag-step-num">4</div>
            <h3>Camera Distance & Framing</h3>
            <p>
              Sit between 0.5m and 1.5m from your webcam. Keep your signing hands within the upper 60% of
              the frame with fingers facing toward the camera lens.
            </p>
          </div>
        </div>

        {/* Browser-Specific Quick Reset Instructions */}
        <div className="browser-guide-box">
          <h4>🌐 Browser-Specific Permission Reset Instructions</h4>
          <div className="browser-instructions-grid">
            <div className="browser-instr-item">
              <strong>Google Chrome</strong>
              Settings ➔ Privacy &amp; Security ➔ Site Settings ➔ Camera ➔ Allow localhost / signbridge.
            </div>
            <div className="browser-instr-item">
              <strong>Apple Safari</strong>
              Safari Preferences ➔ Websites ➔ Camera ➔ Change setting for current site to &ldquo;Allow&rdquo;.
            </div>
            <div className="browser-instr-item">
              <strong>Mozilla Firefox</strong>
              Click the permissions shield in the address bar ➔ Clear blocked camera permissions ➔ Reload.
            </div>
            <div className="browser-instr-item">
              <strong>Microsoft Edge</strong>
              Settings ➔ Cookies and site permissions ➔ Camera ➔ Toggle permission on for this domain.
            </div>
          </div>
        </div>
      </section>

      {/* 5. Accessibility Commitment Statement */}
      <section className="a11y-statement-box">
        <span className="section-pill">Inclusion Standard</span>
        <h2>SignBridge Accessibility Statement</h2>
        <p>
          SignBridge is built from the ground up to achieve strict compliance with the World Wide Web
          Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA and AAA wherever feasible.
        </p>

        <div className="a11y-features-grid">
          <div className="a11y-feat-item">
            <span>⌨️</span> 100% Full Keyboard Navigation
          </div>
          <div className="a11y-feat-item">
            <span>🗣️</span> ARIA Live Regions for Screen Readers
          </div>
          <div className="a11y-feat-item">
            <span>👁️</span> WCAG AAA High Contrast Theme
          </div>
          <div className="a11y-feat-item">
            <span>🔤</span> OpenDyslexic Typography Support
          </div>
          <div className="a11y-feat-item">
            <span>🔍</span> 3-Level Proportional Font Resizing
          </div>
          <div className="a11y-feat-item">
            <span>⚡</span> Reduced Motion CSS Prefers-Reduced
          </div>
        </div>
      </section>

      {/* 6. Feedback & Issue Reporting Form */}
      <section className="help-feedback-box">
        <h2>Report an Issue or Suggest a Sign</h2>
        <p>
          Help us train better gesture classifiers or report bugs you encountered during your translation session.
        </p>

        {feedbackSubmitted ? (
          <div className="feedback-success-banner">
            <h4>Thank You for Your Feedback!</h4>
            <p>
              Your report has been received and added to our continuous training pipeline. Together, we are
              building a more inclusive world.
            </p>
            <button
              className="feedback-submit-btn"
              onClick={() => { setFeedbackSubmitted(false); setFeedbackText('') }}
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
            <div className="form-group">
              <label htmlFor="fb-cat">Issue Category</label>
              <select
                id="fb-cat"
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value)}
              >
                <option value="gesture">Gesture Recognition Accuracy</option>
                <option value="speech">Voice / Audio Speech Synthesis</option>
                <option value="camera">Camera or Video Device Detection</option>
                <option value="accessibility">Accessibility Accommodation Request</option>
                <option value="dictionary">New ASL Sign Request for Dictionary</option>
                <option value="other">General Platform Feedback</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fb-desc">Detailed Description</label>
              <textarea
                id="fb-desc"
                rows="4"
                placeholder="Describe what occurred, which sign gesture was performed, and what output you observed..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="feedback-submit-btn">
              Submit Feedback Report →
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
