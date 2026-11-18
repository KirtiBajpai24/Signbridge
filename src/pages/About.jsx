import { Link } from 'react-router-dom'
import './About.css'

export default function About() {
  return (
    <div className="about-page">
      {/* 1. Page Header */}
      <div className="about-header">
        <span className="section-pill">Our Purpose & Vision</span>
        <h1 className="about-title">About SignBridge</h1>
        <p className="about-lead">
          SignBridge was founded on a simple, uncompromising conviction: human communication is a fundamental right.
          We build ethical, real-time artificial intelligence to eliminate communicative isolation between the Deaf and hearing worlds.
        </p>
      </div>

      {/* Global Impact Numbers */}
      <div className="about-stats-strip">
        <div className="about-stat-item">
          <span className="stat-number">70M+</span>
          <span className="stat-label">Sign Language Users</span>
          <span className="stat-desc">Rely on visual sign language as their primary mother tongue</span>
        </div>
        <div className="about-stat-item">
          <span className="stat-number">&lt; 100ms</span>
          <span className="stat-label">On-Device Inference</span>
          <span className="stat-desc">Low-latency joint tracking directly in the web browser</span>
        </div>
        <div className="about-stat-item">
          <span className="stat-number">0 KB</span>
          <span className="stat-label">Cloud Video Upload</span>
          <span className="stat-desc">100% client-side privacy; camera frames never leave your device</span>
        </div>
        <div className="about-stat-item">
          <span className="stat-number">2-Way</span>
          <span className="stat-label">Full Communication Parity</span>
          <span className="stat-desc">Sign-to-speech and speech-to-sign visual representation</span>
        </div>
      </div>

      {/* 2. What SignBridge Is */}
      <section className="about-section">
        <div className="about-genesis-grid">
          <div className="genesis-text">
            <span className="section-pill">The Platform</span>
            <h3>A Full-Duplex Assistive Communication Bridge</h3>
            <p>
              <strong>SignBridge</strong> is an AI-powered communication ecosystem bridging the gap between sign-language users
              and non-sign-language speakers. While conventional assistive tools only support one direction—forcing Deaf individuals
              to type notes or read imperfect captions—SignBridge operates bidirectionally:
            </p>
            <p>
              Sign language gestures captured by any standard camera are instantly converted into audible spoken voice and written text.
              In reverse, spoken words from hearing peers are recognized and transformed into clear, animated sign-language visuals.
            </p>
            <div className="genesis-highlights">
              <div className="genesis-pill">
                <span>📹</span> No special hardware required—runs on laptops, tablets, and phones.
              </div>
              <div className="genesis-pill">
                <span>🔒</span> Complete edge privacy—camera video stays 100% on the local device.
              </div>
              <div className="genesis-pill">
                <span>♿</span> WCAG 2.1 AA compliant universal accessibility controls built in.
              </div>
            </div>
          </div>

          <div className="genesis-visual-box">
            <div className="visual-flow-item">
              <div className="visual-flow-icon">🤟</div>
              <div>
                <strong>Direction 1: Sign ➔ Voice & Text</strong>
                <small>MediaPipe 21-joint mesh ➔ Kinematic AI ➔ Speech Synthesis</small>
              </div>
            </div>
            <div className="visual-flow-item">
              <div className="visual-flow-icon">🎙️</div>
              <div>
                <strong>Direction 2: Voice ➔ Visual Signs</strong>
                <small>Web Speech Recognition ➔ ASL Lexicon ➔ Visual Stepper</small>
              </div>
            </div>
            <div className="visual-flow-item">
              <div className="visual-flow-icon">🚨</div>
              <div>
                <strong>Emergency SOS Assistance</strong>
                <small>High-contrast distress signals and rapid spoken broadcasts</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Problem Being Solved & Why Barriers Matter */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="section-pill">The Challenge</span>
          <h2>The Problem Being Solved & Why Barriers Matter</h2>
          <p>The human, societal, and economic cost of communicative exclusion.</p>
        </div>

        <div className="problem-impact-grid">
          <div className="about-card">
            <div className="about-card-icon problem">⚠️</div>
            <h3>The Interpreter Shortage & Asymmetric Burden</h3>
            <p>
              In countries worldwide, certified sign language interpreters are in critically short supply.
              Booking a certified interpreter often requires days of advance scheduling and costs between
              $80 to $150 per hour—making spontaneous conversations, routine doctor visits, or sudden emergency encounters impossible.
            </p>
            <ul className="about-card-list">
              <li>Severe shortage of qualified interpreters in rural and municipal areas</li>
              <li>Prohibitive hourly service fees that individuals cannot personally sustain</li>
              <li>Unfair burden placed on Deaf individuals to carry pads, type notes, or lip-read</li>
            </ul>
          </div>

          <div className="about-card">
            <div className="about-card-icon impact">💔</div>
            <h3>Why Communication Barriers Matter</h3>
            <p>
              When communication fails, real lives are disrupted. Barriers in daily life deprive talented individuals
              of equal career opportunities, create acute isolation in classrooms, and can lead to fatal misdiagnoses in healthcare settings.
            </p>
            <ul className="about-card-list">
              <li><strong>Healthcare Risk:</strong> Unclear symptom descriptions can result in tragic medical errors.</li>
              <li><strong>Economic Inequity:</strong> Deaf professionals face ceiling barriers in interviews and workplace meetings.</li>
              <li><strong>Social Alienation:</strong> Routine interactions at transit hubs, retail counters, and banks become stressful obstacles.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Comparison: Traditional Interpreters vs SignBridge */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="section-pill">Paradigm Shift</span>
          <h2>Traditional Interpreters vs. SignBridge AI</h2>
          <p>SignBridge complements human interpreters by providing instant, 24/7 on-demand accessibility everywhere.</p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th>Traditional Human Interpreters</th>
                <th className="col-signbridge">SignBridge Assistive AI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Availability</strong></td>
                <td>Requires days of advance scheduling</td>
                <td className="col-signbridge">Instant 24/7 on-demand in any browser</td>
              </tr>
              <tr>
                <td><strong>Cost</strong></td>
                <td>$80 – $150+ per hour</td>
                <td className="col-signbridge">100% Free & Open-Web standard</td>
              </tr>
              <tr>
                <td><strong>Hardware Requirements</strong></td>
                <td>In-person presence or dedicated video gear</td>
                <td className="col-signbridge">Standard laptop/phone camera—no sensor gloves</td>
              </tr>
              <tr>
                <td><strong>Privacy & Confidentiality</strong></td>
                <td>Third-party presence required in room</td>
                <td className="col-signbridge">100% Private—all AI runs locally on device</td>
              </tr>
              <tr>
                <td><strong>Spontaneous Encounters</strong></td>
                <td>Infeasible for quick grocery or transit queries</td>
                <td className="col-signbridge">Optimized for rapid everyday conversations</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. How AI Powers the Solution */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="section-pill">Engineering Philosophy</span>
          <h2>How AI Powers The Solution</h2>
          <p>Combining modern computer vision, temporal kinematics, and audio synthesis.</p>
        </div>

        <div className="problem-impact-grid">
          <div className="about-card">
            <div className="about-card-icon solution">🧠</div>
            <h3>Sub-Millimeter 3D Landmark Tracking</h3>
            <p>
              Using Google MediaPipe's lightweight neural vision models, SignBridge tracks 21 coordinates per hand in real-time.
              Our scale-invariant kinematic engine calculates geometric ratios relative to the palm width, making gesture recognition
              resilient to distance variations, body sizes, and camera angles.
            </p>
            <ul className="about-card-list">
              <li>Tracks 21 3D joint landmarks (knuckles, PIP, DIP, fingertips)</li>
              <li>Operates at 30+ FPS directly on device CPU with zero WebGL crashes</li>
              <li>Supports both single-hand alphabet signs and two-hand cooperative signs (Help, Thank You)</li>
            </ul>
          </div>

          <div className="about-card">
            <div className="about-card-icon vision">⚡</div>
            <h3>Temporal Smoothing & Continuous Sentence Engine</h3>
            <p>
              Sign language is movement through time, not a series of disconnected static snapshots.
              SignBridge incorporates temporal frame buffers and debouncing logic so gestures smoothly aggregate
              into full grammatical sentences with natural speech inflection.
            </p>
            <ul className="about-card-list">
              <li>Rolling frame confirmation window eliminates false positives and jitter</li>
              <li>Progressive sentence builder accumulates multi-sign thoughts naturally</li>
              <li>Native Web Speech API delivers zero-latency voice output without cloud API costs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Vision and Future Possibilities */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="section-pill">The Horizon</span>
          <h2>Vision of the Project & Future Possibilities</h2>
          <p>Our long-term roadmap for global, multi-dialect sign language parity.</p>
        </div>

        <div className="future-grid">
          <div className="future-item">
            <div className="future-icon">🌍</div>
            <h4>Global Multi-Dialect Expansion</h4>
            <p>
              Expanding beyond American Sign Language (ASL) into British Sign Language (BSL), Indian Sign Language (ISL),
              French Sign Language (LSF), and regional dialects worldwide.
            </p>
          </div>

          <div className="future-item">
            <div className="future-icon">👓</div>
            <h4>Augmented Reality (AR) Smart Glasses</h4>
            <p>
              Projecting live subtitles directly onto AR smart glasses during in-person discussions, and rendering 3D avatar signers
              in physical space when hearing people speak.
            </p>
          </div>

          <div className="future-item">
            <div className="future-icon">😊</div>
            <h4>Facial & Non-Manual Marker AI</h4>
            <p>
              Tracking facial expressions, eyebrow raises, and mouth morphemes that carry essential syntactic and grammatical meaning
              in complete sign language linguistics.
            </p>
          </div>

          <div className="future-item">
            <div className="future-icon">🚨</div>
            <h4>911 Dispatch & Emergency Triage</h4>
            <p>
              Integrating SignBridge directly into municipal emergency response systems, telehealth portals, and public service kiosks
              for rapid, life-saving accessibility.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Action Banner */}
      <div className="about-cta-banner">
        <div className="about-cta-text">
          <h3>Experience SignBridge in Action</h3>
          <p>
            Test our real-time 21-joint live camera translator, explore the interactive ASL dictionary, or inspect our deep technical pipeline.
          </p>
        </div>
        <div className="about-cta-actions">
          <Link to="/live-translator" className="about-btn-primary">
            Open Live Camera Translator 📹
          </Link>
          <Link to="/how-it-works" className="about-btn-secondary">
            Learn How It Works 📖
          </Link>
        </div>
      </div>
    </div>
  )
}
