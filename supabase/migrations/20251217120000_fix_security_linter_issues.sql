-- ============================================
-- Fix Supabase Linter Security Issues
-- ============================================
-- Addresses:
-- 1. SECURITY DEFINER views (badge_statistics, user_badge_summary)
-- 2. Function search_path mutable (update_updated_at_column)
--
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-17
-- ============================================

-- ============================================
-- FIX 1: SECURITY DEFINER VIEWS
-- Recreate views with security_invoker = true
-- This ensures RLS policies are enforced for the querying user
-- ============================================

-- Drop and recreate badge_statistics view with security_invoker
DROP VIEW IF EXISTS public.badge_statistics;

CREATE VIEW public.badge_statistics
WITH (security_invoker = true) AS
SELECT
    badge_id,
    badge_name,
    badge_tier,
    COUNT(*) as total_awards,
    MIN(earned_at) as first_awarded,
    MAX(earned_at) as last_awarded
FROM public.agora_badge_awards
GROUP BY badge_id, badge_name, badge_tier
ORDER BY total_awards DESC;

COMMENT ON VIEW public.badge_statistics IS 'Badge statistics view with security_invoker for proper RLS enforcement';

-- Drop and recreate user_badge_summary view with security_invoker
DROP VIEW IF EXISTS public.user_badge_summary;

CREATE VIEW public.user_badge_summary
WITH (security_invoker = true) AS
SELECT
    user_id,
    COUNT(*) as total_badges,
    SUM(xp_bonus) as total_badge_xp,
    MAX(badge_tier) as highest_tier,
    array_agg(badge_id ORDER BY earned_at) as badge_ids,
    MIN(earned_at) as first_badge_at,
    MAX(earned_at) as last_badge_at
FROM public.agora_badge_awards
GROUP BY user_id;

COMMENT ON VIEW public.user_badge_summary IS 'User badge summary view with security_invoker for proper RLS enforcement';

-- Grant permissions on views
GRANT SELECT ON public.badge_statistics TO authenticated;
GRANT SELECT ON public.user_badge_summary TO authenticated;

-- ============================================
-- FIX 2: FUNCTION SEARCH_PATH MUTABLE
-- Recreate function with SET search_path = ''
-- This prevents search_path manipulation attacks
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Generic trigger function to update updated_at column with secure search_path';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Fixed Issues:
-- 1. badge_statistics - now uses security_invoker
-- 2. user_badge_summary - now uses security_invoker
-- 3. update_updated_at_column - now has SET search_path = ''
--
-- Note: auth_leaked_password_protection must be enabled
-- in Supabase Dashboard > Authentication > Settings
-- ============================================
