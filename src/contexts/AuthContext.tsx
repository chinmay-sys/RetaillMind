import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '@/lib/api'

interface User {
  user_id: number
  email: string
  first_name: string
  last_name: string
  role: string
  phone?: string
  location?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { first_name: string; last_name: string; email: string; password: string; organization?: string }) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('retailmind_token')
    const savedUser = localStorage.getItem('retailmind_user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('retailmind_token')
        localStorage.removeItem('retailmind_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const res = await authAPI.login(email, password)
      const data = res.data
      setToken(data.access_token)
      const userData: User = {
        user_id: data.user_id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      }
      setUser(userData)
      localStorage.setItem('retailmind_token', data.access_token)
      localStorage.setItem('retailmind_user', JSON.stringify(userData))
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.'
      setError(msg)
      throw new Error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: { first_name: string; last_name: string; email: string; password: string; organization?: string }) => {
    setError(null)
    setIsLoading(true)
    try {
      const res = await authAPI.register(data)
      const resData = res.data
      setToken(resData.access_token)
      const userData: User = {
        user_id: resData.user_id,
        email: resData.email,
        first_name: resData.first_name,
        last_name: resData.last_name,
        role: resData.role,
      }
      setUser(userData)
      localStorage.setItem('retailmind_token', resData.access_token)
      localStorage.setItem('retailmind_user', JSON.stringify(userData))
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed.'
      setError(msg)
      throw new Error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('retailmind_token')
    localStorage.removeItem('retailmind_user')
  }

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...data }
      localStorage.setItem('retailmind_user', JSON.stringify(updated))
      return updated
    })
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!token, isLoading,
      login, register, logout, updateUser, error, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
