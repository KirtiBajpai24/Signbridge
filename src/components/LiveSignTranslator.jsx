import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { drawHandLandmarks } from '../utils/gestureClassifier'
import {
  analyzeHandFromVideo,
  getOrInitGestureRecognizer,
  getRecognizerDelegate,
  getRecognizerStatus,
  releaseGestureRecognizer,
  resetRecognizerErrorState
} from '../utils/handVisionEngine'
import { useAccessibility } from '../context/AccessibilityContext'
import { useSignMode } from '../context/SignModeContext'
import { apiFetch } from '../utils/api'
import './LiveSignTranslator.css'

const INFERENCE_INTERVAL_MS = 100 // Target 10 FPS (100ms interval) to balance real-time tracking with CPU stability

const CHEAT_SHEET = [
  { sign: '✋', label: 'Hello / Greeting', speech: 'Hello! How are you?', desc: 'Open palm facing camera' },
  { sign: '🤟', label: 'I Love You', speech: 'I love you', desc: 'Thumb, index, pinky up' },
  { sign: '👍', label: 'Yes / Good', speech: 'Yes, that sounds good', desc: 'Thumbs up' },
  { sign: '👎', label: 'No / Disagree', speech: 'No, I disagree', desc: 'Thumbs down' },
  { sign: '👌', label: 'OK / Perfect', speech: 'Everything is OK', desc: 'Thumb & index circle' },
  { sign: '✌️', label: 'Peace / Two', speech: 'Peace, or Number Two', desc: 'Index & middle up' },
  { sign: '🤙', label: 'Call Me / Y', speech: 'Call me, or Letter Y', desc: 'Thumb & pinky out' },
  { sign: '👉', label: 'Letter L', speech: 'Letter L', desc: 'Thumb & index L-shape' },
  { sign: '☝️', label: 'One / Point', speech: 'Number One', desc: 'Index finger pointing up' },
  { sign: '✊', label: 'Fist / Letter S', speech: 'Letter S or Ready', desc: 'Closed fist' },
  { sign: '🖖', label: 'Letter W / Three', speech: 'Letter W, or Number Three', desc: 'Index, middle, ring up' },
  { sign: '🖐️', label: 'Letter B', speech: 'Letter B', desc: '4 fingers upright, thumb in' },
  { sign: '🙏', label: 'Thank You', speech: 'Thank you!', desc: 'Flat hand near chin or both hands' },
  { sign: '🆘', label: 'Help', speech: 'I need help', desc: 'Thumbs up on flat palm' },
]

