import crypto from 'crypto'

export const TAGLINE = 'Breaking communication barriers with technology.'

// In-memory duplicate prevention tracker: key -> timestamp
const notificationHistory = new Map()

// In-memory OTP store: phone -> { hash, expiresAt, attempts }
const otpStore = new Map()

/**
 * Check if a notification is within the cooldown window to prevent duplicates
 */
export function isDuplicate(userId, channel, type, cooldownSeconds = 60) {
  const normalizedType = type.includes('LOGIN') || type.includes('WELCOME') ? 'LOGIN_NOTIFICATION' : type
  const key = `${userId}:${channel}:${normalizedType}`

  const lastTime = notificationHistory.get(key)
  const now = Date.now()
  if (lastTime && now - lastTime < cooldownSeconds * 1000) {
    return true
  }
  notificationHistory.set(key, now)
  return false
}


/**
 * Mask sensitive email for logs
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return ''
  const parts = email.split('@')
  if (parts.length !== 2) return email
  const [user, domain] = parts
  const visible = user.length > 2 ? user.slice(0, 2) : user.slice(0, 1)
  return `${visible}***@${domain}`
}

/**
 * Mask phone number for logs
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return ''
  const cleaned = phone.trim()
  if (cleaned.length <= 4) return '***'
  const tail = cleaned.slice(-4)
  return `${cleaned.slice(0, 3)}****${tail}`
}

/**
 * Log notification event to database
 */
export function logNotificationToDb(readDb, writeDb, record) {
  try {
    const db = readDb()
    if (!db.notifications) db.notifications = []
    db.notifications.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...record,
      timestamp: new Date().toISOString()
    })
    // Keep last 200 notification records
    if (db.notifications.length > 200) {
      db.notifications = db.notifications.slice(0, 200)
    }
    writeDb(db)
  } catch (err) {
    console.warn('[Notification Service] Failed to save log to DB:', err.message)
  }
}

