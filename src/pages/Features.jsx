import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Features.css'

export default function Features() {
  const [activeCategory, setActiveCategory] = useState('all')

  const modalities = [
    {
      id: 'live',
      category: 'vision',
      title: 'Live Camera Translation',
      icon: '📹',
      badge: 'Real-Time Edge AI',
      pillClass: 'teal',
      isFeatured: true,
      desc: 'Continuously captures real-time webcam video to track 21 skeletal hand landmarks per hand, performing invariant geometric gesture classification and streaming spoken sentences with zero cloud frame transmission.',
      input: 'Webcam Stream (720p/1080p, 30fps)',
      output: 'Live Subtitles + Web Speech Voice',
      engine: 'MediaPipe Hands + Skin Contour Classifier',
      latency: '< 80ms (Instantaneous)',
      offline: 'Fully Supported',
      targetAudience: 'Deaf & Hard-of-Hearing Communicators',
      features: [
        'Anatomical palm-scale normalization invariant to camera distance',
        'Stateful gesture debouncing eliminates audio speech stutter',
        'Visual confidence meter and skeleton joint overlay',
        'Immediate text transcription buffer with copy and speech controls'
      ],
      link: '/live-translator',
      linkText: 'Launch Live Studio →'
    },
    {
      id: 'video',
      category: 'vision',
      title: 'Recorded Video Translation',
      icon: '🎬',
      badge: 'Batch File Processing',
      pillClass: 'blue',
      isFeatured: false,
      desc: 'Upload recorded video files in MP4, WebM, or QuickTime format. The system processes the video frame-by-frame, performs chronological sequence synthesis, and outputs an editable, timestamped transcript.',
      input: 'Video Files (MP4, WebM, MOV, max 50MB)',
      output: 'Timestamped Transcript & SRT Subtitles',
      engine: 'Client-side HTML5 Video Decoding Pipeline',
      latency: '~1.5x Video Playback Duration',
      offline: 'Fully Supported (Local File)',
      targetAudience: 'Educators, Content Creators & Students',
      features: [
        'Frame-accurate timestamp generation for video subtitles',
        'Full playback scrub bar synchronized with translation events',
        'Exportable transcript in Plain Text or SubRip (SRT) format',
        'Zero cloud video upload: 100% processed in local browser sandbox'
      ],
      link: '/video-translator',
      linkText: 'Translate Video File →'
    },
    {
      id: 'speech',
      category: 'voice',
      title: 'Speech to Text & Sign Visualizer',
      icon: '🎙️',
      badge: 'Hearing ➔ Deaf Pathway',
      pillClass: 'amber',
      isFeatured: false,
      desc: 'Hearing friends, doctors, and colleagues speak into their microphone. Their voice is transcribed via browser speech recognition and instantly converted into corresponding ASL hand sign representations.',
      input: 'Microphone Audio Stream (16kHz PCM)',
      output: 'Real-time Captions + ASL Hand Cards',
      engine: 'Web Speech API + Sign Lexicon Parser',
      latency: '< 150ms Recognition Streaming',
      offline: 'Device Dependent (Online/Offline Speech)',
      targetAudience: 'Hearing Companions, Doctors & Teachers',
      features: [
        'Real-time continuous speech transcription with interim results',
        'Instant syntactic lookup mapping words directly to sign representations',
        'Adjustable sign display cadence for effortless visual reading',
        'Two-way reverse response buffer for quick typed replies'
      ],
      link: '/speech-translator',
      linkText: 'Open Speech Visualizer →'
    },
    {
      id: 'text-to-sign',
      category: 'reference',
      title: 'Text-to-Sign & Fingerspelling',
      icon: '✍️',
      badge: 'Interactive Generator',
      pillClass: 'indigo',
      isFeatured: false,
      desc: 'Type any custom phrase or sentence to generate sequential fingerspelling animations and word sign cards. Includes step-by-step playback controls, speed slider, and letter-by-letter visual breakdown.',
      input: 'Text Input Prompt (Keyboard or Paste)',
      output: 'Animated Sign Stream + Visual Cards',
      engine: 'ASL Character & Token Grammar Parser',
      latency: '< 30ms Instant Rendering',
      offline: 'Fully Supported (Local Assets)',
      targetAudience: 'ASL Learners, Interpreters & Students',
      features: [
        'Full 26-letter American Manual Alphabet fingerspelling engine',
        'Configurable animation cadence (0.5x slow to 2.0x brisk speed)',
        'Letter highlight indicator synchronized with active hand sign',
        'Quick preset phrases for conversational greetings and requests'
      ],
      link: '/text-to-sign',
      linkText: 'Try Text-to-Sign →'
    },
    {
      id: 'dictionary',
      category: 'reference',
      title: 'Interactive ASL Dictionary',
      icon: '📖',
      badge: 'Searchable Repository',
      pillClass: 'emerald',
      isFeatured: false,
      desc: 'A comprehensive visual index of American Sign Language signs organized by category, including Greetings, Questions, Family, Common Verbs, and Emergency Signals, with demonstration imagery and usage tips.',
      input: 'Keyword Search & Category Filter',
      output: 'High-Resolution Sign Guides & Memory Tips',
      engine: 'Indexed Fast In-Memory Lexicon Store',
      latency: '< 10ms Instant Search',
      offline: 'Fully Supported',
      targetAudience: 'Learners, Families & Caregivers',
      features: [
        'Live search filtering across 25+ curated high-utility ASL vocabulary',
        'Categorized browsable decks (Greetings, Healthcare, Daily Living)',
        'Sign execution breakdown and handshape formation tips',
        'One-click audio pronunciation for hearing practice'
      ],
      link: '/dictionary',
      linkText: 'Browse ASL Dictionary →'
    },
    {
      id: 'emergency',
      category: 'emergency',
      title: 'Emergency Priority SOS Mode',
      icon: '🚨',
      badge: 'Life-Safety Critical',
      pillClass: 'rose',
      isFeatured: true,
      desc: 'Designed for acute emergencies, hospital intake, or traffic accidents. Features high-visibility full-screen cards, loud synthesized voice distress alerts, and rapid one-tap critical communication panels.',
      input: 'One-Tap Urgent Scenario Buttons',
      output: 'Full-Screen High Contrast Flash + Urgent Audio',
      engine: 'Priority Broadcast Audio Engine',
      latency: '< 5ms Instant Dispatch',
      offline: '100% Reliable Offline',
      targetAudience: 'Patients, Paramedics & First Responders',
      features: [
        'Loud speech distress broadcasts with priority speech synthesis',
        'High-contrast safety cards for medical triage, pain, and danger',
        'Zero cloud dependency: Works with zero internet or cellular connectivity',
        'Rapid one-tap pre-scripted medical distress sentences'
      ],
      link: '/emergency',
      linkText: 'Open Emergency SOS →'
    }
  ]

  const filteredModalities = activeCategory === 'all'
    ? modalities
    : modalities.filter(m => m.category === activeCategory)

  return (
    <div className="features-page">
      {/* 1. Header */}
      <div className="features-header">
        <span className="section-pill">Full-Duplex Communication Engine</span>
        <h1 className="features-title">SignBridge Feature Matrix</h1>
        <p className="features-lead">
          Explore the 6 core modalities engineered to bridge the communication gap between Deaf,
          Hard-of-Hearing, and Hearing individuals across educational, workplace, and healthcare environments.
        </p>
      </div>

      {/* 2. Modality Filter Bar */}
      <div className="features-filter-bar">
        <button
          className={`features-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          🌐 All Modalities (6)
        </button>
        <button
          className={`features-tab-btn ${activeCategory === 'vision' ? 'active' : ''}`}
          onClick={() => setActiveCategory('vision')}
        >
          📹 Vision & AI Tracking
        </button>
        <button
          className={`features-tab-btn ${activeCategory === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveCategory('voice')}
        >
          🎙️ Speech & Hearing Path
        </button>
        <button
          className={`features-tab-btn ${activeCategory === 'reference' ? 'active' : ''}`}
          onClick={() => setActiveCategory('reference')}
        >
          📖 Learning & Lexicon
        </button>
        <button
          className={`features-tab-btn ${activeCategory === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveCategory('emergency')}
        >
          🚨 Safety & Emergency
        </button>
      </div>

      {/* 3. Modalities Grid */}
      <div className="modalities-grid">
        {filteredModalities.map((item) => (
          <div
            key={item.id}
            className={`modality-card ${item.isFeatured ? 'featured-card' : ''}`}
          >
            <div className="modality-top-row">
              <div className="modality-icon-box">{item.icon}</div>
              <span className={`modality-pill ${item.pillClass}`}>{item.badge}</span>
            </div>

            <h2 className="modality-title">{item.title}</h2>
            <p className="modality-desc">{item.desc}</p>

            <div className="modality-specs">
              <div className="spec-item">
                <span className="spec-label">Input</span>
                <span className="spec-val">{item.input}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Latency</span>
                <span className="spec-val accent">{item.latency}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Engine</span>
                <span className="spec-val">{item.engine}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Offline</span>
                <span className="spec-val">{item.offline}</span>
              </div>
            </div>

            <ul className="modality-features-list">
              {item.features.map((feat, fIdx) => (
                <li key={fIdx}>{feat}</li>
              ))}
            </ul>

            <Link
              to={item.link}
              className={`modality-action-btn ${item.isFeatured ? 'primary' : 'secondary'}`}
            >
              {item.linkText}
            </Link>
          </div>
        ))}
      </div>

      {/* 4. Comparison Table Matrix */}
      <section className="comparison-section">
        <div className="comparison-header">
          <span className="section-pill">Cross-Modality Benchmark</span>
          <h2>Platform Capability Comparison Matrix</h2>
          <p>Detailed architectural comparison across inputs, outputs, computational footprint, and privacy.</p>
        </div>

        <div className="matrix-table-wrapper">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Modality</th>
                <th>Direction</th>
                <th>Processing Engine</th>
                <th>Target Latency</th>
                <th>Edge Privacy</th>
                <th>Offline Support</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="matrix-name-cell">
                    <span>📹</span>
                    <strong>Live Camera Studio</strong>
                  </div>
                </td>
                <td>Sign ➔ Speech / Text</td>
                <td>MediaPipe + 21-Joint Geometric Classifier</td>
                <td>&lt; 80ms</td>
                <td>
                  <span className="matrix-badge-status yes">100% Client-Side</span>
                </td>
                <td>
                  <span className="matrix-badge-status yes">Yes</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="matrix-name-cell">
                    <span>🎬</span>
                    <strong>Recorded Video Translator</strong>
                  </div>
                </td>
                <td>Sign Video ➔ Transcript</td>
                <td>HTML5 Decoded Frame Extraction</td>
                <td>~1.5x Duration</td>
                <td>
                  <span className="matrix-badge-status yes">100% Client-Side</span>
                </td>
                <td>
                  <span className="matrix-badge-status yes">Yes</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="matrix-name-cell">
                    <span>🎙️</span>
                    <strong>Speech to Sign Visualizer</strong>
                  </div>
                </td>
                <td>Speech ➔ Sign Visuals</td>
                <td>Web Speech API + Lexicon Mapper</td>
                <td>&lt; 150ms</td>
                <td>
                  <span className="matrix-badge-status partial">Browser Native</span>
                </td>
                <td>
                  <span className="matrix-badge-status partial">Device Varies</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="matrix-name-cell">
                    <span>✍️</span>
                    <strong>Text-to-Sign Generator</strong>
                  </div>
                </td>
                <td>Text ➔ Fingerspelling</td>
                <td>Grammar Tokenizer & SVG Engine</td>
                <td>&lt; 30ms</td>
                <td>
                  <span className="matrix-badge-status yes">100% Client-Side</span>
                </td>
                <td>
                  <span className="matrix-badge-status yes">Yes</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="matrix-name-cell">
                    <span>📖</span>
                    <strong>Interactive ASL Dictionary</strong>
                  </div>
                </td>
                <td>Search ➔ Visual Signs</td>
                <td>Indexed In-Memory Vector Store</td>
                <td>&lt; 10ms</td>
                <td>
                  <span className="matrix-badge-status yes">100% Client-Side</span>
                </td>
                <td>
                  <span className="matrix-badge-status yes">Yes</span>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="matrix-name-cell">
                    <span>🚨</span>
                    <strong>Emergency Priority SOS</strong>
                  </div>
                </td>
                <td>Quick Tap ➔ Flash & Speech</td>
                <td>Priority Audio & High Contrast Broadcast</td>
                <td>&lt; 5ms</td>
                <td>
                  <span className="matrix-badge-status yes">100% Client-Side</span>
                </td>
                <td>
                  <span className="matrix-badge-status yes">Yes</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Architectural Pillars */}
      <section className="pillars-section">
        <div className="pillars-header">
          <span className="section-pill">Core Engineering Standards</span>
          <h2>Architectural Pillars</h2>
          <p>Engineered for maximum accessibility, ultra-low latency, and absolute privacy integrity.</p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon">⚡</div>
            <h3>Sub-100ms Edge Latency</h3>
            <p>
              By running computer vision algorithms directly in the browser via CPU/Wasm, video frames
              never incur round-trip latency to remote cloud servers, delivering instant audio feedback.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon">🔒</div>
            <h3>Client-Side Privacy Isolation</h3>
            <p>
              Video frames from your webcam are processed solely in temporary browser memory and
              discarded immediately after landmark inference. Zero video recordings ever leave your machine.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon">💻</div>
            <h3>Zero Hardware Lock-In</h3>
            <p>
              Compatible with any standard integrated 720p or 1080p webcam on macOS, Windows, Linux,
              Chromebooks, or mobile tablets. No specialized depth cameras or sensory gloves required.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon">♿</div>
            <h3>WCAG 2.1 AAA Accessibility</h3>
            <p>
              Includes full keyboard navigation, OpenDyslexic typography, 3-level proportional font scaling,
              high-contrast dark and light modes, and ARIA live announcements for screen readers.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon">🔄</div>
            <h3>True Full-Duplex Translation</h3>
            <p>
              SignBridge closes the conversation loop in both directions: Deaf communicators sign to
              hearing partners, and hearing partners speak back with instant visual sign feedback.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon">🏥</div>
            <h3>Life-Critical Emergency Resilience</h3>
            <p>
              Emergency SOS cards operate completely offline without active internet connectivity,
              ensuring individuals can communicate distress in medical emergencies or blackouts.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <div className="features-cta-banner">
        <h2>Experience Real-Time Translation Now</h2>
        <p>
          Test live camera sign recognition right in your browser or explore the interactive 21-joint
          hand tracking architecture.
        </p>
        <div className="features-cta-actions">
          <Link to="/live-translator" className="features-cta-btn light">
            Launch Live Translator Studio →
          </Link>
          <Link to="/how-it-works" className="features-cta-btn ghost">
            Explore How It Works →
          </Link>
          <Link to="/help" className="features-cta-btn ghost">
            Read Help & FAQs →
          </Link>
        </div>
      </div>
    </div>
  )
}
