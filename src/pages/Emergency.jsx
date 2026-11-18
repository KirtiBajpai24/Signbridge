import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAccessibility } from '../context/AccessibilityContext'
import { apiFetch } from '../utils/api'
import './Pages.css'

const EMERGENCY_ITEMS = [
  { id: 'help', label: 'HELP ME', speech: 'Help me! I need assistance immediately.', icon: '🆘', color: '#dc2626' },
  { id: 'ambulance', label: 'CALL AMBULANCE', speech: 'Please call an ambulance right away. Medical emergency.', icon: '🚑', color: '#b91c1c' },
  { id: 'medical', label: 'MEDICAL EMERGENCY', speech: 'I have a critical medical emergency. Please help.', icon: '🏥', color: '#991b1b' },
  { id: 'danger', label: 'I AM IN DANGER', speech: 'I am in immediate danger. Please assist.', icon: '⚠️', color: '#c2410c' },
  { id: 'police', label: 'CALL POLICE', speech: 'Please call the police immediately.', icon: '🚓', color: '#1d4ed8' },
  { id: 'cant_hear', label: "I CAN'T HEAR / DEAF", speech: 'I am Deaf and cannot hear you. Please write or use this screen.', icon: '🧏', color: '#4338ca' },
  { id: 'lost', label: 'I AM LOST', speech: 'I am lost and need directions or help reaching my contact.', icon: '📍', color: '#d97706' },
  { id: 'medication', label: 'NEED MEDICATION', speech: 'I urgently need access to my prescribed medication.', icon: '💊', color: '#059669' }
]

const LOCAL_EMERGENCY_KEY = 'signbridge_emergency_profile'

