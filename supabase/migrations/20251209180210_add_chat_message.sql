-- Function to add a message to a session
CREATE OR REPLACE FUNCTION public.add_chat_message(
    p_session_id UUID,
    p_role TEXT,
    p_content TEXT,
    p_agent_id TEXT DEFAULT NULL,
    p_agent_name TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_message_id UUID;
BEGIN
    -- Verify session belongs to user
    SELECT user_id INTO v_user_id
    FROM public.chat_sessions
    WHERE id = p_session_id;

    IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Session not found or unauthorized';
    END IF;

    -- Insert message
    INSERT INTO public.chat_messages (
        session_id,
        user_id,
        role,
        content,
        agent_id,
        agent_name,
        metadata
    ) VALUES (
        p_session_id,
        v_user_id,
        p_role,
        p_content,
        p_agent_id,
        p_agent_name,
        p_metadata
    )
    RETURNING id INTO v_message_id;

    -- Update session's updated_at
    UPDATE public.chat_sessions
    SET updated_at = NOW()
    WHERE id = p_session_id;

    RETURN v_message_id;
END;
$$;
