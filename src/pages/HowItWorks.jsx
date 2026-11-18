import { useState } from 'react'
import { Link } from 'react-router-dom'
import './HowItWorks.css'

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'dir-1' | 'dir-2' | 'ai-tech'

  return (
    <div className="hiw-page">
      {/* 1. Header */}
      <div className="hiw-header">
        <span className="section-pill">Technical Deep Dive</span>
        <h1 className="hiw-title">How SignBridge Works</h1>
        <p className="hiw-lead">
          SignBridge operates as a full-duplex communication platform. Explore the two bidirectional translation
          pipelines, the 21-joint skeletal computer vision engine, and our temporal sequence modeling architecture.
        </p>
      </div>

      {/* Mode Filter Tabs */}
      <div className="hiw-filter-tabs">
        <button
          className={`hiw-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          🌐 Complete Architecture
        </button>
        <button
          className={`hiw-tab-btn ${activeTab === 'dir-1' ? 'active' : ''}`}
          onClick={() => setActiveTab('dir-1')}
        >
          ✋ Direction 1: Sign ➔ Speech
        </button>
        <button
          className={`hiw-tab-btn ${activeTab === 'dir-2' ? 'active' : ''}`}
          onClick={() => setActiveTab('dir-2')}
        >
          🎙️ Direction 2: Speech ➔ Sign
        </button>
        <button
          className={`hiw-tab-btn ${activeTab === 'ai-tech' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-tech')}
        >
          🧠 Temporal AI & 21 Joints
        </button>
      </div>

      {/* 2. DIRECTION 1: SIGN ➔ SPEECH & TEXT (Sections 8 & 11) */}
      {(activeTab === 'all' || activeTab === 'dir-1') && (
        <section className="hiw-pipeline-block">
          <div className="pipeline-badge-row">
            <span className="pipeline-badge-tag dir-1">Direction 1</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Vision ➔ Voice Pipeline</span>
          </div>
          <h2>Sign Language ➔ Speech & Text Translation</h2>
          <p className="hiw-pipeline-subtitle">
            Converts live camera footage of sign language into written English sentences and spoken audio.
          </p>

          {/* Flow Rail */}
          <div className="hiw-flow-rail">
            <div className="rail-node highlight">
              <div className="rail-icon-box">✋</div>
              <span className="rail-name">1. Sign</span>
            </div>
            <span className="rail-arrow">➔</span>

            <div className="rail-node">
              <div className="rail-icon-box">📹</div>
              <span className="rail-name">2. Camera</span>
            </div>
            <span className="rail-arrow">➔</span>

            <div className="rail-node">
              <div className="rail-icon-box">👁️</div>
              <span className="rail-name">3. MediaPipe</span>
            </div>
            <span className="rail-arrow">➔</span>

            <div className="rail-node">
              <div className="rail-icon-box">🦴</div>
              <span className="rail-name">4. Landmarks</span>
            </div>
            <span className="rail-arrow">➔</span>

            <div className="rail-node highlight">
              <div className="rail-icon-box">🧠</div>
              <span className="rail-name">5. AI Model</span>
            </div>
            <span className="rail-arrow">➔</span>

            <div className="rail-node">
              <div className="rail-icon-box">📝</div>
              <span className="rail-name">6. Text</span>
            </div>
            <span className="rail-arrow">➔</span>

            <div className="rail-node highlight">
              <div className="rail-icon-box">🔊</div>
              <span className="rail-name">7. Speech</span>
            </div>
          </div>

          {/* 7 Detailed Step Cards */}
          <div className="hiw-steps-grid">
            <div className="hiw-step-card">
              <div className="step-card-header">
                <span className="step-badge-number">1</span>
                <h3>Sign Language Input</h3>
              </div>
              <p>
                The Deaf user performs manual gestures in front of their webcam. Signs are characterized by hand orientation,
                finger configuration, and spatial positioning relative to the torso and face.
              </p>
              <span className="step-tech-tag">User Action</span>
            </div>

            <div className="hiw-step-card">
              <div className="step-card-header">
                <span className="step-badge-number">2</span>
                <h3>Camera Stream Ingestion</h3>
              </div>
              <p>
                The browser captures 640x480 RGB frames at 30 FPS using <code>navigator.mediaDevices.getUserMedia</code>.
                Frames are drawn to an off-screen canvas for pixel format validation and aspect ratio normalization.
              </p>
              <span className="step-tech-tag">HTML5 Video Stream</span>
            </div>

            <div className="hiw-step-card">
              <div className="step-card-header">
                <span className="step-badge-number">3</span>
                <h3>MediaPipe Vision Processing</h3>
              </div>
              <p>
                Google MediaPipe vision tasks running locally via WebAssembly isolates hand contours from background clutter.
                CPU delegation prevents WebGL crashes and guarantees zero video data leaves the device.
              </p>
              <span className="step-tech-tag">@mediapipe/tasks-vision WASM</span>
            </div>

            <div className="hiw-step-card">
              <div className="step-card-header">
                <span className="step-badge-number">4</span>
                <h3>21 3D Joint Landmarks</h3>
              </div>
              <p>
                Extracts exact Cartesian coordinates (x, y, z) for 21 anatomical joints per hand: wrist, thumb joints, and all four
                finger knuckles, PIP, DIP, and fingertip joints.
              </p>
              <span className="step-tech-tag">21 Normalized 3D Coordinates</span>
            </div>

            <div className="hiw-step-card">
              <div className="step-card-header">
                <span className="step-badge-number">5</span>
                <h3>AI Model & Temporal Buffer</h3>
              </div>
              <p>
                Anatomical normalization calculates palm scale (wrist to middle MCP distance), eliminating camera distance and hand size biases.
                A rolling 6-frame buffer and stateful debounce ensure gestures are stable before confirmation.
              </p>
              <span className="step-tech-tag">Scale-Invariant Kinematics</span>
            </div>

            <div className="hiw-step-card">
              <div className="step-card-header">
                <span className="step-badge-number">6</span>
                <h3>Sentence Formation & Display</h3>
              </div>
              <p>
                Confirmed signs accumulate progressively into full sentences in the Progressive Sentence Builder.
                The live recognized sign and confidence rating (e.g. 98%) are rendered directly on an AR HUD overlay.
              </p>
              <span className="step-tech-tag">Lexical Token Accumulator</span>
            </div>

            <div className="hiw-step-card">
              <div className="step-card-header">
                <span className="step-badge-number">7</span>
                <h3>Real-Time Speech Synthesis</h3>
              </div>
              <p>
                If Voice or Both output mode is selected, the translated phrase triggers the browser's native
                SpeechSynthesis engine, speaking the words out loud through the device speakers with zero cloud latency.
              </p>
              <span className="step-tech-tag">Web Speech Synthesis API</span>
            </div>
          </div>
        </section>
      )}

      {/* 3. DIRECTION 2: SPEECH ➔ SIGN LANGUAGE REPRESENTATION (Section 8) */}
      {(activeTab === 'all' || activeTab === 'dir-2') && (
        <section className="hiw-pipeline-block">
          <div className="pipeline-badge-row">
            <span className="pipeline-badge-tag dir-2">Direction 2</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Voice ➔ Vision Pipeline</span>
          </div>
          <h2>Speech ➔ Sign Language Representation</h2>
          <p className="hiw-pipeline-subtitle">
            Captures spoken language from hearing conversation partners and converts it into animated visual signs for Deaf users.
          </p>

          {/* Flow Rail */}
          <div className="hiw-flow-rail">
            <div className="rail-node highlight">
              <div className="rail-icon-box" style={{ borderColor: '#7c3aed', background: '#f5f3ff' }}>🎙️</div>
              <span className="rail-name">1. Speech</span>
            </div>
            <span className="rail-arrow">➔</span>

            <div className="rail-node">
              <div className="rail-icon-box" style={{ borderColor: '#7c3aed', background: '#f5f3ff' }}>⚡</div>
              <span className="rail-name">2. Recognition</span>
            </div>
            <span className="rail-arrow">➔</span>

            <div className="rail-node">
              <div className="rail-icon-box" style={{ borderColor: '#7c3aed', background: '#f5f3ff' }}>📝</div>
              <span className="rail-name">3. Text</span>
            </div>
            <span className="rail-arrow">➔</span>

            <div className="rail-node highlight">
              <div className="rail-icon-box" style={{ borderColor: '#7c3aed', background: '#f5f3ff' }}>🤟</div>
              <span className="rail-name">4. Sign Visuals</span>
            </div>
          </div>

          {/* 4 Detailed Step Cards */}
          <div className="hiw-steps-grid">
            <div className="hiw-step-card">
              <div className="step-card-header">
                <span className="step-badge-number dir-2">1</span>
                <h3>Spoken Audio Input</h3>
              </div>
              <p>
                The hearing person speaks naturally into their microphone during a conversation, medical consultation,
                or classroom discussion.
              </p>
              <span className="step-tech-tag">Microphone Stream</span>
            </div>

            <div className="hiw-step-card">
              <div className="step-card-header">
                <span className="step-badge-number dir-2">2</span>
                <h3>Speech Recognition Engine</h3>
              </div>
              <p>
                Continuous audio processing converts acoustic waveforms into intermediate and final text transcripts
                with high accuracy across various vocal pitches and accents.
              </p>
              <span className="step-tech-tag">Web Speech Recognition API</span>
            </div>

            <div className="hiw-step-card">
              <div className="step-card-header">
                <span className="step-badge-number dir-2">3</span>
                <h3>Text Tokenization & Parsing</h3>
              </div>
              <p>
                The transcribed text is segmented into individual words, stripped of trailing punctuation, and matched
                against the 60+ ASL vocabulary database.
              </p>
              <span className="step-tech-tag">Lexical Tokenizer</span>
            </div>

            <div className="hiw-step-card">
              <div className="step-card-header">
                <span className="step-badge-number dir-2">4</span>
                <h3>Visual Sign Representation</h3>
              </div>
              <p>
                Matched words render dynamic ASL sign visual cards with emoji identifiers and joint descriptions.
                Unmatched words or names automatically trigger the A–Z fingerspelling stepper so every letter is shown sequentially.
              </p>
              <span className="step-tech-tag">ASL Visual Stepper</span>
            </div>
          </div>
        </section>
      )}

      {/* 4. THE 21 HAND JOINTS COMPUTER VISION MESH */}
      {(activeTab === 'all' || activeTab === 'ai-tech') && (
        <section className="hiw-landmarks-section">
          <div className="pipeline-badge-row">
            <span className="pipeline-badge-tag dir-1">Biometrics</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Kinematic Joint Tracking</span>
          </div>
          <h2>The 21 Hand Landmarks Anatomy</h2>
          <p style={{ color: '#64748b', margin: '0 0 1.5rem' }}>
            MediaPipe extracts 21 three-dimensional landmarks per hand. Our kinematic engine checks mathematical ratios
            between fingertips, intermediate knuckles, and the wrist to determine extension vs. curling.
          </p>

          <div className="landmarks-showcase-grid">
            {/* Visual Diagram */}
            <div className="landmarks-visual-card">
              <svg className="hand-svg-container" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Hand Palm Outline */}
                <path d="M 60 190 C 40 180 30 150 45 130 C 50 100 50 60 65 50 C 75 40 85 70 85 90 C 90 60 100 40 110 50 C 120 60 120 90 125 70 C 135 60 145 70 145 90 C 150 80 160 90 160 110 C 160 150 140 190 120 200 Z" fill="rgba(15, 23, 42, 0.6)" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />

                {/* Bones (Lines) */}
                {/* Palm Base */}
                <line x1="100" y1="210" x2="60" y2="170" stroke="#6366f1" strokeWidth="2.5" />
                <line x1="100" y1="210" x2="80" y2="140" stroke="#6366f1" strokeWidth="2.5" />
                <line x1="100" y1="210" x2="105" y2="135" stroke="#6366f1" strokeWidth="2.5" />
                <line x1="100" y1="210" x2="130" y2="140" stroke="#6366f1" strokeWidth="2.5" />
                <line x1="100" y1="210" x2="150" y2="155" stroke="#6366f1" strokeWidth="2.5" />

                {/* Thumb */}
                <line x1="60" y1="170" x2="45" y2="150" stroke="#818cf8" strokeWidth="2.5" />
                <line x1="45" y1="150" x2="35" y2="130" stroke="#818cf8" strokeWidth="2.5" />
                <line x1="35" y1="130" x2="25" y2="110" stroke="#818cf8" strokeWidth="2.5" />

                {/* Index */}
                <line x1="80" y1="140" x2="75" y2="105" stroke="#818cf8" strokeWidth="2.5" />
                <line x1="75" y1="105" x2="70" y2="75" stroke="#818cf8" strokeWidth="2.5" />
                <line x1="70" y1="75" x2="68" y2="45" stroke="#818cf8" strokeWidth="2.5" />

                {/* Middle */}
                <line x1="105" y1="135" x2="105" y2="100" stroke="#818cf8" strokeWidth="2.5" />
                <line x1="105" y1="100" x2="105" y2="65" stroke="#818cf8" strokeWidth="2.5" />
                <line x1="105" y1="65" x2="105" y2="30" stroke="#818cf8" strokeWidth="2.5" />

                {/* Ring */}
                <line x1="130" y1="140" x2="130" y2="105" stroke="#818cf8" strokeWidth="2.5" />
                <line x1="130" y1="105" x2="130" y2="75" stroke="#818cf8" strokeWidth="2.5" />
                <line x1="130" y1="75" x2="130" y2="48" stroke="#818cf8" strokeWidth="2.5" />

                {/* Pinky */}
                <line x1="150" y1="155" x2="155" y2="130" stroke="#818cf8" strokeWidth="2.5" />
                <line x1="155" y1="130" x2="160" y2="105" stroke="#818cf8" strokeWidth="2.5" />
                <line x1="160" y1="105" x2="165" y2="80" stroke="#818cf8" strokeWidth="2.5" />

                {/* Joints (Circles) */}
                {/* 0: Wrist */}
                <circle cx="100" cy="210" r="5" fill="#38bdf8" />
                <text x="100" y="225" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">0 (Wrist)</text>

                {/* 1-4: Thumb */}
                <circle cx="60" cy="170" r="4" fill="#ffffff" />
                <circle cx="45" cy="150" r="4" fill="#ffffff" />
                <circle cx="35" cy="130" r="4" fill="#ffffff" />
                <circle cx="25" cy="110" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="16" y="108" fill="#38bdf8" fontSize="8" fontWeight="bold">4 (Tip)</text>

                {/* 5-8: Index */}
                <circle cx="80" cy="140" r="4" fill="#ffffff" />
                <circle cx="75" cy="105" r="4" fill="#ffffff" />
                <circle cx="70" cy="75" r="4" fill="#ffffff" />
                <circle cx="68" cy="45" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="68" y="36" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">8 (Tip)</text>

                {/* 9-12: Middle */}
                <circle cx="105" cy="135" r="4" fill="#ffffff" />
                <circle cx="105" cy="100" r="4" fill="#ffffff" />
                <circle cx="105" cy="65" r="4" fill="#ffffff" />
                <circle cx="105" cy="30" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="105" y="20" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">12 (Tip)</text>

                {/* 13-16: Ring */}
                <circle cx="130" cy="140" r="4" fill="#ffffff" />
                <circle cx="130" cy="105" r="4" fill="#ffffff" />
                <circle cx="130" cy="75" r="4" fill="#ffffff" />
                <circle cx="130" cy="48" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="130" y="38" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">16 (Tip)</text>

                {/* 17-20: Pinky */}
                <circle cx="150" cy="155" r="4" fill="#ffffff" />
                <circle cx="155" cy="130" r="4" fill="#ffffff" />
                <circle cx="160" cy="105" r="4" fill="#ffffff" />
                <circle cx="165" cy="80" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="175" y="80" fill="#38bdf8" fontSize="8" fontWeight="bold">20 (Tip)</text>
              </svg>
              <span className="landmark-visual-caption">
                Live 21-Joint 3D Mesh (Cartesian x, y, z normalized space)
              </span>
            </div>

            {/* Anatomical Groups List */}
            <div className="landmarks-list-card">
              <h3>Anatomical Joint Groupings</h3>
              <p>
                Every finger consists of 4 distinct joints. Finger extension is evaluated by comparing Euclidean distances
                and relative vertical trajectories between the tip, PIP joint, and the wrist base.
              </p>

              <div className="joints-groups-accordion">
                <div className="joint-group-item">
                  <strong>Landmark 0 • Wrist Base</strong>
                  <small>Anchor origin for all hand calculations. Used to determine hand tilt and palm scale.</small>
                </div>

                <div className="joint-group-item">
                  <strong>Landmarks 1 – 4 • Thumb (CMC, MCP, IP, Tip)</strong>
                  <small>Evaluated via radial distance to the index knuckle. Distinguishes Open Palm, Letter L, and Thumbs Up/Down.</small>
                </div>

                <div className="joint-group-item">
                  <strong>Landmarks 5 – 8 • Index Finger (MCP, PIP, DIP, Tip)</strong>
                  <small>Extended when tip distance exceeds PIP distance by &gt; 1.12x. Key for Pointing, Victory (✌️), and OK (👌).</small>
                </div>

                <div className="joint-group-item">
                  <strong>Landmarks 9 – 12 • Middle Finger (MCP, PIP, DIP, Tip)</strong>
                  <small>The vector from Wrist (0) to Middle MCP (9) defines the palm scale and hand vertical orientation.</small>
                </div>

                <div className="joint-group-item">
                  <strong>Landmarks 13 – 20 • Ring & Pinky Fingers</strong>
                  <small>Differentiates complex gestures like I Love You (🤟), Call Me / Y (🤙), and Letter W (🖖).</small>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. AI REQUIREMENT & ROADMAP (Section 12) */}
      {(activeTab === 'all' || activeTab === 'ai-tech') && (
        <section className="hiw-roadmap-section">
          <div className="pipeline-badge-row">
            <span className="pipeline-badge-tag dir-1">AI Evolution</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Section 12 Architecture Requirement</span>
          </div>
          <h2>Temporal Sequence Recognition Roadmap</h2>
          <p style={{ color: '#64748b', margin: '0 0 1rem' }}>
            Signs are continuous movements across time. SignBridge implements temporal buffering to capture motion trajectory
            rather than treating individual frames as disconnected words.
          </p>

          <div className="roadmap-phases-grid">
            <div className="roadmap-phase-card active-phase">
              <span className="phase-pill current">Current Phase Active</span>
              <h4>Phase 1: Kinematic Frame Buffer</h4>
              <p>
                Rolling 6-frame temporal window with scale-invariant Euclidean distance ratios.
                Eliminates jitter, rejects false positives, and provides instant client-side recognition.
              </p>
              <div className="phase-tech-stack">MediaPipe + Vector Kinematics</div>
            </div>

            <div className="roadmap-phase-card">
              <span className="phase-pill upcoming">Phase 2: Machine Learning</span>
              <h4>Statistical Feature Classifiers</h4>
              <p>
                Training scikit-learn Random Forests and Support Vector Machines (SVM) on landmark coordinate feature vectors
                to expand vocabulary to 150+ regional signs.
              </p>
              <div className="phase-tech-stack">NumPy + scikit-learn + OpenCV</div>
            </div>

            <div className="roadmap-phase-card">
              <span className="phase-pill upcoming">Phase 3: Deep Sequences</span>
              <h4>Recurrent Neural Networks (RNN)</h4>
              <p>
                Bidirectional LSTM and GRU temporal sequence models trained on sequential ASL datasets (WLASL)
                to recognize continuous dynamic phrases like "Thank you" and "How are you".
              </p>
              <div className="phase-tech-stack">PyTorch + LSTM / GRU + ONNX</div>
            </div>

            <div className="roadmap-phase-card">
              <span className="phase-pill upcoming">Phase 4: Frontier AI</span>
              <h4>Spatio-Temporal Transformers</h4>
              <p>
                Spatial-Temporal Graph Convolutional Networks (ST-GCN) and Vision Transformers for multi-signer continuous
                sentence parsing with non-manual facial marker understanding.
              </p>
              <div className="phase-tech-stack">ST-GCN + Transformer Attention</div>
            </div>
          </div>
        </section>
      )}

      {/* 6. Interactive CTA Banner */}
      <div className="hiw-cta-card">
        <div className="hiw-cta-text">
          <h3>Ready to see the technology in action?</h3>
          <p>
            Test our real-time 21-joint live camera translator studio or practice signs with the interactive ASL dictionary.
          </p>
        </div>
        <div className="hiw-cta-actions">
          <Link to="/live-translator" className="hiw-btn-primary">
            Launch Live Camera Studio 📹
          </Link>
          <Link to="/dictionary" className="hiw-btn-secondary">
            Browse ASL Dictionary 📖
          </Link>
        </div>
      </div>
    </div>
  )
}
