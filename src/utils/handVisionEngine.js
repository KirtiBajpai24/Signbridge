import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision'
import { classifyHandLandmarks } from './gestureClassifier.js'

// Singleton neural gesture recognizer state
let recognizerInstance = null
let recognizerDelegate = null // 'GPU' | 'CPU' | null
let initializationPromise = null
let initializationError = null
let isPermanentlyFailed = false
let consecutiveFrameErrors = 0
let isEngineErrorState = false
let lastLoggedErrorTime = 0
let sharedGLCanvas = null
const MAX_CONSECUTIVE_ERRORS = 3

/**
 * Tests whether WebGL context creation and essential WebGL texture methods
 * are genuinely available and functional in the current browser environment.
 */
export function isWebGLSupported() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  try {
    const testCanvas = document.createElement('canvas')
    testCanvas.width = 16
    testCanvas.height = 16
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
    if (!gl) return false
    return typeof gl.activeTexture === 'function' && typeof gl.createTexture === 'function'
  } catch {
    return false
  }
}

/**
 * Creates or retrieves a persistent dedicated canvas for MediaPipe WebGL texture bindings.
 * Passing this explicitly to GestureRecognizer prevents Emscripten from querying undefined Module['canvas'].
 */
export function getOrCreateSharedGLCanvas() {
  if (typeof document === 'undefined') return null
  if (!sharedGLCanvas) {
    sharedGLCanvas = document.getElementById('signbridge-mediapipe-canvas')
    if (!sharedGLCanvas) {
      sharedGLCanvas = document.createElement('canvas')
      sharedGLCanvas.id = 'signbridge-mediapipe-canvas'
      sharedGLCanvas.width = 640
      sharedGLCanvas.height = 480
      sharedGLCanvas.style.position = 'fixed'
      sharedGLCanvas.style.top = '-9999px'
      sharedGLCanvas.style.left = '-9999px'
      sharedGLCanvas.style.width = '1px'
      sharedGLCanvas.style.height = '1px'
      sharedGLCanvas.style.opacity = '0'
      sharedGLCanvas.style.pointerEvents = 'none'
      sharedGLCanvas.style.visibility = 'hidden'
      document.body.appendChild(sharedGLCanvas)
    }
  }
  return sharedGLCanvas
}

/**
 * Returns the currently active delegate ('GPU' | 'CPU' | null)
 */
export function getRecognizerDelegate() {
  return recognizerDelegate
}

/**
 * Returns the health, availability, and active status of the recognition engine
 */
export function getRecognizerStatus() {
  if (isPermanentlyFailed) {
    return {
      ready: false,
      error: initializationError?.message || 'MediaPipe initialization failed',
      delegate: null,
      webglSupported: isWebGLSupported()
    }
  }
  if (isEngineErrorState) {
    return {
      ready: false,
      error: 'Recognition paused due to repeated engine errors',
      delegate: recognizerDelegate,
      webglSupported: isWebGLSupported()
    }
  }
  if (recognizerInstance) {
    return {
      ready: true,
      error: null,
      delegate: recognizerDelegate,
      webglSupported: true
    }
  }
  return {
    ready: false,
    error: null,
    delegate: null,
    webglSupported: isWebGLSupported()
  }
}

/**
 * Resets the runtime error counter and paused state (called when restarting camera)
 */
export function resetRecognizerErrorState() {
  consecutiveFrameErrors = 0
  isEngineErrorState = false
}

/**
 * Properly closes and disposes the MediaPipe GestureRecognizer instance.
 * Releases all WebGL context bindings and WebAssembly memory allocations.
 */
export function releaseGestureRecognizer() {
  if (recognizerInstance) {
    try {
      if (typeof recognizerInstance.close === 'function') {
        recognizerInstance.close()
      }
    } catch (err) {
      console.warn('[SignBridge AI] Error closing GestureRecognizer:', err)
    }
    recognizerInstance = null
  }
  recognizerDelegate = null
  initializationPromise = null
  consecutiveFrameErrors = 0
  isEngineErrorState = false
  isPermanentlyFailed = false
  initializationError = null
}

