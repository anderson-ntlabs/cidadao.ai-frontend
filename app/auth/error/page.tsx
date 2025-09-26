import Link from 'next/link'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      <div className="relative max-w-md w-full space-y-8 p-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          {/* Error Message */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ops! Algo deu errado
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Ocorreu um erro durante o processo de autenticação. 
              Isso pode acontecer se você cancelou o login ou se houve um problema temporário.
            </p>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/pt/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </Link>
            
            <Link
              href="/pt"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              Voltar ao início
            </Link>
          </div>
          
          {/* Help text */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Se o problema persistir, entre em contato com o suporte
          </p>
        </div>
      </div>
    </div>
  )
}