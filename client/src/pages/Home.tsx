import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Users, Briefcase, Shield, Star, Clock } from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    setLocation('/dashboard');
  };

  const features = [
    {
      icon: Users,
      title: 'Find Professionals',
      description: 'Connect with verified skilled professionals in your area for any job.'
    },
    {
      icon: Briefcase,
      title: 'Post Jobs',
      description: 'Post your project and receive bids from qualified professionals.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with buyer protection.'
    },
    {
      icon: Star,
      title: 'Real Reviews',
      description: 'Transparent ratings and reviews from verified customers.'
    },
    {
      icon: Clock,
      title: 'Quick Booking',
      description: 'Book professionals instantly and track project progress.'
    },
    {
      icon: CheckCircle,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your needs.'
    }
  ];

  const stats = [
    { number: '5,000+', label: 'Professionals' },
    { number: '10,000+', label: 'Jobs Completed' },
    { number: '4.8★', label: 'Average Rating' },
    { number: '50+', label: 'Cities' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-ochre-primary to-blue-deep rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OG</span>
            </div>
            <span className="font-display font-bold text-xl text-gray-900">OgaFix</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">Sign In</button>
            <Button onClick={handleGetStarted} className="btn-primary">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-deep via-white to-ochre-primary/10 py-20 md:py-32">
        <div className="pattern-bg absolute inset-0 opacity-50" />
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-gradient text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Connect Skills. Build Dreams.
              </h1>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                OgaFix is Africa's trusted marketplace connecting skilled professionals with clients who need their expertise. Whether you're a tradesman, technician, or service provider, find your next opportunity today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleGetStarted} className="btn-primary text-base py-4">
                  Find a Professional
                </Button>
                <Button className="btn-outline text-base py-4">
                  Post a Job
                </Button>
              </div>
            </div>
            <div className="relative h-96 md:h-full">
              <img 
                src="/manus-storage/ogafix-hero-banner_c2bc98b3.png" 
                alt="OgaFix Professionals"
                className="w-full h-full object-cover rounded-xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-deep text-white py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-ochre-primary mb-2">
                  {stat.number}
                </div>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose OgaFix?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We've built a platform that makes it easy to find quality professionals and get work done right.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="card-hover group">
                  <div className="w-12 h-12 bg-ochre-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-ochre-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-ochre-primary" />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-deep to-blue-light text-white py-20">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of professionals and clients using OgaFix to connect and grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} className="bg-ochre-primary hover:bg-ochre-primary/90 text-blue-deep font-bold py-4 px-8">
              Join OgaFix Today
            </Button>
            <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/50 font-bold py-4 px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-ochre-primary rounded-lg flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-sm">OG</span>
                </div>
                <span className="font-bold text-white">OgaFix</span>
              </div>
              <p className="text-sm">Africa's trusted marketplace for skilled professionals.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 OgaFix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
