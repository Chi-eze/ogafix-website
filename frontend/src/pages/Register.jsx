import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { User, Mail, Phone, Lock, Loader } from 'lucide-react'

export default function Register() {
  const [searchParams] = useSearchParams()
  const userType = searchParams.get('type') || 'customer'
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    user_type: userType,
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuthStore()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUserTypeChange = (type) => {
    setFormData(prev => ({ ...prev, user_type: type }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { confirm_password, ...registerData } = formData
      await register(registerData)
      toast.success('Registration successful!')
      navigate(formData.user_type === 'tradesman' ? '/profile' : '/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">OgaFix</h1>
          <p className="text-gray-600">Trusted Tradesmen, Excellent Results</p>
        </div>

        {/* User Type Selection */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleUserTypeChange('customer')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              formData.user_type === 'customer'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => handleUserTypeChange('tradesman')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              formData.user_type === 'tradesman'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tradesman
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="John"
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="+234 800 000 0000"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {loading && <Loader size={20} className="animate-spin" />}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
