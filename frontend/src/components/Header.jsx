import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Menu, X, LogOut, User, MessageSquare } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="font-bold text-xl text-secondary hidden sm:inline">OgaFix</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-gray-700 hover:text-primary transition">
            Dashboard
          </Link>
          <Link to="/messages" className="text-gray-700 hover:text-primary transition flex items-center space-x-1">
            <MessageSquare size={20} />
            <span>Messages</span>
          </Link>
          <Link to="/profile" className="text-gray-700 hover:text-primary transition flex items-center space-x-1">
            <User size={20} />
            <span>{user?.first_name || 'Profile'}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 space-y-3">
          <Link to="/dashboard" className="block text-gray-700 hover:text-primary transition py-2">
            Dashboard
          </Link>
          <Link to="/messages" className="block text-gray-700 hover:text-primary transition py-2">
            Messages
          </Link>
          <Link to="/profile" className="block text-gray-700 hover:text-primary transition py-2">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left text-red-600 hover:text-red-700 transition py-2"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  )
}
