# JORNADA COMPLETA DO USUÁRIO FINAL
# CIDADÃO.AI - Da Interface ao Backend

**Autor**: Anderson Henrique da Silva  
**Data**: 2025-10-22  
**Público**: Desenvolvedores e Product Owners

---

## 🎯 VISÃO GERAL

Este documento explica **EXATAMENTE** como a integração frontend-backend se traduz em experiência para o usuário final.

---

## 📱 FLUXO COMPLETO: DO CLIQUE À RESPOSTA

### 1️⃣ **Usuário Acessa a Aplicação**

```
Usuário digita: https://cidadao-ai-frontend.vercel.app
                          ↓
            Vercel Edge Network (CDN)
                          ↓
            Next.js 15 App (SSR + Client)
                          ↓
            Landing Page renderizada
```

**O que o usuário vê:**
- 🏠 **Landing Page** com hero section
- 🎨 **Design glassmorphism** (tema Tarsila do Amaral)
- 🌐 **Seletor de idioma** (PT/EN) no header
- 🔐 **Botões de login** (Google/GitHub OAuth)
- ♿ **Widget VLibras** (LIBRAS) no canto inferior direito

**Arquivos envolvidos:**
- `app/pt/page.tsx` - Landing page PT
- `components/navigation.tsx` - Header
- `components/a11y/vlibras-widget.tsx` - VLibras
- `styles/globals.css` - Glassmorphism

---

### 2️⃣ **Usuário Faz Login**

```
Clica em "Entrar com Google"
            ↓
Redireciona para Google OAuth
            ↓
Google autentica e retorna code
            ↓
app/auth/callback/route.ts
            ↓
Supabase.auth.exchangeCodeForSession(code)
            ↓
Session salva em cookies
            ↓
Redireciona para /pt/home
```

**O que o usuário vê:**
1. **Popup de autenticação do Google**
2. **Loading screen** (durante OAuth)
3. **Redirecionamento automático** para home autenticada

**Arquivos envolvidos:**
- `app/pt/login/page.tsx` - Tela de login
- `app/auth/callback/route.ts` - OAuth callback (CORRIGIDO)
- `lib/supabase/server.ts` - Supabase client
- `middleware.ts` - Session refresh

**Correção recente (2025-10-22):**
- ✅ OAuth agora **persiste sessão corretamente**
- ✅ Sem necessidade de refresh manual
- ✅ Redirecionamento imediato após login

---

### 3️⃣ **Usuário Acessa o Chat**

```
Clica em "Chat" no menu
            ↓
Navega para /pt/chat
            ↓
app/pt/(authenticated)/chat/page.tsx renderiza
            ↓
useChatStore().initializeChat() é chamado
            ↓
chatService.getAgents() busca agentes
```

**Requisição HTTP:**
```http
GET https://cidadao-api-production.up.railway.app/api/v1/chat/agents
```

**Resposta do Backend:**
```json
[
  {
    "id": "abaporu",
    "name": "Abaporu",
    "avatar": "🎨",
    "role": "Orquestrador Master",
    "description": "Coordena investigações complexas",
    "status": "active"
  },
  // ... mais 5 agentes
]
```

**O que o usuário vê:**
```
┌─────────────────────────────────────────┐
│  CIDADÃO.AI                      [PT] ▼ │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 📋 AGENTES DISPONÍVEIS            │  │
│  ├───────────────────────────────────┤  │
│  │ 🎨 Abaporu                        │  │
│  │    Orquestrador Master            │  │
│  │ 🔍 Zumbi dos Palmares            │  │
│  │    Investigador                   │  │
│  │ 📊 Anita Garibaldi               │  │
│  │    Analista                       │  │
│  │ 📝 Tiradentes                     │  │
│  │    Relator                        │  │
│  │ 📚 Machado de Assis              │  │
│  │    Analista Textual               │  │
│  │ ⚖️ Dandara                         │  │
│  │    Justiça Social                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Olá! Como posso ajudar?           │  │
│  │ [________________________] [Enviar] │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Arquivos envolvidos:**
- `app/pt/(authenticated)/chat/page.tsx` - Página do chat
- `components/chat/chat-interface.tsx` - Interface visual
- `components/chat/agent-list.tsx` - Lista de agentes
- `store/chat-store.ts` - Estado global do chat
- `lib/api/chat.service.ts` - Comunicação com backend

---

### 4️⃣ **Usuário Envia Mensagem**

```
Usuário digita: "Quais são os maiores contratos do governo em 2024?"
Clica em "Enviar"
            ↓
handleSendMessage() no ChatInterface
            ↓
useChatStore().sendMessage(mensagem)
            ↓
smartChatService.sendMessage()
            ↓
sendBackendMessage() - POST request
```

**Requisição HTTP:**
```http
POST https://cidadao-api-production.up.railway.app/api/v1/chat/message
Content-Type: application/json

