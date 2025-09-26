import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500 flex items-center justify-center">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Erro de Autenticação
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ocorreu um erro durante o processo de autenticação. Por favor, tente novamente.
          </p>
        </div>
        
        <div className="mt-8">
          <Link
            href="/pt/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  )
}