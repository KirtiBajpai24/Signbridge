/**
 * Strict Validation Helpers for Real Gmail & Indian Mobile Numbers (Backend)
 */

export function validateGmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required.' }
  }

  const trimmed = email.trim().toLowerCase()
  const parts = trimmed.split('@')

  if (parts.length !== 2) {
    return { valid: false, error: 'Please enter a valid email format (e.g. yourname@gmail.com).' }
  }

  const [username, domain] = parts

  if (domain !== 'gmail.com' && domain !== 'googlemail.com') {
    return {
      valid: false,
      error: 'Only valid Gmail addresses (@gmail.com) are accepted.'
    }
  }

  // Gmail username length check (3-30 characters)
  if (username.length < 3 || username.length > 30) {
    return {
      valid: false,
      error: 'Gmail username must be between 3 and 30 characters long.'
    }
  }

  if (username.startsWith('.') || username.endsWith('.')) {
    return {
      valid: false,
      error: 'Gmail username cannot begin or end with a period.'
    }
  }

  if (username.includes('..')) {
    return {
      valid: false,
      error: 'Gmail username cannot contain consecutive periods.'
    }
  }

  if (!/^[a-z0-9.]+$/.test(username)) {
    return {
      valid: false,
      error: 'Gmail username can only contain letters (a-z), numbers (0-9), and periods.'
    }
  }

  return {
    valid: true,
    email: trimmed,
    username,
    domain,
    error: null
  }
}

export function validateIndiaPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Indian mobile number is required.' }
  }

  const raw = phone.trim()
  let cleaned = raw.replace(/[\s\-\(\)\.]/g, '')

  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3)
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2)
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1)
  }

  if (!/^\d+$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Indian mobile number must contain digits only.'
    }
  }

  if (cleaned.length !== 10) {
    return {
      valid: false,
      error: `Indian mobile number must be exactly 10 digits (got ${cleaned.length}).`
    }
  }

  const firstDigit = cleaned[0]
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      valid: false,
      error: 'Indian mobile numbers must begin with 6, 7, 8, or 9.'
    }
  }

  const e164 = `+91${cleaned}`
  const display = `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`

  return {
    valid: true,
    digits: cleaned,
    e164,
    display,
    error: null
  }
}

export function isEmailIdentifier(str) {
  return typeof str === 'string' && str.includes('@')
}
