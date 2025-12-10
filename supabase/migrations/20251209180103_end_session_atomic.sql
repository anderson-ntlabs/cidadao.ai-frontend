-- Atomic Session End Function
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