/**
 * Send an Email using Resend, Brevo, or graceful Simulation
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  userId,
  type,
  readDb,
  writeDb,
  forceFailure = false
}) {
  const cooldown = parseInt(process.env.NOTIFICATION_COOLDOWN_SECONDS || '60', 10)
  const simulate = process.env.SIMULATE_NOTIFICATIONS === 'true'
  const emailProvider = (process.env.EMAIL_PROVIDER || 'resend').toLowerCase()

  // 1. Check duplicate cooldown
  if (userId && isDuplicate(userId, 'EMAIL', type, cooldown)) {
    const record = {
      userId,
      channel: 'EMAIL',
      type,
      recipient: maskEmail(to),
      subject,
      provider: 'cache',
      status: 'SKIPPED_DUPLICATE',
      details: `Suppressed duplicate within ${cooldown}s cooldown window`
    }
    if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
    return { success: true, status: 'SKIPPED_DUPLICATE', provider: 'cache' }
  }

  // 2. Simulated failure for test suite
  if (forceFailure || process.env.FORCE_EMAIL_FAILURE === 'true') {
    const record = {
      userId,
      channel: 'EMAIL',
      type,
      recipient: maskEmail(to),
      subject,
      provider: emailProvider,
      status: 'FAILED',
      error: 'Simulated email provider network failure'
    }
    if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
    return { success: false, status: 'FAILED', provider: emailProvider, error: record.error }
  }

  // 3. Resend Integration
  const resendApiKey = process.env.RESEND_API_KEY
  if (!simulate && resendApiKey && emailProvider === 'resend') {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'SignBridge <onboarding@resend.dev>'
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, '')
        })
      })

      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        const record = {
          userId,
          channel: 'EMAIL',
          type,
          recipient: maskEmail(to),
          subject,
          provider: 'resend',
          status: 'DELIVERED',
          messageId: data.id || `resend-${Date.now()}`
        }
        if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
        return { success: true, status: 'DELIVERED', provider: 'resend', messageId: data.id }
      } else {
        const errMsg = data.message || `Resend HTTP error ${response.status}`
        const record = {
          userId,
          channel: 'EMAIL',
          type,
          recipient: maskEmail(to),
          subject,
          provider: 'resend',
          status: 'FAILED',
          error: errMsg
        }
        if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
        return { success: false, status: 'FAILED', provider: 'resend', error: errMsg }
      }
    } catch (err) {
      const record = {
        userId,
        channel: 'EMAIL',
        type,
        recipient: maskEmail(to),
        subject,
        provider: 'resend',
        status: 'FAILED',
        error: err.message
      }
      if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
      return { success: false, status: 'FAILED', provider: 'resend', error: err.message }
    }
  }

  // 4. Brevo (Sendinblue) Integration
  const brevoApiKey = process.env.BREVO_API_KEY
  if (!simulate && brevoApiKey && (emailProvider === 'brevo' || !resendApiKey)) {
    try {
      const fromEmail = process.env.BREVO_FROM_EMAIL || 'notifications@signbridge.app'
      const fromName = process.env.BREVO_FROM_NAME || 'SignBridge'
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: fromEmail, name: fromName },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text || html.replace(/<[^>]*>?/gm, '')
        })
      })

      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        const record = {
          userId,
          channel: 'EMAIL',
          type,
          recipient: maskEmail(to),
          subject,
          provider: 'brevo',
          status: 'DELIVERED',
          messageId: data.messageId || `brevo-${Date.now()}`
        }
        if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
        return { success: true, status: 'DELIVERED', provider: 'brevo', messageId: data.messageId }
      } else {
        const errMsg = data.message || `Brevo HTTP error ${response.status}`
        const record = {
          userId,
          channel: 'EMAIL',
          type,
          recipient: maskEmail(to),
          subject,
          provider: 'brevo',
          status: 'FAILED',
          error: errMsg
        }
        if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
        return { success: false, status: 'FAILED', provider: 'brevo', error: errMsg }
      }
    } catch (err) {
      const record = {
        userId,
        channel: 'EMAIL',
        type,
        recipient: maskEmail(to),
        subject,
        provider: 'brevo',
        status: 'FAILED',
        error: err.message
      }
      if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
      return { success: false, status: 'FAILED', provider: 'brevo', error: err.message }
    }
  }

  // 5. Default Graceful Simulation / Mock Mode
  const simulatedId = `sim-email-${Date.now()}`
  console.log(`\n======================================================`)
  console.log(`[SIMULATED EMAIL NOTIFICATION]`)
  console.log(`To: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Message Preview:\n${text || html.slice(0, 180)}...`)
  console.log(`======================================================\n`)

  const record = {
    userId,
    channel: 'EMAIL',
    type,
    recipient: maskEmail(to),
    subject,
    provider: 'simulation',
    status: 'SIMULATED',
    messageId: simulatedId
  }
  if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
  return { success: true, status: 'SIMULATED', provider: 'simulation', messageId: simulatedId }
}

/**
 * Send an SMS using Twilio, MSG91, or graceful Simulation
 */
