import { Link } from 'react-router-dom'
import {
  MapPin,
  MessageSquare,
  Star,
  Shield,
  ArrowRight,
  Zap,
  Hammer,
  Paintbrush,
  Droplets,
  Award,
  Calendar,
} from 'lucide-react'
import Logo from '../components/Logo'
import TradeSearchBar from '../components/TradeSearchBar'
import TradeCategorySlider from '../components/TradeCategorySlider'
import MobileAppPromo from '../components/MobileAppPromo'

const trades = [
  { icon: Paintbrush, label: 'Painting' },
  { icon: Zap, label: 'Electrical' },
  { icon: Droplets, label: 'Plumbing' },
  { icon: Hammer, label: 'Carpentry' },
]

const trustBadges = [
  { icon: Shield, label: 'Verified Pros' },
  { icon: Award, label: 'Quality Service' },
  { icon: Star, label: 'Satisfaction Guaranteed' },
]

const customerSteps = [
  {
    step: '1',
    title: 'Post Your Job',
    description: 'Describe what you need, add photos, and specify your location in Nigeria.',
  },
  {
    step: '2',
    title: 'Connect with Pros',
    description: 'Receive quotes from tradesmen in your area. Review portfolios and ratings.',
  },
  {
    step: '3',
    title: 'Hire & Pay Directly',
    description: 'Agree on terms, get the work done, and pay your tradesman directly. No platform fees.',
  },
]

const tradesmanSteps = [
  {
    step: '1',
    title: 'Build Your Profile',
    description: 'Showcase your work, list your trade categories, and define your service areas.',
  },
  {
    step: '2',
    title: 'Find Local Jobs',
    description: 'Get notified about jobs matching your skills and preferred locations.',
  },
  {
    step: '3',
    title: 'Grow Your Reputation',
    description: 'Complete jobs, earn reviews, and build a trusted name in your community.',
  },
]

