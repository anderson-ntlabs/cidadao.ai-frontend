-- Function to get message count for a session
CREATE OR REPLACE FUNCTION public.get_chat_message_count(
    p_session_id UUID
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.chat_messages m
    JOIN public.chat_sessions s ON m.session_id = s.id
    WHERE m.session_id = p_session_id
      AND m.deleted_at IS NULL
      AND s.user_id = auth.uid();
$$;
