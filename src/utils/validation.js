/**
 * Strict Validation Helpers for Real Gmail & Indian Mobile Numbers
 * Enforces:
 * 1. Real Gmail accounts (@gmail.com or @googlemail.com) with valid Google username syntax
 * 2. Real Indian mobile numbers (+91 with 10 digits starting with 6, 7, 8, or 9)
 */

/**
 * Validates that an email is a real Gmail address
 * Google Gmail Username constraints:
 * - 6 to 30 characters in local part
 * - Allowed characters: letters (a-z), numbers (0-9), and periods (.)
 * - Cannot begin or end with a period
 * - Cannot contain consecutive periods (..)
 * - Domain must be @gmail.com or @googlemail.com
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

  // Check username length (3-30 chars)
  if (username.length < 3 || username.length > 30) {
    return {
      valid: false,
      error: 'Gmail username must be between 3 and 30 characters long.'
    }
  }

  // Cannot start or end with a dot
  if (username.startsWith('.') || username.endsWith('.')) {
    return {
      valid: false,
      error: 'Gmail username cannot begin or end with a period.'
    }
  }

  // Cannot contain consecutive dots
  if (username.includes('..')) {
    return {
      valid: false,
      error: 'Gmail username cannot contain consecutive periods.'
    }
  }

  // Must contain only letters, numbers, and periods
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

/**
 * Validates and normalizes an Indian Mobile Phone Number (+91)
 * Indian Telecom Numbering Plan:
 * - Exactly 10 digits for the mobile subscriber number
 * - The first digit MUST be 6, 7, 8, or 9
 * - International country code is +91
 *
 * Supported user input patterns:
 * - 9876543210
 * - +91 98765 43210
 * - +919876543210
 * - 09876543210
 * - 919876543210
 */
export function validateIndiaPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Indian mobile number is required.' }
  }

  const raw = phone.trim()
  // Strip spaces, dashes, brackets, dots
  let cleaned = raw.replace(/[\s\-\(\)\.]/g, '')

  // Remove international country prefix if present
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3)
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2)
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1)
  }

  // Only digits allowed
  if (!/^\d+$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Mobile number must contain digits only.'
    }
  }

  if (cleaned.length !== 10) {
    return {
      valid: false,
      error: `Indian mobile number must be exactly 10 digits (got ${cleaned.length}).`
    }
  }

  // Check Indian mobile prefix: must start with 6, 7, 8, or 9
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

/**
 * Helper to check if string is an email (contains @)
 */
export function isEmailIdentifier(str) {
  return typeof str === 'string' && str.includes('@')
}
