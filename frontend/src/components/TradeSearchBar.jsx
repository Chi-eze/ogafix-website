import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, MapPin } from 'lucide-react'
import { allTrades, popularTrades } from '../data/trades'

export default function TradeSearchBar({ className = '' }) {
  const [trade, setTrade] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e?.preventDefault()
    const params = new URLSearchParams({ type: 'customer' })
    if (trade.trim()) params.set('trade', trade.trim())
    if (location.trim()) params.set('location', location.trim())
    navigate(`/register?${params.toString()}`)
  }

  const searchWithTrade = (tradeName) => {
    const params = new URLSearchParams({ type: 'customer', trade: tradeName })
    if (location.trim()) params.set('location', location.trim())
    navigate(`/register?${params.toString()}`)
  }

  return (
    <div className={className}>
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-full shadow-xl p-1.5 flex flex-col sm:flex-row sm:items-stretch gap-1 sm:gap-0"
      >
        <div className="flex flex-1 items-center gap-2 px-4 py-2 sm:py-0 sm:border-r border-gray-200 min-w-0">
          <Wrench className="text-gray-400 flex-shrink-0" size={18} />
          <input
            type="text"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            placeholder="Trade (e.g. Plumber)"
            className="w-full min-w-0 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm sm:text-base"
            list="ogafix-trades"
          />
          <datalist id="ogafix-trades">
            {allTrades.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-1 items-center gap-2 px-4 py-2 sm:py-0 min-w-0">
          <MapPin className="text-gray-400 flex-shrink-0" size={18} />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or area (e.g. Enugu)"
            className="w-full min-w-0 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm sm:text-base"
          />
        </div>

        <button
          type="submit"
          className="bg-accent hover:bg-accent/90 text-white font-bold text-base px-8 py-3.5 rounded-full transition flex-shrink-0 sm:ml-1"
        >
          Go
        </button>
      </form>

      <p className="mt-3 text-sm text-white/60 leading-relaxed">
        Popular:{' '}
        {popularTrades.map((t, i) => (
          <span key={t}>
            {i > 0 && ' · '}
            <button
              type="button"
              onClick={() => searchWithTrade(t)}
              className="text-white/80 hover:text-accent underline-offset-2 hover:underline transition"
            >
              {t}
            </button>
          </span>
        ))}
      </p>
    </div>
  )
}
