-- Atomic Streak Update Function
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
