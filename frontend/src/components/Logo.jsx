export default function Logo({ className = '', showTagline = false, light = false }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0">
        <svg viewBox="0 0 40 48" className="w-9 h-10" aria-hidden="true">
          <path
            d="M20 0C11.716 0 5 6.716 5 15c0 11.25 15 33 15 33s15-21.75 15-33C35 6.716 28.284 0 20 0z"
            fill="#F7931E"
          />
          <path
            d="M26 14h-4v-2a2 2 0 00-4 0v2h-2a1 1 0 00-1 1v8a2 2 0 002 2h8a2 2 0 002-2v-8a1 1 0 00-1-1zm-6-2a1 1 0 011 1v2h-2v-2a1 1 0 011-1zm5 11h-8v-7h2v1a1 1 0 002 0v-1h2v1a1 1 0 002 0v-1h2v7z"
            fill="#001428"
            transform="translate(2, 6) scale(0.85)"
          />
        </svg>
      </div>
      <div>
        <span className={`font-display font-bold text-xl leading-none ${light ? 'text-white' : 'text-secondary'}`}>
          OgaFix
        </span>
        {showTagline && (
          <p className={`text-xs mt-0.5 ${light ? 'text-white/70' : 'text-gray-500'}`}>
            Skilled People. Great Jobs. Real Results.
          </p>
        )}
      </div>
    </div>
  )
}
