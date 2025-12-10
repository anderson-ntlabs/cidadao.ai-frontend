-- Soft delete column for agora_xp_transactions
ALTER TABLE public.agora_xp_transactions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
