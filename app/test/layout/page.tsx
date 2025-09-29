'use client'

import { AuthLayoutV2, AuthLayoutV2WithSidebar } from '@/components/auth-layout-v2'
import { CardV2, CardV2Header, CardV2Title, CardV2Description, CardV2Content, CardV2Stat } from '@/components/ui/card-v2'
import { ButtonV2 } from '@/components/ui/button-v2'
import { NavigationV2, NavigationV2Group } from '@/components/navigation-v2'
import { FileText, Users, TrendingUp, AlertCircle, Settings, HelpCircle, LogOut } from 'lucide-react'

// Force new design
if (typeof window !== 'undefined') {
  process.env.NEXT_PUBLIC_USE_NEW_DESIGN = 'true'
}

const sidebarNavItems = [
  { name: 'Visão Geral', href: '/pt/dashboard/overview', icon: TrendingUp },
  { name: 'Investigações', href: '/pt/dashboard/investigations', icon: FileText },
  { name: 'Relatórios', href: '/pt/dashboard/reports', icon: FileText },
  { name: 'Configurações', href: '/pt/dashboard/settings', icon: Settings },
]

const sidebarSecondaryItems = [
  { name: 'Ajuda', href: '/pt/help', icon: HelpCircle },
  { name: 'Sair', href: '/pt/logout', icon: LogOut },
]

// Mock authenticated user
if (typeof window !== 'undefined') {
  localStorage.setItem('isAuthenticated', 'true')
  localStorage.setItem('user', JSON.stringify({
    name: 'João Silva',
    email: 'joao@example.com'
  }))
}

export default function TestLayoutPage() {
  return (
    <div>
      {/* Example 1: Basic Layout */}
      <section className="mb-20">
        <AuthLayoutV2 locale="pt">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Dashboard de Transparência
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Bem-vindo ao novo design system integrado
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CardV2Stat
                title="Investigações"
                value="1,234"
                description="Total este mês"
                trend={{ value: 12, isPositive: true }}
                icon={<FileText className="h-5 w-5 text-brand-green-600" />}
              />
              
              <CardV2Stat
                title="Anomalias"
                value="89"
                description="Detectadas hoje"
                trend={{ value: 5, isPositive: false }}
                icon={<AlertCircle className="h-5 w-5 text-brand-red-600" />}
              />
              
              <CardV2Stat
                title="Usuários Ativos"
                value="3.4K"
                description="Últimos 7 dias"
                trend={{ value: 18, isPositive: true }}
                icon={<Users className="h-5 w-5 text-brand-blue-600" />}
              />
              
              <CardV2Stat
                title="Taxa de Sucesso"
                value="94.2%"
                description="Resolução de casos"
                icon={<TrendingUp className="h-5 w-5 text-brand-green-600" />}
              />
            </div>

            {/* Content Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardV2>
                <CardV2Header>
                  <CardV2Title>Últimas Investigações</CardV2Title>
                  <CardV2Description>
                    Acompanhe as investigações mais recentes
                  </CardV2Description>
                </CardV2Header>
                <CardV2Content>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div>
                          <p className="font-medium">Investigação #{1200 + i}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Contrato de licitação suspeito
                          </p>
                        </div>
                        <ButtonV2 size="sm" variant="ghost">
                          Ver
                        </ButtonV2>
                      </div>
                    ))}
                  </div>
                </CardV2Content>
              </CardV2>

              <CardV2>
                <CardV2Header>
                  <CardV2Title>Atividade Recente</CardV2Title>
                  <CardV2Description>
                    Ações dos agentes de IA
                  </CardV2Description>
                </CardV2Header>
                <CardV2Content>
                  <div className="space-y-3">
                    {[
                      { agent: 'Zumbi dos Palmares', action: 'Detectou anomalia em contrato' },
                      { agent: 'Anita Garibaldi', action: 'Analisou padrões de gastos' },
                      { agent: 'Tiradentes', action: 'Gerou relatório de transparência' }
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-green-600 to-brand-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{activity.agent}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardV2Content>
              </CardV2>
            </div>
          </div>
        </AuthLayoutV2>
      </section>

      {/* Example 2: Layout with Sidebar */}
      <section>
        <AuthLayoutV2WithSidebar 
          locale="pt"
          sidebarWidth="normal"
          sidebarContent={
            <div className="h-full flex flex-col p-4">
              <NavigationV2Group title="Dashboard">
                <NavigationV2
                  items={sidebarNavItems}
                  variant="vertical"
                  size="sm"
                />
              </NavigationV2Group>
              
              <div className="flex-1" />
              
              <NavigationV2Group>
                <NavigationV2
                  items={sidebarSecondaryItems}
                  variant="vertical"
                  size="sm"
                />
              </NavigationV2Group>
            </div>
          }
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Layout com Sidebar</h2>
            <CardV2>
              <CardV2Header>
                <CardV2Title>Conteúdo Principal</CardV2Title>
                <CardV2Description>
                  Este layout inclui uma sidebar para navegação complexa
                </CardV2Description>
              </CardV2Header>
              <CardV2Content>
                <p>
                  O AuthLayoutV2WithSidebar é ideal para aplicações que precisam de navegação
                  lateral permanente, como dashboards e painéis administrativos.
                </p>
                <div className="mt-4 flex gap-2">
                  <ButtonV2>Ação Principal</ButtonV2>
                  <ButtonV2 variant="secondary">Ação Secundária</ButtonV2>
                </div>
              </CardV2Content>
            </CardV2>
          </div>
        </AuthLayoutV2WithSidebar>
      </section>
    </div>
  )
}