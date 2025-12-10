-- Soft delete column for agora_sessions
ALTER TABLE public.agora_sessions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
