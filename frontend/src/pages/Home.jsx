import { Link } from 'react-router-dom'
import { Wrench, Users, Star, MapPin, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Trusted Tradesmen, Excellent Results
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100">
            Connect with skilled professionals for all your home and business needs across Nigeria
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?type=customer"
              className="btn-primary bg-white text-primary hover:bg-gray-100"
            >
              Find a Tradesman
            </Link>
            <Link
              to="/register?type=tradesman"
              className="btn-primary bg-accent hover:bg-opacity-90"
            >
              Become a Tradesman
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-12">Why Choose OgaFix?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Professionals</h3>
              <p className="text-gray-600">
                All tradesmen are verified and rated by customers to ensure quality service.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Location-Based Matching</h3>
              <p className="text-gray-600">
                Find tradesmen in your area or across Nigeria who specialize in what you need.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Ratings</h3>
              <p className="text-gray-600">
                Make informed decisions based on real reviews and ratings from past customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Customers */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-primary">For Customers</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Post Your Job</h4>
                    <p className="text-gray-600">
                      Describe what you need, upload photos, and specify your location.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Get Quotes</h4>
                    <p className="text-gray-600">
                      Receive quotes from interested tradesmen in your area.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Choose & Communicate</h4>
                    <p className="text-gray-600">
                      Message tradesmen directly to discuss details and finalize arrangements.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Rate & Review</h4>
                    <p className="text-gray-600">
                      After completion, rate and review the tradesman to help others.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Tradesmen */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-secondary">For Tradesmen</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Create Profile</h4>
                    <p className="text-gray-600">
                      Set up your profile, showcase your work, and choose your service areas.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Browse Jobs</h4>
                    <p className="text-gray-600">
                      Find jobs in your specialty and service areas.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Submit Quotes</h4>
                    <p className="text-gray-600">
                      Send quotes and communicate directly with customers.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Build Reputation</h4>
                    <p className="text-gray-600">
                      Earn positive reviews and grow your customer base.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-gray-100">
            Join thousands of satisfied customers and tradesmen on OgaFix
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?type=customer"
              className="btn-primary bg-white text-primary hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              Find a Tradesman <ArrowRight size={20} />
            </Link>
            <Link
              to="/register?type=tradesman"
              className="btn-primary bg-accent hover:bg-opacity-90 flex items-center justify-center gap-2"
            >
              Join as Tradesman <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
