'use client'

import { ButtonV2 } from './button'
import { 
  Search, 
  ChevronRight, 
  Download, 
  Heart, 
  AlertTriangle,
  Check
} from 'lucide-react'

export function ButtonV2Demo() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Variantes</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 variant="primary">Primary Button</ButtonV2>
          <ButtonV2 variant="secondary">Secondary Button</ButtonV2>
          <ButtonV2 variant="ghost">Ghost Button</ButtonV2>
          <ButtonV2 variant="destructive">Destructive</ButtonV2>
          <ButtonV2 variant="success">Success</ButtonV2>
          <ButtonV2 variant="warning">Warning</ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Tamanhos</h3>
        <div className="flex items-center gap-4">
          <ButtonV2 size="sm">Small</ButtonV2>
          <ButtonV2 size="md">Medium</ButtonV2>
          <ButtonV2 size="lg">Large</ButtonV2>
          <ButtonV2 size="xl">Extra Large</ButtonV2>
          <ButtonV2 size="icon" variant="ghost">
            <Heart className="h-5 w-5" />
          </ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Com Ícones</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 leftIcon={<Search className="h-4 w-4" />}>
            Pesquisar
          </ButtonV2>
          <ButtonV2 rightIcon={<ChevronRight className="h-4 w-4" />}>
            Continuar
          </ButtonV2>
          <ButtonV2 leftIcon={<Download className="h-4 w-4" />} rightIcon={<span className="text-xs">PDF</span>}>
            Baixar Relatório
          </ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Estados</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 loading>Carregando...</ButtonV2>
          <ButtonV2 disabled>Desabilitado</ButtonV2>
          <ButtonV2 variant="success" leftIcon={<Check className="h-4 w-4" />}>
            Concluído
          </ButtonV2>
          <ButtonV2 variant="warning" leftIcon={<AlertTriangle className="h-4 w-4" />}>
            Atenção
          </ButtonV2>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Uso Real - CTAs</h3>
        <div className="flex flex-wrap gap-4">
          <ButtonV2 variant="primary" size="lg">
            Portal do Cidadão
          </ButtonV2>
          <ButtonV2 variant="secondary" size="lg">
            Conhecer Agentes
          </ButtonV2>
          <ButtonV2 variant="ghost" rightIcon={<ChevronRight className="h-4 w-4" />}>
            Saiba mais
          </ButtonV2>
        </div>
      </div>
    </div>
  )
}