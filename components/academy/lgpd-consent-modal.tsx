'use client'

import { useState } from 'react'
import { useAcademyAuth } from '@/hooks/use-academy-auth'

interface LgpdConsentModalProps {
  isOpen: boolean
  onClose?: () => void
}

export function LgpdConsentModal({ isOpen, onClose }: LgpdConsentModalProps) {
  const { user, acceptLgpdConsent } = useAcademyAuth()
  const [isAccepting, setIsAccepting] = useState(false)
  const [checkboxes, setCheckboxes] = useState({
    tracking: false,
    dataProcessing: false,
    certificate: false,
    labsoft: false,
  })

  const allChecked = Object.values(checkboxes).every(Boolean)

  const handleAccept = async () => {
    if (!allChecked) return

    setIsAccepting(true)
    try {
      // Get IP address (optional - can be captured server-side)
      let ipAddress: string | undefined
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        ipAddress = data.ip
      } catch {
        // IP capture failed - not critical
      }

      await acceptLgpdConsent(ipAddress, navigator.userAgent)
      onClose?.()
    } catch (error) {
      console.error('Failed to accept consent:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Termo de Consentimento LGPD</h2>
              <p className="text-green-100">Academia Cidadao.AI + IFSULDEMINAS/LabSoft</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="font-medium text-lg">
              Ola, <span className="text-green-600 dark:text-green-400">{user?.name}</span>!
            </p>

            <p>
              Antes de comecar sua jornada na <strong>Academia Cidadao.AI</strong>, precisamos do
              seu consentimento para o tratamento de dados pessoais, conforme a Lei Geral de
              Protecao de Dados (Lei 13.709/2018 - LGPD).
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                Importante: Rastreamento de Tempo
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Este programa de estagio requer o <strong>registro das horas de atividade</strong>{' '}
                para emissao de certificados e relatorios. Seu tempo sera rastreado automaticamente
                enquanto estiver logado e interagindo com o sistema.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Dados coletados:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Nome completo e email institucional (@alunos.ifsuldeminas.edu.br)</li>
                <li>Tempo de sessao e interacoes com o sistema</li>
                <li>Progresso de aprendizado (videos, leituras, conversas com agentes)</li>
                <li>Diario de aprendizado (reflexoes voluntarias)</li>
                <li>Dados para gamificacao (XP, badges, ranking)</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Finalidades:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Gerar certificado de conclusao com carga horaria</li>
                <li>Produzir relatorio de estagio automatizado</li>
                <li>Pesquisa academica sobre educacao em IA (dados anonimizados)</li>
                <li>Melhoria continua da plataforma de aprendizado</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Seus direitos:</strong> Voce pode solicitar acesso, correcao ou exclusao de
                seus dados a qualquer momento entrando em contato com a coordenacao do LabSoft.
              </p>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-6 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.tracking}
                onChange={(e) => setCheckboxes({ ...checkboxes, tracking: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Autorizo o rastreamento do meu tempo de estudo</strong> para fins de
                documentacao de horas de estagio e emissao de certificados.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.dataProcessing}
                onChange={(e) => setCheckboxes({ ...checkboxes, dataProcessing: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Autorizo o processamento dos meus dados de aprendizado</strong> para analise
                de progresso e pesquisa academica (dados anonimizados).
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.certificate}
                onChange={(e) => setCheckboxes({ ...checkboxes, certificate: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Autorizo a geracao automatica de certificado</strong> contendo meu nome,
                email, carga horaria e metricas de desempenho ao final do programa.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.labsoft}
                onChange={(e) => setCheckboxes({ ...checkboxes, labsoft: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Estou ciente que este programa e uma parceria</strong> entre Neural Thinker
                AI Engineering e IFSULDEMINAS/LabSoft, e que devo cumprir com os compromissos
                estabelecidos no regulamento do programa.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Versao do termo: v1.0 | Data: {new Date().toLocaleDateString('pt-BR')}
            </p>
            <button
              onClick={handleAccept}
              disabled={!allChecked || isAccepting}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all ${
                allChecked
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isAccepting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                'Aceitar e Comecar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