export default function Emergency() {
  const { user } = useAuth()
  const { announce } = useAccessibility()
  const [activeBroadcast, setActiveBroadcast] = useState(null)
  const [isLooping, setIsLooping] = useState(false)
  const [isBeaconActive, setIsBeaconActive] = useState(false)
  const [activeTab, setActiveTab] = useState('sos') // 'sos' | 'medical' | 'contacts'

  // Emergency Profile State
  const [medicalProfile, setMedicalProfile] = useState({
    bloodGroup: 'O+',
    allergies: 'Penicillin (Severe)',
    conditions: 'Deaf / Non-verbal / Uses Sign Language',
    iceName: 'Emergency Contact (Family)',
    icePhone: '+91 98765 43210',
    iceRelation: 'Immediate Family',
    emergencyNotes: 'Carry epinephrine pen in backpack. Please communicate with text notes.'
  })
  const [isEditingMedical, setIsEditingMedical] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  const loopTimerRef = useRef(null)

  // Load profile from backend or localStorage
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiFetch(`/api/emergency/profile?userId=${user?.id || 'user-default-1'}`)
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setMedicalProfile((prev) => ({ ...prev, ...data.profile }))
            return
          }
        }
      } catch {
        // Fallback to local storage
      }
      try {
        const saved = localStorage.getItem(LOCAL_EMERGENCY_KEY)
        if (saved) {
          setMedicalProfile(JSON.parse(saved))
        }
      } catch {
        // use default
      }
    }
    loadProfile()
  }, [user])

  // Broadcast Audio Handler
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.05
      utterance.volume = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleBroadcast = (item) => {
    setActiveBroadcast(item)
    speakText(item.speech)
    announce(`Emergency broadcast: ${item.label}`)
  }

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsLooping(false)
    if (loopTimerRef.current) {
      clearInterval(loopTimerRef.current)
      loopTimerRef.current = null
    }
  }

  // Audio Loop Management
  useEffect(() => {
    if (isLooping && activeBroadcast) {
      speakText(activeBroadcast.speech)
      loopTimerRef.current = setInterval(() => {
        speakText(activeBroadcast.speech)
      }, 4500)
    } else {
      if (loopTimerRef.current) {
        clearInterval(loopTimerRef.current)
        loopTimerRef.current = null
      }
    }
    return () => {
      if (loopTimerRef.current) clearInterval(loopTimerRef.current)
    }
  }, [isLooping, activeBroadcast])

  const handleSaveMedical = async () => {
    try {
      localStorage.setItem(LOCAL_EMERGENCY_KEY, JSON.stringify(medicalProfile))
      await apiFetch('/api/emergency/profile', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || 'user-default-1',
          profile: medicalProfile
        })
      })
      setSaveStatus('Medical ID Saved Successfully!')
      announce('Emergency Medical ID and Contacts saved.')
      setIsEditingMedical(false)
      setTimeout(() => setSaveStatus(''), 2500)
    } catch {
      setSaveStatus('Saved locally!')
      setIsEditingMedical(false)
      setTimeout(() => setSaveStatus(''), 2500)
    }
  }

  return (
    <div className={`page-container ${isBeaconActive ? 'emergency-strobe-bg' : ''}`} style={{ maxWidth: '1080px' }}>
      <div className="page-header">
        <span className="section-pill" style={{ background: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}>
          Critical Mode • Life Safety
        </span>
        <h1 className="page-title" style={{ color: '#b91c1c' }}>🚨 Emergency Communication Mode</h1>
        <p className="page-lead">
          High-visibility distress broadcast cards, accessible medical emergency ID, and instant audio alerts
          for Deaf and non-verbal individuals during urgent situations.
        </p>
      </div>

      {/* Fast Dial & Visual Beacon Action Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #fee2e2',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.06)'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href="tel:911"
            className="btn"
            style={{ background: '#dc2626', color: '#ffffff', fontWeight: 800, padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
          >
            📞 Call 911 (US/Canada)
          </a>
          <a
            href="tel:112"
            className="btn"
            style={{ background: '#b91c1c', color: '#ffffff', fontWeight: 800, padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
          >
            🌍 Call 112 (EU/Global)
          </a>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setIsBeaconActive(!isBeaconActive)
              announce(isBeaconActive ? 'Visual beacon stopped' : 'Visual beacon flashing activated')
            }}
            style={{
              background: isBeaconActive ? '#fef08a' : '#f8fafc',
              border: isBeaconActive ? '2px solid #eab308' : '1px solid #cbd5e1',
              color: isBeaconActive ? '#713f12' : '#334155',
              fontWeight: 800,
              padding: '0.65rem 1.25rem'
            }}
          >
            {isBeaconActive ? '⚠️ Stop Visual Strobe Beacon' : '🚨 Activate Visual Strobe Beacon'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        background: '#f1f5f9',
        padding: '0.4rem',
        borderRadius: '12px',
        width: 'fit-content',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('sos')}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: '9px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'sos' ? '#ffffff' : 'transparent',
            color: activeTab === 'sos' ? '#dc2626' : '#64748b',
            boxShadow: activeTab === 'sos' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          🚨 Distress Broadcast Cards
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('medical')}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: '9px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'medical' ? '#ffffff' : 'transparent',
            color: activeTab === 'medical' ? '#dc2626' : '#64748b',
            boxShadow: activeTab === 'medical' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          🏥 Medical Emergency ID
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contacts')}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: '9px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'contacts' ? '#ffffff' : 'transparent',
            color: activeTab === 'contacts' ? '#dc2626' : '#64748b',
            boxShadow: activeTab === 'contacts' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          👥 In-Case-of-Emergency (ICE) Contacts
        </button>
      </div>

      {/* Tab 1: Distress Cards */}
      {activeTab === 'sos' && (
        <div>
          {/* Active Broadcast Large Display */}
          {activeBroadcast && (
            <div style={{
              background: activeBroadcast.color,
              color: '#ffffff',
              borderRadius: '20px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              marginBottom: '2.5rem',
              boxShadow: '0 12px 32px rgba(220, 38, 38, 0.3)',
              animation: 'pulse 1.5s infinite alternate'
            }}>
              <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}>{activeBroadcast.icon}</div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                {activeBroadcast.label}
              </h2>
              <p style={{ fontSize: '1.4rem', fontWeight: 600, opacity: 0.95, margin: '0 0 1.5rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
                &ldquo;{activeBroadcast.speech}&rdquo;
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleBroadcast(activeBroadcast)}
                  style={{ background: '#ffffff', color: activeBroadcast.color, border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
                >
                  🔊 Broadcast Once
                </button>
                <button
                  type="button"
                  onClick={() => setIsLooping(!isLooping)}
                  style={{
                    background: isLooping ? '#fee2e2' : 'rgba(255,255,255,0.2)',
                    color: isLooping ? '#b91c1c' : '#ffffff',
                    border: '1px solid rgba(255,255,255,0.6)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  {isLooping ? '🔁 Looping Audio (Active)' : '🔁 Repeat Audio Loop'}
                </button>
                <button
                  type="button"
                  onClick={handleStopAudio}
                  style={{ background: 'rgba(0,0,0,0.5)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
                >
                  ⏹️ Silence Audio
                </button>
              </div>
            </div>
          )}

          {/* Distress Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {EMERGENCY_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleBroadcast(item)}
                style={{
                  background: '#ffffff',
                  border: `2px solid ${item.color}`,
                  borderRadius: '16px',
                  padding: '1.75rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)'
                }}
              >
                <span style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{item.icon}</span>
                <strong style={{ fontSize: '1.2rem', fontWeight: 900, color: item.color, marginBottom: '0.4rem' }}>
                  {item.label}
                </strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Tap to speak loudly & display
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Medical ID Card */}
      {activeTab === 'medical' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                🏥 Personal Medical Emergency Card
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                Show this directly to paramedics, doctors, or first responders.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsEditingMedical(!isEditingMedical)}
            >
              {isEditingMedical ? 'Cancel Editing' : '✏️ Edit Medical Profile'}
            </button>
          </div>

          {saveStatus && (
            <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#047857', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 700 }}>
              ✅ {saveStatus}
            </div>
          )}

          {isEditingMedical ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Blood Group</label>
                <input
                  type="text"
                  className="form-input"
                  value={medicalProfile.bloodGroup}
                  onChange={(e) => setMedicalProfile({ ...medicalProfile, bloodGroup: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Allergies & Reactions</label>
                <input
                  type="text"
                  className="form-input"
                  value={medicalProfile.allergies}
                  onChange={(e) => setMedicalProfile({ ...medicalProfile, allergies: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Medical Conditions & Deaf / Non-Verbal Notes</label>
                <input
                  type="text"
                  className="form-input"
                  value={medicalProfile.conditions}
                  onChange={(e) => setMedicalProfile({ ...medicalProfile, conditions: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Emergency Instructions for Responders</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={medicalProfile.emergencyNotes}
                  onChange={(e) => setMedicalProfile({ ...medicalProfile, emergencyNotes: e.target.value })}
                />
              </div>

              <button type="button" className="btn btn-primary" onClick={handleSaveMedical} style={{ alignSelf: 'flex-start' }}>
                💾 Save Medical Information
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>Blood Type</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0.4rem 0 0' }}>
                  {medicalProfile.bloodGroup || 'Not specified'}
                </h3>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>Severe Allergies</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0' }}>
                  {medicalProfile.allergies || 'None reported'}
                </h3>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>Communication & Medical Notes</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0.5rem 0' }}>
                  {medicalProfile.conditions}
                </p>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {medicalProfile.emergencyNotes}
                </p>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => speakText(`Patient medical emergency ID. Blood type ${medicalProfile.bloodGroup}. Allergies: ${medicalProfile.allergies}. Conditions: ${medicalProfile.conditions}. Notes: ${medicalProfile.emergencyNotes}`)}
                >
                  🔊 Read Medical ID Aloud to Responder
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Emergency Contacts */}
      {activeTab === 'contacts' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
            👥 In-Case-of-Emergency (ICE) Contacts
          </h2>
          <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.95rem' }}>
            Verified primary emergency contacts for immediate outreach.
          </p>

          <div style={{
            background: '#f8fafc',
            border: '2px solid #0d9488',
            borderRadius: '16px',
            padding: '1.75rem',
            maxWidth: '540px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2.5rem' }}>👤</div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem' }}>
                  {medicalProfile.iceName}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: 700, background: '#f0fdfa', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {medicalProfile.iceRelation}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Phone Number:</span>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{medicalProfile.icePhone}</strong>
              </div>
              <a
                href={`tel:${medicalProfile.icePhone}`}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                📞 Call Contact Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
