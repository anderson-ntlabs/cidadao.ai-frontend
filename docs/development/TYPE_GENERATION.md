# Automated Type Generation

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Created**: 2025-01-25 20:30:00 -0300
**Last Updated**: 2025-01-25 20:30:00 -0300

---

## Overview

The Cidadão.AI frontend uses **automated type generation** to stay in sync with the backend API. This ensures type safety and reduces manual maintenance when the backend changes.

## Quick Start

### Generate Types from Backend

```bash
# Generate types from production backend
npm run generate:types

# Or run script directly
node scripts/generate-api-types.js
```

### Use Generated Types

```typescript
import type { ChatResponse, InvestigationResponse } from '@/types/generated/backend-api'

// Fully typed backend responses
const response: ChatResponse = await fetch('/api/v1/chat/message')
  .then(res => res.json())
```

---

## How It Works

### Architecture

```
Backend OpenAPI Schema
        ↓
  Fetch /openapi.json
        ↓
    Parse Schema
        ↓
Generate TypeScript Types
        ↓
types/generated/backend-api.ts
```

### Script Flow

1. **Fetch Schema**: Downloads OpenAPI schema from backend
2. **Cache Locally**: Saves schema to `.cache/openapi-schema.json`
3. **Generate Types**: Converts OpenAPI definitions to TypeScript interfaces
4. **Write File**: Outputs to `types/generated/backend-api.ts`

### Example Generated Types

```typescript
/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 *
 * Generated from: https://cidadao-api-production.up.railway.app/openapi.json
 * Generated at: 2025-01-25T23:30:00.000Z
 *
 * To regenerate: npm run generate:types
 */

export interface ChatResponse {
  /** Session identifier */
  session_id: string;
  /** Message ID */
  message_id?: string;
  /** Agent that handled the request */
  agent_id: string;
  /** Agent display name */
  agent_name: string;
  /** Response message content */
  message: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Suggested follow-up actions */
  suggested_actions?: string[];
  /** Follow-up questions */
  follow_up_questions?: string[];
  /** Required input fields */
  requires_input?: Record<string, string> | null;
  /** Additional metadata */
  metadata: Record<string, any>;
}
```

---

## Configuration

### Backend URL

The script uses `NEXT_PUBLIC_API_URL` environment variable:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app
```

Or override via environment:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run generate:types
```

### OpenAPI Endpoint

Default: `/openapi.json`

The backend exposes OpenAPI schema at:
- Production: `https://cidadao-api-production.up.railway.app/openapi.json`
- Local: `http://localhost:8000/openapi.json`

### Output Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Output file | `types/generated/backend-api.ts` | Generated TypeScript types |
| Cache file | `.cache/openapi-schema.json` | Cached OpenAPI schema |
| Format | TypeScript interfaces | Type-safe interfaces |

---

## Usage Patterns

### 1. Direct Import

```typescript
import type { ChatResponse } from '@/types/generated/backend-api'

async function sendMessage(text: string): Promise<ChatResponse> {
  const response = await fetch('/api/v1/chat/message', {
    method: 'POST',
    body: JSON.stringify({ message: text })
  })

  return response.json()  // Fully typed!
}
```

### 2. Type Guards

```typescript
import type { ChatResponse } from '@/types/generated/backend-api'

function isChatResponse(data: unknown): data is ChatResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'session_id' in data &&
    'agent_id' in data &&
    'message' in data
  )
}

const data = await response.json()
if (isChatResponse(data)) {
  console.log(data.message)  // Type-safe access
}
```

### 3. Partial Types

```typescript
import type { Investigation } from '@/types/generated/backend-api'

// Update only specific fields
const updates: Partial<Investigation> = {
  status: 'completed',
  updated_at: new Date().toISOString()
}
```

### 4. Extending Generated Types

```typescript
import type { ChatResponse } from '@/types/generated/backend-api'

// Add frontend-specific fields
interface ChatResponseWithUI extends ChatResponse {
  loading?: boolean
  error?: string
  timestamp: Date
}
```

---

## Workflow Integration

### Development Workflow

```bash
# 1. Backend team updates API
# (Backend changes pushed to Railway)

# 2. Regenerate types
npm run generate:types

# 3. Review changes
git diff types/generated/backend-api.ts

# 4. Fix TypeScript errors
npm run type-check

# 5. Commit generated types
git add types/generated/
git commit -m "chore(types): update from backend API changes"
```

### CI/CD Integration (Future)

```yaml
# .github/workflows/sync-types.yml
name: Sync Backend Types

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:  # Manual trigger

jobs:
  sync-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Generate types
        run: npm run generate:types
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.BACKEND_URL }}

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore(types): sync with backend API'
          title: 'Update backend API types'
          body: 'Auto-generated PR to sync TypeScript types with backend'
          branch: 'auto/sync-backend-types'
```

---

## Troubleshooting

### Backend Not Accessible

**Problem**: `ECONNREFUSED` or network timeout

**Solution**:
```bash
# 1. Check backend URL
curl https://cidadao-api-production.up.railway.app/health

# 2. Verify OpenAPI endpoint
curl https://cidadao-api-production.up.railway.app/openapi.json

# 3. Use cached schema (if available)
# Script automatically falls back to cache
```

### Type Errors After Generation

**Problem**: TypeScript compilation errors

**Solution**:
```bash
# 1. Check generated file for issues
cat types/generated/backend-api.ts

# 2. Run type check to see specific errors
npm run type-check

# 3. Fix breaking changes in consuming code
# Example: Field renamed from 'agent_used' to 'agent_id'
# Update all usages
```

