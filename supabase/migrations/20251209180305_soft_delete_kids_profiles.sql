-- Soft delete column for agora_kids_profiles
ALTER TABLE public.agora_kids_profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
