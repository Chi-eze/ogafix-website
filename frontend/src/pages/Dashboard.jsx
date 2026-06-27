import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { jobAPI } from '../services/api'
import { Briefcase, Plus, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getAll({ status: 'open' })
      setJobs(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-secondary mb-2">
            Welcome, {user?.first_name}!
          </h1>
          <p className="text-gray-600">
            {user?.user_type === 'customer' 
              ? 'Find trusted tradesmen for your projects'
              : 'Browse available jobs in your area'}
          </p>
        </div>
        {user?.user_type === 'customer' && (
          <Link to="/jobs/new" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Post a Job
          </Link>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No jobs available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="card hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-secondary flex-1">{job.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {job.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <MapPin size={16} />
                {job.city}, {job.state}
              </div>
              {job.budget && (
                <div className="text-lg font-bold text-primary">
                  ₦{job.budget.toLocaleString()}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
