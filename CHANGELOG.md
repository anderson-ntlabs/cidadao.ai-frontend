# Changelog

---

**Documento**: Registro de Mudanças
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-09-17 08:42:08 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Documentation / Changelog
**Última Atualização**: 2026-11-03

---

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### 🚀 Adicionado

- **Política de IA Responsável e de Conteúdo** (`/pt/responsible-ai`, `/en/responsible-ai`)
  - Uso da IA, limites ("um achado não é uma acusação"), conteúdo proibido, canal de denúncia,
    remoção e comunicação às autoridades, proteção de crianças (ECA e LGPD art. 14)
- **Aviso "Um achado não é uma acusação"** (`components/ai/finding-notice.tsx`) junto às respostas
  dos agentes no chat, às anomalias, ao resumo da investigação e à lista de investigações
- **Consentimento LGPD antes do cadastro** (`components/privacy/signup-consent.tsx`): o login e o
  cadastro (`/pt/login`, `/pt/agora/login`) só ficam habilitados após o aceite da política
- **Links legais nas áreas logadas** (`components/legal-links.tsx`) em `/pt/app/*` e `/pt/agora/*`

### 🔄 Modificado

- **Política de Privacidade** (PT/EN) reescrita: controlador e contato, dados coletados, bases
  legais, operadores reais (Vercel, Supabase, Railway, provedor de LLM, PostHog, Sentry, Resend,
  ipify), prazos de retenção, direitos do titular e como exercê-los, crianças e adolescentes
- **Exportação e exclusão de dados** agora incluem sessões e mensagens do chat, preferências,
  atividades e investigações
- **Termos de Uso**: links para a Política de IA Responsável; removida a proibição de redistribuir
  o código, que contradizia a licença MIT

### 🐛 Corrigido

- Links quebrados para `/pt/termos` e `/pt/privacidade` no login da Ágora e no modal LGPD
- Seletor de idioma levava `/en/privacy` e `/en/terms` para rotas inexistentes em português

---

## [1.1.0] - 2026-02-25

### 🚀 Adicionado

- **Captura de Session ID do Backend** (`primary.adapter.ts`)
  - PrimaryAdapter captura `session_id` do evento SSE `start` durante streaming
  - Session ID disponível no `ChatResponse.data.sessionId` para rastreamento de sessões

- **Auth Bridge Supabase → Backend** (`types.ts`)
  - `session_id` adicionado à interface `StreamEvent`
  - `sessionId` adicionado à interface `ChatResponse.data`
  - Permite que o frontend identifique sessões persistidas no backend

### 🔄 Modificado

- **PrimaryAdapter SSE Handling** (`lib/chat/adapters/primary.adapter.ts`)
  - Evento `start` agora extrai e armazena `session_id` do payload SSE
  - Token JWT do Supabase enviado automaticamente via localStorage `access_token`

---

## [Unreleased]

### 🚀 Adicionado

- Sistema completo de notificações toast com 4 tipos (success, error, info, warning)
- Página 404 customizada com design temático Operários
- Componente de breadcrumbs para navegação interna
- Tour guiado interativo para novos usuários no dashboard
- Documentação completa no README.md
- Guia de contribuição (CONTRIBUTING.md)
- Este arquivo de changelog

### 🔄 Modificado

- Padronização de transparência em todas as páginas internas
- Melhorias na consistência visual com glass morphism
- Atualização do README com documentação detalhada

## [1.0.0] - 2025-01-17

### 🎉 Lançamento Inicial

#### 🚀 Funcionalidades Principais

- **Autenticação Mockada**
  - Login com Google, Gov.br, GitHub e X (Twitter)
  - Persistência de sessão com localStorage
  - Fluxo de logout

- **Dashboard de Investigações**
  - Métricas em tempo real (mockadas)
  - Lista de investigações recentes
  - Indicadores de anomalias
  - Cards com backdrop blur

- **Chat com IAs**
  - Seleção entre 8 agentes especializados
  - Integração com API do backend HuggingFace
  - Histórico de conversas em memória
  - Sugestões contextuais

- **Landing Pages**
  - Versão bilíngue (PT/EN)
  - Hero section com CTAs
  - Seções de features
  - Links para recursos externos

#### 🎨 Design e UX

- **Identidade Visual Operários**
  - Imagem de Tarsila do Amaral como fundo fixo
  - Transparências consistentes (70% header, 90% conteúdo)
  - Glass morphism em todos componentes
- **Sistema de Cores**
  - Verde (#10b981) - Esperança
  - Amarelo (#eab308) - Sol
  - Azul (#3b82f6) - Céu

- **PWA (Progressive Web App)**
  - Instalável em dispositivos
  - Ícones e splash screens
  - Manifest.json configurado

#### 🛠️ Infraestrutura Técnica

- Next.js 15 com App Router
- TypeScript 5.0
- Tailwind CSS 3.4
- Zustand para gerenciamento de estado
- Lucide React para ícones

### 📦 Dependências Iniciais

- `next`: 15.1.4
- `react`: 18.3.1
- `typescript`: ^5
- `tailwindcss`: ^3.4.0
- `zustand`: ^5.0.2
- `next-pwa`: ^5.6.0

---

## Legenda de Tipos de Mudança

- 🚀 **Adicionado**: Funcionalidades novas
- 🔄 **Modificado**: Mudanças em funcionalidades existentes
- 🐛 **Corrigido**: Correções de bugs
- 🗑️ **Removido**: Funcionalidades removidas
- 📝 **Documentação**: Mudanças apenas na documentação
- 🚨 **Segurança**: Correções de vulnerabilidades
- ⚡ **Performance**: Melhorias de performance

[Unreleased]: https://github.com/anderson-ntlabs/cidadao.ai-frontend/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/anderson-ntlabs/cidadao.ai-frontend/releases/tag/v1.0.0
