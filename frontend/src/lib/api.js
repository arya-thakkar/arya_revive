import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://arya-revive.onrender.com'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.warn('[API] No token found for request to:', config.url)
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const { refreshToken, logout } = useAuthStore.getState()
      const refreshed = await refreshToken()
      if (refreshed) {
        error.config.headers.Authorization = `Bearer ${useAuthStore.getState().token}`
        return api(error.config)
      } else {
        logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (new_password) => api.post('/api/auth/reset-password', { new_password }),
  refresh: (refresh_token) => api.post('/api/auth/refresh', { refresh_token }),
  resendVerification: (email) => api.post('/api/auth/resend-verification', { email }),
}

export const userAPI = {
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data) => api.patch('/api/users/me', data),
  deleteAccount: () => api.delete('/api/users/me'),
}

export const addictionAPI = {
  getAll: () => api.get('/api/addictions'),
  create: (data) => api.post('/api/addictions', data),
  getOne: (id) => api.get(`/api/addictions/${id}`),
  update: (id, data) => api.patch(`/api/addictions/${id}`, data),
  delete: (id) => api.delete(`/api/addictions/${id}`),
  logRelapse: (id, note) => api.post(`/api/addictions/${id}/relapse`, { note }),
}

export const planAPI = {
  generate: (addictionId) => api.post(`/api/plans/generate/${addictionId}`),
  get: (addictionId) => api.get(`/api/plans/${addictionId}`),
  getDay: (addictionId, day) => api.get(`/api/plans/${addictionId}/day/${day}`),
}

export const dashboardAPI = {
  get: (addictionId) => api.get(`/api/dashboard${addictionId ? `?addiction_id=${addictionId}` : ''}`),
  weekly: (addictionId) => api.get(`/api/dashboard/stats/weekly?addiction_id=${addictionId}`),
}

export const checkinAPI = {
  create: (data) => api.post('/api/checkins', data),
  getAll: (addictionId, month) => {
    let url = `/api/checkins?addiction_id=${addictionId}`
    if (month) url += `&month=${month}`
    return api.get(url)
  },
}

export const urgeAPI = {
  log: (data) => api.post('/api/urges', data),
  getAll: (addictionId) => api.get(`/api/urges?addiction_id=${addictionId}`),
}

export const journalAPI = {
  getAll: (addictionId) => api.get(`/api/journal?addiction_id=${addictionId}`),
  create: (data) => api.post('/api/journal', data),
  update: (id, data) => api.patch(`/api/journal/${id}`, data),
  delete: (id) => api.delete(`/api/journal/${id}`),
}

export const aiAPI = {
  getDailyMotivation: (addictionId) => api.get(`/api/ai/daily-motivation/${addictionId}`),
  chat: (message, addiction_type) => api.post('/api/ai/chat', { message, addiction_type }),
  journalReflection: (entry_content, addiction_type) =>
    api.post('/api/ai/journal-reflection', { entry_content, addiction_type }),
}

export default api
