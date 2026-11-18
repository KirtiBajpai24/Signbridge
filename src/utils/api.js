/**
 * Unified API Client for SignBridge
 * Connects directly to backend at http://localhost:5001 first (bypassing Vite proxy sandbox limits)
 * and falls back to relative /api routing or client resilience.
 */

const BACKEND_URL = 'http://localhost:5001'

export async function apiFetch(endpoint, options = {}) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  // 1. Try direct connection to backend server first
  try {
    const directUrl = `${BACKEND_URL}${path}`
    const res = await fetch(directUrl, {
      ...options,
      headers
    })
    // If backend replied with anything (even 4xx/5xx), return it directly
    return res
  } catch (directErr) {
    // 2. If direct fetch threw network error (e.g. port mismatch), try relative URL
    try {
      const relativeRes = await fetch(path, {
        ...options,
        headers
      })
      return relativeRes
    } catch (relativeErr) {
      // Both network calls failed
      throw directErr || relativeErr
    }
  }
}
