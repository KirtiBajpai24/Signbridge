import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAccessibility } from '../context/AccessibilityContext'
import './Home.css'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const { openModal } = useAccessibility()
  const navigate = useNavigate()

  // Auto-redirect authenticated members directly to Dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="home-page">
      {/* 1. Hero Section */}
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-pulse"></span> Breaking Communication Barriers Through AI
          </div>

          <h1 className="hero-title">
            Real-Time AI Communication Between <span className="gradient-text">Sign Language, Text & Speech</span>
          </h1>

          <p className="hero-subtitle">
            SignBridge is a full-duplex assistive bridge empowering Deaf, hard-of-hearing, and hearing individuals
            to converse naturally. Translate camera sign gestures into spoken voice, and speech into visual sign language in real time.
          </p>

          <div className="hero-actions">
            <Link to="/live-translator" className="hero-btn-primary">
              Start Translating 🚀
            </Link>
            <Link to="/how-it-works" className="hero-btn-secondary">
              Learn How It Works 📖
            </Link>
          </div>

          <div className="hero-metric-strip">
            <div className="metric-item">
              <span className="metric-val">2-Way</span>
              <span className="metric-lbl">Sign ⇄ Speech</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-val">21 Joints</span>
              <span className="metric-lbl">3D Landmark Mesh</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-val">100% Private</span>
              <span className="metric-lbl">Client-Side Edge AI</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-val">WCAG 2.1 AA</span>
              <span className="metric-lbl">Accessible Standard</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Visual Demonstration (Pure CSS & Static Preview - No Heavy AI) */}
        <div className="hero-visual-container">
          <div className="hero-mockup-card">
            {/* Left Stream: Visual Sign */}
            <div className="mockup-side">
              <div className="mockup-header">
                <span className="mockup-tag">Direction 1 • Sign Input</span>
                <span className="mockup-fps">30 FPS Live</span>
              </div>
              <div className="mockup-camera-view">
                <div className="mockup-hand-wireframe">
                  <div className="wireframe-glow">✋</div>
                  <div className="wireframe-joint j-wrist"></div>
                  <div className="wireframe-joint j-thumb"></div>
                  <div className="wireframe-joint j-index"></div>
                  <div className="wireframe-joint j-middle"></div>
                  <div className="wireframe-joint j-ring"></div>
                  <div className="wireframe-joint j-pinky"></div>
                </div>
                <div className="mockup-detection-pill">
                  <span>Hello / Greeting ✋</span>
                  <small>98% Conf.</small>
                </div>
              </div>
            </div>

            {/* Middle: Bidirectional Neural Bridge */}
            <div className="mockup-bridge-core">
              <div className="bridge-icon">⇄</div>
              <span className="bridge-label">AI Bridge</span>
              <div className="bridge-pulse-dot"></div>
            </div>

            {/* Right Stream: Voice & Text Output */}
            <div className="mockup-side">
              <div className="mockup-header">
                <span className="mockup-tag">Spoken Voice & Text</span>
                <span className="mockup-audio-active">🔊 Audio Active</span>
              </div>
              <div className="mockup-output-view">
                <div className="mockup-speech-bubble">
                  <span className="bubble-speaker">Spoken Output:</span>
                  <p>"Hello! How are you doing today?"</p>
                </div>
                <div className="mockup-audio-visualizer">
                  <span className="audio-bar bar-1"></span>
                  <span className="audio-bar bar-2"></span>
                  <span className="audio-bar bar-3"></span>
                  <span className="audio-bar bar-4"></span>
                  <span className="audio-bar bar-5"></span>
                  <span className="audio-bar bar-6"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Feature Cards Grid (Section 6) */}
      <section className="home-section" id="features">
        <div className="section-header">
          <span className="section-pill">Core Features</span>
          <h2>Six Translation Modalities</h2>
          <p>
            Seamless two-way translation across visual sign language, written English text, and natural vocal speech.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="card-badge">Direction 1</div>
            <div className="card-icon">✋ ➔ 💬</div>
            <h3>Sign → Text</h3>
            <p>
              High-speed computer vision tracks 21 skeletal joints, translates gestures progressively, and builds readable sentences.
            </p>
            <Link to="/live-translator" className="card-link">Launch Sign to Text →</Link>
          </div>

          <div className="feature-card">
            <div className="card-badge">Direction 1</div>
            <div className="card-icon">✋ ➔ 🔊</div>
            <h3>Sign → Speech</h3>
            <p>
              Converts recognized sign gestures directly into clear verbal speech through your device speakers in real time.
            </p>
            <Link to="/live-translator" className="card-link">Experience Voice Output →</Link>
          </div>

          <div className="feature-card">
            <div className="card-badge">Direction 2</div>
            <div className="card-icon">🎙️ ➔ 💬</div>
            <h3>Speech → Text</h3>
            <p>
              Captures spoken English conversation through the microphone and renders real-time accessible captions for Deaf users.
            </p>
            <Link to="/speech-translator" className="card-link">Use Speech to Text →</Link>
          </div>

          <div className="feature-card">
            <div className="card-badge">Direction 2</div>
            <div className="card-icon">💬 ➔ 🤟</div>
            <h3>Text → Sign</h3>
            <p>
              Converts typed words or captured speech into high-contrast ASL fingerspelling cards and anatomical visual demonstrations.
            </p>
            <Link to="/text-to-sign" className="card-link">Explore Text to Sign →</Link>
          </div>

          <div className="feature-card">
            <div className="card-badge">Real-Time</div>
            <div className="card-icon">📹 ➔ ⚡</div>
            <h3>Live Camera Translation</h3>
            <p>
              Real-time browser webcam translation studio with glowing AR skeletal HUD overlays and progressive sentence accumulation.
            </p>
            <Link to="/live-translator" className="card-link">Open Live Camera →</Link>
          </div>

          <div className="feature-card">
            <div className="card-badge">Batch File</div>
            <div className="card-icon">📁 ➔ 📝</div>
            <h3>Recorded Video Translation</h3>
            <p>
              Upload recorded MP4, WebM, or MOV sign language footage for temporal sequence analysis and timestamped transcripts.
            </p>
            <Link to="/video-translator" className="card-link">Upload Video File →</Link>
          </div>
        </div>
      </section>

      {/* 3. Dual Communication Pipeline Showcase */}
      <section className="home-section bg-alt" id="how-it-works">
        <div className="section-header">
          <span className="section-pill">Two-Way Architecture</span>
          <h2>How SignBridge Works</h2>
          <p>
            Two distinct bidirectional translation pipelines designed for complete human-to-human communication parity.
          </p>
        </div>

        <div className="pipelines-container">
          {/* Direction 1 Pipeline */}
          <div className="pipeline-card">
            <div className="pipeline-title-row">
              <span className="pipeline-badge dir-1">Direction 1</span>
              <h3>Sign Language User ➔ Hearing Person</h3>
            </div>
            <p className="pipeline-desc">
              Converts live visual gestures into spoken speech and written transcriptions.
            </p>

            <div className="pipeline-steps-flow">
              <div className="pipe-step">
                <span className="step-num">1</span>
                <span className="step-icon">✋</span>
                <strong>Sign Language</strong>
                <small>User performs ASL signs</small>
              </div>
              <div className="pipe-arrow">➔</div>
              <div className="pipe-step">
                <span className="step-num">2</span>
                <span className="step-icon">📹</span>
                <strong>Camera / Video</strong>
                <small>640x480 video feed</small>
              </div>
              <div className="pipe-arrow">➔</div>
              <div className="pipe-step">
                <span className="step-num">3</span>
                <span className="step-icon">🦴</span>
                <strong>MediaPipe</strong>
                <small>21 3D joint landmarks</small>
              </div>
              <div className="pipe-arrow">➔</div>
              <div className="pipe-step">
                <span className="step-num">4</span>
                <span className="step-icon">🧠</span>
                <strong>Recognition AI</strong>
                <small>Scale-invariant kinematics</small>
              </div>
              <div className="pipe-arrow">➔</div>
              <div className="pipe-step">
                <span className="step-num">5</span>
                <span className="step-icon">💬</span>
                <strong>Written Text</strong>
                <small>Progressive sentence builder</small>
              </div>
              <div className="pipe-arrow">➔</div>
              <div className="pipe-step highlight">
                <span className="step-num">6</span>
                <span className="step-icon">🔊</span>
                <strong>Vocal Speech</strong>
                <small>Real-time speech synthesis</small>
              </div>
            </div>
          </div>

          {/* Direction 2 Pipeline */}
          <div className="pipeline-card">
            <div className="pipeline-title-row">
              <span className="pipeline-badge dir-2">Direction 2</span>
              <h3>Hearing Person ➔ Sign Language User</h3>
            </div>
            <p className="pipeline-desc">
              Converts spoken conversation into visual ASL signs and structured fingerspelling.
            </p>

            <div className="pipeline-steps-flow">
              <div className="pipe-step">
                <span className="step-num">1</span>
                <span className="step-icon">🎙️</span>
                <strong>Spoken Speech</strong>
                <small>Hearing user speaks</small>
              </div>
              <div className="pipe-arrow">➔</div>
              <div className="pipe-step">
                <span className="step-num">2</span>
                <span className="step-icon">⚡</span>
                <strong>Speech Recognition</strong>
                <small>Web Speech API engine</small>
              </div>
              <div className="pipe-arrow">➔</div>
              <div className="pipe-step">
                <span className="step-num">3</span>
                <span className="step-icon">📝</span>
                <strong>Text Tokenizer</strong>
                <small>Lexical segmentation</small>
              </div>
              <div className="pipe-arrow">➔</div>
              <div className="pipe-step highlight">
                <span className="step-num">4</span>
                <span className="step-icon">🤟</span>
                <strong>Sign Representation</strong>
                <small>Visual hand poses & A-Z stepper</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why SignBridge & Real-World Scenarios */}
      <section className="home-section" id="why-signbridge">
        <div className="section-header">
          <span className="section-pill">Why SignBridge Matters</span>
          <h2>Breaking Real-World Barriers</h2>
          <p>
            Over 70 million Deaf and hard-of-hearing individuals encounter communication obstacles daily.
            SignBridge delivers instantaneous communication in the moments that matter most.
          </p>
        </div>

        <div className="scenarios-grid">
          <div className="scenario-card">
            <div className="scenario-icon-box">🏥</div>
            <h4>Healthcare & Emergency Triage</h4>
            <p>
              Enables doctors, nurses, and EMTs to communicate urgent medical instructions, allergies, and pain levels
              with Deaf patients when certified medical interpreters are delayed.
            </p>
            <span className="scenario-tag">Emergency Critical</span>
          </div>

          <div className="scenario-card">
            <div className="scenario-icon-box">🏫</div>
            <h4>Classrooms & Inclusive Education</h4>
            <p>
              Empowers Deaf students and hearing instructors to collaborate freely in group discussions,
              tutoring sessions, and lectures with live bidirectional captions.
            </p>
            <span className="scenario-tag">Education</span>
          </div>

          <div className="scenario-card">
            <div className="scenario-icon-box">🛒</div>
            <h4>Retail, Banking & Hospitality</h4>
            <p>
              Facilitates frictionless transactions at airport check-in counters, retail cash registers,
              and banking teller desks without requiring pen and paper.
            </p>
            <span className="scenario-tag">Customer Experience</span>
          </div>

          <div className="scenario-card">
            <div className="scenario-icon-box">🚨</div>
            <h4>First Responders & Disaster Response</h4>
            <p>
              Dedicated high-contrast Emergency Mode provides rapid visual SOS distress cards, pain location indicators,
              and loud audible emergency broadcasts.
            </p>
            <span className="scenario-tag">Safety & Rescue</span>
          </div>
        </div>
      </section>

      {/* 5. Technology & Client-Side Privacy */}
      <section className="home-section bg-alt" id="technology">
        <div className="section-header">
          <span className="section-pill">Under The Hood</span>
          <h2>Built on Modern Web AI Standards</h2>
          <p>
            High performance, zero privacy compromises, and complete browser independence.
          </p>
        </div>

        <div className="tech-matrix-grid">
          <div className="tech-card">
            <div className="tech-icon">🔒</div>
            <h4>100% Client-Side Privacy</h4>
            <p>
              Camera frames and microphone feeds are analyzed entirely in your browser using WebAssembly.
              Zero biometric video frames or facial recordings are ever sent to an external cloud server.
            </p>
          </div>

          <div className="tech-card">
            <div className="tech-icon">🦴</div>
            <h4>MediaPipe 21-Joint Tracking</h4>
            <p>
              Sub-millimeter tracking of 21 3D landmarks per hand. Operates smoothly on lightweight CPU delegate
              to eliminate WebGL context crashes and support low-resource hardware.
            </p>
          </div>

          <div className="tech-card">
            <div className="tech-icon">📐</div>
            <h4>Kinematic Scale Invariance</h4>
            <p>
              Anatomically normalized geometric classifier calculates hand scale dynamically, ensuring
              accurate gesture recognition regardless of camera distance, user hand size, or camera tilt.
            </p>
          </div>

          <div className="tech-card">
            <div className="tech-icon">⚡</div>
            <h4>Progressive Sentence Engine</h4>
            <p>
              Stateful temporal smoothing aggregates sequential signs into complete spoken sentences
              with intelligent gesture hold debouncing and instant text-to-speech synthesis.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Accessibility Standard Section */}
      <section className="home-section" id="accessibility">
        <div className="a11y-banner-card">
          <div className="a11y-banner-content">
            <span className="section-pill">Universal Design</span>
            <h2>Accessibility-First Architecture (WCAG 2.1 AA)</h2>
            <p>
              Accessibility isn't an afterthought—it's the core foundation of SignBridge.
              Every interface element is crafted with high-contrast ratios, screen-reader semantic trees,
              customizable text scaling, and motion suppression.
            </p>
            <div className="a11y-features-list">
              <span className="a11y-pill">🌓 High Contrast Theme</span>
              <span className="a11y-pill">🔤 100% / 112% / 125% Text Scaling</span>
              <span className="a11y-pill">📖 Dyslexia-Friendly Typography</span>
              <span className="a11y-pill">⏸️ Reduced Motion Controls</span>
              <span className="a11y-pill">⌨️ Enhanced Keyboard Focus</span>
            </div>
          </div>
          <div className="a11y-banner-action">
            <button
              type="button"
              className="a11y-open-controls-btn"
              onClick={openModal}
            >
              <span>♿</span> Open Accessibility Settings
            </button>
            <small>Preferences persist across all pages</small>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Section */}
      <section className="home-cta">
        <div className="cta-container">
          <h2>Ready to Bridge Communication Barriers?</h2>
          <p>
            Experience real-time AI sign language translation today. Free, accessible, and runs directly in your browser.
          </p>
          <div className="cta-buttons">
            <Link to="/live-translator" className="hero-btn-primary">
              Launch Live Translator 📹
            </Link>
            <Link to="/dictionary" className="hero-btn-secondary">
              Explore ASL Dictionary 📖
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