{
  "message": "Quais são os maiores contratos do governo em 2024?",
  "session_id": "session_1729634402123_abc456"
}
```

**O que acontece no Backend (Railway):**
```
FastAPI recebe request
        ↓
Intent Detection (NLP)
        ↓
Identifica intent: "investigate"
        ↓
Agent Router seleciona: "Abaporu" (orquestrador)
        ↓
Abaporu invoca: "Zumbi" (investigador)
        ↓
Zumbi analisa com Maritaca Sabiá-3 LLM
        ↓
Retorna resposta estruturada
```

**Resposta do Backend:**
```json
{
  "session_id": "session_1729634402123_abc456",
  "message_id": "msg_xyz789",
  "agent_id": "zumbi",
  "agent_name": "Zumbi dos Palmares",
  "message": "🔍 Analisando os maiores contratos governamentais de 2024...\n\nEncontrei 15 contratos relevantes:\n\n1. **Contrato TI - Ministério da Defesa**\n   - Valor: R$ 45.000.000,00\n   - Fornecedor: TechGov Solutions\n   - Status: Ativo\n   - ⚠️ ANOMALIA: Preço 127% acima da média\n\n2. **Sistema Integrado - Ministério da Saúde**\n   - Valor: R$ 38.500.000,00\n   ...",
  "confidence": 0.92,
  "suggested_actions": [
    "Ver detalhes das anomalias",
    "Exportar relatório em PDF",
    "Investigar fornecedores"
  ],
  "follow_up_questions": [
    "Gostaria de investigar as anomalias detectadas?",
    "Quer ver contratos de um ministério específico?",
    "Precisa exportar esses dados?"
  ],
  "metadata": {
    "intent_type": "investigate",
    "model_used": "maritaca-sabia-3",
    "processing_time_ms": 1847,
    "orchestration": {
      "target_agent": "zumbi",
      "routing_reason": "Investigation intent with contract analysis"
    }
  }
}
```

**O que o usuário vê (em tempo real):**

**Passo 1 - Mensagem enviada:**
```
┌─────────────────────────────────────────┐
│ Você (14:30)                            │
│ Quais são os maiores contratos do       │
│ governo em 2024?                        │
└─────────────────────────────────────────┘
```

**Passo 2 - Agente pensando (loading):**
```
┌─────────────────────────────────────────┐
│ 🔍 Zumbi dos Palmares está pensando...  │
│ [▓▓▓▓░░░░░░] Analisando contratos       │
└─────────────────────────────────────────┘
```

**Passo 3 - Resposta completa:**
```
┌─────────────────────────────────────────┐
│ 🔍 Zumbi dos Palmares (14:30)          │
│                                         │
│ 🔍 Analisando os maiores contratos      │
│ governamentais de 2024...               │
│                                         │
│ Encontrei 15 contratos relevantes:     │
│                                         │
│ 1. **Contrato TI - Ministério da       │
│    Defesa**                             │
│    - Valor: R$ 45.000.000,00           │
│    - Fornecedor: TechGov Solutions     │
│    - Status: Ativo                      │
│    - ⚠️ ANOMALIA: Preço 127% acima     │
│                                         │
│ 2. **Sistema Integrado - Ministério    │
│    da Saúde**                           │
│    - Valor: R$ 38.500.000,00           │
│    ...                                  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💡 PERGUNTAS DE ACOMPANHAMENTO      │ │
│ ├─────────────────────────────────────┤ │
│ │ • Gostaria de investigar as         │ │
│ │   anomalias detectadas?             │ │
│ │ • Quer ver contratos de um          │ │
│ │   ministério específico?            │ │
│ │ • Precisa exportar esses dados?     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ AÇÕES SUGERIDAS                     │ │
│ ├─────────────────────────────────────┤ │
│ │ [📊 Ver detalhes das anomalias]     │ │
│ │ [📄 Exportar relatório em PDF]      │ │
│ │ [🔍 Investigar fornecedores]        │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Arquivos envolvidos:**
- `components/chat/message-item.tsx` - Renderiza mensagens
- `components/chat/typing-indicator.tsx` - Indicador de digitação
- `components/chat/suggested-actions.tsx` - Ações sugeridas
- `components/chat/follow-up-questions.tsx` - Perguntas follow-up
- `lib/api/chat-adapter-backend.ts` - Faz POST para backend
- `store/chat-store.ts` - Gerencia estado das mensagens

---

### 5️⃣ **Usuário Clica em Ação Sugerida**

```
Usuário clica: "Ver detalhes das anomalias"
            ↓
handleSuggestedAction("Ver detalhes das anomalias")
            ↓
sendMessage("Ver detalhes das anomalias")
            ↓
Backend processa como nova mensagem
            ↓
Agente retorna detalhes expandidos
```

