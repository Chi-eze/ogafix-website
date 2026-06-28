import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { jobAPI, tradesmanAPI } from '../services/api'
import { Briefcase, Plus, MapPin, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const [tab, setTab] = useState(user?.is_tradesman ? 'matching' : 'browse')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [tab, user?.is_tradesman, user?.tradesman_id])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      let response
      if (tab === 'mine') {
        response = await jobAPI.getMine()
      } else if (tab === 'matching' && user?.is_tradesman) {
        response = await tradesmanAPI.getMyMatchingJobs()
      } else {
        response = await jobAPI.getAll({ status: 'open' })
      }
      setJobs(response.data.data || [])
    } catch {
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'browse', label: 'Browse jobs', show: true },
    { id: 'mine', label: 'My posted jobs', show: true },
    { id: 'matching', label: 'Jobs for me', show: user?.is_tradesman },
  ].filter((t) => t.show)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-secondary mb-2">
            Welcome, {user?.first_name}!
          </h1>
          <p className="text-gray-600">
            {user?.is_tradesman
              ? 'Post jobs as a customer or find work in your trade.'
              : 'Find trusted tradesmen for your projects.'}
          </p>
        </div>
        <Link to="/jobs/new" className="btn-primary flex items-center justify-center gap-2 shrink-0">
          <Plus size={20} />
          Post a Job
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
              tab === id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-600 hover:text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          {tab === 'matching' ? (
            <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
          ) : (
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
          )}
          <p className="text-gray-600">
            {tab === 'mine' && 'You have not posted any jobs yet.'}
            {tab === 'matching' && 'No matching jobs in your areas right now.'}
            {tab === 'browse' && 'No open jobs available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="card hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="text-lg font-bold text-secondary mb-3">{job.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <MapPin size={16} />
                {job.city}, {job.state}
              </div>
              {job.budget && (
                <div className="text-lg font-bold text-primary">
                  ₦{Number(job.budget).toLocaleString()}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
