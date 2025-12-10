-- Award badge function
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