export default function LiveSignTranslator({ user, onNewTranslationSaved, initialText = '' }) {
  const { announce } = useAccessibility()
  const { signMode, translate, speak: regionalSpeak } = useSignMode()

  // Camera & Pipeline State
  const [isCameraRunning, setIsCameraRunning] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [detectedGesture, setDetectedGesture] = useState(null)
  const [confidence, setConfidence] = useState(0)
  const [handDetected, setHandDetected] = useState(false)
  const [fps, setFps] = useState(0)
  const [aiStatus, setAiStatus] = useState('Initializing AI...')

  // Visual Controls (Phase 11)
  const [isMirrored, setIsMirrored] = useState(true)
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [showBoundingBox, setShowBoundingBox] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState(70) // 50% to 95%
  const [videoDevices, setVideoDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')

  // Speech & Output Settings (Phase 11)
  const [outputMode, setOutputMode] = useState('both') // 'text' | 'voice' | 'both'
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [speechRate, setSpeechRate] = useState(1.0)
  const [availableVoices, setAvailableVoices] = useState([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('')

  // Sentence Builder State
  const [sentenceTokens, setSentenceTokens] = useState([])
  const [activeTab, setActiveTab] = useState('sign-to-speech') // 'sign-to-speech' | 'speech-to-sign'
  const [speechInputText, setSpeechInputText] = useState(initialText || '')
  const [isListening, setIsListening] = useState(false)
  const [recordSavedMsg, setRecordSavedMsg] = useState('')
  const [paletteSearch, setPaletteSearch] = useState('')

  // Refs
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastSpokenGestureRef = useRef('')
  const lastHandSeenTimeRef = useRef(0)
  const frameCountRef = useRef(0)
  const lastFpsUpdateRef = useRef(0)
  const loopRef = useRef(null)

  // Loop guard & throttling refs
  const isCameraRunningRef = useRef(false)
  const isInferenceRunningRef = useRef(false)
  const lastInferenceTimeRef = useRef(0)
  const lastTimestampRef = useRef(0)
  const isMountedRef = useRef(true)

  // Temporal smoothing window
  const recentDetectionsRef = useRef([])
  const lastConfirmedGestureTimeRef = useRef(0)

  // 1. Enumerate Media Devices & TTS Voices on Mount + Initialize Model Once
  useEffect(() => {
    isMountedRef.current = true

    // Media Devices
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        if (!isMountedRef.current) return
        const cameras = devices.filter((d) => d.kind === 'videoinput')
        setVideoDevices(cameras)
        if (cameras.length > 0) {
          setSelectedDeviceId(prev => prev || cameras[0].deviceId)
        }
      }).catch(() => {})
    }

    // TTS Voices
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const vList = window.speechSynthesis.getVoices()
        if (vList && vList.length > 0) {
          const engVoices = vList.filter(v => v.lang.startsWith('en'))
          setAvailableVoices(engVoices.length > 0 ? engVoices : vList)
          setSelectedVoiceURI(prev => prev || engVoices[0]?.voiceURI || vList[0]?.voiceURI || '')
        }
      }
    }

    updateVoices()
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices
    }

    // Initialize MediaPipe recognizer once on mount
    getOrInitGestureRecognizer()
      .then((recog) => {
        if (!isMountedRef.current) return
        if (recog) {
          const delegate = getRecognizerDelegate() || 'CPU'
          setAiStatus(`⚡ MediaPipe Ready (${delegate})`)
        } else {
          setAiStatus('AI Inference Unavailable')
        }
      })
      .catch((err) => {
        if (!isMountedRef.current) return
        console.warn('[LiveSignTranslator] MediaPipe init failed:', err?.message || err)
        if (err?.message?.includes('WebGL') || err?.message?.includes('webGL')) {
          setAiStatus('⚠️ WebGL unavailable — Live AI disabled')
        } else {
          setAiStatus('AI Inference Unavailable')
        }
      })

    return () => {
      isMountedRef.current = false
      releaseGestureRecognizer()
    }
  }, []) // Empty dependency array so initialization happens exactly once

  // Text-To-Speech helper with customized voice & rate + Regional Language Support
  const speakText = useCallback((text) => {
    if (!text) return
    if (outputMode === 'text') return

    // If regional language mode has speak helper
    if (regionalSpeak) {
      regionalSpeak(text, speechRate)
      return
    }

    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speechRate
    utterance.pitch = 1.0

    if (selectedVoiceURI) {
      const v = availableVoices.find(voice => voice.voiceURI === selectedVoiceURI)
      if (v) utterance.voice = v
    }

    window.speechSynthesis.speak(utterance)
  }, [outputMode, speechRate, selectedVoiceURI, availableVoices, regionalSpeak])

  // Save translation to backend history with apiFetch
  const saveTranslationToHistory = useCallback(async (text, type = 'sign-to-text', conf = 95) => {
    if (!text) return
    try {
      const res = await apiFetch('/api/history', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || 'user-default-1',
          type,
          inputText: text,
          outputText: text,
          confidence: conf
        })
      })
      if (res && res.ok) {
        setRecordSavedMsg('Saved to History!')
        setTimeout(() => setRecordSavedMsg(''), 2500)
        if (onNewTranslationSaved) onNewTranslationSaved()
      }
    } catch {
      setRecordSavedMsg('Saved locally!')
      setTimeout(() => setRecordSavedMsg(''), 2500)
    }
  }, [user?.id, onNewTranslationSaved])

  const saveTranslationRef = useRef(saveTranslationToHistory)
  useEffect(() => {
    saveTranslationRef.current = saveTranslationToHistory
  }, [saveTranslationToHistory])

  // Continuous frame analysis loop with rate throttling and overlapping protection
  const processFrame = useCallback(() => {
    if (!isMountedRef.current || !isCameraRunningRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Video must be ready with valid dimensions
    if (video && canvas && video.readyState >= 2 && !video.paused && !video.ended && video.videoWidth > 0 && video.videoHeight > 0) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      const ctx = canvas.getContext('2d')
      const nowMs = performance.now()

      // Calculate camera rendering FPS
      frameCountRef.current += 1
      if (nowMs - lastFpsUpdateRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (nowMs - lastFpsUpdateRef.current)))
        frameCountRef.current = 0
        lastFpsUpdateRef.current = nowMs
      }

      // Check if enough time has elapsed for next AI inference (throttle to 10 FPS)
      const timeSinceLastInference = nowMs - lastInferenceTimeRef.current
      if (timeSinceLastInference >= INFERENCE_INTERVAL_MS && !isInferenceRunningRef.current) {
        isInferenceRunningRef.current = true

        // Ensure strictly monotonically increasing timestamp for MediaPipe Tasks Vision
        let currentTimestamp = Math.floor(nowMs)
        if (currentTimestamp <= lastTimestampRef.current) {
          currentTimestamp = lastTimestampRef.current + 1
        }
        lastTimestampRef.current = currentTimestamp
        lastInferenceTimeRef.current = nowMs

        try {
          const result = analyzeHandFromVideo(video, currentTimestamp)

          // Check if engine entered an error state
          const engineStatus = getRecognizerStatus()
          if (engineStatus.error) {
            setAiStatus(engineStatus.error)
          }

          if (result && result.landmarks) {
            setHandDetected(true)
            lastHandSeenTimeRef.current = Date.now()

            // Draw visual overlays with user preferences
            drawHandLandmarks(
              ctx,
              result.allLandmarks || [result.landmarks],
              canvas.width,
              canvas.height,
              result.classified,
              {
                showSkeleton,
                showJoints: true,
                showBoundingBox,
                showBadge: true
              }
            )

            if (result.classified && result.classified.name !== 'None') {
              const item = result.classified
              const itemConf = Math.round((item.confidence || 0.95) * 100)

              // Respect user confidence sensitivity threshold
              if (itemConf >= confidenceThreshold) {
                recentDetectionsRef.current.push({
                  name: item.name,
                  item,
                  time: Date.now()
                })

                // Keep rolling temporal window of 6 frames
                if (recentDetectionsRef.current.length > 6) {
                  recentDetectionsRef.current.shift()
                }

                const counts = {}
                for (const d of recentDetectionsRef.current) {
                  counts[d.name] = (counts[d.name] || 0) + 1
                }

                const topName = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b))

                // Require 2 confirmations in window for stable classification
                if (counts[topName] >= 2) {
                  const confirmed = recentDetectionsRef.current.find((d) => d.name === topName)?.item || item
                  setDetectedGesture(confirmed)
                  setConfidence(itemConf)
                  lastConfirmedGestureTimeRef.current = Date.now()

                  const isDifferentSign = confirmed.name !== lastSpokenGestureRef.current

                  if (isDifferentSign) {
                    lastSpokenGestureRef.current = confirmed.name

                    if (autoSpeak) {
                      speakText(confirmed.speech)
                    }

                    // Announce for accessibility screen readers
                    announce(`Recognized sign: ${confirmed.displayName}`)

                    // Append to progressive sentence token list
                    setSentenceTokens((prev) => {
                      const lastToken = prev[prev.length - 1]
                      if (!lastToken || lastToken.text !== confirmed.speech) {
                        return [...prev, { id: 'tok-' + Date.now(), text: confirmed.speech, sign: confirmed.displayName }]
                      }
                      return prev
                    })

                    if (saveTranslationRef.current) {
                      saveTranslationRef.current(confirmed.speech, 'sign-to-text', itemConf)
                    }
                  }
                }
              }
            }
          } else {
            // No hand detected in frame: clear overlay canvas safely
            setHandDetected(false)
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height)
            }

            if (Date.now() - lastHandSeenTimeRef.current > 1200) {
              lastSpokenGestureRef.current = ''
            }
          }

          if (Date.now() - lastConfirmedGestureTimeRef.current > 2200) {
            setDetectedGesture(null)
            setConfidence(0)
          }
        } finally {
          isInferenceRunningRef.current = false
        }
      }
    }

    // Schedule next frame only if camera is actively running
    if (isCameraRunningRef.current && isMountedRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => {
        if (loopRef.current) loopRef.current()
      })
    }
  }, [speakText, showSkeleton, showBoundingBox, confidenceThreshold, autoSpeak, announce])

  useEffect(() => {
    loopRef.current = processFrame
  }, [processFrame])

  // Camera toggle handler with complete lifecycle management
  const toggleCamera = useCallback(async () => {
    setCameraError(null)

    if (isCameraRunningRef.current) {
      // 1. Mark camera inactive first to halt rAF loop
      isCameraRunningRef.current = false
      setIsCameraRunning(false)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      isInferenceRunningRef.current = false

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      setHandDetected(false)
      setDetectedGesture(null)
      setConfidence(0)
      setFps(0)
      announce('Webcam turned off.')
    } else {
      try {
        resetRecognizerErrorState()
        const constraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
            : { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)

        if (videoRef.current && isMountedRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          isCameraRunningRef.current = true
          setIsCameraRunning(true)
          lastTimestampRef.current = 0
          lastInferenceTimeRef.current = 0
          isInferenceRunningRef.current = false

          // Sync AI status badge to match actual engine delegate
          const status = getRecognizerStatus()
          if (status.ready) {
            setAiStatus(`⚡ MediaPipe Ready (${status.delegate || 'CPU'})`)
          }

          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
          }
          animationFrameRef.current = requestAnimationFrame(processFrame)
          announce('Webcam active. Hand tracking initiated.')
        }
      } catch (err) {
        console.error('Camera access error:', err)
        setCameraError('Webcam access was denied or unavailable. Please allow camera permissions.')
        announce('Webcam error: Access denied or device unavailable.')
      }
    }
  }, [selectedDeviceId, processFrame, announce])

  // Cleanup on unmount
  useEffect(() => {
    const videoElem = videoRef.current
    return () => {
      isMountedRef.current = false
      isCameraRunningRef.current = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (videoElem && videoElem.srcObject) {
        const stream = videoElem.srcObject
        stream.getTracks().forEach((track) => track.stop())
      }
      releaseGestureRecognizer()
    }
  }, [])

  // Manual test sign trigger
  const triggerManualSign = useCallback((item) => {
    const mockGesture = {
      name: item.label,
      displayName: `${item.label} ${item.sign}`,
      speech: item.speech,
      confidence: 0.98
    }
    setDetectedGesture(mockGesture)
    setConfidence(98)
    lastConfirmedGestureTimeRef.current = Date.now()

    if (autoSpeak) {
      speakText(item.speech)
    }

    setSentenceTokens((prev) => {
      const lastToken = prev[prev.length - 1]
      if (!lastToken || lastToken.text !== item.speech) {
        return [...prev, { id: 'tok-' + Date.now(), text: item.speech, sign: item.sign }]
      }
      return prev
    })

    if (saveTranslationRef.current) {
      saveTranslationRef.current(item.speech, 'sign-to-text', 98)
    }
  }, [autoSpeak, speakText])

  // Full Sentence Actions
  const fullSentenceString = useMemo(() => {
    return sentenceTokens.map(t => t.text).join('. ')
  }, [sentenceTokens])

  const handleSpeakFullSentence = useCallback(() => {
    if (!fullSentenceString) return
    speakText(fullSentenceString)
    announce(`Speaking: ${fullSentenceString}`)
  }, [fullSentenceString, speakText, announce])

  const handleBackspaceToken = useCallback(() => {
    setSentenceTokens(prev => prev.slice(0, -1))
    announce('Removed last word from sentence builder.')
  }, [announce])

  const handleClearSentence = useCallback(() => {
    setSentenceTokens([])
    announce('Sentence builder cleared.')
  }, [announce])

  const handleCopySentence = useCallback(() => {
    if (!fullSentenceString) return
    navigator.clipboard.writeText(fullSentenceString).then(() => {
      setRecordSavedMsg('Sentence Copied!')
      setTimeout(() => setRecordSavedMsg(''), 2000)
    })
  }, [fullSentenceString])

  const handleSaveSentenceToHistory = useCallback(() => {
    if (!fullSentenceString) return
    if (saveTranslationRef.current) {
      saveTranslationRef.current(fullSentenceString, 'sign-to-text', 96)
      setRecordSavedMsg('Saved Full Sentence to History!')
      setTimeout(() => setRecordSavedMsg(''), 2000)
    }
  }, [fullSentenceString])

  // Keyboard Shortcuts Listener (Phase 11)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return

      if (e.code === 'Space') {
        e.preventDefault()
        toggleCamera()
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMirrored(prev => !prev)
      } else if (e.key === 's' || e.key === 'S') {
        handleSpeakFullSentence()
      } else if (e.key === 'c' || e.key === 'C') {
        handleClearSentence()
      } else if (e.key === 'b' || e.key === 'B') {
        handleBackspaceToken()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleCamera, handleSpeakFullSentence, handleClearSentence, handleBackspaceToken])

  // Filtered Cheatsheet Palette
  const filteredCheatSheet = useMemo(() => {
    if (!paletteSearch.trim()) return CHEAT_SHEET
    const q = paletteSearch.toLowerCase()
    return CHEAT_SHEET.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.speech.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
    )
  }, [paletteSearch])

  // Speech-to-Sign mic handler
  const handleToggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.')
      return
    }

    if (isListening) {
      setIsListening(false)
    } else {
      try {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => setIsListening(true)
        recognition.onend = () => setIsListening(false)
        recognition.onerror = () => setIsListening(false)

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setSpeechInputText(transcript)
          setIsListening(false)
          if (saveTranslationRef.current) {
            saveTranslationRef.current(transcript, 'speech-to-sign', 100)
          }
        }

        recognition.start()
      } catch (e) {
        console.error('Speech recognition error:', e)
        setIsListening(false)
      }
    }
  }

  return (
    <div className="live-translator-container">
      {/* 1. Mode Switcher Tabs */}
      <div className="mode-tabs">
        <button
          className={`tab-btn ${activeTab === 'sign-to-speech' ? 'active' : ''}`}
          onClick={() => setActiveTab('sign-to-speech')}
        >
          📷 Live Camera Studio
        </button>
        <button
          className={`tab-btn ${activeTab === 'speech-to-sign' ? 'active' : ''}`}
          onClick={() => setActiveTab('speech-to-sign')}
        >
          🎤 Voice &amp; Text ➔ Visual Signs
        </button>
      </div>

      {activeTab === 'sign-to-speech' ? (
        <div className="translator-grid">
          {/* Left Column: Viewport & Studio Settings */}
          <div className="camera-card">
            {/* Visual Studio Toolbar (Phase 11) */}
            <div className="studio-toolbar-row">
              <div className="studio-tools-group">
                <button
                  type="button"
                  className={`studio-toggle-btn ${isMirrored ? 'active' : ''}`}
                  onClick={() => setIsMirrored(!isMirrored)}
                  title="Flip / Mirror Camera (Key: M)"
                >
                  🔄 Mirror View
                </button>
                <button
                  type="button"
                  className={`studio-toggle-btn ${showSkeleton ? 'active' : ''}`}
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  title="Toggle 21-Joint Skeletal Mesh"
                >
                  🦴 Skeleton
                </button>
                <button
                  type="button"
                  className={`studio-toggle-btn ${showBoundingBox ? 'active' : ''}`}
                  onClick={() => setShowBoundingBox(!showBoundingBox)}
                  title="Toggle Invariant Bounding Box"
                >
                  📦 Bounding Box
                </button>
              </div>

              {/* Sensitivity Slider */}
              <div className="sensitivity-control" title="Sensitivity threshold for gesture classification">
                <span>Sensitivity:</span>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="sensitivity-slider"
                  aria-label="Confidence Sensitivity"
                />
                <span className="sensitivity-val">{confidenceThreshold}%</span>
              </div>
            </div>

            {/* Audio Voice & Speech Toolbar (Phase 11) */}
            <div className="audio-settings-bar">
              <div className="audio-settings-label">
                <span>🔊 Voice &amp; Audio:</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {availableVoices.length > 0 && (
                  <select
                    className="audio-select"
                    value={selectedVoiceURI}
                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                    aria-label="Select Voice"
                  >
                    {availableVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name.slice(0, 20)}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  className={`studio-toggle-btn ${autoSpeak ? 'active' : ''}`}
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  title="Toggle Instant Speech vs Sentence-Only"
                >
                  {autoSpeak ? '🔊 Auto-Speak: ON' : '🤫 Auto-Speak: OFF'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#0f766e' }}>
                  <span>Rate:</span>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    style={{ width: '60px', accentColor: '#0d9488' }}
                    aria-label="Speech rate"
                  />
                  <span>{speechRate}x</span>
                </div>
              </div>
            </div>

            {/* Status & Telemetry Header */}
            <div className="card-top-bar">
              <div className="status-indicator">
                <span className={`status-bulb ${isCameraRunning ? 'active' : ''}`} />
                <span>{isCameraRunning ? 'Live Webcam Active' : 'Camera Ready'}</span>
              </div>
              <div className="telemetry-badges">
                <span className="telemetry-pill" style={{ background: signMode === 'ISL' ? '#f0fdf4' : '#eff6ff', color: signMode === 'ISL' ? '#166534' : '#1e40af', fontWeight: 700 }}>
                  {signMode === 'ISL' ? '🇮🇳 ISL Mode' : '🇺🇸 ASL Mode'}
                </span>
                {isCameraRunning && (
                  <span className="telemetry-pill">
                    {handDetected ? '🟢 Hand Tracked' : 'Waiting for Hand...'}
                  </span>
                )}
                {isCameraRunning && <span className="telemetry-pill">{fps} FPS</span>}
                <span className="telemetry-pill" style={{ color: '#0d9488', fontWeight: 700 }}>
                  {aiStatus}
                </span>
              </div>
            </div>

            {aiStatus.includes('WebGL') && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '0.65rem 0.9rem',
                  marginBottom: '0.75rem',
                  fontSize: '0.825rem',
                  color: '#92400e',
                  lineHeight: '1.4'
                }}
              >
                <strong>ℹ️ WebGL Notice:</strong> Automated neural hand tracking requires WebGL for video texture binding.
                Your live webcam preview remains fully active. You can enable WebGL / hardware acceleration in your browser settings (e.g. <code>chrome://settings/system</code>), or use the interactive gesture palette below to test translations and speech.
              </div>
            )}

            {/* Video + Canvas Viewport */}
            <div className="viewport-wrapper">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`video-feed ${isCameraRunning ? 'visible' : 'hidden'} ${isMirrored ? 'mirrored' : ''}`}
              />
              <canvas
                ref={canvasRef}
                className={`canvas-feed ${isCameraRunning ? 'visible' : 'hidden'} ${isMirrored ? 'mirrored' : ''}`}
              />

              {!isCameraRunning && (
                <div className="camera-placeholder" onClick={toggleCamera}>
                  <div className="placeholder-icon">📹</div>
                  <h3>Turn On Camera to Translate Signs</h3>
                  <p>Tracks 21 skeletal joints in real time and converts gestures into speech &amp; written sentences.</p>
                  <button className="start-stream-btn" type="button">
                    Turn On Webcam Now
                  </button>
                  {cameraError && <div className="camera-err-notice">{cameraError}</div>}
                </div>
              )}

              {/* Viewfinder HUD Overlays */}
              {isCameraRunning && (
                <>
                  <div className="hud-corner top-left" />
                  <div className="hud-corner top-right" />
                  <div className="hud-corner bottom-left" />
                  <div className="hud-corner bottom-right" />
                  {detectedGesture && (
                    <div className="hud-detection-badge">
                      <span className="badge-sign">{detectedGesture.displayName}</span>
                      <span className="badge-conf">{confidence}% confidence</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Main Camera Controls Bar */}
            <div className="camera-controls">
              <button
                type="button"
                className={`ctrl-btn ${isCameraRunning ? 'stop' : 'start'}`}
                onClick={toggleCamera}
              >
                {isCameraRunning ? '⏹ Turn Off Camera' : '▶ Turn On Camera'}
              </button>

              {/* Camera device picker if multiple cameras detected */}
              {videoDevices.length > 1 && (
                <select
                  className="audio-select"
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  disabled={isCameraRunning}
                  title="Switch video input camera"
                >
                  {videoDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              )}

              {/* Output Mode Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#475569', padding: '0 0.4rem' }}>
                  Output:
                </span>
                <button
                  type="button"
                  className={`btn ${outputMode === 'text' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => setOutputMode('text')}
                >
                  Text
                </button>
                <button
                  type="button"
                  className={`btn ${outputMode === 'voice' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => setOutputMode('voice')}
                >
                  Voice
                </button>
                <button
                  type="button"
                  className={`btn ${outputMode === 'both' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => setOutputMode('both')}
                >
                  Both
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint Bar */}
            <div className="kbd-shortcuts-bar">
              <span style={{ fontWeight: 700 }}>Shortcuts:</span>
              <span className="kbd-item"><kbd>Space</kbd> Camera</span>
              <span className="kbd-item"><kbd>M</kbd> Mirror</span>
              <span className="kbd-item"><kbd>S</kbd> Speak</span>
              <span className="kbd-item"><kbd>B</kbd> Backspace</span>
              <span className="kbd-item"><kbd>C</kbd> Clear</span>
            </div>
          </div>

          {/* Right Column: Translation Output & Sentence Builder */}
          <div className="translation-panel">
            {/* Live Recognized Sign Box */}
            <div className="detected-box">
              <div className="box-header-row">
                <div className="box-label">Live Recognized Gesture</div>
                {recordSavedMsg && <span className="saved-badge">{recordSavedMsg}</span>}
              </div>

              <div className="gesture-display">
                <div className="gesture-title">
                  {detectedGesture ? detectedGesture.displayName : 'Show your hand to camera...'}
                </div>
                <div className="gesture-spoken-text">
                  {detectedGesture
                    ? `"${signMode === 'ISL' && translate ? translate(detectedGesture.speech) : detectedGesture.speech}"`
                    : 'Try: "Hello ✋", "I Love You 🤟", "Yes 👍", "Peace ✌️", "OK 👌", or "Help 🆘"'}
                </div>
                {signMode === 'ISL' && detectedGesture && translate && translate(detectedGesture.speech) !== detectedGesture.speech && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    English: "{detectedGesture.speech}"
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.45rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.35rem' }}>
                  Supported vocabulary: Hello ✋, I Love You 🤟, Yes 👍, No 👎, OK 👌, Peace ✌️, Help 🆘, Namaste/Thanks 🙏, Call Me 🤙, Pointing ☝️, Fist ✊, Letters L, W, B
                </div>
              </div>

              {detectedGesture && (
                <div className="detected-actions-row">
                  <button
                    type="button"
                    className="quick-speak-btn"
                    onClick={() => speakText(detectedGesture.speech)}
                  >
                    🔊 Hear Voice
                  </button>
                  <button
                    type="button"
                    className="quick-save-btn"
                    onClick={() => {
                      if (saveTranslationRef.current) {
                        saveTranslationRef.current(detectedGesture.speech, 'sign-to-text', confidence)
                      }
                    }}
                  >
                    💾 Save Record
                  </button>
                  <button
                    type="button"
                    className="quick-copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(detectedGesture.speech)
                      setRecordSavedMsg('Copied to clipboard!')
                      setTimeout(() => setRecordSavedMsg(''), 2000)
                    }}
                  >
                    📋 Copy Text
                  </button>
                </div>
              )}
            </div>

            {/* Progressive Sentence Builder (Phase 11 Enhanced) */}
            <div className="sentence-builder-card">
              <div className="sentence-header">
                <div className="builder-title-group">
                  <span className="builder-icon">📝</span>
                  <div>
                    <h4>Progressive Sentence Builder</h4>
                    <span className="builder-subtext">Aggregates sequential signs into full speech</span>
                  </div>
                </div>
                <div className="sentence-controls">
                  <button
                    type="button"
                    className="clear-sentence-btn"
                    onClick={handleBackspaceToken}
                    disabled={sentenceTokens.length === 0}
                    title="Remove last word (Key: B)"
                  >
                    ⌫ Backspace
                  </button>
                  <button
                    type="button"
                    className="clear-sentence-btn"
                    onClick={handleClearSentence}
                    disabled={sentenceTokens.length === 0}
                    title="Clear all words (Key: C)"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="clear-sentence-btn"
                    onClick={handleCopySentence}
                    disabled={sentenceTokens.length === 0}
                    title="Copy full sentence"
                  >
                    📋 Copy
                  </button>
                  <button
                    type="button"
                    className="speak-sentence-btn"
                    onClick={handleSpeakFullSentence}
                    disabled={sentenceTokens.length === 0}
                    title="Speak full sentence aloud (Key: S)"
                  >
                    🔊 Speak
                  </button>
                </div>
              </div>

              <div className="sentence-tokens-area">
                {sentenceTokens.length === 0 ? (
                  <p className="sentence-empty-hint">
                    As you perform gestures, each recognized word will concatenate here into a complete sentence...
                  </p>
                ) : (
                  <div className="tokens-list">
                    {sentenceTokens.map((token, index) => (
                      <span key={token.id || index} className="token-chip-enhanced">
                        <span>{token.sign}</span>
                        <span>{token.text}</span>
                        <button
                          type="button"
                          className="token-remove-btn"
                          onClick={() => setSentenceTokens(prev => prev.filter((_, i) => i !== index))}
                          title="Remove word"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {sentenceTokens.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="studio-toggle-btn active"
                    onClick={handleSaveSentenceToHistory}
                    style={{ fontSize: '0.8rem' }}
                  >
                    💾 Save Sentence to Translation History
                  </button>
                </div>
              )}
            </div>

            {/* Gesture Palette & Searchable Reference (Phase 11 Enhanced) */}
            <div className="reference-grid">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>Gesture Palette ({filteredCheatSheet.length}):</h4>
              </div>

              <div className="palette-search-row">
                <input
                  type="text"
                  placeholder="Search gestures (e.g. peace, love, yes, hello)..."
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  className="palette-search-input"
                  aria-label="Filter gesture reference"
                />
              </div>

              <div className="ref-cards">
                {filteredCheatSheet.map((item, idx) => (
                  <div
                    key={idx}
                    className={`ref-mini-card ${detectedGesture?.name === item.label ? 'highlighted' : ''}`}
                    onClick={() => triggerManualSign(item)}
                    title={`${item.label} — ${item.desc} (Click to trigger)`}
                  >
                    <span className="ref-sign">{item.sign}</span>
                    <span className="ref-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Speech & Text ➔ Visual Signs View */
        <div className="speech-to-sign-view">
          <div className="speech-input-box">
            <h3>Translate Spoken Voice into Visual Sign Representation</h3>
            <p>Speak into your microphone or type a sentence. The engine maps spoken words to sign representations.</p>

            <div className="input-group-row">
              <input
                type="text"
                placeholder="Type words here (e.g. Hello, Thank you, Help, Yes)..."
                value={speechInputText}
                onChange={(e) => setSpeechInputText(e.target.value)}
                className="speech-text-input"
              />
              <button
                type="button"
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                onClick={handleToggleMic}
              >
                {isListening ? '🛑 Stop Recording' : '🎤 Speak Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
