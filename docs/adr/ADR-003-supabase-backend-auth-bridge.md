# ADR-003: Supabase-Backend Auth Bridge

## Status

Accepted

## Data

2026-02-25

## Contexto

Cidadao.AI uses **two separate auth systems**:

1. **Supabase** (frontend) - OAuth social login (Google, GitHub, Gov.br)
2. **Railway Backend** (FastAPI) - JWT-based API authentication

The backend API needs to identify which user is making requests, but it has no direct connection to Supabase. The backend only has the `SUPABASE_JWT_SECRET` to verify tokens.

### Problem

- Frontend authenticates users via Supabase OAuth
- Backend stream endpoint (`/api/v1/chat/stream`) had no way to identify users
- Chat sessions were created with `user_id=null`, making history invisible per-user
- The `AuthenticationMiddleware` is NOT registered as global middleware, so `request.state.user_id` is never set automatically

## Decisao

**Bridge Supabase tokens to the backend via the Authorization header.**

### Frontend Side

1. After Supabase OAuth login, store `access_token` in `localStorage`
2. `PrimaryAdapter` reads token from `localStorage` and sends as `Bearer` header
3. Capture `session_id` from SSE `start` event for session tracking

### Backend Side

1. `get_current_optional_user` dependency extracts JWT from Authorization header directly
2. Tries `jwt_secret_key` (backend) first, then `supabase_jwt_secret` as fallback
3. Extracts `sub` (user_id), `email`, and `roles` from JWT payload
4. Returns `None` for unauthenticated requests (non-blocking)

### Token Flow

```
Supabase OAuth → access_token → localStorage
    ↓
PrimaryAdapter → Authorization: Bearer <token>
    ↓
Backend get_current_optional_user()
    ↓ try jwt_secret_key → fail
    ↓ try supabase_jwt_secret → success
    ↓
user_id extracted from "sub" claim
    ↓
chat_service.get_or_create_session(session_id, user_id)
```

## Consequencias

### Positivas

- Users see only their own chat history
- No Supabase SDK dependency on the backend
- Non-blocking auth: anonymous users can still chat (just without persistence)
- Single token flow, no extra login step needed

### Negativas

- Supabase token expiration handled differently than backend tokens
- `supabase_jwt_secret` must be kept in sync with Supabase project settings
- If Supabase rotates the JWT secret, backend auth breaks until updated

### Neutras

- Backend still accepts its own JWT tokens (useful for API key auth and service-to-service calls)

## Alternativas Consideradas

### Alternativa 1: Register AuthenticationMiddleware Globally

**Descricao**: Register the existing `AuthenticationMiddleware` as FastAPI global middleware.

**Pros**:

- `request.state.user_id` would be set automatically
- Dependencies would work as originally designed

**Cons**:

- Would block unauthenticated requests in production
- Health check and docs endpoints need explicit skip lists
- Breaking change for existing API consumers

**Por que foi rejeitada**: Too invasive. The non-blocking `get_current_optional_user` dependency is more flexible.

### Alternativa 2: Backend-Supabase Service Role Key

**Descricao**: Use `SUPABASE_SERVICE_ROLE_KEY` on the backend to verify users via Supabase Admin API.

**Pros**:

- Full user profile access
- Real-time token validation

**Cons**:

- Adds network latency (Supabase API call per request)
- Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars
- Supabase is used only for OAuth, not data storage

**Por que foi rejeitada**: Over-engineering. JWT verification is sufficient and has zero latency.

## Referencias

- ADR-004 (Backend): Conversation Persistence in Railway PostgreSQL
- PyJWT docs: https://pyjwt.readthedocs.io/
- Supabase JWT: Project Settings > API > JWT Secret

## Notas

Key files modified:

- Frontend: `lib/chat/types.ts`, `lib/chat/adapters/primary.adapter.ts`
- Backend: `src/api/dependencies.py`, `src/api/middleware/authentication.py`
