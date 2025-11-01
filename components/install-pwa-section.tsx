'use client'

import { useEffect, useState } from 'react'
import { Download, Smartphone, Monitor, CheckCircle, Shield, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InstallPWASection() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setCanInstall(false)
      setIsInstalled(true)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Instale o Cidadão.AI no seu Dispositivo
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Transforme o Cidadão.AI em um aplicativo nativo. Acesso rápido, notificações em tempo
            real e funcionamento offline.
          </p>
        </div>

        {/* Installation Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Benefits Card */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-600" />
              Vantagens do App
            </h3>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block">Acesso Rápido</strong>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Ícone direto na tela inicial do seu dispositivo
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block">Notificações em Tempo Real</strong>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Receba alertas de anomalias e investigações
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block">Funcionamento Offline</strong>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Acesse dados salvos mesmo sem internet
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block">Experiência Nativa</strong>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Interface otimizada para mobile e desktop
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Installation Guide Card */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Download className="h-8 w-8 text-blue-600" />
              Como Instalar
            </h3>

            {isInstalled ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">App já instalado!</p>
                <p className="text-gray-600 dark:text-gray-400">
                  O Cidadão.AI já está instalado no seu dispositivo.
                </p>
              </div>
            ) : (
              <>
                {/* Installation Button */}
                {canInstall && (
                  <button
                    onClick={handleInstallClick}
                    className={cn(
                      'w-full mb-6 px-6 py-4 rounded-lg font-semibold text-white',
                      'bg-gradient-to-r from-green-600 to-blue-600',
                      'hover:shadow-xl transition-all duration-300',
                      'flex items-center justify-center gap-3'
                    )}
                  >
                    <Download className="h-5 w-5" />
                    Instalar Agora
                  </button>
                )}

                {/* Platform-specific instructions */}
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Monitor className="h-4 w-4" />
                      Desktop (Chrome, Edge, Brave)
                    </h4>
                    <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>1. Clique no ícone de instalação na barra de endereços</li>
                      <li>2. Ou use o menu (⋮) → "Instalar Cidadão.AI"</li>
                    </ol>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile (Android/iOS)
                    </h4>
                    <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>1. Abra no Chrome ou Safari</li>
                      <li>2. Toque no menu de compartilhar</li>
                      <li>3. Selecione "Adicionar à Tela Inicial"</li>
                    </ol>
                  </div>
                </div>

                {!canInstall && !isInstalled && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <Wifi className="h-4 w-4 inline mr-2" />
                      Use um navegador compatível (Chrome, Edge, Brave ou Safari) para instalar o
                      app.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
