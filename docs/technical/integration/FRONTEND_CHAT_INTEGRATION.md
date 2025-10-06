# Frontend Chat Integration - Carlos Drummond de Andrade

---

**Documento**: Integração de Chat Frontend
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-09-19 10:54:49 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Technical Integration / Chat
**Última Atualização**: 2025-10-04

---

## Summary

This document details the frontend changes to enable the conversational AI capabilities of Carlos Drummond de Andrade agent.

## Changes Implemented

### 1. Chat Service Updates

**File**: `lib/api/chat-adapter-v2.ts`

#### Endpoint Update
- Changed from `/api/investigate` to `/api/v1/chat/message`
- Removed investigation-specific response formatting
- Direct pass-through of chat API response

#### Response Handling
```typescript
// Now returns the chat response directly
return {
  session_id: data.session_id,
  agent_id: data.agent_id,
  agent_name: data.agent_name,
  message: data.content,
  confidence: data.metadata?.confidence || 0.9,
  suggested_actions: data.suggested_actions || [],
  metadata: {
    ...data.metadata,
    timestamp: data.timestamp || new Date().toISOString(),
  },
};
```

### 2. Agent Registry Update

**File**: `lib/api/chat-adapter-v2.ts`

Added Carlos Drummond de Andrade to the mock agents list:

```typescript
{
  id: 'drummond',
  name: 'Carlos Drummond de Andrade',
  role: 'Assistente Conversacional',
  status: 'available',
  specialty: 'Conversação natural e orientação',
  type: 'conversational',
  description: 'Poeta e comunicador, sua voz amiga no Cidadão.AI',
}
```

### 3. Type Definitions

**File**: `types/chat.ts`

#### Added IntentType Enum
```typescript
export enum IntentType {
  // Task-specific intents
  INVESTIGATE = "investigate",
  ANALYZE = "analyze",
  REPORT = "report",
  STATUS = "status",
  
  // Conversational intents
  GREETING = "greeting",
  CONVERSATION = "conversation",
  HELP_REQUEST = "help_request",
  ABOUT_SYSTEM = "about_system",
  SMALLTALK = "smalltalk",
  THANKS = "thanks",
  GOODBYE = "goodbye",
  
  // General
  QUESTION = "question",
  HELP = "help",
  UNKNOWN = "unknown"
}
```

#### Updated AgentInfo Interface
```typescript
export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  type: 'master' | 'investigator' | 'analyst' | 'reporter' | 'conversational' | string;
  description: string;
  specialty: string;
  capabilities?: string[];
  status: 'available' | 'busy' | 'offline';
}
```

### 4. Agent Name Formatting

**File**: `lib/api/chat.service.ts`

Added Drummond to the agent name mapping:
```typescript
'drummond': 'Carlos Drummond de Andrade'
```

## WebSocket Support

The WebSocket implementation in `lib/websocket/chat-websocket.ts` is already configured and ready for use with:
- Auto-reconnection with exponential backoff
- Message queuing when disconnected
- Heartbeat mechanism
- Investigation subscription support

## Integration Status

### ✅ Completed:
1. Updated chat adapter to use correct endpoint
2. Added Drummond to agent registry
3. Extended TypeScript types for intents
4. Updated agent name formatting

### 🔄 Ready to Use:
1. WebSocket connection (already implemented)
2. SSE streaming (implemented in chat service)
3. Real-time chat capabilities

### 📝 Next Steps:
1. Enable WebSocket in chat UI component
2. Add visual indicators for Drummond responses
3. Test end-to-end conversation flow

## Testing Checklist

- [ ] Test greeting messages
- [ ] Test conversation flow
- [ ] Test handoff to specialized agents
- [ ] Test WebSocket connection/reconnection
- [ ] Test suggested actions
- [ ] Test error handling

## API Endpoints Used

- `POST /api/v1/chat/message` - Send chat messages
- `GET /api/v1/chat/suggestions` - Get quick actions
- `GET /api/v1/chat/agents` - Get available agents
- `GET /api/v1/chat/history/{sessionId}` - Get chat history
- `WS /api/v1/ws/chat/{sessionId}` - WebSocket connection

## Performance Considerations

- Response time target: < 2 seconds
- WebSocket heartbeat: 30 seconds
- Reconnection attempts: Max 5
- Message queue: Preserves messages during disconnection