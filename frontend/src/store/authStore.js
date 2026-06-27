import { create } from 'zustand'
import { authAPI } from '../services/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  register: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await authAPI.register(data)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      set({ user, token, loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', loading: false })
      throw error
    }
  },

  login: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await authAPI.login(data)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      set({ user, token, loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setError: (error) => set({ error }),
}))