**O que o usuário vê:**
```
┌─────────────────────────────────────────┐
│ Você (14:32)                            │
│ Ver detalhes das anomalias              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🔍 Zumbi dos Palmares (14:32)          │
│                                         │
│ ⚠️ ANOMALIAS DETECTADAS                 │
│                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ ANOMALIA #1: PREÇO EXCESSIVO            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                         │
│ 📄 Contrato: TechGov Solutions          │
│ 💰 Valor: R$ 45.000.000,00              │
│ 📊 Desvio: +127% da média               │
│ 🎯 Confiança: 95%                       │
│                                         │
│ 📈 Análise Estatística:                 │
│ - Média de mercado: R$ 19.800.000       │
│ - Desvio padrão: R$ 8.200.000          │
│ - Z-score: 3.07 (crítico)               │
│                                         │
│ 🔍 Evidências:                          │
│ • Contratos similares em outros órgãos  │
│   custaram em média 54% menos           │
│ • Fornecedor tem histórico de preços    │
│   inflacionados (3 contratos anteriores)│
│ • Processo licitatório teve apenas 2    │
│   participantes (baixa concorrência)    │
│                                         │
│ 💡 Recomendação:                        │
│ Solicitar revisão técnica do contrato   │
│ e análise de viabilidade de renegociação│
│                                         │
│ [📄 Exportar Análise] [🔍 Próxima]      │
└─────────────────────────────────────────┘
```

---

### 6️⃣ **Usuário Exporta Dados**

```
Usuário clica: "Exportar relatório em PDF"
            ↓
handleExport("pdf")
            ↓
POST /api/v1/export/investigations/{id}/download
```

**Requisição HTTP:**
```http
POST https://cidadao-api-production.up.railway.app/api/v1/export/investigations/inv_123/download
Content-Type: application/json

{
  "format": "pdf",
  "sections": ["summary", "anomalies", "charts"],
  "language": "pt-BR"
}
```

**Resposta do Backend:**
```json
{
  "download_url": "https://cidadao-api.../exports/temp_xyz.pdf",
  "expires_at": "2025-10-22T15:32:00Z",
  "file_size": 2457600
}
```

**O que o usuário vê:**
1. **Loading modal** com progresso
2. **Download automático** do PDF
3. **Toast notification**: "✅ Relatório baixado com sucesso!"

**Conteúdo do PDF:**
```
╔═══════════════════════════════════════════════════════╗
║  RELATÓRIO DE INVESTIGAÇÃO - CIDADÃO.AI               ║
║  Contratos Governamentais 2024                        ║
╚═══════════════════════════════════════════════════════╝

📊 SUMÁRIO EXECUTIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total de contratos analisados: 15
Anomalias detectadas: 3
Valor total envolvido: R$ 287.500.000,00
Confiança média: 92%

⚠️ ANOMALIAS CRÍTICAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Tabela com dados estruturados]
[Gráficos de análise temporal]
[Rede de fornecedores]

📋 RECOMENDAÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Revisão técnica do contrato XYZ
2. Auditoria de fornecedor ABC
...
```

**Arquivos envolvidos:**
- `components/export/export-button.tsx` - Botão de export
- `components/export/export-modal.tsx` - Modal de progresso
- `lib/api/export.service.ts` - API de export
- Backend gera PDF usando ReportLab/FPDF

---

## 🎨 COMPONENTES VISUAIS MAPEADOS

### Header (Sempre Visível)
```typescript
// components/navigation.tsx
<Navigation>
  <Logo />                        // Cidadão.AI
  <NavMenu>
    <NavItem href="/pt/home">Home</NavItem>
    <NavItem href="/pt/chat">Chat</NavItem>
    <NavItem href="/pt/investigacoes">Investigações</NavItem>
    <NavItem href="/pt/dashboard">Dashboard</NavItem>
  </NavMenu>
  <LanguageSwitcher />           // PT/EN toggle
  <UserMenu>
    <Avatar src={user.avatar} />
    <Dropdown>
      <DropdownItem>Perfil</DropdownItem>
      <DropdownItem>Configurações</DropdownItem>
      <DropdownItem onClick={logout}>Sair</DropdownItem>
    </Dropdown>
  </UserMenu>
</Navigation>
```

### Chat Interface (Tela Principal)
```typescript
// app/pt/(authenticated)/chat/page.tsx
<ChatLayout>
  <Sidebar>                       // Coluna esquerda
    <AgentList agents={agents} />
    <QuickActions actions={suggestedActions} />
  </Sidebar>
  
  <MainArea>                      // Centro
    <MessageList>
      {messages.map(msg => (
        <MessageItem
          key={msg.id}
          message={msg}
          agentAvatar={getAgentAvatar(msg.agent_id)}
        />
      ))}
    </MessageList>
    
    {agentTyping && <TypingIndicator agent={currentAgent} />}
    
    {followUpQuestions.length > 0 && (
      <FollowUpQuestions questions={followUpQuestions} />
    )}
  </MainArea>
  
  <InputArea>                     // Rodapé
    <ChatInput
      value={message}
      onChange={setMessage}
      onSend={handleSend}
      placeholder="Digite sua pergunta..."
    />
    <SendButton disabled={!message} />
  </InputArea>
</ChatLayout>
```

