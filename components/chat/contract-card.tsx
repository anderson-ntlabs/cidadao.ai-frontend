/**
 * Contract Card Component - Displays contract data from Portal da Transparência
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-25
 */

'use client'

import { useState } from 'react'
import {
  Building2,
  FileText,
  Calendar,
  DollarSign,
  User,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContractData } from '@/lib/chat/types'

interface ContractCardProps {
  contract: ContractData
  index: number
  isExpanded?: boolean
}

export function ContractCard({
  contract,
  index,
  isExpanded: defaultExpanded = false,
}: ContractCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateStr
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower.includes('vig') || statusLower.includes('ativo')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }
    if (statusLower.includes('encerr') || statusLower.includes('finali')) {
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
    if (statusLower.includes('cancel') || statusLower.includes('rescind')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        'shadow-sm hover:shadow-md transition-shadow duration-200'
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-start gap-3 text-left"
        aria-expanded={isExpanded}
      >
        {/* Index badge */}
        <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <span className="text-xs font-semibold text-green-700 dark:text-green-300">
            {index + 1}
          </span>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {contract.numero || 'Sem número'}
            </span>
            <span
              className={cn('text-xs px-2 py-0.5 rounded-full', getStatusColor(contract.situacao))}
            >
              {contract.situacao || 'N/A'}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{contract.objeto}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              {contract.valor_formatado || `R$ ${contract.valor?.toLocaleString('pt-BR')}`}
            </span>
            <span className="text-xs text-gray-500">{contract.orgao}</span>
          </div>
        </div>

        {/* Expand icon */}
        <div className="flex-shrink-0 text-gray-400">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Supplier info */}
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fornecedor</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {contract.fornecedor || 'N/A'}
              </p>
              {contract.cnpj_fornecedor && (
                <p className="text-xs text-gray-500">CNPJ: {contract.cnpj_fornecedor}</p>
              )}
            </div>
          </div>

          {/* Organization */}
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Órgão</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{contract.orgao}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Assinatura</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(contract.data_assinatura)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Vigência</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(contract.vigencia_inicio)} - {formatDate(contract.vigencia_fim)}
                </p>
              </div>
            </div>
          </div>

          {/* Value */}
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Valor</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {contract.valor_formatado ||
                  `R$ ${contract.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
            </div>
          </div>

          {/* Additional info */}
          {(contract.modalidade || contract.processo) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {contract.modalidade && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                  {contract.modalidade}
                </span>
              )}
              {contract.processo && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                  Processo: {contract.processo}
                </span>
              )}
            </div>
          )}

          {/* Portal link placeholder */}
          <a
            href={`https://portaldatransparencia.gov.br/contratos/${contract.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:underline"
          >
            Ver no Portal da Transparência
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  )
}

interface ContractListProps {
  contracts: ContractData[]
  downloadAvailable?: boolean
  totalContracts?: number
  onDownload?: () => void
}

export function ContractList({
  contracts,
  downloadAvailable,
  totalContracts,
  onDownload,
}: ContractListProps) {
  if (!contracts || contracts.length === 0) {
    return null
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-green-600" />
          Contratos Encontrados
          <span className="text-xs font-normal text-gray-500">
            ({contracts.length}
            {totalContracts && totalContracts > contracts.length && ` de ${totalContracts}`})
          </span>
        </h4>

        {downloadAvailable && onDownload && (
          <button
            onClick={onDownload}
            className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
          >
            Baixar todos
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Contract cards */}
      <div className="space-y-2">
        {contracts.map((contract, index) => (
          <ContractCard key={contract.id || index} contract={contract} index={index} />
        ))}
      </div>

      {/* Show more indicator */}
      {totalContracts && totalContracts > contracts.length && (
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Mostrando {contracts.length} de {totalContracts} contratos
        </p>
      )}
    </div>
  )
}
