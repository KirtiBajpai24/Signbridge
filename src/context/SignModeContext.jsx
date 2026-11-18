import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { INDIAN_LANGUAGES, translateToRegional, speakInRegionalLanguage } from '../utils/indianLanguages'

const SignModeContext = createContext(null)

const SIGN_MODE_KEY = 'signbridge_sign_mode' // 'ISL' | 'ASL'
const REGIONAL_LANG_KEY = 'signbridge_regional_lang' // 'hi-IN', 'ta-IN', 'en-IN', etc.

export function SignModeProvider({ children }) {
  // Default to ISL (Indian Sign Language) and Hindi
  const [signMode, setSignModeState] = useState(() => {
    try {
      return localStorage.getItem(SIGN_MODE_KEY) || 'ISL'
    } catch {
      return 'ISL'
    }
  })

  const [regionalLang, setRegionalLangState] = useState(() => {
    try {
      return localStorage.getItem(REGIONAL_LANG_KEY) || 'hi-IN'
    } catch {
      return 'hi-IN'
    }
  })

  const setSignMode = useCallback((mode) => {
    const valid = mode === 'ASL' ? 'ASL' : 'ISL'
    setSignModeState(valid)
    try {
      localStorage.setItem(SIGN_MODE_KEY, valid)
    } catch (err) {
      console.warn('Could not save sign mode:', err)
    }
  }, [])

  const setRegionalLang = useCallback((code) => {
    const exists = INDIAN_LANGUAGES.some((l) => l.code === code)
    const validCode = exists ? code : 'hi-IN'
    setRegionalLangState(validCode)
    try {
      localStorage.setItem(REGIONAL_LANG_KEY, validCode)
    } catch (err) {
      console.warn('Could not save regional language:', err)
    }
  }, [])

  // Helper: Translate text to active regional language
  const translate = useCallback(
    (text) => {
      return translateToRegional(text, regionalLang)
    },
    [regionalLang]
  )

  // Helper: Speak text in active regional language
  const speak = useCallback(
    (text, rate = 1.0) => {
      return speakInRegionalLanguage(text, regionalLang, rate)
    },
    [regionalLang]
  )

  const currentLanguageMeta = INDIAN_LANGUAGES.find((l) => l.code === regionalLang) || INDIAN_LANGUAGES[0]

  const value = {
    signMode, // 'ISL' | 'ASL'
    setSignMode,
    isISL: signMode === 'ISL',
    isASL: signMode === 'ASL',
    regionalLang, // 'hi-IN', 'ta-IN', etc.
    setRegionalLang,
    currentLanguageMeta,
    availableLanguages: INDIAN_LANGUAGES,
    translate,
    speak
  }

  return <SignModeContext.Provider value={value}>{children}</SignModeContext.Provider>
}

export function useSignMode() {
  const context = useContext(SignModeContext)
  if (!context) {
    throw new Error('useSignMode must be used within a SignModeProvider')
  }
  return context
}
