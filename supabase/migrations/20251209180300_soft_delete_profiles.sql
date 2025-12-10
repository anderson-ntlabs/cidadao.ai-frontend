-- Soft delete column for agora_profiles
ALTER TABLE public.agora_profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
