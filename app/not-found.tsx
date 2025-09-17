import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      {/* Background layers */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url(/operarios.png)' }} />
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-10" />
      
      {/* Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
              404
            </div>
            <div className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Ops! Página não encontrada
            </div>
          </div>
          
          {/* Message */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            Parece que você se perdeu no caminho da transparência. 
            A página que você procura não existe ou foi movida para outro endereço.
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/pt"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300 hover-lift"
            >
              Voltar ao Início
            </Link>
            <Link 
              href="/pt/dashboard"
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:border-green-600 dark:hover:border-green-400 transition-all duration-300"
            >
              Ir para Dashboard
            </Link>
          </div>
          
          {/* Fun fact */}
          <div className="mt-12 p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-green-600 dark:text-green-400">Você sabia?</span> 
              {' '}O erro 404 significa que o servidor não conseguiu encontrar o recurso solicitado. 
              É um dos códigos de status HTTP mais conhecidos!
            </p>
          </div>
          
          {/* Agent suggestion */}
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            💡 Dica: Nossos agentes de IA estão sempre prontos para ajudar no{' '}
            <Link href="/pt/chat" className="text-green-600 hover:underline">
              chat
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}