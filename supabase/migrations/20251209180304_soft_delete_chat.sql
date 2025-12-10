-- Soft delete column for chat_sessions
ALTER TABLE public.chat_sessions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
