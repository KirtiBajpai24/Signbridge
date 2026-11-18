import { useState } from 'react'
import { Link } from 'react-router-dom'
import SignBridgeLogo from '../SignBridgeLogo'
import { useAccessibility } from '../../context/AccessibilityContext'
import './Footer.css'

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  const { openModal } = useAccessibility()
  const [emailInput, setEmailInput] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!emailInput || !emailInput.includes('@')) {
      setSubscribeStatus('Please enter a valid email address.')
      return
    }
    setSubscribeStatus('Thank you for subscribing to SignBridge accessibility updates!')
    setEmailInput('')
    setTimeout(() => setSubscribeStatus(''), 5000)
  }

  return (
    <footer className="site-footer" role="contentinfo">
      {/* Emergency Quick Action Banner */}
      <div className="footer-emergency-strip">
        <div className="footer-container emergency-strip-inner">
          <div className="emergency-strip-text">
            <span className="emergency-beacon">🚨</span>
            <strong>Need Urgent Assistance?</strong> Access high-contrast emergency sign cards & instant audio broadcast.
          </div>
          <Link to="/emergency" className="emergency-strip-btn">
            Open Emergency SOS Mode →
          </Link>
        </div>
      </div>

      <div className="footer-container">
        {/* Main Footer Columns */}
        <div className="footer-main">
          {/* Brand & Mission Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo" aria-label="SignBridge Home">
              <SignBridgeLogo size={34} />
              <span className="footer-brand-name">
                Sign<span className="brand-accent">Bridge</span>
              </span>
            </Link>
            <p className="footer-tagline">
              Real-time AI-powered communication between sign language, text, and speech.
              Empowering seamless interactions for Deaf, hard-of-hearing, and non-signing individuals worldwide.
            </p>

            <div className="footer-badges-group">
              <div className="footer-accessibility-pill">
                <span className="pill-dot"></span> WCAG 2.1 AA Compliant
              </div>
              <button
                type="button"
                className="footer-a11y-trigger-btn"
                onClick={openModal}
                title="Configure contrast, text size, and motion settings"
              >
                ♿ Customize Accessibility
              </button>
            </div>

            {/* Newsletter Subscription Box */}
            <div className="footer-newsletter-box">
              <h5>Stay Updated on AI Advancements</h5>
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="newsletter-input"
                  aria-label="Email for updates"
                />
                <button type="submit" className="newsletter-submit-btn">
                  Subscribe
                </button>
              </form>
              {subscribeStatus && (
                <span className="newsletter-feedback">{subscribeStatus}</span>
              )}
            </div>
          </div>

          {/* 4 Link Columns */}
          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/how-it-works">How It Works</Link></li>
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Translators</h4>
              <ul>
                <li><Link to="/live-translator">Live Camera Translator</Link></li>
                <li><Link to="/video-translator">Recorded Video Translator</Link></li>
                <li><Link to="/speech-translator">Speech to Text</Link></li>
                <li><Link to="/text-to-sign">Text to Sign</Link></li>
                <li><Link to="/emergency">Emergency SOS</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><Link to="/dictionary">ASL Dictionary</Link></li>
                <li><Link to="/history">Translation History</Link></li>
                <li><Link to="/activity">Activity Logs</Link></li>
                <li><Link to="/profile">User Profile</Link></li>
                <li><Link to="/settings">Settings</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Support & Legal</h4>
              <ul>
                <li><Link to="/help">Help & FAQ</Link></li>
                <li><Link to="/help#accessibility">Accessibility Statement</Link></li>
                <li><Link to="/about#privacy">Privacy Policy</Link></li>
                <li><Link to="/about#terms">Terms of Service</Link></li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    Open Source Code ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p>© {CURRENT_YEAR} SignBridge. Designed with empathy for inclusive communication.</p>
          <div className="footer-bottom-telemetry">
            <span>MediaPipe v0.10.35</span>
            <span>•</span>
            <span>21-Joint Vision AI</span>
            <span>•</span>
            <span>Client-Side WebGL/CPU</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
