import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verify: () => api.post('/auth/verify'),
}

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUser: (id) => api.get(`/users/${id}`),
  becomeTradesman: (data) => api.post('/users/become-tradesman', data),
}

// Tradesman endpoints
export const tradesmanAPI = {
  getMyProfile: () => api.get('/tradesmen/me'),
  getProfile: (id) => api.get(`/tradesmen/${id}`),
  updateProfile: (id, data) => api.put(`/tradesmen/${id}`, data),
  updateServiceAreas: (id, data) => api.put(`/tradesmen/${id}/service-areas`, data),
  getMatchingJobs: (id) => api.get(`/tradesmen/${id}/matching-jobs`),
  getMyMatchingJobs: () => api.get('/tradesmen/me/matching-jobs'),
}

// Job endpoints
export const jobAPI = {
  create: (data) => api.post('/jobs', data),
  getAll: (filters) => api.get('/jobs', { params: filters }),
  getMine: () => api.get('/jobs/mine'),
  getById: (id) => api.get(`/jobs/${id}`),
  updateStatus: (id, status) => api.put(`/jobs/${id}/status`, { status }),
  submitResponse: (id, data) => api.post(`/jobs/${id}/responses`, data),
  getResponses: (id) => api.get(`/jobs/${id}/responses`),
}

// Message endpoints
export const messageAPI = {
  send: (data) => api.post('/messages', data),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getInbox: () => api.get('/messages/inbox'),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
}

// Review endpoints
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  getJobReview: (jobId) => api.get(`/reviews/job/${jobId}`),
}

// City endpoints
export const cityAPI = {
  getAll: (state) => api.get('/cities', { params: { state } }),
  getById: (id) => api.get(`/cities/${id}`),
  getStates: () => api.get('/cities/states/list'),
}

export default api
