import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { User, Wrench, Briefcase } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { userAPI } from '../services/api'
import { allTrades } from '../data/trades'

export default function Profile() {
  const { user, loadProfile, becomeTradesman } = useAuthStore()
  const [tradeCategory, setTradeCategory] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleBecomeTradesman = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await becomeTradesman(tradeCategory || undefined)
      toast.success('Tradesman profile created! You can still post jobs as a customer.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create tradesman profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-secondary">My Profile</h1>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="text-primary" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
            {user?.phone_number && <p className="text-gray-500 text-sm">{user.phone_number}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm">
            <Briefcase size={14} />
            Customer
          </span>
          {user?.is_tradesman && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              <Wrench size={14} />
              Tradesman{user.tradesman?.trade_category ? ` · ${user.tradesman.trade_category}` : ''}
            </span>
          )}
        </div>

        {user?.bio && <p className="text-gray-600">{user.bio}</p>}
      </div>

      {!user?.is_tradesman ? (
        <div className="card border-2 border-dashed border-primary/30">
          <h3 className="text-lg font-bold text-secondary mb-2">Become a tradesman</h3>
          <p className="text-gray-600 text-sm mb-4">
            Offer your services on OgaFix. You will still be able to hire other tradespeople for your
            own projects.
          </p>
          <form onSubmit={handleBecomeTradesman} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your trade</label>
              <select
                value={tradeCategory}
                onChange={(e) => setTradeCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Select a trade (optional for now)</option>
                {allTrades.map((trade) => (
                  <option key={trade} value={trade}>{trade}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Creating profile...' : 'Create tradesman profile'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card">
          <h3 className="text-lg font-bold text-secondary mb-2">Tradesman profile</h3>
          <p className="text-gray-600 text-sm mb-4">
            Manage your trade details, portfolio, and service areas.
          </p>
          <Link to={`/tradesman/${user.tradesman_id}`} className="btn-outline inline-block">
            View tradesman profile
          </Link>
        </div>
      )}
    </div>
  )
}