### Cache Issues

**Problem**: Using stale cached schema

**Solution**:
```bash
# 1. Delete cache
rm -rf .cache/

# 2. Regenerate
npm run generate:types

# 3. Verify fresh schema
cat .cache/openapi-schema.json | jq '.info.version'
```

---

## Advanced Usage

### Production-Ready Setup (Future)

For production-grade type generation, install **openapi-typescript**:

```bash
npm install -D openapi-typescript
```

Then update the script or create a new command:

```bash
# package.json
{
  "scripts": {
    "generate:types:prod": "openapi-typescript $NEXT_PUBLIC_API_URL/openapi.json -o types/generated/backend-api.ts"
  }
}
```

Benefits:
- ✅ More accurate type conversion
- ✅ Handles complex schemas (oneOf, anyOf, allOf)
- ✅ Generates discriminated unions
- ✅ Better enum support
- ✅ Path operation types

Example with openapi-typescript:

```typescript
import type { paths } from '@/types/generated/backend-api'

type ChatMessageRequest = paths['/api/v1/chat/message']['post']['requestBody']['content']['application/json']
type ChatMessageResponse = paths['/api/v1/chat/message']['post']['responses']['200']['content']['application/json']
```

---

## Schema Validation

### Verify Generated Types

```typescript
// scripts/verify-types.ts
import { z } from 'zod'
import type { ChatResponse } from '@/types/generated/backend-api'

const ChatResponseSchema = z.object({
  session_id: z.string(),
  message_id: z.string().optional(),
  agent_id: z.string(),
  agent_name: z.string(),
  message: z.string(),
  confidence: z.number().min(0).max(1),
  suggested_actions: z.array(z.string()).optional(),
  metadata: z.record(z.any())
})

// Runtime validation
export function validateChatResponse(data: unknown): ChatResponse {
  return ChatResponseSchema.parse(data)
}
```

---

## Migration Guide

### From Manual Types to Generated Types

**Before** (manual types in `types/chat.ts`):

```typescript
export interface ChatResponse {
  response?: string
  message?: string
  agent_used?: string
  agent_id?: string
  confidence?: number
}
```

**After** (generated types):

```typescript
import type { ChatResponse } from '@/types/generated/backend-api'

// Use generated types directly - always in sync with backend
```

**Migration steps**:

1. Generate types: `npm run generate:types`
2. Update imports:
   ```typescript
   // Old
   import type { ChatResponse } from '@/types/chat'

   // New
   import type { ChatResponse } from '@/types/generated/backend-api'
   ```
3. Fix type errors (if field names changed)
4. Remove manual type definitions
5. Test thoroughly

---

## Best Practices

### 1. **Don't Edit Generated Files**

```typescript
// ❌ Bad - editing generated file
// types/generated/backend-api.ts
export interface ChatResponse {
  // CUSTOM FIELD - will be overwritten!
  customField: string
}

// ✅ Good - extend in your own file
// types/chat.ts
import type { ChatResponse as BaseResponse } from '@/types/generated/backend-api'

export interface ChatResponse extends BaseResponse {
  customField: string
}
```

### 2. **Commit Generated Types**

```bash
# ✅ Good - commit generated types
git add types/generated/
git commit -m "chore(types): update from backend API v1.2.0"

# ❌ Bad - ignore generated types
# Forces team to regenerate, may cause version drift
```

### 3. **Document Breaking Changes**

```typescript
/**
 * BREAKING CHANGE (v1.2.0 → v1.3.0):
 * - Field 'agent_used' renamed to 'agent_id'
 * - Field 'suggestions' renamed to 'suggested_actions'
 *
 * Migration:
 * - Update all usages of ChatResponse
 * - Run tests to catch issues
 */
import type { ChatResponse } from '@/types/generated/backend-api'
```

### 4. **Version Control**

Keep schema cache in version control for offline development:

```bash
# .gitignore
# types/generated/  # Don't ignore - commit generated types
# .cache/           # Don't ignore - commit schema cache

# ✅ Both should be committed for team sync
```

---

## FAQ

### Q: How often should I regenerate types?

**A**: Regenerate types whenever:
- Backend API changes
- New endpoints are added
- Existing endpoints are modified
- Before starting a new feature
- After pulling backend changes

### Q: What if backend schema is malformed?

**A**: The script will fail with a descriptive error. Contact backend team to fix OpenAPI schema generation.

### Q: Can I use this with local backend?

**A**: Yes!

```bash
# Start local backend on port 8000
cd ../cidadao.ai-backend
make run-dev

# Generate types from local backend
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run generate:types
```

### Q: Do I need internet to develop?

**A**: No! After first run, the script uses cached schema from `.cache/openapi-schema.json`

---

## Related Documentation

- [API Integration Guide](../technical/api-integration-guide.md) - HTTP client and service architecture
- [Data Fetching Strategies](../technical/data-fetching-strategies.md) - CSR vs RSC patterns
- [Testing Strategy](../guides/TESTING-STRATEGY.md) - Type-safe testing

---

## Summary

**Key Points**:
- ✅ Types auto-generated from backend OpenAPI schema
- ✅ Run `npm run generate:types` to sync
- ✅ Cache enables offline development
- ✅ Commit generated types to git
- ✅ Never edit generated files
- ✅ Extend types in separate files

**Next Steps**:
1. Run `npm run generate:types` to create initial types
2. Replace manual types with generated ones
3. Add to pre-commit hook (optional)
4. Set up CI/CD automation (future)

For issues or questions, check [Troubleshooting](#troubleshooting) or open a GitHub issue.
