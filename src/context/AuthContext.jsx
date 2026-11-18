import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../utils/api'
import { validateGmail, validateIndiaPhone } from '../utils/validation'

const AuthContext = createContext(null)

const TOKEN_KEY = 'signbridge_token'
const USER_KEY = 'signbridge_user'
const LOCAL_USERS_KEY = 'signbridge_registered_users'

// No mock or hardcoded non-gmail / US seed accounts
const INITIAL_LOCAL_USERS = []

function getLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(INITIAL_LOCAL_USERS))
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Filter to retain only valid Gmail and Indian mobile users
    const validUsers = parsed.filter(
      (u) =>
        u.email &&
        validateGmail(u.email).valid &&
        (!u.phone || validateIndiaPhone(u.phone).valid)
    )
    if (validUsers.length !== parsed.length) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(validUsers))
    }
    return validUsers
  } catch {
    return []
  }
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
  } catch (err) {
    console.warn('Could not save local users:', err)
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY)
      if (!saved) return null
      const parsed = JSON.parse(saved)
      if (!parsed.email || !validateGmail(parsed.email).valid) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        return null
      }
      return parsed
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  // Verify and hydrate stored session on initial mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUser = localStorage.getItem(USER_KEY)

      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser)
        // Ensure stored user is a real Gmail user
        if (parsed.email && validateGmail(parsed.email).valid) {
          setToken(storedToken)
          setUser(parsed)
        } else {
          // Erase old non-gmail test sessions
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setToken(null)
          setUser(null)
        }
      } else {
        setToken(null)
        setUser(null)
      }
    } catch (err) {
      console.warn('Failed to parse stored auth session:', err)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const persistSession = useCallback((sessionToken, sessionUser) => {
    localStorage.setItem(TOKEN_KEY, sessionToken)
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser))
    setToken(sessionToken)
    setUser(sessionUser)
  }, [])

  // Login handler with Real Gmail or Indian Mobile Number support
  const login = useCallback(async (emailOrPhone, password) => {
    if (!emailOrPhone || !password) {
      throw new Error('Please enter both your Gmail / Indian mobile number and password.')
    }

    const trimmedInput = emailOrPhone.trim()
    const isEmail = trimmedInput.includes('@')

    // Client-side strict validation check
    if (isEmail) {
      const gCheck = validateGmail(trimmedInput)
      if (!gCheck.valid) throw new Error(gCheck.error)
    } else {
      const pCheck = validateIndiaPhone(trimmedInput)
      if (!pCheck.valid) throw new Error(pCheck.error)
    }

    let backendErrorMsg = ''

    // 1. Attempt backend authentication
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: trimmedInput,
          emailOrPhone: trimmedInput,
          email: isEmail ? trimmedInput.toLowerCase() : '',
          phone: !isEmail ? trimmedInput : '',
          password
        })
      })

      if (res && res.ok) {
        const data = await res.json()
        const userObj = data.user || {
          id: data.userId || 'usr_' + Date.now(),
          name: trimmedInput.split('@')[0],
          email: isEmail ? trimmedInput.toLowerCase() : '',
          phone: !isEmail ? trimmedInput : ''
        }
        const jwtToken = data.token || 'jwt_' + Date.now()
        persistSession(jwtToken, userObj)

        // Ensure user is saved locally
        const localUsers = getLocalUsers()
        const existingIdx = localUsers.findIndex(
          (u) =>
            (isEmail && u.email?.toLowerCase() === trimmedInput.toLowerCase()) ||
            (!isEmail && u.phone && u.phone.replace(/\D/g, '').endsWith(trimmedInput.replace(/\D/g, '').slice(-10)))
        )
        if (existingIdx === -1) {
          localUsers.push({ ...userObj, password })
          saveLocalUsers(localUsers)
        } else {
          localUsers[existingIdx] = { ...localUsers[existingIdx], ...userObj }
          saveLocalUsers(localUsers)
        }
        return { user: userObj, notifications: data.notifications, notification: data.notification }
      } else if (res && (res.status === 400 || res.status === 401)) {
        const errData = await res.json().catch(() => ({}))
        backendErrorMsg = errData.error || errData.detail || errData.message || ''
      }
    } catch (netErr) {
      // If network failure, provide helpful message
      if (backendErrorMsg) throw new Error(backendErrorMsg)
    }

    if (backendErrorMsg) {
      throw new Error(backendErrorMsg)
    }

    throw new Error('Invalid credentials. Please check your Gmail / Indian mobile and password.')
  }, [persistSession])

  // Signup handler with Required Real Gmail and Indian Mobile Phone (+91)
  const signup = useCallback(async (name, email, password, phone = '') => {
    const trimmedName = (name || '').trim()
    const trimmedPassword = (password || '').trim()

    if (!trimmedName || !email || !trimmedPassword || !phone) {
      throw new Error('All registration fields including real Gmail and Indian mobile are required.')
    }
    if (trimmedPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.')
    }

    // 1. Strict validation
    const gCheck = validateGmail(email)
    if (!gCheck.valid) {
      throw new Error(gCheck.error)
    }

    const pCheck = validateIndiaPhone(phone)
    if (!pCheck.valid) {
      throw new Error(pCheck.error)
    }

    // 2. Attempt backend registration
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          email: gCheck.email,
          password: trimmedPassword,
          phone: pCheck.display
        })
      })

      if (res && res.ok) {
        const data = await res.json()
        const userObj = data.user || {
          id: `user-${Date.now()}`,
          name: trimmedName,
          email: gCheck.email,
          phone: pCheck.display,
          isPhoneVerified: true
        }
        const jwtToken = data.token || `jwt_${Date.now()}`

        const localUsers = getLocalUsers()
        localUsers.push({
          id: userObj.id,
          name: trimmedName,
          email: gCheck.email,
          phone: pCheck.display,
          password: trimmedPassword
        })
        saveLocalUsers(localUsers)

        persistSession(jwtToken, userObj)
        return { user: userObj, notifications: data.notifications, notification: data.notification }
      } else if (res && (res.status === 400 || res.status === 409)) {
        const errData = await res.json().catch(() => ({}))
        const errMsg = errData.error || errData.detail || errData.message
        if (errMsg) throw new Error(errMsg)
      }
    } catch (err) {
      throw err
    }

    throw new Error('Registration failed. Please check your details and try again.')
  }, [persistSession])

  // Mobile OTP helpers (Requirement 9)
  const sendPhoneOtp = useCallback(async (phone) => {
    const res = await apiFetch('/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone, userId: user?.id })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Failed to send verification code')
    return data
  }, [user])

  const verifyPhoneOtpCode = useCallback(async (phone, otp) => {
    const res = await apiFetch('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, userId: user?.id })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Invalid OTP code')

    // Update local user state
    setUser((prev) => {
      const updated = { ...prev, phone, isPhoneVerified: true }
      localStorage.setItem(USER_KEY, JSON.stringify(updated))
      return updated
    })
    return data
  }, [user])


  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // Update profile handler
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields }
      localStorage.setItem(USER_KEY, JSON.stringify(next))

      // Also update in local users store
      const localUsers = getLocalUsers()
      const idx = localUsers.findIndex(u => u.id === next.id || u.email === next.email)
      if (idx !== -1) {
        localUsers[idx] = { ...localUsers[idx], ...updatedFields }
        saveLocalUsers(localUsers)
      }

      return next
    })
  }, [])

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    signup,
    logout,
    updateUser,
    sendPhoneOtp,
    verifyPhoneOtpCode
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => {},
      signup: async () => {},
      logout: () => {},
      updateUser: () => {},
      sendPhoneOtp: async () => {},
      verifyPhoneOtpCode: async () => {}
    }
  }
  return context
}

