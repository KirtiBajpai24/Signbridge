import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import AccessibilityBar from './AccessibilityBar'
import './AppLayout.css'

export default function AppLayout() {
  return (
    <div className="app-shell light-theme">
      <Navbar />
      <main className="main-content" id="main-content">
        <Outlet />
      </main>
      <Footer />
      <AccessibilityBar />
    </div>
  )
}
