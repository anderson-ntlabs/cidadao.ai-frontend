-- Atomic Add XP Function
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
