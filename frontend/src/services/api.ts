import axios from 'axios'
import type { RegisterRequest } from '../types/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data: RegisterRequest) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
}

export const conversationAPI = {
  list: () => api.get('/conversations/'),
  create: () => api.post('/conversations/'),
  get: (id: number) => api.post(`/conversations/${id}`),
  getMessages: (id: number) => api.get(`/conversations/${id}/messages`),
}

export const chatAPI = {
  send: (data: { task: string; conversation_id: number; subject: string }) => api.post('/chat/', data),
}

export const documentAPI = {
  upload: (formData: FormData) => api.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteDocument: (id: number) => api.delete(`/documents/document-delete/${id}`),
}

export default api
