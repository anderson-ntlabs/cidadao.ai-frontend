-- Ensure deleted_at column exists
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
