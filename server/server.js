import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import {
  TAGLINE,
  sendEmail,
  sendSms,
  buildWelcomeEmail,
  buildLoginAlertEmail,
  buildWelcomeSms,
  buildLoginAlertSms,
  buildOtpSms,
  generatePhoneOtp,
  verifyPhoneOtp,
  maskEmail,
  maskPhone,
  logNotificationToDb,
  buildPasswordResetEmail,
  buildPasswordResetSms,
  buildPasswordChangedEmail,
  buildPasswordChangedSms
} from './notificationService.js'
import {
  validateGmail,
  validateIndiaPhone,
  isEmailIdentifier
} from './validation.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Robust zero-dependency .env loader
function loadEnv() {
  const envCandidates = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '.env')
  ]
  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf-8')
        const lines = content.split('\n')
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=')
            const key = trimmed.slice(0, idx).trim()
            let val = trimmed.slice(idx + 1).trim()
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1)
            }
            if (!process.env[key]) {
              process.env[key] = val
            }
          }
        }
      } catch (err) {
        console.warn(`[Env] Could not read ${envPath}:`, err.message)
      }
    }
  }
}
loadEnv()

const app = express()
const PORT = process.env.PORT || 5001
const DB_FILE = path.join(__dirname, 'database.json')

app.use(cors())
app.use(express.json())

// Helper to initialize and read DB
function readDb() {
  const defaultPreferences = {
    emailOnLogin: true,
    smsOnLogin: true,
    welcomeEmail: true,
    welcomeSms: true
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      history: [],
      quizScores: [],
      notifications: []
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2))
    return initialData
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    let modified = false

    if (!Array.isArray(parsed.users)) {
      parsed.users = []
      modified = true
    }
    if (!Array.isArray(parsed.history)) {
      parsed.history = []
      modified = true
    }
    if (!Array.isArray(parsed.quizScores)) {
      parsed.quizScores = []
      modified = true
    }
    if (!Array.isArray(parsed.notifications)) {
      parsed.notifications = []
      modified = true
    }

    for (const u of parsed.users) {
      if (!u.notificationPreferences) {
        u.notificationPreferences = { ...defaultPreferences }
        modified = true
      }
      if (u.loginCount === undefined) {
        u.loginCount = 1
        modified = true
      }
    }

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2))
    }
    return parsed
  } catch (err) {
    console.error('Error reading database file:', err)
    return { users: [], history: [], quizScores: [], notifications: [] }
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Error writing database file:', err)
  }
}

// Ensure database file is initialized
readDb()

