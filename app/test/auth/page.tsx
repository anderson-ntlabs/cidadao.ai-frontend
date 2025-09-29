'use client'

import { useAuth } from '@/hooks/use-supabase-auth'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { AuthProvider } from '@/contexts/auth-context'

function TestAuthContent() {
  const { user, isAuthenticated, login, logout, loginWithProvider } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) {
        console.error('Database error:', error)
        alert('Erro ao conectar com o banco: ' + error.message)
      } else {
        console.log('Profile data:', data)
        alert('Conexão com banco funcionando! Verifique o console.')
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Teste de Autenticação Supabase</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <p>Autenticado: <span className="font-mono">{isAuthenticated ? 'Sim' : 'Não'}</span></p>
        {user && (
          <div className="mt-2">
            <p>ID: <span className="font-mono text-sm">{user.id}</span></p>
            <p>Email: <span className="font-mono">{user.email}</span></p>
            <p>Nome: <span className="font-mono">{user.name}</span></p>
          </div>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          
          <div className="space-y-4 mb-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <button
              onClick={() => login(email, password)}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
            >
              Login com Email/Senha
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => loginWithProvider('google')}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Login com Google
            </button>
            <button
              onClick={() => loginWithProvider('github')}
              className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900"
            >
              Login com GitHub
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Ações</h2>
          <button
            onClick={testDatabaseConnection}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Testar Conexão com Banco
          </button>
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default function TestAuthPage() {
  return (
    <AuthProvider>
      <TestAuthContent />
    </AuthProvider>
  )
}