'use client'

import { useState } from 'react'
import { Settings, Type, Eye, Languages, Keyboard, HelpCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FontSizeControl } from '@/components/a11y/font-size-control'
import { HighContrastToggle } from '@/components/a11y/high-contrast-toggle'
import { VLibrasToggle } from '@/components/a11y/vlibras-toggle'

/**
 * Configurações de Acessibilidade
 *
 * Página dedicada para gerenciar todas as preferências de acessibilidade
 * do usuário, incluindo tamanho de fonte, alto contraste e VLibras.
 *
 * Features:
 * - Controle de tamanho de fonte (4 níveis)
 * - Toggle de alto contraste
 * - Toggle de VLibras (LIBRAS)
 * - Informações sobre atalhos de teclado
 * - Guia de acessibilidade
 * - Design responsivo
 * - Preferências persistentes
 */

export default function ConfiguracoesPage() {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/pt/app"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Settings className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Configurações de Acessibilidade
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Personalize sua experiência para melhor atender suas necessidades
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Font Size Section */}
          <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Type className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Tamanho da Fonte
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Ajuste o tamanho do texto para melhor leitura. Use os botões abaixo ou os
                  atalhos de teclado <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Alt + +</kbd> e{' '}
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Alt + -</kbd>
                </p>
                <FontSizeControl locale="pt" />
              </div>
            </div>
          </section>

          {/* High Contrast Section */}
          <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Alto Contraste
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Aumenta o contraste entre texto e fundo para melhor visualização. Use o
                    atalho <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Alt + H</kbd> para
                    ativar/desativar rapidamente.
                  </p>
                </div>
              </div>
              <HighContrastToggle />
            </div>
          </section>

          {/* VLibras Section */}
          <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Languages className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    VLibras (LIBRAS)
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Ative a tradução automática para Língua Brasileira de Sinais (LIBRAS).
                    O widget oficial do VLibras aparecerá no canto inferior direito da tela.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Como usar:</strong> Após ativar, clique no avatar do VLibras
                      que aparece no canto da tela e selecione o texto que deseja traduzir
                      para LIBRAS. O assistente virtual irá realizar a tradução em tempo real.
                    </p>
                  </div>
                </div>
              </div>
              <VLibrasToggle locale="pt" variant="switch" />
            </div>
          </section>

          {/* Keyboard Shortcuts Section */}
          <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Keyboard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Atalhos de Teclado
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                  >
                    {showKeyboardHelp ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>

                {showKeyboardHelp && (
                  <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Use estes atalhos para navegar rapidamente pelas funcionalidades de acessibilidade:
                    </p>

                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">
                          Alternar alto contraste
                        </span>
                        <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500 font-mono text-sm">
                          Alt + H
                        </kbd>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">
                          Aumentar tamanho da fonte
                        </span>
                        <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500 font-mono text-sm">
                          Alt + +
                        </kbd>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">
                          Diminuir tamanho da fonte
                        </span>
                        <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500 font-mono text-sm">
                          Alt + -
                        </kbd>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Help Section */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <HelpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Precisa de Ajuda?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Estamos comprometidos em fornecer uma experiência acessível para todos os usuários.
                  Se você encontrar alguma dificuldade ou tiver sugestões de melhorias, entre em contato conosco.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                    asChild
                  >
                    <Link href="/pt/about">
                      Sobre o Projeto
                    </Link>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                    asChild
                  >
                    <Link href="/pt/privacy">
                      Política de Privacidade
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Todas as suas preferências são salvas localmente no seu navegador e
            permanecerão ativas nas suas próximas visitas.
          </p>
        </div>
      </div>
    </div>
  )
}