const benefits = [
  {
    icon: MapPin,
    title: 'Location-Based Matching',
    description: 'Find tradesmen near you or filter by city, state, and LGA across Nigeria.',
  },
  {
    icon: Shield,
    title: 'Verified Professionals',
    description: 'Every tradesman profile includes portfolios, ratings, and customer reviews.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Communication',
    description: 'Message tradesmen directly to discuss quotes, timelines, and payment terms.',
  },
  {
    icon: Star,
    title: 'Transparent Reviews',
    description: 'Real ratings from verified customers help you make confident decisions.',
  },
]

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero — marketing creative + interactive layer */}
      <section className="relative bg-navy overflow-hidden">
        {/* Mobile: photo hero + search */}
        <div className="lg:hidden">
          <div className="relative h-56 sm:h-64">
            <img
              src="/ogafix-hero-photo.jpg"
              alt="OgaFix professionals at work in Nigeria — painter, electrician, plumber and carpenter"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
          </div>
          <div className="px-4 sm:px-6 py-8 space-y-5">
            <TradeSearchBar />
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register?type=customer"
                className="flex-1 min-w-[140px] bg-accent text-white font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition hover:bg-accent/90"
              >
                <Calendar size={18} />
                Book a Pro Today
              </Link>
              <Link
                to="/register?type=tradesman"
                className="flex-1 min-w-[140px] border border-white/30 text-white font-semibold py-3 px-5 rounded-xl text-center hover:bg-white/10 transition"
              >
                Join as a Tradesman
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop: split layout matching brand creative */}
        <div className="hidden lg:grid lg:grid-cols-2 min-h-[600px]">
          <div className="relative z-10 flex flex-col justify-center px-10 xl:px-16 py-16">
            <Logo light showTagline className="mb-8" />

            <h1 className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Find Trusted Professionals.{' '}
              <span className="text-accent">Get Things Done.</span>
            </h1>

            <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-md">
              OgaFix connects you with verified, skilled professionals for your home, office,
              or business. Quality service, every time.
            </p>

            <div className="grid grid-cols-4 gap-3 mb-8 max-w-md">
              {trades.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="border border-white/25 rounded-lg p-3 text-center hover:border-accent/50 hover:bg-white/5 transition"
                >
                  <Icon className="text-white mx-auto mb-2" size={22} />
                  <span className="text-white/80 text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>

            <TradeSearchBar className="mb-6 max-w-xl" />

            <Link
              to="/register?type=tradesman"
              className="text-white/70 hover:text-white text-sm font-medium inline-flex items-center gap-1 mb-8 transition"
            >
              Are you a tradesman? Join OgaFix <ArrowRight size={14} />
            </Link>

            <div className="flex flex-wrap gap-6">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="text-accent" size={18} />
                  <span className="text-white/70 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photo panel — workshop photo only (no baked-in marketing UI) */}
          <div className="relative overflow-hidden min-h-[600px]">
            <img
              src="/ogafix-hero-photo.jpg"
              alt="OgaFix professionals at work in Nigeria — painter, electrician, plumber and carpenter"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-y-0 left-0 w-16 xl:w-24 bg-gradient-to-r from-navy to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: 'Direct', label: 'Customer-to-tradesman payments' },
              { value: 'Local', label: 'Location-based matching' },
              { value: 'Verified', label: 'Portfolio & review system' },
              { value: '50+', label: 'Cities across Nigeria' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-2xl font-bold text-secondary">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories slider + mobile app promo */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <TradeCategorySlider />
          <MobileAppPromo />
        </div>
      </section>

      {/* Showcase strip */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/ogafix-hero-photo.jpg"
                alt="OgaFix professionals ready to help"
                className="w-full h-64 lg:h-80 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy/80 to-transparent flex items-center p-8">
                <div>
                  <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">
                    Trusted Tradesmen
                  </p>
                  <p className="text-white font-display text-2xl font-bold">
                    Excellent Results
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="section-title mb-4">Built for Nigeria</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                From painting and electrical work to plumbing and carpentry — OgaFix brings
                together skilled professionals and customers who need quality work done. Pay
                directly, communicate openly, and build trust through real reviews.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {trades.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Icon className="text-accent" size={20} />
                    </div>
                    <span className="font-medium text-secondary text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">How OgaFix Works</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Whether you need work done or want to find your next job, getting started is simple.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="rounded-2xl border border-gray-100 p-8 bg-white shadow-sm">
              <div className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
                For Customers
              </div>
              <h3 className="font-display text-2xl font-bold text-secondary mb-8">
                Get Your Project Done in 3 Steps
              </h3>
              <div className="space-y-6">
                {customerSteps.map(({ step, title, description }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary mb-1">{title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/register?type=customer" className="btn-primary mt-8 inline-flex items-center gap-2">
                Post a Job <ArrowRight size={16} />
              </Link>
            </div>

            <div className="rounded-2xl border border-gray-100 p-8 bg-navy text-white shadow-sm">
              <div className="inline-block bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
                For Tradesmen
              </div>
              <h3 className="font-display text-2xl font-bold mb-8">
                Grow Your Business
              </h3>
              <div className="space-y-6">
                {tradesmanSteps.map(({ step, title, description }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 bg-accent text-navy rounded-full flex items-center justify-center font-bold text-sm">
                      {step}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{title}</h4>
                      <p className="text-white/70 text-sm leading-relaxed">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/register?type=tradesman"
                className="mt-8 inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Create Your Profile <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Why Choose OgaFix?</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Built for Nigeria — connecting customers and tradesmen with transparency and trust.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-11 h-11 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-accent" size={22} />
                </div>
                <h3 className="font-semibold text-secondary mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto relative rounded-2xl overflow-hidden shadow-2xl">
          <img
            src="/ogafix-hero-photo.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-navy/85" />
          <div className="relative text-center p-12 md:p-16 text-white">
            <Logo light showTagline className="justify-center mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/75 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of professionals and clients using OgaFix to connect and grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register?type=customer"
                className="px-8 py-3.5 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition inline-flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
              >
                <Calendar size={18} />
                Book a Pro Today
              </Link>
              <Link
                to="/register?type=tradesman"
                className="px-8 py-3.5 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition inline-flex items-center justify-center gap-2"
              >
                Join as a Tradesman <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
