# Backend Integration Mapping - Cidadao.AI

**Date**: 2025-11-25
**Author**: Anderson Henrique da Silva
**Status**: Analysis Complete

---

## Executive Summary

This document maps all backend API capabilities vs current frontend implementation, identifying gaps and opportunities for improvement.

**Backend**: https://cidadao-api-production.up.railway.app
**Frontend Status**: 82% complete

---

## 1. Chat System Comparison

### Backend Endpoints Available

| Endpoint                                      | Method | Description       | Status in Frontend             |
| --------------------------------------------- | ------ | ----------------- | ------------------------------ |
| `/api/v1/chat/message`                        | POST   | Standard chat     | **Implemented**                |
| `/api/v1/chat/stream`                         | POST   | SSE Streaming     | **Partial** (fallback to sync) |
| `/api/v1/chat/suggestions`                    | GET    | Quick actions     | **Implemented**                |
| `/api/v1/chat/history/{session_id}`           | GET    | Chat history      | **Implemented**                |
| `/api/v1/chat/history/{session_id}`           | DELETE | Clear history     | **Implemented**                |
| `/api/v1/chat/history/{session_id}/paginated` | GET    | Cursor pagination | **Implemented**                |
| `/api/v1/chat/agents`                         | GET    | Available agents  | **Implemented**                |
| `/api/v1/chat/cache/stats`                    | GET    | Cache metrics     | **Not Implemented**            |

### Maritaca Direct Chat (NEW)

| Endpoint                              | Method | Description   | Status in Frontend                 |
| ------------------------------------- | ------ | ------------- | ---------------------------------- |
| `/api/v1/chat/direct/maritaca`        | POST   | Direct LLM    | **Partial** (via fallback adapter) |
| `/api/v1/chat/direct/maritaca/stream` | POST   | SSE Streaming | **Not Implemented**                |
| `/api/v1/chat/direct/maritaca/models` | GET    | Model list    | **Not Implemented**                |
| `/api/v1/chat/direct/maritaca/health` | GET    | Health check  | **Not Implemented**                |

### Current Frontend Implementation

```
lib/chat/
├── chat.service.ts       # Main orchestrator
├── adapters/
│   ├── primary.adapter.ts   # Backend API (uses /chat/message)
│   └── fallback.adapter.ts  # Maritaca direct (basic)
└── types.ts
```

**Issues Found**:

1. SSE streaming falls back to sync calls
2. No model selector UI for Maritaca
3. No streaming visualization (typing effect)

---

## 2. Voice AI Services (NOT IMPLEMENTED)

### Backend Endpoints Available

| Endpoint                            | Method | Description          | Priority |
| ----------------------------------- | ------ | -------------------- | -------- |
| `/api/v1/voice/transcribe`          | POST   | Speech-to-Text       | **HIGH** |
| `/api/v1/voice/speak`               | POST   | Text-to-Speech       | **HIGH** |
| `/api/v1/voice/conversation`        | POST   | Full voice flow      | MEDIUM   |
| `/api/v1/voice/conversation/stream` | POST   | Voice streaming      | LOW      |
| `/api/v1/voice/voices`              | GET    | Available voices     | **HIGH** |
| `/api/v1/voice/agent-voices`        | GET    | Agent voice profiles | **HIGH** |
| `/api/v1/voice/health`              | GET    | Service health       | LOW      |

### Backend Features

- **16 unique agent voices** with Brazilian cultural personalities
- High-quality Chirp3-HD voices
- Agent-specific speaking rates and pitches
- Google Cloud TTS/STT integration

### Recommended Implementation

1. Add microphone button to chat input
2. Add speaker button to messages
3. Create voice settings panel
4. Implement voice conversation mode

---

## 3. Investigations System (PARTIAL)

### Backend Endpoints Available

