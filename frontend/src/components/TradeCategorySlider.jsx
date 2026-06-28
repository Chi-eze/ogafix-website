import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { browseTrades } from '../data/trades'

export default function TradeCategorySlider() {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const amount = direction === 'left' ? -320 : 320
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6">
        Browse our most popular categories
      </h2>

      <div className="relative group">
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll categories left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-secondary hover:bg-gray-50 hover:border-accent transition md:opacity-100"
        >
          <ChevronLeft size={22} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2 pl-12 pr-12"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {browseTrades.map(({ icon: Icon, label, slug }) => (
            <Link
              key={slug}
              to={`/register?type=customer&trade=${encodeURIComponent(slug)}`}
              className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-accent hover:shadow-md transition min-w-max"
            >
              <Icon className="text-secondary flex-shrink-0" size={22} strokeWidth={1.75} />
              <span className="font-semibold text-secondary text-sm whitespace-nowrap">{label}</span>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll categories right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-secondary hover:bg-gray-50 hover:border-accent transition md:opacity-100"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  )
}