### Message Item (Cada Mensagem)
```typescript
// components/chat/message-item.tsx
<MessageContainer role={message.role}>
  {message.role === 'assistant' && (
    <AgentAvatar>
      {getAgentEmoji(message.agent_id)}
      <AgentName>{message.agent_name}</AgentName>
    </AgentAvatar>
  )}
  
  <MessageBubble>
    <MessageContent>
      <MarkdownRenderer content={message.content} />
    </MessageContent>
    
    {message.metadata?.anomalies && (
      <AnomalyBadges anomalies={message.metadata.anomalies} />
    )}
    
    <MessageFooter>
      <Timestamp>{formatTime(message.timestamp)}</Timestamp>
      <ConfidenceBadge confidence={message.confidence} />
    </MessageFooter>
  </MessageBubble>
  
  {message.suggested_actions && (
    <SuggestedActions actions={message.suggested_actions} />
  )}
</MessageContainer>
```

---

## 🔄 ESTADO GLOBAL (Zustand)

```typescript
// store/chat-store.ts - O que mantém tudo sincronizado

interface ChatStore {
  // Estado atual
  messages: ChatMessage[];           // Todas as mensagens da conversa
  session: ChatSession | null;       // Sessão atual
  activeAgents: AgentInfo[];         // Agentes disponíveis
  isLoading: boolean;                // Aguardando resposta
  agentTyping: boolean;              // Agente está digitando
  
  // Ações
  sendMessage(content: string): void;
  addMessage(message: ChatMessage): void;
  loadAgents(): void;
}

// Quando o usuário envia mensagem:
sendMessage() {
  1. Adiciona mensagem do usuário ao estado
  2. UI re-renderiza imediatamente (otimistic update)
  3. Envia para backend
  4. Aguarda resposta
  5. Adiciona resposta ao estado
  6. UI re-renderiza com resposta
}
```

---

## 📊 MÉTRICAS DE PERFORMANCE

### Timing (Experiência do Usuário)

| Etapa | Tempo | O que o Usuário Vê |
|-------|-------|-------------------|
| **Envio de mensagem** | 0ms | Mensagem aparece instantaneamente |
| **Indicador de digitação** | 100ms | "Agente está pensando..." |
| **Processamento backend** | 1-3s | Loading animation |
| **Primeira palavra da resposta** | 1.5s | Texto começa a aparecer |
| **Resposta completa** | 2-4s | Mensagem completa + ações |

### Bundle Sizes
- **Initial Load**: ~250KB (gzipped)
- **Chat Components**: ~45KB (lazy loaded)
- **Agent Avatars**: ~8KB (SVG/emoji)
- **Total Interactive**: ~303KB

---

## 🎯 RESUMO: JORNADA COMPLETA

```
1. ACESSO
   └─> Landing Page (Vercel)
   
2. LOGIN
   └─> OAuth Google/GitHub
   └─> Session em cookies (Supabase)
   
3. CHAT
   └─> Carrega agentes do backend Railway
   └─> Mostra interface interativa
   
4. MENSAGEM
   └─> User digita + clica Enviar
   └─> POST /api/v1/chat/message
   └─> Backend processa com Maritaca LLM
   └─> Resposta com follow-up questions
   └─> UI atualiza em tempo real
   
5. INTERAÇÃO
   └─> Clica em ação sugerida
   └─> Nova mensagem enviada
   └─> Ciclo se repete
   
6. EXPORT
   └─> Gera PDF/Excel
   └─> Download automático
```

---

## 💡 PONTOS-CHAVE PARA O USUÁRIO

✅ **Interface limpa e intuitiva**  
✅ **Respostas em tempo real**  
✅ **Agentes com personalidades únicas**  
✅ **Follow-up questions inteligentes**  
✅ **Ações sugeridas contextuais**  
✅ **Export em múltiplos formatos**  
✅ **Acessibilidade (VLibras)**  
✅ **Tema brasileiro (Tarsila do Amaral)**

---

**Conclusão**: O usuário final **não vê** a complexidade técnica da integração. Ele vê uma **experiência fluida** de perguntar e receber respostas inteligentes, com sugestões contextuais e exportação fácil.

---

**Versão**: 1.0  
**Data**: 2025-10-22  
**Próxima Atualização**: Adicionar screenshots reais