| Endpoint                              | Method  | Description      | Status in Frontend     |
| ------------------------------------- | ------- | ---------------- | ---------------------- |
| `/api/v1/investigations/`             | POST    | Create           | **Partial** (via chat) |
| `/api/v1/investigations/`             | GET     | List             | **Not Implemented**    |
| `/api/v1/investigations/start`        | POST    | Start new        | **Not Implemented**    |
| `/api/v1/investigations/{id}/status`  | GET     | Status           | **Not Implemented**    |
| `/api/v1/investigations/{id}/results` | GET     | Results          | **Not Implemented**    |
| `/api/v1/investigations/stream/{id}`  | GET     | Real-time SSE    | **Not Implemented**    |
| `/api/v1/investigations/public/*`     | Various | Public endpoints | **Not Implemented**    |

### Current State

- Investigations are triggered via chat messages
- No dedicated investigations UI
- No real-time progress tracking
- No investigation history

### Recommended Implementation

1. Create `/app/investigations` page
2. Add investigation progress component
3. Implement SSE for real-time updates
4. Add investigation history panel

---

## 4. Reports System (NOT IMPLEMENTED)

### Backend Endpoints Available

| Endpoint                        | Method | Description       | Priority |
| ------------------------------- | ------ | ----------------- | -------- |
| `/api/v1/reports/generate`      | POST   | Generate report   | **HIGH** |
| `/api/v1/reports/templates`     | GET    | Report templates  | **HIGH** |
| `/api/v1/reports/`              | GET    | List reports      | MEDIUM   |
| `/api/v1/reports/{id}/status`   | GET    | Generation status | MEDIUM   |
| `/api/v1/reports/{id}`          | GET    | Get report        | MEDIUM   |
| `/api/v1/reports/{id}/download` | GET    | Download          | **HIGH** |

### Available Templates

1. **Executive Summary** - 2-4 pages, for executives
2. **Detailed Analysis** - 10-20 pages, technical
3. **Investigation Report** - 5-15 pages, for journalists
4. **Transparency Dashboard** - 1-3 pages, general
5. **Comparative Analysis** - 8-12 pages, for researchers
6. **Audit Report** - 15-30 pages, for auditors

### Recommended Implementation

1. Create report generation modal
2. Add template selector UI
3. Implement generation progress
4. Add download functionality

---

## 5. Analysis & Patterns (NOT IMPLEMENTED)

### Backend Endpoints Available

| Endpoint                        | Method | Description       |
| ------------------------------- | ------ | ----------------- |
| `/api/v1/analysis/start`        | POST   | Start analysis    |
| `/api/v1/analysis/trends`       | GET    | Spending trends   |
| `/api/v1/analysis/correlations` | GET    | Correlations      |
| `/api/v1/analysis/patterns`     | GET    | Pattern detection |
| `/api/v1/analysis/{id}/status`  | GET    | Analysis status   |
| `/api/v1/analysis/{id}/results` | GET    | Results           |

---

## 6. Export System (PARTIAL)

### Backend Endpoints Available

| Endpoint                                      | Method | Description          | Status              |
| --------------------------------------------- | ------ | -------------------- | ------------------- |
| `/api/v1/export/investigations/{id}/download` | POST   | Export investigation | **Not Implemented** |
| `/api/v1/export/contracts/export`             | POST   | Export contracts     | **Not Implemented** |
| `/api/v1/export/anomalies/export`             | POST   | Export anomalies     | **Not Implemented** |
| `/api/v1/export/bulk`                         | POST   | Bulk export (ZIP)    | **Not Implemented** |
| `/api/v1/export/visualization/export`         | POST   | Visualization data   | **Not Implemented** |
| `/api/v1/export/regional-analysis/export`     | POST   | Regional analysis    | **Not Implemented** |
| `/api/v1/export/time-series/export`           | POST   | Time series          | **Not Implemented** |

### Supported Formats

- Excel (.xlsx)
- CSV
- PDF
- JSON

---

## 7. WebSocket Real-Time (PARTIAL)

### Backend Endpoints Available

| Endpoint                         | Description           | Status                    |
| -------------------------------- | --------------------- | ------------------------- |
| `/api/v1/ws`                     | General WebSocket     | **Code exists, disabled** |
| `/api/v1/ws/chat/{session_id}`   | Chat WebSocket        | **Code exists, disabled** |
| `/api/v1/ws/investigations/{id}` | Investigation updates | **Not Implemented**       |

### Current State

