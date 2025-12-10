-- Soft delete column for agora_diary_entries
ALTER TABLE public.agora_diary_entries
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
