'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/api/auth.service'
import { toast } from './use-toast'

interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
}

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      // Check if we have a token
      if (!authService.isAuthenticated()) {
        // Check for mock auth
        const mockAuth = localStorage.getItem('isAuthenticated') === 'true'
        const mockUser = localStorage.getItem('user')
        
        if (mockAuth && mockUser) {
          setUser(JSON.parse(mockUser))
          setIsAuthenticated(true)
        }
        
        setIsLoading(false)
        return
      }

      // Try to get current user from backend
      const userInfo = await authService.getCurrentUser()
      setUser({
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=16a34a&color=fff`
      })
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      // Try real authentication first
      const response = await authService.login(email, password)
      
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user.name)}&background=16a34a&color=fff`
      })
      setIsAuthenticated(true)
      
      toast.success(`Bem-vindo(a), ${response.user.name}!`, 'Login realizado com sucesso')
      
      // Handle redirect
      const redirectUrl = localStorage.getItem('redirectAfterLogin')
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin')
        router.push(redirectUrl)
      } else {
        router.push('/pt/dashboard')
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Falha no login', 'Verifique suas credenciais e tente novamente')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const loginWithProvider = useCallback(async (provider: string) => {
    setIsLoading(true)
    
    try {
      // For now, use mock authentication for OAuth providers
      // TODO: Implement real OAuth flow when backend supports it
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockUser = {
        id: `${provider}_${Date.now()}`,
        name: 'João Silva',
        email: 'joao.silva@email.com',
        role: 'user',
        avatar: `https://ui-avatars.com/api/?name=João+Silva&background=16a34a&color=fff`
      }
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('isAuthenticated', 'true')
      
      setUser(mockUser)
      setIsAuthenticated(true)
      
      toast.success(`Bem-vindo(a), ${mockUser.name}!`, 'Login realizado com sucesso')
      
      // Handle redirect
      const redirectUrl = localStorage.getItem('redirectAfterLogin')
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin')
        router.push(redirectUrl)
      } else {
        router.push('/pt/dashboard')
      }
    } catch (error) {
      console.error('Provider login failed:', error)
      toast.error('Falha no login', 'Tente novamente mais tarde')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // Try real logout if authenticated
      if (authService.isAuthenticated()) {
        await authService.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('redirectAfterLogin')
      
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
      
      router.push('/pt/login')
    }
  }, [router])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithProvider,
    logout,
    checkAuth
  }
}