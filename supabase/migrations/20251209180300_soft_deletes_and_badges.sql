-- =====================================================
-- Migration: Soft Deletes and Badge Metadata
-- Description: LGPD compliance + badge tracking improvements
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-09
-- =====================================================

-- =====================================================
-- PART 1: Soft Delete Columns for LGPD Compliance
-- =====================================================

-- Add deleted_at to main tables (if not exists)

-- agora_profiles
ALTER TABLE public.agora_profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.agora_profiles.deleted_at IS
'Soft delete for LGPD compliance. Profile data retained for audit.';

-- agora_sessions
ALTER TABLE public.agora_sessions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- agora_diary_entries
ALTER TABLE public.agora_diary_entries
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- agora_xp_transactions
ALTER TABLE public.agora_xp_transactions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- chat_sessions
ALTER TABLE public.chat_sessions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- agora_kids_profiles
ALTER TABLE public.agora_kids_profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- agora_kids_sessions
ALTER TABLE public.agora_kids_sessions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- =====================================================
-- PART 2: Badge Metadata Table
-- =====================================================

-- Create dedicated table for badge awards with full metadata
CREATE TABLE IF NOT EXISTS public.agora_badge_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Badge information
    badge_id TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_emoji TEXT,
    badge_tier INTEGER DEFAULT 1 CHECK (badge_tier BETWEEN 1 AND 4),

    -- Award context
    xp_bonus INTEGER DEFAULT 0,
    trigger_source TEXT, -- What triggered the badge (session, xp, streak, etc.)
    trigger_value INTEGER, -- The value that triggered it (e.g., 100 for "100 XP")

    -- Timestamps
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure unique badge per user
    UNIQUE(user_id, badge_id)
);

-- Index for user badge lookups
CREATE INDEX IF NOT EXISTS idx_badge_awards_user
ON public.agora_badge_awards(user_id, earned_at DESC);

-- Index for badge analytics
CREATE INDEX IF NOT EXISTS idx_badge_awards_badge
ON public.agora_badge_awards(badge_id, earned_at DESC);

-- RLS for badge awards
ALTER TABLE public.agora_badge_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badge awards"
ON public.agora_badge_awards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert badge awards"
ON public.agora_badge_awards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PART 3: Badge Award Function
-- =====================================================

CREATE OR REPLACE FUNCTION public.award_badge(
    p_user_id UUID,
    p_badge_id TEXT,
    p_badge_name TEXT,
    p_badge_emoji TEXT DEFAULT NULL,
    p_badge_tier INTEGER DEFAULT 1,
    p_xp_bonus INTEGER DEFAULT 0,
    p_trigger_source TEXT DEFAULT NULL,
    p_trigger_value INTEGER DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    already_had BOOLEAN,
    xp_awarded INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_existing UUID;
BEGIN
    -- Check if user already has this badge
    SELECT id INTO v_existing
    FROM public.agora_badge_awards
    WHERE user_id = p_user_id AND badge_id = p_badge_id;

    IF v_existing IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, TRUE, 0;
        RETURN;
    END IF;

    -- Award the badge
    INSERT INTO public.agora_badge_awards (
        user_id,
        badge_id,
        badge_name,
        badge_emoji,
        badge_tier,
        xp_bonus,
        trigger_source,
        trigger_value
    ) VALUES (
        p_user_id,
        p_badge_id,
        p_badge_name,
        p_badge_emoji,
        p_badge_tier,
        p_xp_bonus,
        p_trigger_source,
        p_trigger_value
    );

    -- Update badges array in profile (for backward compatibility)
    UPDATE public.agora_profiles
    SET
        badges = COALESCE(badges, '[]'::jsonb) || to_jsonb(p_badge_id),
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND NOT (COALESCE(badges, '[]'::jsonb) ? p_badge_id);

    -- Award XP bonus if any
    IF p_xp_bonus > 0 THEN
        PERFORM public.add_xp_atomic(
            p_user_id,
            p_xp_bonus,
            'badge',
            'Badge conquistado: ' || p_badge_name
        );
    END IF;

    RETURN QUERY SELECT TRUE, FALSE, p_xp_bonus;
END;
$$;

COMMENT ON FUNCTION public.award_badge IS
'Awards a badge to user, updates profile, and optionally awards XP bonus.
Returns success status and whether user already had the badge.';

-- =====================================================
-- PART 4: User Deletion Function (LGPD)
-- =====================================================

CREATE OR REPLACE FUNCTION public.soft_delete_user_data(
    p_user_id UUID
)
RETURNS TABLE(
    tables_affected INTEGER,
    records_deleted INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tables INTEGER := 0;
    v_records INTEGER := 0;
    v_count INTEGER;
BEGIN
    -- Verify the user is deleting their own data
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: Can only delete own data';
    END IF;

    -- Soft delete agora_profiles
    UPDATE public.agora_profiles
    SET deleted_at = NOW()
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete agora_sessions
    UPDATE public.agora_sessions
    SET deleted_at = NOW()
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete agora_diary_entries
    UPDATE public.agora_diary_entries
    SET deleted_at = NOW()
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete agora_xp_transactions
    UPDATE public.agora_xp_transactions
    SET deleted_at = NOW()
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete chat_sessions
    UPDATE public.chat_sessions
    SET deleted_at = NOW()
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete kids profiles
    UPDATE public.agora_kids_profiles
    SET deleted_at = NOW()
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete kids sessions
    UPDATE public.agora_kids_sessions
    SET deleted_at = NOW()
    WHERE profile_id IN (
        SELECT id FROM public.agora_kids_profiles WHERE user_id = p_user_id
    ) AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    RETURN QUERY SELECT v_tables, v_records;
END;
$$;

COMMENT ON FUNCTION public.soft_delete_user_data IS
'LGPD compliant: Soft deletes all user data across all tables.
User can request this through account settings.';

-- =====================================================
-- PART 5: Analytics Views
-- =====================================================

-- View: Badge statistics (for admin/analytics)
CREATE OR REPLACE VIEW public.badge_statistics AS
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

-- View: User badge summary
CREATE OR REPLACE VIEW public.user_badge_summary AS
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

-- =====================================================
-- PART 6: Grants
-- =====================================================

GRANT SELECT, INSERT ON public.agora_badge_awards TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_badge TO authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_user_data TO authenticated;
GRANT SELECT ON public.user_badge_summary TO authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE public.agora_badge_awards IS
'Detailed badge award tracking with metadata. Enables badge analytics and history.';

COMMENT ON VIEW public.badge_statistics IS
'Aggregate badge statistics for analytics dashboard.';

COMMENT ON VIEW public.user_badge_summary IS
'Per-user badge summary for profile display.';

-- =====================================================
-- Verification
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Soft delete columns added to tables';
    RAISE NOTICE 'Badge metadata table created';
    RAISE NOTICE 'LGPD soft_delete_user_data function created';
    RAISE NOTICE 'Badge analytics views created';
END $$;
