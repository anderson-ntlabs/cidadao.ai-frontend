-- Migration: Add session_id field to chat_sessions table
-- Run this in Supabase SQL Editor if table already exists

-- Add session_id column
ALTER TABLE public.chat_sessions
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Make it unique and not null (after adding, populate existing rows)
-- First, populate with generated values for existing rows
UPDATE public.chat_sessions
SET session_id = 'session_' || TO_CHAR(created_at, 'YYYYMMDDHH24MISS') || '_' || SUBSTRING(id::text, 1, 8)
WHERE session_id IS NULL;

-- Now make it NOT NULL and UNIQUE
ALTER TABLE public.chat_sessions
ALTER COLUMN session_id SET NOT NULL;

ALTER TABLE public.chat_sessions
ADD CONSTRAINT chat_sessions_session_id_unique UNIQUE (session_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON public.chat_sessions(session_id);

-- Verify the change
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'chat_sessions'
ORDER BY ordinal_position;
