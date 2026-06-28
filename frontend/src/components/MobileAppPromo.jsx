import { Star, Smartphone, MessageSquare, Bell } from 'lucide-react'

export default function MobileAppPromo() {
  return (
    <div className="mt-14 rounded-2xl overflow-hidden bg-gradient-to-br from-navy via-secondary to-navy text-white shadow-xl">
      <div className="grid lg:grid-cols-2 gap-8 items-center p-8 md:p-10 lg:p-12">
        {/* Left — copy & download */}
        <div>
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Coming soon
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight mb-6">
            Download the OgaFix app to see quotes &amp; book jobs easily
          </h2>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-2xl font-bold">4.8</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-accent fill-accent" size={14} />
                  ))}
                </div>
              </div>
              <p className="text-white/60 text-xs">Average rating</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
              <p className="text-2xl font-bold">50+</p>
              <p className="text-white/60 text-xs">Cities in Nigeria</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 transition cursor-default"
              aria-label="App Store — coming soon"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] text-white/70 leading-none">Download on the</p>
                <p className="text-sm font-semibold leading-tight">App Store</p>
              </div>
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 transition cursor-default"
              aria-label="Google Play — coming soon"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
                <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] text-white/70 leading-none">GET IT ON</p>
                <p className="text-sm font-semibold leading-tight">Google Play</p>
              </div>
            </a>

            <div className="hidden sm:flex w-20 h-20 bg-white rounded-lg items-center justify-center p-2">
              <div className="w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                <span className="text-[8px] text-gray-400 text-center leading-tight">QR<br />Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — phone mockup */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-56 md:w-64">
            <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl border-4 border-gray-700">
              <div className="bg-white rounded-[2rem] overflow-hidden aspect-[9/19]">
                <div className="bg-navy px-4 py-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">OG</span>
                  </div>
                  <span className="text-white text-xs font-semibold">OgaFix</span>
                </div>
                <div className="p-3 space-y-2 bg-gray-50 h-full">
                  <div className="bg-white rounded-lg p-2.5 shadow-sm text-[10px] text-gray-600 max-w-[85%]">
                    Hi! I can fix your plumbing issue. When works for you?
                  </div>
                  <div className="bg-accent/10 rounded-lg p-2.5 text-[10px] text-secondary max-w-[85%] ml-auto">
                    Can you come tomorrow in Enugu?
                  </div>
                  <div className="bg-white rounded-lg p-2.5 shadow-sm border border-accent/30 max-w-[90%]">
                    <p className="text-[10px] font-bold text-secondary mb-1">Quote: ₦25,000</p>
                    <p className="text-[9px] text-accent font-medium">View details →</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="flex-1 flex items-center justify-center gap-1 bg-white rounded-lg py-2 text-[9px] text-gray-500 border">
                      <MessageSquare size={10} /> Chat
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-1 bg-accent text-white rounded-lg py-2 text-[9px] font-semibold">
                      <Bell size={10} /> Book
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -left-4 bg-white text-secondary text-xs font-medium px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 max-w-[180px]">
              <Smartphone size={14} className="text-accent flex-shrink-0" />
              <span>Quotes &amp; booking on the go</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
