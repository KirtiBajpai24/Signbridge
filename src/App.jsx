import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AccessibilityProvider } from './context/AccessibilityContext'
import { SignModeProvider } from './context/SignModeContext'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import GuestRoute from './components/auth/GuestRoute'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import Features from './pages/Features'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import LiveTranslator from './pages/LiveTranslator'
import VideoTranslator from './pages/VideoTranslator'
import SpeechTranslator from './pages/SpeechTranslator'
import TextToSign from './pages/TextToSign'
import Dictionary from './pages/Dictionary'
import History from './pages/History'
import Activity from './pages/Activity'
import Emergency from './pages/Emergency'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Help from './pages/Help'
import NotFound from './pages/NotFound'

import './styles/accessibility.css'
import './App.css'

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <SignModeProvider>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Public Informational Routes (Accessible to everyone) */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/features" element={<Features />} />
              <Route path="/help" element={<Help />} />

              {/* Guest-Only Authentication Routes (Redirect to /dashboard if logged in) */}
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Protected Routes (Redirect to /login if unauthenticated) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/live-translator" element={<LiveTranslator />} />
                <Route path="/video-translator" element={<VideoTranslator />} />
                <Route path="/speech-translator" element={<SpeechTranslator />} />
                <Route path="/text-to-sign" element={<TextToSign />} />
                <Route path="/dictionary" element={<Dictionary />} />
                <Route path="/history" element={<History />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
~              </Route>

              {/* 404 Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </SignModeProvider>
      </AuthProvider>
    </AccessibilityProvider>
  )
}
