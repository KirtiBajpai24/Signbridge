import { useAuth } from '../context/AuthContext'
import LiveSignTranslator from '../components/LiveSignTranslator'
import './Pages.css'

export default function LiveTranslator() {
  const { user } = useAuth()
  const currentUser = user || { id: 'user-default-1', name: 'User' }

  return (
    <div className="page-container" style={{ maxWidth: '1280px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <span className="section-pill">Direction 1 • Real-Time Studio</span>
        <h1 className="page-title">Live Sign Language Translator</h1>
        <p className="page-lead">
          Position your hand in the camera frame. The AI tracks 21 skeletal joints, translates gestures progressively,
          and synthesizes spoken audio in real time.
        </p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)' }}>
        <LiveSignTranslator user={currentUser} />
      </div>
    </div>
  )
}
