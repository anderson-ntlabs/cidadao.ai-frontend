-- Function to get messages for a session with pagination
CREATE OR REPLACE FUNCTION public.get_chat_messages(
    p_session_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    role TEXT,
    content TEXT,
    agent_id TEXT,
    agent_name TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT
        m.id,
        m.role,
        m.content,
        m.agent_id,
        m.agent_name,
        m.metadata,
        m.created_at
    FROM public.chat_messages m
    JOIN public.chat_sessions s ON m.session_id = s.id
    WHERE m.session_id = p_session_id
      AND m.deleted_at IS NULL
      AND s.user_id = auth.uid()
    ORDER BY m.created_at ASC
    LIMIT p_limit
    OFFSET p_offset;
$$;
