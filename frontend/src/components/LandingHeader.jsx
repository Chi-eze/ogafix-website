import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        isHome
          ? 'bg-navy/95 backdrop-blur-sm border-white/10'
          : 'bg-white/95 backdrop-blur-sm border-gray-100'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/">
          <Logo light={isHome} showTagline={false} />
        </Link>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className={`px-4 py-2 font-medium transition ${
              isHome ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-secondary'
            }`}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-lg shadow-accent/20"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-1 ${isHome ? 'text-white' : 'text-gray-700'}`}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isOpen && (
        <div
          className={`md:hidden border-t px-4 py-4 space-y-2 ${
            isHome ? 'border-white/10 bg-navy' : 'border-gray-100 bg-white'
          }`}
        >
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className={`block py-2.5 font-medium ${isHome ? 'text-white/90' : 'text-gray-700'}`}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            onClick={() => setIsOpen(false)}
            className="block bg-accent text-white text-center py-2.5 rounded-lg font-semibold"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  )
}
