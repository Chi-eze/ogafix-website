import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useEffect, useState } from 'react'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TrademenProfile from './pages/TrademenProfile'
import JobPosting from './pages/JobPosting'
import JobDetail from './pages/JobDetail'
import Messages from './pages/Messages'
import Profile from './pages/Profile'

// Components
import Header from './components/Header'
import Footer from './components/Footer'

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token)
  return token ? children : <Navigate to="/login" />
}

function App() {
  const token = useAuthStore((state) => state.token)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {token && <Header />}
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/tradesman/:id" element={<ProtectedRoute><TrademenProfile /></ProtectedRoute>} />
            <Route path="/jobs/new" element={<ProtectedRoute><JobPosting /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        {token && <Footer />}
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App
