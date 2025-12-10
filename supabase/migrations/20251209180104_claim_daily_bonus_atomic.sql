-- Claim Daily Bonus Function
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
