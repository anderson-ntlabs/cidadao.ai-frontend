'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { toast } from './use-toast'

interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: 'google' | 'github') => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Convert Supabase user to our User type
  const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
    // Google OAuth provides: full_name, avatar_url, email, provider_id
    // GitHub OAuth provides: user_name, avatar_url, email, preferred_username
    const metadata = supabaseUser.user_metadata || {}
    
    // Get name from different possible fields
    const name = metadata.full_name || 
                 metadata.name || 
                 metadata.user_name ||
                 metadata.preferred_username ||
                 supabaseUser.email!.split('@')[0]
    
    // Get avatar with fallback
    const avatar = metadata.avatar_url || 
                   metadata.picture ||
                   `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff`
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: name,
      role: supabaseUser.app_metadata?.role || 'user',
      avatar: avatar
    }
  }

  // Check authentication status on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(convertSupabaseUser(session.user))
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(convertSupabaseUser(session.user))
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const convertedUser = convertSupabaseUser(data.user)
        setUser(convertedUser)
        setIsAuthenticated(true)
        
        toast.success(`Bem-vindo(a), ${convertedUser.name}!`, 'Login realizado com sucesso')
        
        // Handle redirect
        const redirectUrl = localStorage.getItem('redirectAfterLogin')
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin')
          router.push(redirectUrl)
        } else {
          router.push('/pt/home')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error('Falha no login', error.message || 'Verifique suas credenciais')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router])

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/pt/home`
        }
      })

      if (error) throw error

      if (data.user) {
        toast.success('Conta criada com sucesso!', 'Verifique seu email para confirmar o cadastro')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error('Erro ao criar conta', error.message || 'Tente novamente')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const loginWithProvider = useCallback(async (provider: 'google' | 'github') => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/pt/home`,
        }
      })

      if (error) throw error
    } catch (error: any) {
      console.error('OAuth login error:', error)
      toast.error('Erro no login social', error.message || 'Tente novamente')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const logout = useCallback(async () => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setIsAuthenticated(false)
      
      // Clear any remaining local storage
      localStorage.removeItem('redirectAfterLogin')
      
      router.push('/pt')
    } catch (error: any) {
      console.error('Logout error:', error)
      toast.error('Erro ao sair', error.message || 'Tente novamente')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router])

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      if (session?.user) {
        setUser(convertSupabaseUser(session.user))
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      await logout()
    }
  }, [supabase, logout])

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        loginWithProvider,
        signup,
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}