import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Pages.css'

export default function NotFound() {
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const q = searchQuery.toLowerCase().trim()
    if (!q) return

    if (q.includes('cam') || q.includes('live')) {
      navigate('/live-translator')
    } else if (q.includes('video') || q.includes('upload')) {
      navigate('/video-translator')
    } else if (q.includes('dict') || q.includes('sign') || q.includes('word') || q.includes('quiz')) {
      navigate('/dictionary')
    } else if (q.includes('speech') || q.includes('voice') || q.includes('mic')) {
      navigate('/speech-translator')
    } else if (q.includes('text')) {
      navigate('/text-to-sign')
    } else if (q.includes('emerg') || q.includes('sos') || q.includes('help')) {
      navigate('/emergency')
    } else if (q.includes('sett') || q.includes('pref')) {
      navigate('/settings')
    } else if (q.includes('hist') || q.includes('log')) {
      navigate('/history')
    } else {
      navigate(isAuthenticated ? '/dashboard' : '/')
    }
  }

  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <div style={{
        width: '96px',
        height: '96px',
        margin: '0 auto 1.5rem',
        borderRadius: '50%',
        background: '#fef2f2',
        border: '3px solid #f87171',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3.5rem'
      }}>
        🔍
      </div>

      <span className="section-pill" style={{ background: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}>
        404 • Destination Not Found
      </span>

      <h1 className="page-title" style={{ fontSize: '2.5rem', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
        Lost in Translation?
      </h1>

      <p className="page-lead" style={{ maxWidth: '580px', margin: '0 auto 2rem' }}>
        We couldn&rsquo;t find the path you were looking for. The link might be outdated or the page has moved.
      </p>

      {/* Quick Search Recovery */}
      <form onSubmit={handleSearchSubmit} style={{ maxWidth: '440px', margin: '0 auto 2.5rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Where did you want to go? (e.g. camera, dictionary)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary">
          Jump 🚀
        </button>
      </form>

      {/* Helpful Shortcuts Grid */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
        marginBottom: '2.5rem'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
          Explore Popular SignBridge Destinations:
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          textAlign: 'left'
        }}>
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              color: '#0f172a',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🏠</span>
            <strong style={{ fontSize: '0.95rem' }}>{isAuthenticated ? 'User Dashboard' : 'Home Page'}</strong>
            <span style={{ fontSize: '0.775rem', color: '#64748b' }}>Return to start</span>
          </Link>

          <Link
            to="/live-translator"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              color: '#0f172a',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📹</span>
            <strong style={{ fontSize: '0.95rem' }}>Live Camera Studio</strong>
            <span style={{ fontSize: '0.775rem', color: '#64748b' }}>21-landmark recognition</span>
          </Link>

          <Link
            to="/dictionary"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              color: '#0f172a',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📖</span>
            <strong style={{ fontSize: '0.95rem' }}>ASL Dictionary & Quiz</strong>
            <span style={{ fontSize: '0.775rem', color: '#64748b' }}>Vocabulary & letters</span>
          </Link>

          <Link
            to="/emergency"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #fee2e2',
              textDecoration: 'none',
              color: '#b91c1c',
              background: '#fff5f5',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🚨</span>
            <strong style={{ fontSize: '0.95rem' }}>Emergency SOS Mode</strong>
            <span style={{ fontSize: '0.775rem', color: '#dc2626' }}>Urgent assistance</span>
          </Link>
        </div>
      </div>

      <div>
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
          Back to Safety 🏠
        </Link>
      </div>
    </div>
  )
}
