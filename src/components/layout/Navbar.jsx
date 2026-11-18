import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAccessibility } from '../../context/AccessibilityContext'
import { useSignMode } from '../../context/SignModeContext'
import SignBridgeLogo from '../SignBridgeLogo'
import './Navbar.css'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isTranslatorDropdownOpen, setIsTranslatorDropdownOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)

  const translatorRef = useRef(null)
  const profileRef = useRef(null)
  const langRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { openModal: openA11yModal } = useAccessibility()
  const {
    signMode,
    setSignMode,
    regionalLang,
    setRegionalLang,
    currentLanguageMeta,
    availableLanguages
  } = useSignMode()

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsTranslatorDropdownOpen(false)
    setIsProfileDropdownOpen(false)
    setIsLangDropdownOpen(false)
  }, [location.pathname])

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (translatorRef.current && !translatorRef.current.contains(event.target)) {
        setIsTranslatorDropdownOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsTranslatorDropdownOpen(false)
        setIsProfileDropdownOpen(false)
        setIsMobileMenuOpen(false)
        setIsLangDropdownOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
    setIsProfileDropdownOpen(false)
    navigate('/')
  }

  const isTranslatorActive = [
    '/live-translator',
    '/video-translator',
    '/speech-translator',
    '/text-to-sign'
  ].includes(location.pathname)

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="brand-logo" aria-label="SignBridge Home">
          <SignBridgeLogo size={36} />
          <span className="brand-name">
            Sign<span className="brand-accent">Bridge</span>
          </span>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Backdrop for Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="mobile-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Desktop & Mobile Navigation Links */}
        <nav className={`nav-menu ${isMobileMenuOpen ? 'nav-menu-open' : ''}`}>
          {!isAuthenticated ? (
            /* ================= GUEST / LOGGED-OUT NAVIGATION ================= */
            <div className="nav-group public-nav-group">
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
                Home
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                About
              </NavLink>
              <NavLink to="/how-it-works" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                How It Works
              </NavLink>
              <NavLink to="/features" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Features
              </NavLink>

              <div className="nav-auth-buttons">
                {/* Sign Mode Toggle (ISL / ASL) */}
                <button
                  type="button"
                  className={`nav-sign-mode-btn ${signMode === 'ISL' ? 'isl-active' : 'asl-active'}`}
                  onClick={() => setSignMode(signMode === 'ISL' ? 'ASL' : 'ISL')}
                  title={`Active: ${signMode === 'ISL' ? 'Indian Sign Language (ISL)' : 'American Sign Language (ASL)'}. Click to switch.`}
                  aria-label="Toggle Sign Language Mode"
                >
                  <span className="sign-mode-flag">{signMode === 'ISL' ? '🇮🇳' : '🇺🇸'}</span>
                  <span className="sign-mode-text">{signMode}</span>
                </button>

                <button
                  type="button"
                  className="nav-a11y-btn"
                  onClick={openA11yModal}
                  title="Accessibility Preferences (WCAG 2.1 AA)"
                  aria-label="Accessibility Settings"
                >
                  ♿
                </button>
                <Link to="/login" className="btn btn-outline nav-auth-btn">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary nav-auth-btn">
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            /* ================= AUTHENTICATED / LOGGED-IN NAVIGATION ================= */
            <div className="nav-group authenticated-nav-group">
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Dashboard
              </NavLink>

              {/* Translators Dropdown */}
              <div className="nav-dropdown-wrapper" ref={translatorRef}>
                <button
                  type="button"
                  className={`nav-link nav-dropdown-toggle ${isTranslatorActive ? 'active' : ''}`}
                  onClick={() => setIsTranslatorDropdownOpen(!isTranslatorDropdownOpen)}
                  aria-expanded={isTranslatorDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>Translators</span>
                  <span className={`dropdown-caret ${isTranslatorDropdownOpen ? 'open' : ''}`}>▾</span>
                </button>

                {isTranslatorDropdownOpen && (
                  <div className="nav-dropdown-menu">
                    <Link
                      to="/live-translator"
                      className="dropdown-item"
                      onClick={() => setIsTranslatorDropdownOpen(false)}
                    >
                      <div className="dropdown-item-icon">📹</div>
                      <div className="dropdown-item-text">
                        <strong>Live Camera Translator</strong>
                        <small>Real-time 21-joint sign recognition</small>
                      </div>
                    </Link>

                    <Link
                      to="/video-translator"
                      className="dropdown-item"
                      onClick={() => setIsTranslatorDropdownOpen(false)}
                    >
                      <div className="dropdown-item-icon">📁</div>
                      <div className="dropdown-item-text">
                        <strong>Video Upload Translator</strong>
                        <small>Frame extraction & timestamped signs</small>
                      </div>
                    </Link>

                    <Link
                      to="/speech-translator"
                      className="dropdown-item"
                      onClick={() => setIsTranslatorDropdownOpen(false)}
                    >
                      <div className="dropdown-item-icon">🎙️</div>
                      <div className="dropdown-item-text">
                        <strong>Speech to Text</strong>
                        <small>Voice transcription for Deaf users</small>
                      </div>
                    </Link>

                    <Link
                      to="/text-to-sign"
                      className="dropdown-item"
                      onClick={() => setIsTranslatorDropdownOpen(false)}
                    >
                      <div className="dropdown-item-icon">🤟</div>
                      <div className="dropdown-item-text">
                        <strong>Text to Sign</strong>
                        <small>Conceptual signs & ASL alphabet</small>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <NavLink to="/dictionary" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Dictionary
              </NavLink>

              <NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                History
              </NavLink>

              <NavLink to="/activity" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Activity
              </NavLink>

              {/* Emergency Quick SOS Button */}
              <NavLink to="/emergency" className="nav-link emergency-nav-btn" title="Emergency High-Contrast SOS Mode">
                🚨 Emergency
              </NavLink>

              {/* Sign Mode Toggle (ISL / ASL) */}
              <button
                type="button"
                className={`nav-sign-mode-btn ${signMode === 'ISL' ? 'isl-active' : 'asl-active'}`}
                onClick={() => setSignMode(signMode === 'ISL' ? 'ASL' : 'ISL')}
                title={`Active: ${signMode === 'ISL' ? 'Indian Sign Language (ISL)' : 'American Sign Language (ASL)'}. Click to switch.`}
                aria-label="Toggle Sign Language Mode"
              >
                <span className="sign-mode-flag">{signMode === 'ISL' ? '🇮🇳' : '🇺🇸'}</span>
                <span className="sign-mode-text">{signMode}</span>
              </button>

              {/* Indian Regional Language Dropdown */}
              <div className="nav-dropdown-wrapper" ref={langRef}>
                <button
                  type="button"
                  className="nav-lang-btn"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  title="Select Indian Regional Language for Speech & Subtitles"
                  aria-expanded={isLangDropdownOpen}
                >
                  <span>{currentLanguageMeta.flag}</span>
                  <span className="nav-lang-text">{currentLanguageMeta.native}</span>
                  <span className={`dropdown-caret ${isLangDropdownOpen ? 'open' : ''}`}>▾</span>
                </button>
                {isLangDropdownOpen && (
                  <div className="nav-dropdown-menu lang-dropdown-menu">
                    <div className="dropdown-section-title">Indian Regional Languages</div>
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        className={`dropdown-item lang-option ${regionalLang === lang.code ? 'selected' : ''}`}
                        onClick={() => {
                          setRegionalLang(lang.code)
                          setIsLangDropdownOpen(false)
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                        <div>
                          <strong>{lang.native}</strong>
                          <small style={{ display: 'block', color: '#64748b' }}>{lang.label}</small>
                        </div>
                        {regionalLang === lang.code && <span className="lang-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accessibility Quick Trigger */}
              <button
                type="button"
                className="nav-a11y-btn"
                onClick={openA11yModal}
                title="Accessibility Preferences (WCAG 2.1 AA)"
                aria-label="Accessibility Settings"
              >
                ♿
              </button>

              {/* Profile & Account Dropdown */}
              <div className="nav-dropdown-wrapper" ref={profileRef}>
                <button
                  type="button"
                  className="user-profile-badge"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="user-avatar-tag">👤</span>
                  <span className="user-name-tag">{user?.name || 'My Account'}</span>
                  <span className={`dropdown-caret ${isProfileDropdownOpen ? 'open' : ''}`}>▾</span>
                </button>

                {isProfileDropdownOpen && (
                  <div className="nav-dropdown-menu profile-dropdown-menu">
                    <div className="profile-dropdown-header">
                      <strong>{user?.name || 'SignBridge Member'}</strong>
                      <small>{user?.email || 'Signed in'}</small>
                    </div>

                    <div className="dropdown-divider"></div>

                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <div className="dropdown-item-icon">👤</div>
                      <div className="dropdown-item-text">
                        <strong>My Profile</strong>
                        <small>Account settings & statistics</small>
                      </div>
                    </Link>

                    <Link
                      to="/settings"
                      className="dropdown-item"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <div className="dropdown-item-icon">⚙️</div>
                      <div className="dropdown-item-text">
                        <strong>Preferences</strong>
                        <small>Speech speed & accessibility</small>
                      </div>
                    </Link>

                    <div className="dropdown-divider"></div>

                    <button
                      type="button"
                      className="dropdown-logout-btn"
                      onClick={handleLogout}
                    >
                      <span>🚪</span> Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
