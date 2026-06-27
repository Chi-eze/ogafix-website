import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Star, Clock, DollarSign, Plus, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');

  const professionals = [
    {
      id: 1,
      name: 'Chinedu Okafor',
      title: 'Electrician',
      location: 'Lagos, Nigeria',
      rating: 4.9,
      reviews: 127,
      hourlyRate: 50,
      image: '👨‍🔧',
      verified: true
    },
    {
      id: 2,
      name: 'Amara Johnson',
      title: 'Plumber',
      location: 'Accra, Ghana',
      rating: 4.8,
      reviews: 95,
      hourlyRate: 45,
      image: '👩‍🔧',
      verified: true
    },
    {
      id: 3,
      name: 'Kwame Mensah',
      title: 'Carpenter',
      location: 'Kumasi, Ghana',
      rating: 4.7,
      reviews: 82,
      hourlyRate: 40,
      image: '👨‍🔨',
      verified: true
    },
    {
      id: 4,
      name: 'Zainab Hassan',
      title: 'Web Developer',
      location: 'Nairobi, Kenya',
      rating: 4.9,
      reviews: 156,
      hourlyRate: 60,
      image: '👩‍💻',
      verified: true
    }
  ];

  const jobs = [
    {
      id: 1,
      title: 'Electrical Rewiring',
      description: 'Need to rewire the entire house with modern electrical system',
      category: 'Electrical',
      budget: 500,
      location: 'Lagos, Nigeria',
      bids: 8,
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Bathroom Renovation',
      description: 'Complete bathroom renovation including plumbing and tiling',
      category: 'Plumbing',
      budget: 800,
      location: 'Accra, Ghana',
      bids: 5,
      posted: '1 day ago'
    },
    {
      id: 3,
      title: 'Website Development',
      description: 'Build a modern e-commerce website for my business',
      category: 'Web Development',
      budget: 2000,
      location: 'Remote',
      bids: 12,
      posted: '3 hours ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-ochre-primary to-blue-deep rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OG</span>
            </div>
            <span className="font-display font-bold text-xl text-gray-900">OgaFix</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              Notifications
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              Profile
            </button>
            <Button 
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search professionals or jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ochre-primary"
              />
            </div>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Post a Job
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="browse">Browse Professionals</TabsTrigger>
            <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          </TabsList>

          {/* Browse Professionals Tab */}
          <TabsContent value="browse">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {professionals.map((prof) => (
                <Card key={prof.id} className="card-hover overflow-hidden">
                  <div className="text-center pt-6">
                    <div className="text-5xl mb-3">{prof.image}</div>
                    <h3 className="font-display font-bold text-lg">{prof.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{prof.title}</p>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="w-4 h-4 fill-ochre-primary text-ochre-primary" />
                      <span className="font-semibold">{prof.rating}</span>
                      <span className="text-sm text-gray-600">({prof.reviews})</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-gray-600 text-sm mb-4">
                      <MapPin className="w-4 h-4" />
                      {prof.location}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-ochre-primary font-bold mb-4">
                      <DollarSign className="w-4 h-4" />
                      {prof.hourlyRate}/hr
                    </div>
                    <Button className="w-full btn-primary">View Profile</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Active Jobs Tab */}
          <TabsContent value="jobs">
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="card-hover p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-xl mb-2">{job.title}</h3>
                      <p className="text-gray-600 mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <span className="font-semibold text-ochre-primary">{job.category}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {job.posted}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-ochre-primary">${job.budget}</div>
                        <div className="text-sm text-gray-600">{job.bids} bids</div>
                      </div>
                      <Button className="btn-primary">View Bids</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings">
            <Card className="card p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-display font-bold text-xl mb-2">No Active Bookings</h3>
              <p className="text-gray-600 mb-6">You don't have any active bookings yet. Browse professionals or post a job to get started.</p>
              <Button className="btn-primary">Browse Professionals</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
