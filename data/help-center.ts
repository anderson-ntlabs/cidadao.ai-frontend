export interface HelpArticle {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  content: string
  relatedArticles?: string[]
  helpful?: number
  notHelpful?: number
}

export interface HelpCategory {
  id: string
  name: string
  description: string
  icon: string
  articles: number
}

export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Primeiros Passos',
    description: 'Aprenda o básico sobre o Cidadão.AI',
    icon: '🚀',
    articles: 8
  },
  {
    id: 'agents',
    name: 'Agentes de IA',
    description: 'Conheça nossos agentes especializados',
    icon: '🤖',
    articles: 17
  },
  {
    id: 'investigations',
    name: 'Investigações',
    description: 'Como funcionam as análises de transparência',
    icon: '🔍',
    articles: 12
  },
  {
    id: 'dashboard',
    name: 'Dashboard e Relatórios',
    description: 'Visualize e exporte dados',
    icon: '📊',
    articles: 10
  },
  {
    id: 'account',
    name: 'Conta e Configurações',
    description: 'Gerencie seu perfil e preferências',
    icon: '⚙️',
    articles: 15
  },
  {
    id: 'troubleshooting',
    name: 'Solução de Problemas',
    description: 'Resolva questões comuns',
    icon: '🔧',
    articles: 9
  }
]

