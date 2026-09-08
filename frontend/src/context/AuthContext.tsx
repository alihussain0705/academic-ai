import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authAPI } from '../services/api'
import type { User, LoginResponse } from '../types/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: { email: string; password: string }) => Promise<void>
  register: (data: Record<string, unknown>) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        // Invalid stored user data
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (data: { email: string; password: string }) => {
    const response = await authAPI.login(data)
    const result: LoginResponse = response.data
    localStorage.setItem('access_token', result.access_token)
    setToken(result.access_token)

    const tokenPayload = JSON.parse(atob(result.access_token.split('.')[1]))
    const userData: User = {
      id: parseInt(tokenPayload.sub),
      name: '',
      email: data.email,
      role: 'student',
      department: '',
      college: '',
      semester: 0,
      created_at: '',
    }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const register = async (data: Record<string, unknown>) => {
    await authAPI.register(data)
    const { email, password } = data as { email: string; password: string }
    await login({ email, password })
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
