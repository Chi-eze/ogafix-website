import { create } from 'zustand'
import { authAPI, userAPI } from '../services/api'
import { connectSocket, disconnectSocket } from '../lib/socket'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  loadProfile: async () => {
    const token = get().token
    if (!token) return null

    try {
      const response = await userAPI.getProfile()
      const user = response.data.data
      set({ user })
      connectSocket(token)
      return user
    } catch {
      return null
    }
  },

  register: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await authAPI.register(data)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      connectSocket(token)
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
      connectSocket(token)
      set({ user, token, loading: false })
      return response.data
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false })
      throw error
    }
  },

  becomeTradesman: async (tradeCategory) => {
    const response = await userAPI.becomeTradesman({ trade_category: tradeCategory })
    const { token, user } = response.data
    localStorage.setItem('token', token)
    set({ user, token })
    return user
  },

  logout: () => {
    localStorage.removeItem('token')
    disconnectSocket()
    set({ user: null, token: null })
  },

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setError: (error) => set({ error }),
}))
