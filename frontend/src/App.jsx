import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useEffect, useState } from 'react'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TrademenProfile from './pages/TrademenProfile'
import JobPosting from './pages/JobPosting'
import JobDetail from './pages/JobDetail'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

import Header from './components/Header'
import Footer from './components/Footer'
import LandingHeader from './components/LandingHeader'
import PublicFooter from './components/PublicFooter'

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token)
  return token ? children : <Navigate to="/login" />
}

const authPaths = ['/login', '/register']

function AppLayout({ children }) {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()
  const isAuthPage = authPaths.includes(location.pathname)

  if (token) {
    return (
      <>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </>
    )
  }

  if (isAuthPage) {
    return <main className="flex-grow">{children}</main>
  }

  return (
    <>
      <LandingHeader />
      <main className="flex-grow">{children}</main>
      <PublicFooter />
    </>
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const loadProfile = useAuthStore((state) => state.loadProfile)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const init = async () => {
      if (token) await loadProfile()
      setIsLoading(false)
    }
    init()
  }, [token, loadProfile])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<RegisterRoute />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/tradesman/:id" element={<ProtectedRoute><TrademenProfile /></ProtectedRoute>} />
            <Route path="/jobs/new" element={<ProtectedRoute><JobPosting /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

function LoginRoute() {
  const token = useAuthStore((state) => state.token)
  return token ? <Navigate to="/dashboard" /> : <Login />
}

function RegisterRoute() {
  const token = useAuthStore((state) => state.token)
  return token ? <Navigate to="/dashboard" /> : <Register />
}

export default App
