-- Migration: Add missing INSERT policies for Agora tables
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-07
--
-- This migration adds missing INSERT policies for Agora tables.
-- Without these policies, users cannot insert records due to RLS blocking (403 Forbidden).
-- Tables affected:
--   - agora_xp_transactions: Missing INSERT policy
--   - agora_sessions: Missing INSERT policy (has USING clause but not WITH CHECK)

-- 1. Add INSERT policy for agora_xp_transactions
CREATE POLICY "Users can insert own xp transactions"
ON public.agora_xp_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Add INSERT policy for agora_sessions
CREATE POLICY "Users can insert own sessions"
ON public.agora_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Add UPDATE policy for agora_sessions (needed for endSession)
CREATE POLICY "Users can update own sessions"
ON public.agora_sessions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON POLICY "Users can insert own xp transactions" ON public.agora_xp_transactions
IS 'Allows authenticated users to insert their own XP transaction records';

COMMENT ON POLICY "Users can insert own sessions" ON public.agora_sessions
IS 'Allows authenticated users to create their own study sessions';

COMMENT ON POLICY "Users can update own sessions" ON public.agora_sessions
IS 'Allows authenticated users to update their own study sessions';
