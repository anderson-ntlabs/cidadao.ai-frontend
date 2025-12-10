-- Soft delete column for agora_kids_sessions
ALTER TABLE public.agora_kids_sessions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