export async function sendSms({
  to,
  text,
  userId,
  type,
  readDb,
  writeDb,
  forceFailure = false
}) {
  const cooldown = parseInt(process.env.NOTIFICATION_COOLDOWN_SECONDS || '60', 10)
  const simulate = process.env.SIMULATE_NOTIFICATIONS === 'true'
  const smsProvider = (process.env.SMS_PROVIDER || 'twilio').toLowerCase()

  // 1. Check duplicate cooldown
  if (userId && isDuplicate(userId, 'SMS', type, cooldown)) {
    const record = {
      userId,
      channel: 'SMS',
      type,
      recipient: maskPhone(to),
      summary: text.slice(0, 50),
      provider: 'cache',
      status: 'SKIPPED_DUPLICATE',
      details: `Suppressed duplicate within ${cooldown}s cooldown window`
    }
    if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
    return { success: true, status: 'SKIPPED_DUPLICATE', provider: 'cache' }
  }

  // 2. Simulated failure for test suite
  if (forceFailure || process.env.FORCE_SMS_FAILURE === 'true') {
    const record = {
      userId,
      channel: 'SMS',
      type,
      recipient: maskPhone(to),
      summary: text.slice(0, 50),
      provider: smsProvider,
      status: 'FAILED',
      error: 'Simulated SMS provider gateway failure'
    }
    if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
    return { success: false, status: 'FAILED', provider: smsProvider, error: record.error }
  }

  // 3. Twilio Integration
  const twilioSid = process.env.TWILIO_ACCOUNT_SID
  const twilioToken = process.env.TWILIO_AUTH_TOKEN
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER
  if (!simulate && twilioSid && twilioToken && twilioPhone && smsProvider === 'twilio') {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`
      const params = new URLSearchParams()
      params.append('From', twilioPhone)
      params.append('To', to)
      params.append('Body', text)

      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })

      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        const record = {
          userId,
          channel: 'SMS',
          type,
          recipient: maskPhone(to),
          summary: text.slice(0, 50),
          provider: 'twilio',
          status: 'DELIVERED',
          messageId: data.sid || `twilio-${Date.now()}`
        }
        if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
        return { success: true, status: 'DELIVERED', provider: 'twilio', messageId: data.sid }
      } else {
        const errMsg = data.message || `Twilio error ${response.status}`
        const record = {
          userId,
          channel: 'SMS',
          type,
          recipient: maskPhone(to),
          summary: text.slice(0, 50),
          provider: 'twilio',
          status: 'FAILED',
          error: errMsg
        }
        if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
        return { success: false, status: 'FAILED', provider: 'twilio', error: errMsg }
      }
    } catch (err) {
      const record = {
        userId,
        channel: 'SMS',
        type,
        recipient: maskPhone(to),
        summary: text.slice(0, 50),
        provider: 'twilio',
        status: 'FAILED',
        error: err.message
      }
      if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
      return { success: false, status: 'FAILED', provider: 'twilio', error: err.message }
    }
  }

  // 4. MSG91 Integration
  const msg91AuthKey = process.env.MSG91_AUTH_KEY
  if (!simulate && msg91AuthKey && (smsProvider === 'msg91' || !twilioSid)) {
    try {
      const senderId = process.env.MSG91_SENDER_ID || 'SIGNBR'
      const templateId = process.env.MSG91_TEMPLATE_ID
      const endpoint = 'https://control.msg91.com/api/v5/flow/'

      const payload = {
        template_id: templateId || 'default',
        short_url: '0',
        recipients: [
          {
            mobiles: to.replace(/[^0-9]/g, ''),
            message: text
          }
        ]
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          authkey: msg91AuthKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => ({}))
      if (response.ok && (data.type === 'success' || response.status === 200)) {
        const record = {
          userId,
          channel: 'SMS',
          type,
          recipient: maskPhone(to),
          summary: text.slice(0, 50),
          provider: 'msg91',
          status: 'DELIVERED',
          messageId: data.message || `msg91-${Date.now()}`
        }
        if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
        return { success: true, status: 'DELIVERED', provider: 'msg91', messageId: record.messageId }
      } else {
        const errMsg = data.message || `MSG91 error ${response.status}`
        const record = {
          userId,
          channel: 'SMS',
          type,
          recipient: maskPhone(to),
          summary: text.slice(0, 50),
          provider: 'msg91',
          status: 'FAILED',
          error: errMsg
        }
        if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
        return { success: false, status: 'FAILED', provider: 'msg91', error: errMsg }
      }
    } catch (err) {
      const record = {
        userId,
        channel: 'SMS',
        type,
        recipient: maskPhone(to),
        summary: text.slice(0, 50),
        provider: 'msg91',
        status: 'FAILED',
        error: err.message
      }
      if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
      return { success: false, status: 'FAILED', provider: 'msg91', error: err.message }
    }
  }

  // 5. Default Graceful Simulation / Mock Mode
  const simulatedId = `sim-sms-${Date.now()}`
  console.log(`\n======================================================`)
  console.log(`[SIMULATED SMS NOTIFICATION]`)
  console.log(`To: ${to}`)
  console.log(`Body: ${text}`)
  console.log(`======================================================\n`)

  const record = {
    userId,
    channel: 'SMS',
    type,
    recipient: maskPhone(to),
    summary: text.slice(0, 50),
    provider: 'simulation',
    status: 'SIMULATED',
    messageId: simulatedId
  }
  if (readDb && writeDb) logNotificationToDb(readDb, writeDb, record)
  return { success: true, status: 'SIMULATED', provider: 'simulation', messageId: simulatedId }
}

/**
 * Message Builders (Meeting Requirements 1, 2, 3, and 11)
 */

// 1. Welcome Email (For Brand New Accounts)
export function buildWelcomeEmail(user) {
  const userName = user.name || 'Friend'
  const subject = `Welcome to SignBridge, ${userName}! 🤟`
  const text = `
Dear ${userName},

Welcome to SignBridge! Your account is now active and ready.

We are thrilled to welcome you to our community. SignBridge provides instant, two-way assistive communication between sign language and spoken speech:
- Live 21-Joint Camera Studio
- Recorded Video Translator with Frame Segmentation
- Continuous Voice-to-Sign Visualizer
- Text-to-Sign Stepper & Fingerspelling
- Interactive ASL Dictionary & Academy

Confirmation of successful initial login: Your session has been created securely.

SignBridge Mission:
"${TAGLINE}"

If you have any questions, our support team is here to assist you at support@signbridge.app.

Warm regards,
The SignBridge Team
  `.trim()

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 2rem;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
          <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 2rem; text-align: center; color: #ffffff;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🤟</div>
            <h1 style="margin: 0; font-size: 1.6rem; font-weight: 800;">Welcome to SignBridge!</h1>
            <p style="margin: 0.5rem 0 0; opacity: 0.9; font-size: 0.95rem;">${TAGLINE}</p>
          </div>
          <div style="padding: 2rem;">
            <h2 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 1rem;">
              Your SignBridge account has been created successfully, and your initial session is authenticated and active!
            </p>
            <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 12px; padding: 1.25rem; margin: 1.5rem 0;">
              <strong style="color: #0f766e; display: block; margin-bottom: 0.5rem; font-size: 0.95rem;">✨ Successful Account Authentication Confirmed</strong>
              <span style="color: #115e59; font-size: 0.9rem;">
                Account: <strong>${user.email}</strong><br/>
                Status: <strong>Active & Verified</strong>
              </span>
            </div>
            <p style="color: #475569; line-height: 1.6; font-size: 0.95rem;">
              Explore your translation studios, practice high-frequency vocabulary in the ASL Dictionary, or use Emergency SOS mode whenever immediate assistance is needed.
            </p>
            <div style="text-align: center; margin: 2rem 0 1rem;">
              <a href="http://localhost:5173/dashboard" style="display: inline-block; background: #0d9488; color: #ffffff; text-decoration: none; padding: 0.85rem 1.75rem; border-radius: 10px; font-weight: 700; font-size: 1rem;">
                Launch Translation Studio →
              </a>
            </div>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 1.25rem 2rem; text-align: center; font-size: 0.85rem; color: #64748b;">
            <strong>SignBridge</strong> • <em>"${TAGLINE}"</em>
          </div>
        </div>
      </body>
    </html>
  `.trim()

  return { subject, text, html }
}

// 2. Login Alert Email (For Returning Users)
export function buildLoginAlertEmail(user, loginMeta = {}) {
  const userName = user.name || 'Friend'
  const timeStr = loginMeta.timestamp ? new Date(loginMeta.timestamp).toUTCString() : new Date().toUTCString()
  const subject = `Security Alert: Successful Login to SignBridge`
  const text = `
Dear ${userName},

This is confirmation of a successful login to your SignBridge account.

Login Details:
- Account: ${user.email}
- Time: ${timeStr}
- Login Method: ${loginMeta.method || 'Email & Password'}
- Status: Confirmed & Authenticated

SignBridge Mission:
"${TAGLINE}"

Security Notice:
If this was you, no action is needed. If you did not authorize this login, please change your password immediately in your SignBridge Profile settings.

Sincerely,
The SignBridge Security Team
  `.trim()

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 2rem;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
          <div style="background: #0f172a; padding: 1.75rem 2rem; text-align: center; color: #ffffff;">
            <span style="font-size: 2rem;">🔐</span>
            <h1 style="margin: 0.5rem 0 0; font-size: 1.4rem; font-weight: 800;">Successful Login Confirmed</h1>
            <p style="margin: 0.25rem 0 0; font-size: 0.85rem; color: #94a3b8;">${TAGLINE}</p>
          </div>
          <div style="padding: 2rem;">
            <h2 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 0.95rem;">
              We detected a new successful sign-in to your SignBridge account.
            </p>
            <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem 1.25rem; margin: 1.25rem 0; font-size: 0.9rem; color: #334155;">
              <p style="margin: 0 0 0.4rem;"><strong>Account:</strong> ${user.email}</p>
              <p style="margin: 0 0 0.4rem;"><strong>Time:</strong> ${timeStr}</p>
              <p style="margin: 0 0 0.4rem;"><strong>Method:</strong> ${loginMeta.method || 'Email Authentication'}</p>
              <p style="margin: 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: 700;">✅ Confirmed & Authorized</span></p>
            </div>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">
              If this was you, you can safely disregard this message. If you did not initiate this login, please secure your account immediately.
            </p>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 1rem 2rem; text-align: center; font-size: 0.8rem; color: #64748b;">
            SignBridge Assistive System • <em>"${TAGLINE}"</em>
          </div>
        </div>
      </body>
    </html>
  `.trim()

  return { subject, text, html }
}

// 3. Welcome SMS (For New Users via Mobile)
export function buildWelcomeSms(user) {
  const userName = user.name || 'Friend'
  return `Welcome to SignBridge, ${userName}! Your account is active. Successful login confirmed. "${TAGLINE}"`
}

// 4. Login Alert SMS (For Returning Users via Mobile)
export function buildLoginAlertSms(user, loginMeta = {}) {
  const userName = user.name || 'Friend'
  const timeStr = loginMeta.timestamp ? new Date(loginMeta.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'
  return `SignBridge Alert: Hi ${userName}, successful login confirmed at ${timeStr}. "${TAGLINE}"`
}

// 5. OTP SMS for Phone Verification
export function buildOtpSms(otp) {
  return `Your SignBridge verification code is ${otp}. Valid for 5 minutes. Do not share this code. "${TAGLINE}"`
}

/**
 * Mobile OTP Generation & Verification (Requirement 9)
 */
export function generatePhoneOtp(phone) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const salt = crypto.randomBytes(8).toString('hex')
  const hash = crypto.createHash('sha256').update(otp + salt).digest('hex')
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes TTL

  otpStore.set(phone.trim(), { hash, salt, expiresAt, attempts: 0 })
  return otp
}

export function verifyPhoneOtp(phone, inputOtp) {
  if (!phone || !inputOtp) return false
  const record = otpStore.get(phone.trim())
  if (!record) return false

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone.trim())
    return false
  }

  record.attempts += 1
  if (record.attempts > 5) {
    otpStore.delete(phone.trim())
    return false
  }

  const testHash = crypto.createHash('sha256').update(inputOtp.toString().trim() + record.salt).digest('hex')
  const isValid = testHash === record.hash

  if (isValid) {
    otpStore.delete(phone.trim())
  }
  return isValid
}

/**
 * 6. Password Reset Email Template
 */
export function buildPasswordResetEmail(user, { resetLink, resetCode, expiresMinutes = 15 }) {
  const userName = user.name || 'Friend'
  const subject = 'Reset Your SignBridge Password'
  const text = `
Dear ${userName},

We received a request to reset the password for your SignBridge account (${user.email}).

To reset your password, visit the link below:
${resetLink}

Or enter your 6-digit verification code: ${resetCode}

This link and code will expire in ${expiresMinutes} minutes.

Security Notice:
If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

SignBridge Mission:
"${TAGLINE}"

Warm regards,
The SignBridge Security Team
  `.trim()

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 2rem;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
          <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 2rem; text-align: center; color: #ffffff;">
            <div style="font-size: 2.75rem; margin-bottom: 0.5rem;">🔑</div>
            <h1 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Password Reset Request</h1>
            <p style="margin: 0.4rem 0 0; opacity: 0.9; font-size: 0.9rem;">${TAGLINE}</p>
          </div>
          <div style="padding: 2rem;">
            <h2 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 0.95rem;">
              We received a request to reset the password for your SignBridge account. Click the button below to choose a new password:
            </p>
            <div style="text-align: center; margin: 1.75rem 0;">
              <a href="${resetLink}" style="display: inline-block; background: #0d9488; color: #ffffff; text-decoration: none; padding: 0.85rem 1.75rem; border-radius: 10px; font-weight: 700; font-size: 1rem; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);">
                Reset Password Now →
              </a>
            </div>
            <div style="background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 1rem; margin: 1.5rem 0; text-align: center;">
              <span style="display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 0.35rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Or enter this 6-digit reset code</span>
              <span style="font-size: 1.75rem; font-weight: 800; letter-spacing: 0.25em; color: #0f766e; font-family: monospace;">${resetCode}</span>
            </div>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">
              ⏱️ This reset link and code will expire in <strong>${expiresMinutes} minutes</strong>. If you did not request a password reset, you can safely ignore this email. Your current password remains secure.
            </p>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 1.25rem 2rem; text-align: center; font-size: 0.85rem; color: #64748b;">
            <strong>SignBridge</strong> • <em>"${TAGLINE}"</em>
          </div>
        </div>
      </body>
    </html>
  `.trim()

  return { subject, text, html }
}

/**
 * 7. Password Reset SMS Template
 */
export function buildPasswordResetSms(user, { resetCode, expiresMinutes = 15 }) {
  const userName = user.name || 'Friend'
  return `SignBridge: Hi ${userName}, your password reset code is ${resetCode}. Valid for ${expiresMinutes} minutes. Never share this code. "${TAGLINE}"`
}

/**
 * 8. Password Changed Confirmation Email
 */
export function buildPasswordChangedEmail(user) {
  const userName = user.name || 'Friend'
  const subject = 'Your SignBridge Password Was Changed'
  const timeStr = new Date().toUTCString()
  const text = `
Dear ${userName},

Your SignBridge account (${user.email}) password was successfully updated at ${timeStr}.

If you made this change, no further action is required.
If you did NOT change your password, please contact our security team immediately at support@signbridge.app.

SignBridge Mission:
"${TAGLINE}"
  `.trim()

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 2rem;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
          <div style="background: #0f172a; padding: 1.75rem 2rem; text-align: center; color: #ffffff;">
            <span style="font-size: 2rem;">🔒</span>
            <h1 style="margin: 0.5rem 0 0; font-size: 1.35rem; font-weight: 800;">Password Changed Successfully</h1>
            <p style="margin: 0.25rem 0 0; font-size: 0.85rem; color: #94a3b8;">${TAGLINE}</p>
          </div>
          <div style="padding: 2rem;">
            <h2 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 0.95rem;">
              The password for your SignBridge account (<strong>${user.email}</strong>) has been changed successfully.
            </p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 1rem 1.25rem; margin: 1.25rem 0; font-size: 0.9rem; color: #166534;">
              <p style="margin: 0;"><strong>Status:</strong> Password reset confirmed at ${timeStr}.</p>
            </div>
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">
              If you made this change, you can safely disregard this message. If you did NOT change your password, please secure your account immediately.
            </p>
          </div>
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 1rem 2rem; text-align: center; font-size: 0.8rem; color: #64748b;">
            SignBridge Assistive System • <em>"${TAGLINE}"</em>
          </div>
        </div>
      </body>
    </html>
  `.trim()

  return { subject, text, html }
}

/**
 * 9. Password Changed Confirmation SMS
 */
export function buildPasswordChangedSms(user) {
  const userName = user.name || 'Friend'
  return `SignBridge Alert: Hi ${userName}, your password was changed successfully. If this wasn't you, secure your account. "${TAGLINE}"`
}