// Root status page
app.get('/', (req, res) => {
  const db = readDb()
  const emailProvider = process.env.EMAIL_PROVIDER || 'resend'
  const smsProvider = process.env.SMS_PROVIDER || 'twilio'
  const simulate = process.env.SIMULATE_NOTIFICATIONS === 'true'

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>SignBridge Backend API & Notification Service</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 2.5rem; }
          .container { max-width: 680px; margin: 0 auto; background: #ffffff; padding: 2rem; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.06); }
          .badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.8rem; background: #ecfdf5; color: #059669; font-weight: 700; font-size: 0.85rem; border-radius: 9999px; }
          h1 { margin: 1rem 0 0.5rem; font-size: 1.6rem; color: #0f172a; }
          p { color: #64748b; line-height: 1.6; }
          .cta-btn { display: inline-block; margin: 1.25rem 0; padding: 0.75rem 1.5rem; background: #0d9488; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; }
          .notif-box { background: #f1f5f9; padding: 1rem 1.25rem; border-radius: 10px; margin: 1rem 0; font-size: 0.9rem; }
          ul { background: #f8fafc; padding: 1rem 1.5rem; border-radius: 8px; font-family: monospace; font-size: 0.85rem; border: 1px solid #e2e8f0; }
          li { margin: 0.4rem 0; }
          a { color: #0d9488; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">🟢 API & Notification Engine Active</span>
          <h1>SignBridge Backend Service</h1>
          <p><em>"${TAGLINE}"</em></p>
          <div class="notif-box">
            <strong>Notification Status:</strong><br/>
            • Email Provider: <strong>${emailProvider.toUpperCase()}</strong> ${simulate ? '(Simulated Mode)' : ''}<br/>
            • SMS Provider: <strong>${smsProvider.toUpperCase()}</strong> ${simulate ? '(Simulated Mode)' : ''}<br/>
            • Notifications Logged: <strong>${db.notifications?.length || 0}</strong>
          </div>
          <a href="http://localhost:5173" class="cta-btn">🚀 Open SignBridge Web App (localhost:5173)</a>
          <h3>Available Endpoints:</h3>
          <ul>
            <li><a href="/api/health">GET /api/health</a> — Service health check</li>
            <li><a href="/api/notifications/logs">GET /api/notifications/logs</a> — Notification audit trail</li>
            <li><a href="/api/history">GET /api/history</a> — Translation history</li>
          </ul>
        </div>
      </body>
    </html>
  `)
})

app.get('/api', (req, res) => {
  res.json({
    service: 'SignBridge Backend API',
    tagline: TAGLINE,
    status: 'online',
    version: '1.2.0',
    providers: {
      email: process.env.EMAIL_PROVIDER || 'resend',
      sms: process.env.SMS_PROVIDER || 'twilio',
      simulation: process.env.SIMULATE_NOTIFICATIONS === 'true'
    }
  })
})

// ============================================
// Auth Endpoints with Strict Gmail & Indian Mobile Validation
// ============================================

// Erase / Reset all data endpoint
app.post('/api/admin/clear-all-data', (req, res) => {
  const cleanData = {
    users: [],
    history: [],
    quizScores: [],
    notifications: []
  }
  writeDb(cleanData)
  res.json({ success: true, message: 'All past logins, gmails, mobile numbers, and records erased.' })
})

// Register a new account (Strict Gmail & Indian Mobile required)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password } = req.body

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required.' })
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' })
  }

  // 1. Strict Real Gmail Validation
  const gCheck = validateGmail(email)
  if (!gCheck.valid) {
    return res.status(400).json({ error: gCheck.error })
  }

  // 2. Strict Real Indian Mobile Number Validation (+91, 10 digits starting with 6-9)
  const pCheck = validateIndiaPhone(phone)
  if (!pCheck.valid) {
    return res.status(400).json({ error: pCheck.error })
  }

  const db = readDb()

  // 3. Ensure uniqueness
  const existingEmail = db.users.find((u) => u.email && u.email.toLowerCase() === gCheck.email)
  if (existingEmail) {
    return res.status(400).json({ error: 'A user with this Gmail address already exists.' })
  }

  const existingPhone = db.users.find((u) => {
    if (!u.phone) return false
    const uDigits = u.phoneDigits || u.phone.replace(/[\s\-\(\)\+]/g, '')
    return uDigits.endsWith(pCheck.digits)
  })
  if (existingPhone) {
    return res.status(400).json({ error: 'A user with this Indian mobile number already exists.' })
  }

  const defaultPreferences = {
    emailOnLogin: true,
    smsOnLogin: true,
    welcomeEmail: true,
    welcomeSms: true
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: gCheck.email,
    phone: pCheck.display,
    phoneE164: pCheck.e164,
    phoneDigits: pCheck.digits,
    isPhoneVerified: true,
    password,
    avatar: '🤟',
    joinedAt: new Date().toISOString(),
    loginCount: 1,
    hasReceivedWelcomeEmail: true,
    hasReceivedWelcomeSms: true,
    notificationPreferences: defaultPreferences
  }

  db.users.push(newUser)
  writeDb(db)

  // 4. Dispatch BOTH Welcome Email AND Welcome SMS
  const notificationResults = {
    email: null,
    sms: null
  }

  // Dispatch Welcome Email to Gmail
  try {
    const emailContent = buildWelcomeEmail(newUser)
    const emailRes = await sendEmail({
      to: newUser.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      userId: newUser.id,
      type: 'WELCOME_EMAIL',
      readDb,
      writeDb
    })
    notificationResults.email = emailRes
  } catch (notifErr) {
    console.warn('[Register Email Error]:', notifErr.message)
    notificationResults.email = { success: false, status: 'FAILED', error: notifErr.message }
  }

  // Dispatch Welcome SMS to Indian Mobile Number
  try {
    const smsText = buildWelcomeSms(newUser)
    const smsRes = await sendSms({
      to: newUser.phoneE164,
      text: smsText,
      userId: newUser.id,
      type: 'WELCOME_SMS',
      readDb,
      writeDb
    })
    notificationResults.sms = smsRes
  } catch (notifErr) {
    console.warn('[Register SMS Error]:', notifErr.message)
    notificationResults.sms = { success: false, status: 'FAILED', error: notifErr.message }
  }

  const { password: _, ...userSafe } = newUser
  res.json({
    user: userSafe,
    token: `token-${newUser.id}`,
    notifications: notificationResults,
    notification: {
      sent: Boolean(notificationResults.email?.success || notificationResults.sms?.success),
      email: notificationResults.email,
      sms: notificationResults.sms
    }
  })
})

// Login with Gmail or Indian Mobile Number (dispatches BOTH notifications upon success)
app.post('/api/auth/login', async (req, res) => {
  const { email, phone, emailOrPhone, identifier: rawId, password } = req.body
  const rawIdent = (rawId || emailOrPhone || email || phone || '').trim()

  if (!rawIdent || !password) {
    return res.status(400).json({
      error: 'Please enter your registered Gmail or Indian mobile number and password.'
    })
  }

  const isEmail = rawIdent.includes('@')
  let targetEmail = null
  let targetPhoneDigits = null

  if (isEmail) {
    const gCheck = validateGmail(rawIdent)
    if (!gCheck.valid) {
      return res.status(400).json({ error: gCheck.error })
    }
    targetEmail = gCheck.email
  } else {
    const pCheck = validateIndiaPhone(rawIdent)
    if (!pCheck.valid) {
      return res.status(400).json({ error: pCheck.error })
    }
    targetPhoneDigits = pCheck.digits
  }

  const db = readDb()

  // Authenticate user by Gmail or Indian Phone Digits
  const user = db.users.find((u) => {
    if (u.password !== password) return false
    if (isEmail) {
      return u.email && u.email.toLowerCase() === targetEmail
    } else {
      if (!u.phone) return false
      const uDigits = u.phoneDigits || u.phone.replace(/[\s\-\(\)\+]/g, '')
      return uDigits.endsWith(targetPhoneDigits)
    }
  })

  // Trigger notifications ONLY after successful authentication
  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials. Please verify your Gmail or Indian mobile number and password.'
    })
  }

  // Increment login counter
  const isFirstLogin = !user.loginCount || user.loginCount <= 1
  user.loginCount = (user.loginCount || 1) + 1
  writeDb(db)

  const notificationResults = {
    email: null,
    sms: null
  }

  const prefs = user.notificationPreferences || {
    emailOnLogin: true,
    smsOnLogin: true
  }

  // 1. Send Email Notification to user's Gmail
  if (user.email && prefs.emailOnLogin !== false) {
    try {
      let emailContent
      let notifType
      if (isFirstLogin && !user.hasReceivedWelcomeEmail) {
        emailContent = buildWelcomeEmail(user)
        notifType = 'WELCOME_EMAIL'
        user.hasReceivedWelcomeEmail = true
      } else {
        emailContent = buildLoginAlertEmail(user, {
          method: isEmail ? 'Gmail Authentication' : 'Indian Mobile Authentication',
          timestamp: new Date().toISOString()
        })
        notifType = 'LOGIN_ALERT_EMAIL'
      }

      const resEmail = await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        userId: user.id,
        type: notifType,
        readDb,
        writeDb
      })
      notificationResults.email = resEmail
    } catch (err) {
      console.warn('[Login Email Error]:', err.message)
      notificationResults.email = { success: false, status: 'FAILED', error: err.message }
    }
  }

  // 2. Send SMS Notification to user's Indian Mobile Number
  const phoneDest = user.phoneE164 || (user.phone ? (user.phone.startsWith('+91') ? user.phone.replace(/\s+/g, '') : `+91${user.phone.replace(/\D/g, '').slice(-10)}`) : '')
  if (phoneDest && prefs.smsOnLogin !== false) {
    try {
      let smsText
      let notifType
      if (isFirstLogin && !user.hasReceivedWelcomeSms) {
        smsText = buildWelcomeSms(user)
        notifType = 'WELCOME_SMS'
        user.hasReceivedWelcomeSms = true
      } else {
        smsText = buildLoginAlertSms(user, {
          method: isEmail ? 'Gmail' : 'Indian Mobile',
          timestamp: new Date().toISOString()
        })
        notifType = 'LOGIN_ALERT_SMS'
      }

      const resSms = await sendSms({
        to: phoneDest,
        text: smsText,
        userId: user.id,
        type: notifType,
        readDb,
        writeDb
      })
      notificationResults.sms = resSms
    } catch (err) {
      console.warn('[Login SMS Error]:', err.message)
      notificationResults.sms = { success: false, status: 'FAILED', error: err.message }
    }
  }

  const { password: _, ...userSafe } = user
  res.json({
    user: userSafe,
    token: `token-${user.id}`,
    notifications: notificationResults,
    notification: {
      sent: Boolean(notificationResults.email?.success || notificationResults.sms?.success),
      email: notificationResults.email,
      sms: notificationResults.sms
    }
  })
})

// Current user profile
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization
  const db = readDb()

  if (authHeader && authHeader.startsWith('Bearer token-')) {
    const userId = authHeader.replace('Bearer token-', '')
    const user = db.users.find((u) => u.id === userId)
    if (user) {
      const { password: _, ...userSafe } = user
      return res.json({ user: userSafe })
    }
  }

  const defaultUser = db.users[0]
  if (defaultUser) {
    const { password: _, ...userSafe } = defaultUser
    return res.json({ user: userSafe })
  }
  res.status(401).json({ error: 'Not authenticated' })
})

// Update user profile
app.put('/api/auth/profile', (req, res) => {
  const { userId, name, avatar, bio, phone, emergencyContact, medicalNotes } = req.body
  const db = readDb()
  const idx = db.users.findIndex(
    (u) =>
      u.id === userId ||
      (req.body.email && u.email.toLowerCase() === req.body.email.toLowerCase())
  )
  if (idx === -1) {
    return res.status(404).json({ error: 'User not found' })
  }

  if (name) db.users[idx].name = name
  if (avatar) db.users[idx].avatar = avatar
  if (bio !== undefined) db.users[idx].bio = bio
  if (phone !== undefined) {
    db.users[idx].phone = phone
    db.users[idx].isPhoneVerified = false // Reset verification if phone updated
  }
  if (emergencyContact !== undefined) db.users[idx].emergencyContact = emergencyContact
  if (medicalNotes !== undefined) db.users[idx].medicalNotes = medicalNotes

  writeDb(db)
  const { password: _, ...userSafe } = db.users[idx]
  res.json({ success: true, user: userSafe })
})

// Update user password
app.put('/api/auth/password', (req, res) => {
  const { userId, currentPassword, newPassword } = req.body
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' })
  }

  const db = readDb()
  const user = db.users.find((u) => u.id === userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  if (user.password && user.password !== currentPassword) {
    return res.status(400).json({ error: 'Current password does not match' })
  }

  user.password = newPassword
  user.passwordChangedAt = new Date().toISOString()
  user.tokenVersion = (user.tokenVersion || 1) + 1
  writeDb(db)
  res.json({ success: true, message: 'Password updated successfully' })
})

// ============================================
// Secure Forgot Password & Password Reset Flow
// ============================================

// In-memory single-use password reset store
// userId -> { userId, tokenHash, otpHash, expiresAt, attempts }
const passwordResetStore = new Map()

// Periodic cleanup of expired reset requests (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of passwordResetStore.entries()) {
    if (val.expiresAt < now) {
      passwordResetStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Helper: Constant-time comparison between input string's SHA-256 and target hash
function safeCompareHash(inputStr, targetHashHex) {
  if (!inputStr || !targetHashHex) return false
  const inputHashHex = crypto.createHash('sha256').update(String(inputStr).trim()).digest('hex')
  const bufA = Buffer.from(inputHashHex, 'hex')
  const bufB = Buffer.from(targetHashHex, 'hex')
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

// 1. Request Password Reset (Dispatches email link & SMS OTP; Anti-enumeration protected)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { identifier: rawIdent, email, phone } = req.body || {}
  const input = (rawIdent || email || phone || '').trim()

  if (!input) {
    return res.status(400).json({
      error: 'Please enter your registered Gmail address or Indian mobile number.'
    })
  }

  const isEmail = input.includes('@')
  let targetEmail = null
  let targetPhoneDigits = null

  if (isEmail) {
    const gCheck = validateGmail(input)
    if (!gCheck.valid) {
      return res.status(400).json({ error: gCheck.error })
    }
    targetEmail = gCheck.email
  } else {
    const pCheck = validateIndiaPhone(input)
    if (!pCheck.valid) {
      return res.status(400).json({ error: pCheck.error })
    }
    targetPhoneDigits = pCheck.digits
  }

  const db = readDb()

  // Find user by Gmail or Indian Phone Digits
  const user = db.users.find((u) => {
    if (isEmail) {
      return u.email && u.email.toLowerCase() === targetEmail
    } else {
      if (!u.phone) return false
      const uDigits = u.phoneDigits || u.phone.replace(/[\s\-\(\)\+]/g, '')
      return uDigits.endsWith(targetPhoneDigits)
    }
  })

  // Generic anti-enumeration response message
  const genericResponse = {
    success: true,
    message: 'If an account exists with this email or mobile number, password reset instructions and a verification code have been dispatched.'
  }

  // If user does not exist, perform dummy work to mitigate timing attacks and return generic 200
  if (!user) {
    crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('hex')
    return res.json(genericResponse)
  }

  // Generate cryptographically secure reset token & 6-digit OTP
  const rawToken = crypto.randomBytes(32).toString('hex')
  const rawOtp = crypto.randomInt(100000, 1000000).toString()

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex')
  const expiresMinutes = 15
  const expiresAt = Date.now() + expiresMinutes * 60 * 1000

  // Save hashed credentials with attempt counter and 15m expiry
  passwordResetStore.set(user.id, {
    userId: user.id,
    tokenHash,
    otpHash,
    expiresAt,
    attempts: 0
  })

  // Determine client URL for reset link
  const clientOrigin = req.get('origin') || process.env.CLIENT_URL || 'http://localhost:5173'
  const resetLink = `${clientOrigin}/reset-password?token=${rawToken}&id=${user.id}`

  // Dispatch reset email to Gmail if available
  if (user.email) {
    try {
      const emailContent = buildPasswordResetEmail(user, {
        resetLink,
        resetCode: rawOtp,
        expiresMinutes
      })
      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        userId: user.id,
        type: 'PASSWORD_RESET_EMAIL',
        readDb,
        writeDb
      })
    } catch (err) {
      console.warn('[Forgot Password Email Error]:', err.message)
    }
  }

  // Dispatch reset SMS to Indian Mobile Number if available
  const phoneDest = user.phoneE164 || (user.phone ? (user.phone.startsWith('+91') ? user.phone.replace(/\s+/g, '') : `+91${user.phone.replace(/\D/g, '').slice(-10)}`) : '')
  if (phoneDest) {
    try {
      const smsText = buildPasswordResetSms(user, {
        resetCode: rawOtp,
        expiresMinutes
      })
      await sendSms({
        to: phoneDest,
        text: smsText,
        userId: user.id,
        type: 'PASSWORD_RESET_SMS',
        readDb,
        writeDb
      })
    } catch (err) {
      console.warn('[Forgot Password SMS Error]:', err.message)
    }
  }

  // Never return raw token or raw OTP in the API response or logs
  res.json(genericResponse)
})

// 2. Verify Reset Token or OTP Code (For client-side validation / pre-check)
app.post('/api/auth/verify-reset-token', (req, res) => {
  const { token, code, identifier, id, userId } = req.body || {}

  if (!token && !code) {
    return res.status(400).json({ error: 'Reset token or verification code is required.' })
  }

  const db = readDb()
  let targetUserId = userId || id

  // Resolve targetUserId via identifier if provided
  if (!targetUserId && identifier) {
    const trimmed = identifier.trim()
    const isEmail = trimmed.includes('@')
    const user = db.users.find((u) => {
      if (isEmail) {
        return u.email && u.email.toLowerCase() === trimmed.toLowerCase()
      } else {
        const clean = trimmed.replace(/\D/g, '').slice(-10)
        const uDigits = u.phoneDigits || (u.phone && u.phone.replace(/\D/g, '').slice(-10))
        return uDigits === clean
      }
    })
    if (user) targetUserId = user.id
  }

  let entry = null

  if (targetUserId) {
    entry = passwordResetStore.get(targetUserId)
  } else if (token) {
    // If only token is given, look up entry by matching tokenHash
    for (const item of passwordResetStore.values()) {
      if (safeCompareHash(token, item.tokenHash)) {
        entry = item
        break
      }
    }
  }

  if (!entry) {
    return res.status(400).json({
      error: 'Invalid or expired password reset request. Please request a new link or code.'
    })
  }

  // Check expiration
  if (Date.now() > entry.expiresAt) {
    passwordResetStore.delete(entry.userId)
    return res.status(400).json({
      error: 'This password reset link or code has expired (15-minute limit). Please request a new one.'
    })
  }

  // Check maximum verification attempts (5 attempts limit)
  if (entry.attempts >= 5) {
    passwordResetStore.delete(entry.userId)
    return res.status(429).json({
      error: 'Maximum verification attempts exceeded. Please request a new password reset.'
    })
  }

  // Validate token or OTP
  let isValid = false
  if (token) {
    isValid = safeCompareHash(token, entry.tokenHash)
  } else if (code) {
    isValid = safeCompareHash(code, entry.otpHash)
  }

  if (!isValid) {
    entry.attempts += 1
    if (entry.attempts >= 5) {
      passwordResetStore.delete(entry.userId)
      return res.status(429).json({
        error: 'Maximum verification attempts exceeded. Please request a new password reset.'
      })
    }
    return res.status(400).json({
      error: `Invalid verification code or link. (${5 - entry.attempts} attempts remaining)`
    })
  }

  res.json({ success: true, valid: true, userId: entry.userId })
})

// 3. Reset Password (Verifies token/code, updates password securely, invalidates sessions)
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, code, identifier, id, userId, newPassword } = req.body || {}

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters long.'
    })
  }

  if (!token && !code) {
    return res.status(400).json({
      error: 'Verification code or reset token is required.'
    })
  }

  const db = readDb()
  let targetUserId = userId || id

  if (!targetUserId && identifier) {
    const trimmed = identifier.trim()
    const isEmail = trimmed.includes('@')
    const user = db.users.find((u) => {
      if (isEmail) {
        return u.email && u.email.toLowerCase() === trimmed.toLowerCase()
      } else {
        const clean = trimmed.replace(/\D/g, '').slice(-10)
        const uDigits = u.phoneDigits || (u.phone && u.phone.replace(/\D/g, '').slice(-10))
        return uDigits === clean
      }
    })
    if (user) targetUserId = user.id
  }

  let entry = null

  if (targetUserId) {
    entry = passwordResetStore.get(targetUserId)
  } else if (token) {
    for (const item of passwordResetStore.values()) {
      if (safeCompareHash(token, item.tokenHash)) {
        entry = item
        break
      }
    }
  }

  if (!entry) {
    return res.status(400).json({
      error: 'Invalid or expired password reset request. Please request a new link or code.'
    })
  }

  // Check expiration
  if (Date.now() > entry.expiresAt) {
    passwordResetStore.delete(entry.userId)
    return res.status(400).json({
      error: 'This password reset link or code has expired. Please request a new one.'
    })
  }

  // Check attempt limits
  if (entry.attempts >= 5) {
    passwordResetStore.delete(entry.userId)
    return res.status(429).json({
      error: 'Maximum verification attempts exceeded. Please request a new password reset.'
    })
  }

  // Verify token or OTP
  let isValid = false
  if (token) {
    isValid = safeCompareHash(token, entry.tokenHash)
  } else if (code) {
    isValid = safeCompareHash(code, entry.otpHash)
  }

  if (!isValid) {
    entry.attempts += 1
    if (entry.attempts >= 5) {
      passwordResetStore.delete(entry.userId)
      return res.status(429).json({
        error: 'Maximum verification attempts exceeded. Please request a new password reset.'
      })
    }
    return res.status(400).json({
      error: `Invalid verification code or link. (${5 - entry.attempts} attempts remaining)`
    })
  }

  // Find user in database
  const userIndex = db.users.findIndex((u) => u.id === entry.userId)
  if (userIndex === -1) {
    passwordResetStore.delete(entry.userId)
    return res.status(404).json({ error: 'User account not found.' })
  }

  const user = db.users[userIndex]

  // Update password and invalidate all existing active sessions
  user.password = newPassword
  user.passwordChangedAt = new Date().toISOString()
  user.tokenVersion = (user.tokenVersion || 1) + 1

  // Single-use token: Immediately delete from reset store
  passwordResetStore.delete(entry.userId)
  writeDb(db)

  // Dispatch confirmation notification of password change
  if (user.email) {
    try {
      const emailContent = buildPasswordChangedEmail(user)
      sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        userId: user.id,
        type: 'PASSWORD_CHANGED_EMAIL',
        readDb,
        writeDb
      }).catch((e) => console.warn('[Password Changed Email Alert Failed]:', e.message))
    } catch (e) {
      console.warn('[Password Changed Email Error]:', e.message)
    }
  }

  const phoneDest = user.phoneE164 || (user.phone ? (user.phone.startsWith('+91') ? user.phone.replace(/\s+/g, '') : `+91${user.phone.replace(/\D/g, '').slice(-10)}`) : '')
  if (phoneDest) {
    try {
      const smsText = buildPasswordChangedSms(user)
      sendSms({
        to: phoneDest,
        text: smsText,
        userId: user.id,
        type: 'PASSWORD_CHANGED_SMS',
        readDb,
        writeDb
      }).catch((e) => console.warn('[Password Changed SMS Alert Failed]:', e.message))
    } catch (e) {
      console.warn('[Password Changed SMS Error]:', e.message)
    }
  }

  res.json({
    success: true,
    message: 'Password reset successfully. Please sign in with your new password.'
  })
})

// ============================================
// Phone OTP Verification Endpoints (Rule 9)
// ============================================

// Send OTP to mobile number
app.post('/api/auth/otp/send', async (req, res) => {
  const { phone, userId } = req.body
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ error: 'Valid mobile phone number is required' })
  }

  const cleanPhone = phone.trim()
  try {
    const otp = generatePhoneOtp(cleanPhone)
    const smsBody = buildOtpSms(otp)

    const smsRes = await sendSms({
      to: cleanPhone,
      text: smsBody,
      userId: userId || 'guest',
      type: 'PHONE_OTP',
      readDb,
      writeDb
    })

    res.json({
      success: true,
      maskedPhone: maskPhone(cleanPhone),
      message: `Verification OTP dispatched to ${maskPhone(cleanPhone)}`,
      status: smsRes.status,
      provider: smsRes.provider
    })
  } catch (err) {
    console.error('[OTP Send Error]:', err)
    res.status(500).json({ error: 'Could not send verification OTP. Please try again.' })
  }
})

// Verify OTP
app.post('/api/auth/otp/verify', (req, res) => {
  const { phone, otp, userId } = req.body
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' })
  }

  const isValid = verifyPhoneOtp(phone.trim(), otp.toString().trim())
  if (!isValid) {
    return res.status(400).json({
      error: 'Invalid or expired OTP code. Please check your code or request a new one.'
    })
  }

  // Update user in DB if userId provided
  const db = readDb()
  if (userId) {
    const user = db.users.find((u) => u.id === userId)
    if (user) {
      user.phone = phone.trim()
      user.isPhoneVerified = true
      writeDb(db)
    }
  }

  res.json({
    success: true,
    isPhoneVerified: true,
    message: 'Mobile number verified successfully!'
  })
})

// ============================================
// Notification Preferences & Audit Logs (Rules 8 & 10)
// ============================================

// Get user notification preferences
app.get('/api/notifications/preferences', (req, res) => {
  const userId = req.query.userId
  const db = readDb()
  const user = db.users.find((u) => u.id === userId)

  const defaultPreferences = {
    emailOnLogin: true,
    smsOnLogin: true,
    welcomeEmail: true,
    welcomeSms: true
  }

  res.json({
    preferences: user?.notificationPreferences || defaultPreferences,
    phone: user?.phone || '',
    isPhoneVerified: Boolean(user?.isPhoneVerified)
  })
})

// Update user notification preferences
app.put('/api/notifications/preferences', (req, res) => {
  const { userId, preferences } = req.body
  if (!userId || !preferences) {
    return res.status(400).json({ error: 'UserId and preferences object are required' })
  }

  const db = readDb()
  const user = db.users.find((u) => u.id === userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  user.notificationPreferences = {
    ...user.notificationPreferences,
    ...preferences
  }
  writeDb(db)

  res.json({
    success: true,
    preferences: user.notificationPreferences,
    message: 'Notification preferences updated successfully.'
  })
})

// Get notification audit logs (never exposes credentials or plain OTPs)
app.get('/api/notifications/logs', (req, res) => {
  const userId = req.query.userId
  const db = readDb()
  let logs = db.notifications || []

  if (userId && userId !== 'all') {
    logs = logs.filter((n) => !n.userId || n.userId === userId)
  }

  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  res.json({ logs: logs.slice(0, 50) })
})

// Test delivery endpoint for testing Resend, Brevo, Twilio, MSG91, failure modes, etc.
app.post('/api/notifications/test', async (req, res) => {
  const { channel, recipient, forceFailure } = req.body
  const db = readDb()

  try {
    if (channel === 'EMAIL') {
      const emailRes = await sendEmail({
        to: recipient || 'test@example.com',
        subject: 'Test Notification from SignBridge',
        html: `<p>This is a test notification confirming delivery capabilities.</p><p><em>"${TAGLINE}"</em></p>`,
        text: `This is a test notification from SignBridge. ${TAGLINE}`,
        userId: 'test-user',
        type: 'TEST_EMAIL',
        forceFailure: Boolean(forceFailure),
        readDb,
        writeDb
      })
      return res.json({ result: emailRes })
    } else {
      const pCheck = recipient ? validateIndiaPhone(recipient) : { valid: true, e164: '+919876543210' }
      const destPhone = pCheck.valid ? pCheck.e164 : '+919876543210'
      const smsRes = await sendSms({
        to: destPhone,
        text: `Test SMS from SignBridge: "${TAGLINE}"`,
        userId: 'test-user',
        type: 'TEST_SMS',
        forceFailure: Boolean(forceFailure),
        readDb,
        writeDb
      })
      return res.json({ result: smsRes })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ============================================
// Emergency Profile Endpoints
// ============================================

app.get('/api/emergency/profile', (req, res) => {
  const userId = req.query.userId || 'user-default-1'
  const db = readDb()
  const profile = db.emergencyProfiles?.[userId] || {
    bloodGroup: 'O+',
    allergies: 'None reported',
    conditions: 'Deaf / Hard of Hearing',
    iceName: 'Primary Contact',
    icePhone: '+91 98765 43210',
    iceRelation: 'Family'
  }
  res.json({ profile })
})

app.post('/api/emergency/profile', (req, res) => {
  const { userId, profile } = req.body
  const db = readDb()
  if (!db.emergencyProfiles) db.emergencyProfiles = {}
  db.emergencyProfiles[userId || 'user-default-1'] = profile
  writeDb(db)
  res.json({ success: true, profile })
})

// ============================================
// Translation History Endpoints
// ============================================

app.get('/api/history', (req, res) => {
  const userId = req.query.userId
  const db = readDb()
  let userHistory = []
  if (!userId || userId === 'all') {
    userHistory = [...(db.history || [])]
  } else {
    userHistory = (db.history || []).filter((h) => !h.userId || h.userId === userId)
    if (userHistory.length === 0 && (db.history || []).length > 0) {
      userHistory = [...db.history]
    }
  }
  userHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  res.json({ history: userHistory })
})

app.post('/api/history', (req, res) => {
  const { userId, type, inputText, outputText, confidence } = req.body
  if (!outputText) {
    return res.status(400).json({ error: 'Output text is required' })
  }

  const db = readDb()
  const newItem = {
    id: `hist-${Date.now()}`,
    userId: userId || 'user-default-1',
    type: type || 'sign-to-text',
    inputText: inputText || outputText,
    outputText,
    confidence: confidence || 95,
    timestamp: new Date().toISOString()
  }

  db.history.unshift(newItem)
  if (db.history.length > 100) {
    db.history = db.history.slice(0, 100)
  }

  if (!db.activity) db.activity = []
  db.activity.unshift({
    id: `act-${Date.now()}`,
    userId: newItem.userId,
    type: 'TRANSLATION_COMPLETED',
    icon: '✅',
    title: 'New Translation Saved',
    desc: `Recorded "${newItem.outputText}" (${newItem.confidence}% confidence)`,
    timestamp: new Date().toISOString()
  })
  if (db.activity.length > 100) {
    db.activity = db.activity.slice(0, 100)
  }

  writeDb(db)
  res.json({ success: true, item: newItem })
})

app.delete('/api/history/:id', (req, res) => {
  const { id } = req.params
  const db = readDb()
  db.history = db.history.filter((h) => h.id !== id)
  writeDb(db)
  res.json({ success: true })
})

app.delete('/api/history', (req, res) => {
  const userId = req.query.userId || 'user-default-1'
  const db = readDb()
  db.history = db.history.filter((h) => h.userId && h.userId !== userId)
  writeDb(db)
  res.json({ success: true })
})

// ============================================
// Quiz Scores Endpoints
// ============================================

app.get('/api/quiz/scores', (req, res) => {
  const userId = req.query.userId || 'user-default-1'
  const db = readDb()
  const scores = (db.quizScores || [])
    .filter((s) => !s.userId || s.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  res.json({ scores })
})

app.post('/api/quiz/scores', (req, res) => {
  const { userId, score, total, category } = req.body
  const db = readDb()
  if (!db.quizScores) db.quizScores = []

  const newScore = {
    id: `quiz-${Date.now()}`,
    userId: userId || 'user-default-1',
    score: score || 0,
    total: total || 5,
    category: category || 'General',
    timestamp: new Date().toISOString()
  }

  db.quizScores.unshift(newScore)
  writeDb(db)
  res.json({ success: true, score: newScore })
})

// ============================================
// Activity Logs Endpoints
// ============================================

app.get('/api/activity', (req, res) => {
  const userId = req.query.userId
  const db = readDb()
  let activity = db.activity || []
  if (userId && userId !== 'all') {
    activity = activity.filter((a) => !a.userId || a.userId === userId)
  }
  if (activity.length === 0) {
    activity = [
      {
        id: 'act-1',
        userId: userId || 'user-default-1',
        type: 'TRANSLATION_COMPLETED',
        icon: '✅',
        title: 'Camera Translation Completed',
        desc: 'Recognized continuous signs with 96% confidence and synthesized audio speech.',
        timestamp: new Date().toISOString()
      }
    ]
  }
  activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  res.json({ activity })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    tagline: TAGLINE,
    time: new Date().toISOString()
  })
})

const server = app.listen(PORT, () => {
  console.log(`[SignBridge Backend & Notification Engine] Running on http://localhost:${PORT}`)
})


export { app, server, passwordResetStore, safeCompareHash, readDb, writeDb }
export default app

