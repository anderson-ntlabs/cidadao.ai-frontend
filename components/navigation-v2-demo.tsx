'use client'

import { useState } from 'react'
import { NavigationV2, NavigationV2Drawer, NavigationV2Tabs, NavigationV2Group } from './navigation'
import { CardV2, CardV2Header, CardV2Title, CardV2Description, CardV2Content } from './ui/card'
import { ButtonV2 } from './ui/button'
import { 
  Home, 
  MessageSquare, 
  LayoutDashboard, 
  Bell, 
  Settings, 
  User, 
  HelpCircle,
  FileText,
  BarChart,
  Shield,
  Menu
} from 'lucide-react'

const mainNavItems = [
  { name: 'Início', href: '/pt/home', icon: Home },
  { name: 'Chat com IAs', href: '/pt/chat', icon: MessageSquare },
  { name: 'Dashboard', href: '/pt/dashboard', icon: LayoutDashboard },
  { name: 'Notificações', href: '/pt/notifications', icon: Bell, badge: 3 },
]

const settingsNavItems = [
  { name: 'Perfil', href: '/pt/profile', icon: User },
  { name: 'Configurações', href: '/pt/settings', icon: Settings },
  { name: 'Ajuda', href: '/pt/help', icon: HelpCircle },
]

const tabNavItems = [
  { name: 'Visão Geral', href: '/pt/dashboard/overview', icon: BarChart },
  { name: 'Investigações', href: '/pt/dashboard/investigations', icon: FileText, badge: 'Novo' },
  { name: 'Relatórios', href: '/pt/dashboard/reports', icon: FileText },
  { name: 'Segurança', href: '/pt/dashboard/security', icon: Shield },
]

export function NavigationV2Demo() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="space-y-8 p-8">
      {/* Horizontal Navigation */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Navegação Horizontal</h3>
        <CardV2 variant="outlined" padding="none">
          <div className="p-4">
            <NavigationV2 
              items={mainNavItems} 
              variant="horizontal"
              size="md"
            />
          </div>
        </CardV2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Tamanho Pequeno</CardV2Title>
            </CardV2Header>
            <NavigationV2 
              items={mainNavItems} 
              variant="horizontal"
              size="sm"
            />
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Sem Ícones</CardV2Title>
            </CardV2Header>
            <NavigationV2 
              items={mainNavItems} 
              variant="horizontal"
              showIcons={false}
            />
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Apenas Ícones</CardV2Title>
            </CardV2Header>
            <NavigationV2 
              items={mainNavItems} 
              variant="horizontal"
              showLabels={false}
            />
          </CardV2>
        </div>
      </div>

      {/* Vertical Navigation */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Navegação Vertical</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardV2 padding="sm">
            <NavigationV2 
              items={mainNavItems} 
              variant="vertical"
            />
          </CardV2>

          <CardV2 padding="sm">
            <NavigationV2Group title="Menu Principal">
              <NavigationV2 
                items={mainNavItems} 
                variant="vertical"
                size="sm"
              />
            </NavigationV2Group>
            
            <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
            
            <NavigationV2Group title="Configurações">
              <NavigationV2 
                items={settingsNavItems} 
                variant="vertical"
                size="sm"
              />
            </NavigationV2Group>
          </CardV2>

          <CardV2 padding="sm" variant="filled">
            <CardV2Header>
              <CardV2Title className="text-base">Sidebar Completa</CardV2Title>
            </CardV2Header>
            <NavigationV2 
              items={[...mainNavItems, ...settingsNavItems]} 
              variant="vertical"
            />
          </CardV2>
        </div>
      </div>

      {/* Tab Navigation */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Navegação em Abas</h3>
        <CardV2 variant="elevated" padding="none">
          <NavigationV2Tabs items={tabNavItems} />
          <CardV2Content className="p-6">
            <p>Conteúdo da aba selecionada aparece aqui. As abas são ideais para organizar conteúdo relacionado em uma mesma página.</p>
          </CardV2Content>
        </CardV2>
      </div>

      {/* Mobile Navigation */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Navegação Mobile</h3>
        <CardV2>
          <CardV2Header>
            <CardV2Title>Menu Drawer</CardV2Title>
            <CardV2Description>
              Navegação otimizada para dispositivos móveis com drawer lateral
            </CardV2Description>
          </CardV2Header>
          <CardV2Content>
            <ButtonV2 
              variant="secondary" 
              leftIcon={<Menu className="h-4 w-4" />}
              onClick={() => setDrawerOpen(true)}
            >
              Abrir Menu Mobile
            </ButtonV2>
            
            <NavigationV2Drawer
              isOpen={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              items={mainNavItems}
            >
              <div className="mt-6 px-6">
                <NavigationV2Group title="Outras Opções">
                  <NavigationV2 
                    items={settingsNavItems} 
                    variant="mobile"
                    onItemClick={() => setDrawerOpen(false)}
                  />
                </NavigationV2Group>
              </div>
            </NavigationV2Drawer>
          </CardV2Content>
        </CardV2>
      </div>

      {/* Advanced Examples */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Exemplos Avançados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Com Badges e Estados</CardV2Title>
            </CardV2Header>
            <NavigationV2 
              items={[
                { name: 'Dashboard', href: '/pt/dashboard', icon: LayoutDashboard },
                { name: 'Mensagens', href: '/pt/messages', icon: MessageSquare, badge: 5 },
                { name: 'Notificações', href: '/pt/notifications', icon: Bell, badge: '99+' },
                { name: 'Alertas', href: '/pt/alerts', icon: Shield, badge: '!' },
              ]} 
              variant="vertical"
            />
          </CardV2>

          <CardV2>
            <CardV2Header>
              <CardV2Title className="text-base">Links Externos</CardV2Title>
            </CardV2Header>
            <NavigationV2 
              items={[
                { name: 'Portal da Transparência', href: 'https://transparencia.gov.br', external: true },
                { name: 'Documentação', href: 'https://docs.cidadao.ai', external: true },
                { name: 'GitHub', href: 'https://github.com/cidadao-ai', external: true },
              ]} 
              variant="vertical"
            />
          </CardV2>
        </div>
      </div>

      {/* Responsive Example */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Exemplo Responsivo</h3>
        <CardV2 variant="elevated">
          <CardV2Header>
            <CardV2Title>Navegação Adaptável</CardV2Title>
            <CardV2Description>
              Esta navegação se adapta automaticamente ao tamanho da tela
            </CardV2Description>
          </CardV2Header>
          <CardV2Content>
            <div className="hidden lg:block">
              <NavigationV2 items={mainNavItems} variant="horizontal" />
            </div>
            <div className="block lg:hidden">
              <NavigationV2 items={mainNavItems} variant="vertical" />
            </div>
          </CardV2Content>
        </CardV2>
      </div>
    </div>
  )
}