WebSocket code exists in `lib/websocket/chat-websocket.ts` but is disabled due to backend deployment limitations on Railway.

---

## 8. GraphQL (NOT IMPLEMENTED)

### Backend Endpoints Available

| Endpoint              | Description              |
| --------------------- | ------------------------ |
| `/graphql`            | GraphQL query endpoint   |
| `/graphql/playground` | GraphQL Playground (dev) |
| `/graphql/examples`   | Example queries          |

---

## 9. Agent-Specific Features

### Agents with Special Capabilities

| Agent          | Capability         | Backend Endpoint                          | Frontend Status     |
| -------------- | ------------------ | ----------------------------------------- | ------------------- |
| Zumbi          | Anomaly Detection  | `/api/v1/agents/zumbi`                    | Via chat only       |
| Anita          | Pattern Analysis   | `/api/v1/agents/anita`                    | Via chat only       |
| Tiradentes     | Report Generation  | `/api/v1/agents/tiradentes`               | Via chat only       |
| Oscar Niemeyer | Data Visualization | `/api/v1/export/visualization/export`     | **Not Implemented** |
| Lampião        | Regional Analysis  | `/api/v1/export/regional-analysis/export` | **Not Implemented** |
| Machado        | Text Analysis      | `/api/v1/agents/machado`                  | Via chat only       |

---

## 10. Priority Improvements

### HIGH Priority (Week 1-2)

1. **SSE Streaming for Chat**
   - Implement real streaming with typing effect
   - Use `/api/v1/chat/stream` endpoint
   - Show agent selection and intent detection

2. **Voice Integration**
   - Add microphone button (STT)
   - Add speaker button (TTS)
   - Use agent-specific voices

3. **Maritaca Model Selector**
   - Fetch models from `/models`
   - Add UI selector in chat settings
   - Implement streaming for Maritaca direct

### MEDIUM Priority (Week 3-4)

4. **Investigations Dashboard**
   - Create dedicated page
   - Real-time progress via SSE
   - Investigation history

5. **Reports Generation**
   - Template selector
   - Generation progress
   - Download functionality

6. **Export Functionality**
   - Add export buttons to chat results
   - Support multiple formats

### LOW Priority (Month 2)

7. **Analysis Dashboard**
   - Trends visualization
   - Pattern detection UI
   - Correlation analysis

8. **WebSocket Re-enablement**
   - When backend supports it
   - Real-time notifications
   - Typing indicators

9. **GraphQL Integration**
   - For complex queries
   - Better data fetching

---

## 11. Technical Debt

1. **Streaming fallback**: `sendStreamingMessage` falls back to sync
2. **WebSocket disabled**: Code exists but unused
3. **No model selection**: Maritaca models hardcoded
4. **No voice UI**: Backend ready, frontend missing
5. **No investigation UI**: Only via chat

---

## 12. API Response Examples

### Chat Stream Events

```json
{"type": "start", "timestamp": "..."}
{"type": "detecting", "message": "Analisando sua mensagem..."}
{"type": "intent", "intent": "investigation", "confidence": 0.95}
{"type": "agent_selected", "agent_id": "zumbi", "agent_name": "Zumbi dos Palmares"}
{"type": "chunk", "content": "Olá! Sou Zumbi"}
{"type": "chunk", "content": " dos Palmares..."}
{"type": "complete", "total_tokens": 150}
```

### Voice Agent Profiles

```json
{
  "agent_id": "zumbi",
  "voice_name": "pt-BR-Chirp3-HD-Fenrir",
  "gender": "male",
  "speaking_rate": 0.95,
  "personality_traits": ["Fighter", "Analytical", "Determined"]
}
```

### Report Templates

```json
{
  "type": "investigation_report",
  "name": "Relatório de Investigação",
  "target_audience": "journalist",
  "estimated_pages": "5-15"
}
```

---

## 13. Next Steps

1. Review this document with team
2. Prioritize based on user feedback
3. Create implementation tickets
4. Start with SSE streaming improvement
5. Add voice integration
6. Build investigations dashboard

---

**Document maintained by**: Anderson Henrique da Silva
**Last updated**: 2025-11-25
