-- =====================================================
-- Migration: Atomic XP Functions
-- Description: Database functions for atomic XP operations
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-09
-- Purpose: Prevent race conditions in XP calculations
-- =====================================================

-- =====================================================
-- 1. Atomic Add XP Function
-- =====================================================
-- Atomically adds XP to user profile and creates transaction
-- Returns: new total XP, new level, new rank

CREATE OR REPLACE FUNCTION public.add_xp_atomic(
    p_user_id UUID,
    p_amount INTEGER,
    p_source_type TEXT,
    p_description TEXT DEFAULT NULL
)
RETURNS TABLE(
    new_total_xp INTEGER,
    new_level INTEGER,
    new_rank TEXT,
    old_level INTEGER,
    old_rank TEXT,
    level_up BOOLEAN,
    rank_up BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_old_xp INTEGER;
    v_old_level INTEGER;
    v_old_rank TEXT;
    v_new_xp INTEGER;
    v_new_level INTEGER;
    v_new_rank TEXT;
BEGIN
    -- Lock the row for update to prevent race conditions
    SELECT total_xp, current_level, current_rank
    INTO v_old_xp, v_old_level, v_old_rank
    FROM public.agora_profiles
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found for user_id: %', p_user_id;
    END IF;

    -- Calculate new values
    v_new_xp := v_old_xp + p_amount;
    v_new_level := (v_new_xp / 100) + 1;

    -- Calculate new rank based on XP thresholds
    v_new_rank := CASE
        WHEN v_new_xp >= 5000 THEN 'arquiteto'
        WHEN v_new_xp >= 2000 THEN 'mentor'
        WHEN v_new_xp >= 500 THEN 'contribuidor'
        WHEN v_new_xp >= 100 THEN 'aprendiz'
        ELSE 'novato'
    END;

    -- Update profile atomically
    UPDATE public.agora_profiles
    SET
        total_xp = v_new_xp,
        current_level = v_new_level,
        current_rank = v_new_rank,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Create XP transaction record
    INSERT INTO public.agora_xp_transactions (
        user_id,
        amount,
        balance_after,
        source_type,
        description
    ) VALUES (
        p_user_id,
        p_amount,
        v_new_xp,
        p_source_type,
        COALESCE(p_description, p_source_type)
    );

    -- Return results
    RETURN QUERY SELECT
        v_new_xp,
        v_new_level,
        v_new_rank,
        v_old_level,
        v_old_rank,
        (v_new_level > v_old_level),
        (v_new_rank != v_old_rank);
END;
$$;

COMMENT ON FUNCTION public.add_xp_atomic IS
'Atomically adds XP to user profile, preventing race conditions.
Returns new stats and indicates if level/rank changed.';

-- =====================================================
-- 2. Atomic Streak Update Function
-- =====================================================
-- Atomically updates user streak based on last activity

CREATE OR REPLACE FUNCTION public.update_streak_atomic(
    p_user_id UUID
)
RETURNS TABLE(
    new_streak INTEGER,
    longest_streak INTEGER,
    streak_multiplier NUMERIC,
    streak_broken BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_last_activity DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_new_streak INTEGER;
    v_today DATE := CURRENT_DATE;
    v_diff_days INTEGER;
    v_multiplier NUMERIC;
    v_broken BOOLEAN := FALSE;
BEGIN
    -- Lock the row for update
    SELECT last_activity_date, current_streak, longest_streak
    INTO v_last_activity, v_current_streak, v_longest_streak
    FROM public.agora_profiles
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found for user_id: %', p_user_id;
    END IF;

    -- Calculate days since last activity
    IF v_last_activity IS NULL THEN
        v_new_streak := 1;
    ELSE
        v_diff_days := v_today - v_last_activity;

        IF v_diff_days = 0 THEN
            -- Same day, keep current streak
            v_new_streak := v_current_streak;
        ELSIF v_diff_days = 1 THEN
            -- Consecutive day, increment streak
            v_new_streak := v_current_streak + 1;
        ELSE
            -- Streak broken
            v_new_streak := 1;
            v_broken := TRUE;
        END IF;
    END IF;

    -- Update longest streak if needed
    IF v_new_streak > v_longest_streak THEN
        v_longest_streak := v_new_streak;
    END IF;

    -- Calculate multiplier
    v_multiplier := CASE
        WHEN v_new_streak >= 30 THEN 2.0
        WHEN v_new_streak >= 14 THEN 1.5
        WHEN v_new_streak >= 7 THEN 1.25
        WHEN v_new_streak >= 3 THEN 1.1
        ELSE 1.0
    END;

    -- Update profile
    UPDATE public.agora_profiles
    SET
        current_streak = v_new_streak,
        longest_streak = v_longest_streak,
        last_activity_date = v_today,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Return results
    RETURN QUERY SELECT
        v_new_streak,
        v_longest_streak,
        v_multiplier,
        v_broken;
END;
$$;

COMMENT ON FUNCTION public.update_streak_atomic IS
'Atomically updates user streak based on activity.
Returns new streak, multiplier, and whether streak was broken.';

-- =====================================================
-- 3. Atomic Session End Function
-- =====================================================
-- Atomically ends session and updates profile stats

CREATE OR REPLACE FUNCTION public.end_session_atomic(
    p_session_id UUID,
    p_user_id UUID,
    p_xp_earned INTEGER DEFAULT 0,
    p_agents_used TEXT[] DEFAULT '{}'
)
RETURNS TABLE(
    duration_minutes INTEGER,
    new_total_sessions INTEGER,
    new_total_time INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_started_at TIMESTAMPTZ;
    v_duration INTEGER;
    v_current_sessions INTEGER;
    v_current_time INTEGER;
BEGIN
    -- Get session start time
    SELECT started_at INTO v_started_at
    FROM public.agora_sessions
    WHERE id = p_session_id AND user_id = p_user_id AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active session not found: %', p_session_id;
    END IF;

    -- Calculate duration
    v_duration := EXTRACT(EPOCH FROM (NOW() - v_started_at)) / 60;

    -- Update session
    UPDATE public.agora_sessions
    SET
        ended_at = NOW(),
        duration_minutes = v_duration,
        xp_earned = p_xp_earned,
        conversations = (
            SELECT jsonb_agg(jsonb_build_object('agent_name', agent))
            FROM unnest(p_agents_used) AS agent
        ),
        status = 'completed'
    WHERE id = p_session_id;

    -- Update profile stats atomically
    UPDATE public.agora_profiles
    SET
        total_sessions = total_sessions + 1,
        total_time_minutes = total_time_minutes + v_duration,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING total_sessions, total_time_minutes
    INTO v_current_sessions, v_current_time;

    -- Return results
    RETURN QUERY SELECT
        v_duration,
        v_current_sessions,
        v_current_time;
END;
$$;

COMMENT ON FUNCTION public.end_session_atomic IS
'Atomically ends a study session and updates profile statistics.
Ensures session and profile stats are always in sync.';

-- =====================================================
-- 4. Claim Daily Bonus Function
-- =====================================================
-- Atomically claims daily bonus with streak multiplier

CREATE OR REPLACE FUNCTION public.claim_daily_bonus_atomic(
    p_user_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    xp_awarded INTEGER,
    streak_multiplier NUMERIC,
    already_claimed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_last_bonus DATE;
    v_streak INTEGER;
    v_multiplier NUMERIC;
    v_base_bonus INTEGER := 5;
    v_total_bonus INTEGER;
    v_today DATE := CURRENT_DATE;
BEGIN
    -- Lock and get current state
    SELECT last_daily_bonus_date, current_streak
    INTO v_last_bonus, v_streak
    FROM public.agora_profiles
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0, 1.0::NUMERIC, FALSE;
        RETURN;
    END IF;

    -- Check if already claimed today
    IF v_last_bonus = v_today THEN
        RETURN QUERY SELECT FALSE, 0, 1.0::NUMERIC, TRUE;
        RETURN;
    END IF;

    -- Calculate multiplier
    v_multiplier := CASE
        WHEN v_streak >= 30 THEN 2.0
        WHEN v_streak >= 14 THEN 1.5
        WHEN v_streak >= 7 THEN 1.25
        WHEN v_streak >= 3 THEN 1.1
        ELSE 1.0
    END;

    v_total_bonus := ROUND(v_base_bonus * v_multiplier);

    -- Update last bonus date
    UPDATE public.agora_profiles
    SET
        last_daily_bonus_date = v_today,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Add XP using the atomic function
    PERFORM public.add_xp_atomic(
        p_user_id,
        v_total_bonus,
        'daily_login',
        CASE
            WHEN v_multiplier > 1
            THEN format('Bonus diario (+%s%% streak bonus!)', ROUND((v_multiplier - 1) * 100))
            ELSE 'Bonus diario de login'
        END
    );

    RETURN QUERY SELECT TRUE, v_total_bonus, v_multiplier, FALSE;
END;
$$;

COMMENT ON FUNCTION public.claim_daily_bonus_atomic IS
'Atomically claims daily login bonus with streak multiplier.
Prevents double-claiming and ensures XP is awarded correctly.';

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION public.add_xp_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_streak_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_session_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_daily_bonus_atomic TO authenticated;

-- =====================================================
-- Verification
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Atomic functions created successfully:';
    RAISE NOTICE '  - add_xp_atomic(user_id, amount, source_type, description)';
    RAISE NOTICE '  - update_streak_atomic(user_id)';
    RAISE NOTICE '  - end_session_atomic(session_id, user_id, xp_earned, agents_used)';
    RAISE NOTICE '  - claim_daily_bonus_atomic(user_id)';
END $$;
