import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AccessibilityContext = createContext(null)

const STORAGE_KEY = 'signbridge_a11y_prefs'

const DEFAULT_PREFS = {
  fontSize: 'normal', // 'normal' | 'large' | 'xlarge'
  highContrast: false,
  dyslexicFont: false,
  reducedMotion: false,
  focusHighlight: false,
  soundFeedback: false
}

export function AccessibilityProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS
    } catch {
      return DEFAULT_PREFS
    }
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [liveAnnouncement, setLiveAnnouncement] = useState('')

  // Persist and apply preferences to DOM
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // ignore storage errors
    }

    const root = document.documentElement
    root.setAttribute('data-a11y-font', prefs.fontSize)
    root.setAttribute('data-a11y-contrast', prefs.highContrast ? 'true' : 'false')
    root.setAttribute('data-a11y-dyslexic', prefs.dyslexicFont ? 'true' : 'false')
    root.setAttribute('data-a11y-motion', prefs.reducedMotion ? 'reduced' : 'standard')
    root.setAttribute('data-a11y-focus', prefs.focusHighlight ? 'true' : 'false')
  }, [prefs])

  const setFontSize = useCallback((size) => {
    setPrefs((prev) => ({ ...prev, fontSize: size }))
  }, [])

  const toggleHighContrast = useCallback(() => {
    setPrefs((prev) => ({ ...prev, highContrast: !prev.highContrast }))
  }, [])

  const toggleDyslexicFont = useCallback(() => {
    setPrefs((prev) => ({ ...prev, dyslexicFont: !prev.dyslexicFont }))
  }, [])

  const toggleReducedMotion = useCallback(() => {
    setPrefs((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }))
  }, [])

  const toggleFocusHighlight = useCallback(() => {
    setPrefs((prev) => ({ ...prev, focusHighlight: !prev.focusHighlight }))
  }, [])

  const toggleSoundFeedback = useCallback(() => {
    setPrefs((prev) => ({ ...prev, soundFeedback: !prev.soundFeedback }))
  }, [])

  const resetPreferences = useCallback(() => {
    setPrefs(DEFAULT_PREFS)
  }, [])

  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  const announce = useCallback((message) => {
    setLiveAnnouncement(message)
    setTimeout(() => setLiveAnnouncement(''), 4000)
  }, [])

  // Count active accessibility customizations
  const activeCount = [
    prefs.fontSize !== 'normal',
    prefs.highContrast,
    prefs.dyslexicFont,
    prefs.reducedMotion,
    prefs.focusHighlight,
    prefs.soundFeedback
  ].filter(Boolean).length

  return (
    <AccessibilityContext.Provider
      value={{
        ...prefs,
        activeCount,
        isModalOpen,
        liveAnnouncement,
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
      }}
    >
      {children}
      {/* Invisible screen-reader live region */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {liveAnnouncement}
      </div>
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    return {
      ...DEFAULT_PREFS,
      activeCount: 0,
      isModalOpen: false,
      liveAnnouncement: '',
      setFontSize: () => {},
      toggleHighContrast: () => {},
      toggleDyslexicFont: () => {},
      toggleReducedMotion: () => {},
      toggleFocusHighlight: () => {},
      toggleSoundFeedback: () => {},
      resetPreferences: () => {},
      openModal: () => {},
      closeModal: () => {},
      announce: () => {}
    }
  }
  return context
}
