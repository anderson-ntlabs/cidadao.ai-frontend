'use client';

import { useState } from 'react';
import { SmartBreadcrumbs } from '@/components/smart-breadcrumbs';
import { BreadcrumbsV2 } from '@/components/breadcrumbs-v2';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card';
import { 
  Home, 
  MessageSquare, 
  Search, 
  Settings,
  FileText,
  Shield,
  User
} from 'lucide-react';

export default function BreadcrumbDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState(0);
  
  const demos = [
    {
      title: 'Detecção Automática',
      description: 'SmartBreadcrumbs detecta automaticamente a página atual',
      component: <SmartBreadcrumbs />
    },
    {
      title: 'Chat com Indicador Ativo',
      description: 'Página de chat marcada como ativa',
      component: (
        <BreadcrumbsV2
          items={[
            { label: 'Home', href: '/pt/home', icon: Home },
            { label: 'Chat', icon: MessageSquare, current: true }
          ]}
        />
      )
    },
    {
      title: 'Investigação Detalhada',
      description: 'Navegação profunda com múltiplos níveis',
      component: (
        <BreadcrumbsV2
          items={[
            { label: 'Home', href: '/pt/home', icon: Home },
            { label: 'Investigações', href: '/pt/investigacoes', icon: Search },
            { label: 'Contratos', href: '/pt/investigacoes/contratos' },
            { label: 'Detalhes', current: true }
          ]}
        />
      )
    },
    {
      title: 'Configurações de Perfil',
      description: 'Com ícones personalizados',
      component: (
        <BreadcrumbsV2
          items={[
            { label: 'Configurações', href: '/pt/settings', icon: Settings },
            { label: 'Perfil', icon: User, current: true }
          ]}
        />
      )
    },
    {
      title: 'Breadcrumb Longo',
      description: 'Com truncamento automático',
      component: (
        <BreadcrumbsV2
          items={[
            { label: 'Home', href: '/pt/home' },
            { label: 'Documentos', href: '/pt/docs' },
            { label: 'Transparência', href: '/pt/docs/transparencia' },
            { label: 'Licitações', href: '/pt/docs/transparencia/licitacoes' },
            { label: 'Análise Detalhada', current: true }
          ]}
          maxItems={3}
        />
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Demonstração de Breadcrumbs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize diferentes estados e configurações dos breadcrumbs com indicadores de página ativa
          </p>
        </div>

        <GlassCard>
          <GlassCardHeader>
            <div className="flex gap-2 flex-wrap">
              {demos.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDemo(index)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedDemo === index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {demo.title}
                </button>
              ))}
            </div>
          </GlassCardHeader>
          
          <GlassCardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{demos[selectedDemo].title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {demos[selectedDemo].description}
              </p>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                {demos[selectedDemo].component}
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-semibold mb-2">Características do Indicador Ativo:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Background gradiente sutil</li>
                <li>✓ Fonte em negrito (semibold)</li>
                <li>✓ Ícone em verde da marca</li>
                <li>✓ Indicador visual (ponto verde) abaixo do item</li>
                <li>✓ Borda suave para definição</li>
                <li>✓ Sombra leve para profundidade</li>
                <li>✓ Atributo aria-current="page" para acessibilidade</li>
              </ul>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader>
            <h3 className="text-lg font-semibold">Código de Exemplo</h3>
          </GlassCardHeader>
          <GlassCardContent>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`// Detecção automática (recomendado)
<SmartBreadcrumbs />

// Ou configuração manual
<BreadcrumbsV2
  items={[
    { label: 'Home', href: '/pt/home', icon: Home },
    { label: 'Chat', icon: MessageSquare, current: true }
  ]}
/>`}</code>
            </pre>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}