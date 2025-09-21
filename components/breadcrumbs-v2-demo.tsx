'use client'

import { BreadcrumbsV2, BreadcrumbsV2Mobile, type BreadcrumbItemV2 } from './breadcrumbs-v2'
import { CardV2, CardV2Header, CardV2Title, CardV2Description, CardV2Content } from './ui/card-v2'
import { Home, FileText, Shield, Settings, User, BarChart } from 'lucide-react'

const basicItems: BreadcrumbItemV2[] = [
  { label: 'Dashboard', href: '/pt/dashboard' },
  { label: 'Investigações', href: '/pt/dashboard/investigations' },
  { label: 'Relatório #1234' }
]

const iconItems: BreadcrumbItemV2[] = [
  { label: 'Dashboard', href: '/pt/dashboard', icon: BarChart },
  { label: 'Segurança', href: '/pt/dashboard/security', icon: Shield },
  { label: 'Configurações', href: '/pt/dashboard/security/settings', icon: Settings },
  { label: 'Autenticação' }
]

const longPathItems: BreadcrumbItemV2[] = [
  { label: 'Home', href: '/pt/home' },
  { label: 'Dashboard', href: '/pt/dashboard' },
  { label: 'Investigações', href: '/pt/dashboard/investigations' },
  { label: 'Contratos Públicos', href: '/pt/dashboard/investigations/contracts' },
  { label: 'Saúde', href: '/pt/dashboard/investigations/contracts/health' },
  { label: 'Hospitais', href: '/pt/dashboard/investigations/contracts/health/hospitals' },
  { label: 'Relatório Detalhado' }
]

const userFlowItems: BreadcrumbItemV2[] = [
  { label: 'Conta', href: '/pt/account', icon: User },
  { label: 'Perfil', href: '/pt/account/profile' },
  { label: 'Editar' }
]

export function BreadcrumbsV2Demo() {
  return (
    <div className="space-y-8 p-8">
      {/* Basic Examples */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Exemplos Básicos</h3>
        <div className="space-y-4">
          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Breadcrumbs Padrão</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={basicItems} />
            </CardV2Content>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Com Ícones</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={iconItems} />
            </CardV2Content>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Sem Home</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={basicItems} showHome={false} />
            </CardV2Content>
          </CardV2>
        </div>
      </div>

      {/* Separator Variations */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Variações de Separadores</h3>
        <div className="space-y-4">
          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Chevron (Padrão)</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={basicItems} separator="chevron" />
            </CardV2Content>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Slash</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={basicItems} separator="slash" />
            </CardV2Content>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Arrow</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={basicItems} separator="arrow" />
            </CardV2Content>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Dot</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={basicItems} separator="dot" />
            </CardV2Content>
          </CardV2>
        </div>
      </div>

      {/* Spacing Variations */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Variações de Espaçamento</h3>
        <div className="space-y-4">
          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Compacto</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={iconItems} spacing="compact" />
            </CardV2Content>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Normal (Padrão)</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={iconItems} spacing="normal" />
            </CardV2Content>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Relaxed</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={iconItems} spacing="relaxed" />
            </CardV2Content>
          </CardV2>
        </div>
      </div>

      {/* Long Path with Collapse */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Caminho Longo</h3>
        <div className="space-y-4">
          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Caminho Completo</CardV2Title>
              <CardV2Description>7 níveis de navegação</CardV2Description>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={longPathItems} />
            </CardV2Content>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Collapsed (max 4 itens)</CardV2Title>
              <CardV2Description>Mostra primeiro e últimos 3 itens</CardV2Description>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={longPathItems} maxItems={4} />
            </CardV2Content>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Collapsed (max 3 itens)</CardV2Title>
              <CardV2Description>Mostra primeiro e últimos 2 itens</CardV2Description>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={longPathItems} maxItems={3} />
            </CardV2Content>
          </CardV2>
        </div>
      </div>

      {/* Mobile Breadcrumbs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Versão Mobile</h3>
        <CardV2>
          <CardV2Header>
            <CardV2Title>BreadcrumbsV2Mobile</CardV2Title>
            <CardV2Description>
              Otimizado para telas pequenas, mostra apenas a página anterior
            </CardV2Description>
          </CardV2Header>
          <CardV2Content>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <BreadcrumbsV2Mobile items={basicItems} />
              </div>
              
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <BreadcrumbsV2Mobile items={iconItems} />
              </div>
              
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <BreadcrumbsV2Mobile 
                  items={[{ label: 'Dashboard', href: '/pt/dashboard' }]} 
                />
              </div>
            </div>
          </CardV2Content>
        </CardV2>
      </div>

      {/* Style Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Variantes de Estilo</h3>
        <div className="space-y-4">
          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Default</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={userFlowItems} variant="default" />
            </CardV2Content>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Subtle</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={userFlowItems} variant="subtle" />
            </CardV2Content>
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Prominent</CardV2Title>
            </CardV2Header>
            <CardV2Content className="py-0">
              <BreadcrumbsV2 items={userFlowItems} variant="prominent" />
            </CardV2Content>
          </CardV2>
        </div>
      </div>

      {/* Interactive Example */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Exemplo Interativo</h3>
        <CardV2>
          <CardV2Header>
            <CardV2Title>Com Callback</CardV2Title>
            <CardV2Description>
              Clique nos itens para ver o evento no console
            </CardV2Description>
          </CardV2Header>
          <CardV2Content>
            <BreadcrumbsV2 
              items={iconItems}
              onItemClick={(item) => {
                console.log('Breadcrumb clicked:', item)
                alert(`Navegando para: ${item.label}`)
              }}
            />
          </CardV2Content>
        </CardV2>
      </div>

      {/* Responsive Example */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Exemplo Responsivo</h3>
        <CardV2>
          <CardV2Header>
            <CardV2Title>Desktop vs Mobile</CardV2Title>
            <CardV2Description>
              Diferentes componentes para diferentes tamanhos de tela
            </CardV2Description>
          </CardV2Header>
          <CardV2Content>
            {/* Desktop */}
            <div className="hidden md:block">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Desktop:</p>
              <BreadcrumbsV2 items={longPathItems} />
            </div>
            
            {/* Mobile */}
            <div className="block md:hidden">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mobile:</p>
              <BreadcrumbsV2Mobile items={longPathItems} />
            </div>
          </CardV2Content>
        </CardV2>
      </div>
    </div>
  )
}