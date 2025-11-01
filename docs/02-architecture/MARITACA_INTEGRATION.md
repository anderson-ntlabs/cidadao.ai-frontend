# Maritaca Integration Guide

---

**Documento**: Guia de Integração Maritaca
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-09-25 13:21:26 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Technical Integration / API
**Última Atualização**: 2025-10-04

---

## Overview

The Cidadão.AI frontend is now integrated with Maritaca-powered endpoints using the **sabiazinho-3** model for cost-effective and efficient responses.

## Available Endpoints

All endpoints use the Maritaca sabiazinho-3 model:

### 1. `/api/v1/chat/stable` (Primary)

- **Description**: Most stable option with multiple fallback mechanisms
- **Use Case**: Default for all chat interactions
- **Features**: Automatic retries, error handling, fallback chains

### 2. `/api/v1/chat/optimized`

- **Description**: Performance-optimized with Drummond persona
- **Use Case**: When you want poetic, thoughtful responses
- **Features**: Carlos Drummond de Andrade writing style

### 3. `/api/v1/chat/emergency`

- **Description**: Ultra-resilient fallback endpoint
- **Use Case**: When other endpoints fail
- **Features**: Minimal dependencies, highest availability

### 4. `/api/v1/chat/simple`

- **Description**: Direct and simple implementation
- **Use Case**: Testing or lightweight interactions
- **Features**: No frills, straightforward responses

## Backend Configuration

### HuggingFace Spaces Setup

1. Add the `MARITACA_API_KEY` secret in your HuggingFace Space settings
2. The backend will automatically use sabiazinho-3 model
3. No additional configuration needed

### Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://your-space.hf.space

# Backend (HuggingFace Secrets)
MARITACA_API_KEY=your-maritaca-api-key
```

## Frontend Integration

The frontend automatically routes through these endpoints:

```typescript
// Primary adapter uses /api/v1/chat/stable
sendBackendMessage() → /api/v1/chat/stable

// Smart service with intelligent routing
smartChatService.sendMessage() → Selects best endpoint
```

## Testing

Run the test script to verify all endpoints:

```bash
node scripts/test-maritaca-endpoints.js
```

## Cost Optimization

The sabiazinho-3 model provides:

- **10x lower cost** compared to GPT-3.5
- **Good quality** for general conversations
- **Fast response times** (typically <2s)
- **Portuguese optimization** for Brazilian context

## Response Format

All endpoints return consistent format:

```json
{
  "session_id": "session_123",
  "agent_id": "drummond",
  "agent_name": "Carlos Drummond de Andrade",
  "message": "Response text here...",
  "confidence": 0.9,
  "suggested_actions": ["Action 1", "Action 2"],
  "metadata": {
    "endpoint": "stable",
    "model": "sabiazinho-3",
    "response_time": 1250
  }
}
```

## Troubleshooting

### Backend Returns Maintenance Message

- Frontend automatically falls back to v3 adapter with demo data
- Check if MARITACA_API_KEY is configured in HuggingFace

### Slow Response Times

- Normal range: 1-3 seconds
- If consistently slow, check HuggingFace Space status

### Authentication Errors

- Verify MARITACA_API_KEY is set correctly
- Check API key hasn't expired

## Migration from Old Endpoints

The frontend previously used:

- `/api/v1/chat/message` → Now uses `/api/v1/chat/stable`
- Mock data fallbacks → Now real Maritaca responses

All changes are backward compatible with automatic fallbacks.
