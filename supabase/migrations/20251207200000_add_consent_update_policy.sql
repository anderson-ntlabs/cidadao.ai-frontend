-- Migration: Add UPDATE policy for agora_consent
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-07
-- Description: Allows users to update their own consent record (needed for upsert)

-- Add UPDATE policy for agora_consent
CREATE POLICY "Users can update own consent" ON agora_consent
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Also ensure there's a unique constraint on user_id for upsert to work
-- (This should already exist, but let's make sure)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'agora_consent_user_id_key'
        AND conrelid = 'agora_consent'::regclass
    ) THEN
        ALTER TABLE agora_consent ADD CONSTRAINT agora_consent_user_id_key UNIQUE (user_id);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;