export const helpArticles: HelpArticle[] = [
  // Getting Started
  {
    id: 'what-is-cidadao-ai',
    title: 'O que é o Cidadão.AI?',
    description: 'Entenda nossa missão e como funciona o sistema',
    category: 'getting-started',
    tags: ['introdução', 'básico', 'conceitos'],
    content: `
# O que é o Cidadão.AI?

O Cidadão.AI é uma plataforma de **inteligência artificial** desenvolvida para democratizar o acesso a dados públicos e fortalecer a transparência governamental no Brasil.

## Nossa Missão

Utilizamos tecnologia de ponta para:
- 🔍 **Analisar** contratos e licitações públicas
- 🚨 **Detectar** anomalias e possíveis irregularidades
- 📊 **Visualizar** dados complexos de forma simples
- 🤝 **Empoderar** cidadãos com informação

## Como Funciona

1. **Coleta de Dados**: Acessamos bases de dados públicas
2. **Análise por IA**: 17 agentes especializados processam informações
3. **Detecção de Padrões**: Identificamos anomalias automaticamente
4. **Relatórios**: Geramos insights acionáveis

## Por que é Importante?

A transparência é fundamental para uma democracia saudável. Com o Cidadão.AI, qualquer pessoa pode:
- Acompanhar como recursos públicos são gastos
- Identificar possíveis irregularidades
- Contribuir para uma gestão pública mais eficiente
    `,
    relatedArticles: ['how-to-start', 'understanding-agents'],
    helpful: 156,
    notHelpful: 3
  },
  {
    id: 'how-to-start',
    title: 'Como começar a usar o Cidadão.AI',
    description: 'Guia passo a passo para novos usuários',
    category: 'getting-started',
    tags: ['tutorial', 'início', 'passo-a-passo'],
    content: `
# Como começar a usar o Cidadão.AI

Bem-vindo! Este guia vai te ajudar a dar os primeiros passos na plataforma.

## 1. Crie sua Conta

- Clique em **"Entrar"** no canto superior direito
- Escolha seu método de login preferido (Google, Gov.br, GitHub)
- Autorize o acesso e pronto!

## 2. Explore o Dashboard

Após o login, você verá o dashboard principal com:
- **Métricas em Tempo Real**: Investigações ativas
- **Alertas**: Anomalias detectadas recentemente
- **Gráficos**: Visualizações de dados

## 3. Converse com os Agentes

Nossa funcionalidade mais poderosa! 
- Acesse o **Chat** no menu principal
- Digite sua pergunta sobre transparência pública
- Os agentes de IA analisarão e responderão

## 4. Personalize sua Experiência

- Acesse **Configurações** para ajustar:
  - Tema claro/escuro
  - Notificações
  - Preferências de privacidade

## Próximos Passos

- [Entenda os Agentes de IA](/help/understanding-agents)
- [Configure suas Notificações](/help/notification-settings)
- [Exporte seu Primeiro Relatório](/help/export-data)
    `,
    relatedArticles: ['understanding-agents', 'notification-settings'],
    helpful: 203,
    notHelpful: 7
  },
  
  // Agents
  {
    id: 'understanding-agents',
    title: 'Entendendo os Agentes de IA',
    description: 'Conheça nossos 17 agentes especializados',
    category: 'agents',
    tags: ['agentes', 'IA', 'especialidades'],
    content: `
# Entendendo os Agentes de IA

O Cidadão.AI conta com **17 agentes especializados**, cada um com habilidades únicas para análise de transparência pública.

## Principais Agentes

### 🥷 Zumbi dos Palmares
**Especialidade**: Detecção de Anomalias
- Analisa padrões suspeitos em contratos
- Identifica valores fora do comum
- Score de precisão: 94%

### ⚔️ Anita Garibaldi
**Especialidade**: Análise de Padrões
- Compara históricos de licitações
- Detecta favorecimentos recorrentes
- Score de precisão: 91%

### 📝 Machado de Assis
**Especialidade**: Análise Textual
- Examina documentos e contratos
- Identifica cláusulas problemáticas
- Score de precisão: 88%

## Como os Agentes Trabalham

1. **Recebem sua Pergunta**: Você faz uma consulta no chat
2. **Análise Colaborativa**: Múltiplos agentes podem trabalhar juntos
3. **Processamento**: Cada agente aplica sua especialidade
4. **Resposta Integrada**: Resultados combinados e explicados

## Dicas de Uso

- Seja específico em suas perguntas
- Mencione o tipo de análise desejada
- Peça comparações temporais para melhores insights
    `,
    relatedArticles: ['chat-best-practices', 'agent-specialties'],
    helpful: 189,
    notHelpful: 5
  },
  
  // Dashboard
  {
    id: 'export-data',
    title: 'Como Exportar Dados e Relatórios',
    description: 'Exporte análises em PDF ou CSV',
    category: 'dashboard',
    tags: ['export', 'pdf', 'csv', 'relatórios'],
    content: `
# Como Exportar Dados e Relatórios

O Cidadão.AI permite exportar todas as análises em diferentes formatos.

## Formatos Disponíveis

### 📄 PDF
Ideal para:
- Relatórios formais
- Compartilhamento profissional
- Documentação com gráficos

### 📊 CSV
Ideal para:
- Análise em Excel/Sheets
- Processamento de dados
- Integrações com outros sistemas

## Como Exportar

### No Dashboard:
1. Clique no botão **"Exportar"** (ícone de download)
2. Escolha o formato desejado
3. Selecione o período de dados
4. Aguarde o processamento

### Opções de Export:
- **Dashboard Completo**: Todos os gráficos e métricas
- **Dados Específicos**: Apenas a aba selecionada
- **Relatório Financeiro**: Análise detalhada de gastos

## Dicas Importantes

- Exports grandes podem demorar alguns segundos
- PDFs incluem gráficos em alta resolução
- CSVs mantêm formatação brasileira (R$, datas)
    `,
    relatedArticles: ['dashboard-overview', 'data-analysis'],
    helpful: 145,
    notHelpful: 2
  },
  
  // Account
  {
    id: 'notification-settings',
    title: 'Configurando Notificações',
    description: 'Personalize seus alertas e notificações',
    category: 'account',
    tags: ['notificações', 'alertas', 'configurações'],
    content: `
# Configurando Notificações

Mantenha-se informado sobre investigações e anomalias importantes.

## Tipos de Notificações

### 🔍 Investigações
- Novas investigações iniciadas
- Conclusão de análises
- Atualizações de status

### 🚨 Anomalias
- Detecção de irregularidades
- Alertas de alto risco
- Padrões suspeitos

### 📊 Relatórios
- Relatórios prontos para download
- Resumos semanais/mensais
- Insights importantes

## Como Configurar

1. Acesse **Configurações** → **Notificações**
2. Ative/desative cada tipo
3. Escolha a frequência:
   - Imediato
   - Resumo diário
   - Resumo semanal

## Canais de Notificação

- **🔔 No Sistema**: Badge no header
- **💻 Desktop**: Notificações do navegador
- **📧 Email**: Para alertas críticos

## Melhores Práticas

- Ative apenas notificações relevantes
- Use resumos para evitar excesso
- Configure horário de não perturbar
    `,
    relatedArticles: ['privacy-settings', 'email-preferences'],
    helpful: 167,
    notHelpful: 4
  }
]

export const popularArticles = [
  'what-is-cidadao-ai',
  'how-to-start',
  'understanding-agents',
  'export-data'
]

export const recentArticles = [
  'notification-settings',
  'export-data',
  'understanding-agents'
]