/**
 * Initializes the MediaPipe Gesture Recognizer.
 * - Checks WebGL availability upfront.
 * - If WebGL is unavailable, fails gracefully with an explicit message instead of
 *   creating an unusable CPU instance that crashes on video texture ingestion.
 * - Provides an explicit HTMLCanvasElement to GestureRecognizer options so Emscripten
 *   never queries an undefined canvas target.
 * - Attempts GPU delegate first, falls back to CPU delegate with canvas if GPU fails.
 * - Caches singleton instance and promise.
 */
export async function getOrInitGestureRecognizer() {
  if (recognizerInstance) return recognizerInstance
  if (isPermanentlyFailed) {
    throw initializationError || new Error('MediaPipe initialization permanently failed')
  }
  if (initializationPromise) return initializationPromise

  initializationPromise = (async () => {
    // 1. MediaPipe Tasks Vision requires WebGL for ingest of video frames (GpuBuffer texture binding)
    if (!isWebGLSupported()) {
      const noWebGLErr = new Error('WebGL is unavailable or disabled in this browser. MediaPipe video frame inference requires WebGL.')
      isPermanentlyFailed = true
      initializationError = noWebGLErr
      initializationPromise = null
      console.warn('[SignBridge AI] WebGL unavailable. Disabling neural inference to prevent crashes.')
      throw noWebGLErr
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const localWasmPath = origin ? `${origin}/wasm` : '/wasm'
    const localModelPath = origin ? `${origin}/models/gesture_recognizer.task` : '/models/gesture_recognizer.task'
    const cdnWasmPath = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
    const cdnModelPath = 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task'

    const canvas = getOrCreateSharedGLCanvas()
    if (typeof window !== 'undefined') {
      window.Module = window.Module || {}
      if (canvas) window.Module.canvas = canvas
    }

    // Try GPU first; if GPU shader compile fails, try CPU delegate with canvas
    const delegatesToTry = ['GPU', 'CPU']

    async function tryCreate(wasmPath, modelPath, delegate) {
      const vision = await FilesetResolver.forVisionTasks(wasmPath)
      const options = {
        baseOptions: {
          modelAssetPath: modelPath,
          delegate
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.35,
        minHandPresenceConfidence: 0.35,
        minTrackingConfidence: 0.35
      }
      if (canvas) {
        options.canvas = canvas
      }
      const instance = await GestureRecognizer.createFromOptions(vision, options)
      return instance
    }

    // Attempt local assets first
    for (const delegate of delegatesToTry) {
      try {
        recognizerInstance = await tryCreate(localWasmPath, localModelPath, delegate)
        recognizerDelegate = delegate
        console.log(`[SignBridge AI] Neural GestureRecognizer ready (${delegate} delegate, local assets)`)
        return recognizerInstance
      } catch (err) {
        console.warn(`[SignBridge AI] Local initialization failed for ${delegate} mode:`, err?.message || err)
      }
    }

    // Attempt CDN fallback
    for (const delegate of delegatesToTry) {
      try {
        recognizerInstance = await tryCreate(cdnWasmPath, cdnModelPath, delegate)
        recognizerDelegate = delegate
        console.log(`[SignBridge AI] Neural GestureRecognizer ready (${delegate} delegate, CDN fallback)`)
        return recognizerInstance
      } catch (err) {
        console.warn(`[SignBridge AI] CDN initialization failed for ${delegate} mode:`, err?.message || err)
      }
    }

    // Both local and CDN failed across delegates
    const finalErr = new Error('MediaPipe GestureRecognizer failed to initialize on available delegates')
    isPermanentlyFailed = true
    initializationError = finalErr
    initializationPromise = null
    console.error('[SignBridge AI] Permanent MediaPipe initialization failure:', finalErr)
    throw finalErr
  })()

  return initializationPromise
}

// Map MediaPipe pre-trained neural gesture names to ASL meanings & spoken phrases
const NEURAL_GESTURE_MAP = {
  Open_Palm: {
    name: 'Open_Palm',
    displayName: 'Hello / Greeting ✋',
    speech: 'Hello! How are you?',
    category: 'Greeting'
  },
  Victory: {
    name: 'Victory',
    displayName: 'Peace / Two ✌️',
    speech: 'Peace, or Number Two',
    category: 'Sign'
  },
  ILoveYou: {
    name: 'ILoveYou',
    displayName: 'I Love You (ASL) 🤟',
    speech: 'I love you',
    category: 'Phrase'
  },
  Thumb_Up: {
    name: 'Thumb_Up',
    displayName: 'Yes / Good 👍',
    speech: 'Yes, that sounds good',
    category: 'Response'
  },
  Thumb_Down: {
    name: 'Thumb_Down',
    displayName: 'No / Disagree 👎',
    speech: 'No, I disagree',
    category: 'Response'
  },
  Pointing_Up: {
    name: 'Pointing_Up',
    displayName: 'One / Pointing ☝️',
    speech: 'Number One',
    category: 'Sign'
  },
  Closed_Fist: {
    name: 'Closed_Fist',
    displayName: 'Fist / Letter S ✊',
    speech: 'Letter S or Ready',
    category: 'Alphabet'
  }
}

/**
 * Main Frame Analysis Function
 * Performs inference on a video frame using the initialized MediaPipe GestureRecognizer.
 * Strictly avoids generating fake hand predictions or synthetic landmarks.
 *
 * @param {HTMLVideoElement} videoElement
 * @param {number} timestamp Valid monotonically increasing millisecond timestamp
 * @returns {object|null} Recognition result or null if no hand or engine paused
 */
export function analyzeHandFromVideo(videoElement, timestamp) {
  if (!videoElement || videoElement.readyState < 2 || videoElement.paused || videoElement.ended) {
    return null
  }
  if (!videoElement.videoWidth || !videoElement.videoHeight) {
    return null
  }

  // Do not perform inference if recognizer is not ready, paused, or WebGL is unsupported
  if (isPermanentlyFailed || isEngineErrorState || !recognizerInstance) {
    return null
  }

  try {
    const result = recognizerInstance.recognizeForVideo(videoElement, timestamp)
    consecutiveFrameErrors = 0 // Successful frame resets error counter

    if (result && result.landmarks && result.landmarks.length > 0) {
      const primaryLandmarks = result.landmarks[0]
      const allLandmarks = result.landmarks
      const neuralGesture = result.gestures?.[0]?.[0]

      // Step A: Run scale-invariant geometric ASL classifier (supports 1-hand & 2-hand cooperative signs)
      let classified = classifyHandLandmarks(primaryLandmarks, allLandmarks)

      // Step B: Corroborate with Neural Gesture Recognizer
      if (neuralGesture && neuralGesture.categoryName !== 'None' && neuralGesture.score > 0.48) {
        const mapped = NEURAL_GESTURE_MAP[neuralGesture.categoryName]

        if (!classified && mapped) {
          classified = {
            ...mapped,
            confidence: neuralGesture.score
          }
        } else if (classified && mapped) {
          // Priority override: If neural recognizes ILoveYou with high confidence, prioritize over generic Open_Palm
          if (neuralGesture.categoryName === 'ILoveYou' && neuralGesture.score > 0.72 && classified.name === 'Open_Palm') {
            classified = {
              ...mapped,
              confidence: neuralGesture.score
            }
          } else if (classified.name === mapped.name) {
            classified.confidence = Math.min(0.99, Math.max(classified.confidence, neuralGesture.score) + 0.04)
          }
        }
      }

      return {
        landmarks: primaryLandmarks,
        allLandmarks,
        classified,
        isNeural: true,
        delegate: recognizerDelegate
      }
    }

    // No hands present in frame: return null cleanly
    return null
  } catch (err) {
    consecutiveFrameErrors++
    const now = Date.now()
    if (now - lastLoggedErrorTime > 5000) {
      console.warn(`[SignBridge AI] MediaPipe frame inference error (${consecutiveFrameErrors}):`, err?.message || err)
      lastLoggedErrorTime = now
    }

    // Check for fatal WebAssembly memory trap, WebGL context loss, or activeTexture errors
    const isFatal = err instanceof WebAssembly.RuntimeError ||
      (err?.message && (
        err.message.includes('out of bounds') ||
        err.message.includes('activeTexture') ||
        err.message.includes('webGL') ||
        err.message.includes('deadlock') ||
        err.message.includes('max_queue_size')
      ))

    if (isFatal || consecutiveFrameErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.error('[SignBridge AI] Fatal recognition error encountered. Pausing engine to prevent crashes.', err?.message || err)
      isEngineErrorState = true
      isPermanentlyFailed = true
      initializationError = err
      try {
        if (recognizerInstance && typeof recognizerInstance.close === 'function') {
          recognizerInstance.close()
        }
      } catch {}
      recognizerInstance = null
    }

    return null
  }
}
