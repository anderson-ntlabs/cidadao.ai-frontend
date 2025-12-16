import type { TourStep } from './app-tour'

export const dashboardTourSteps: TourStep[] = [
  {
    target: '[data-tour="welcome"]',
    title: 'Bem-vindo ao Cidadão.AI!',
    content:
      'Este é o seu centro de comando para transparência pública. Aqui você acompanha investigações, analisa dados e conversa com nossos agentes de IA.',
    position: 'bottom',
  },
  {
    target: '[data-tour="quick-stats"]',
    title: 'Estatísticas em Tempo Real',
    content:
      'Acompanhe os números principais: contratos analisados, anomalias detectadas, economia identificada e agentes ativos.',
    position: 'bottom',
  },
  {
    target: '[data-tour="nav-chat"]',
    title: 'Chat com IAs',
    content:
      'Converse com 17 agentes especializados em transparência pública. Cada agente tem habilidades únicas para ajudar você.',
    position: 'auto',
    action: {
      label: 'Conhecer Agentes',
      href: '/pt/app/chat',
    },
  },
  {
    target: '[data-tour="nav-dashboard"]',
    title: 'Dashboard de Análises',
    content:
      'Visualize gráficos, métricas e tendências das investigações. Ideal para acompanhamento detalhado.',
    position: 'auto',
  },
  {
    target: '[data-tour="nav-notifications"]',
    title: 'Central de Notificações',
    content:
      'Receba alertas sobre novas anomalias, atualizações de investigações e novidades do sistema.',
    position: 'auto',
  },
  {
    target: '[data-tour="nav-investigations"]',
    title: 'Suas Investigações',
    content:
      'Acesse o histórico completo de todas as análises realizadas. Exporte relatórios e compartilhe resultados.',
    position: 'auto',
  },
  {
    target: '[data-tour="activity"]',
    title: 'Atividade Recente',
    content:
      'Acompanhe em tempo real as últimas ações: investigações iniciadas, anomalias detectadas e análises concluídas.',
    position: 'top',
  },
  {
    target: '[data-tour="quick-actions"]',
    title: 'Ações Rápidas',
    content:
      'Acesse rapidamente as funcionalidades mais usadas: iniciar chat, configurações e seu perfil.',
    position: 'top',
  },
]

// English version for future internationalization
export const dashboardTourStepsEN: TourStep[] = [
  {
    target: '[data-tour="welcome"]',
    title: 'Welcome to Cidadão.AI!',
    content:
      'This is your command center for public transparency. Here you can track investigations, analyze data, and chat with our AI agents.',
    position: 'bottom',
  },
  {
    target: '[data-tour="quick-stats"]',
    title: 'Real-Time Statistics',
    content:
      'Track key numbers: analyzed contracts, detected anomalies, identified savings, and active agents.',
    position: 'bottom',
  },
  {
    target: '[data-tour="nav-chat"]',
    title: 'Chat with AIs',
    content:
      'Chat with 17 specialized agents in public transparency. Each agent has unique skills to help you.',
    position: 'auto',
    action: {
      label: 'Meet Agents',
      href: '/en/app/chat',
    },
  },
  {
    target: '[data-tour="nav-dashboard"]',
    title: 'Analytics Dashboard',
    content:
      'Visualize charts, metrics, and trends from investigations. Ideal for detailed tracking.',
    position: 'auto',
  },
  {
    target: '[data-tour="nav-notifications"]',
    title: 'Notification Center',
    content: 'Receive alerts about new anomalies, investigation updates, and system news.',
    position: 'auto',
  },
  {
    target: '[data-tour="nav-investigations"]',
    title: 'Your Investigations',
    content:
      'Access the complete history of all analyses performed. Export reports and share results.',
    position: 'auto',
  },
  {
    target: '[data-tour="activity"]',
    title: 'Recent Activity',
    content:
      'Track real-time actions: started investigations, detected anomalies, and completed analyses.',
    position: 'top',
  },
  {
    target: '[data-tour="quick-actions"]',
    title: 'Quick Actions',
    content: 'Quickly access the most used features: start chat, settings, and your profile.',
    position: 'top',
  },
]
