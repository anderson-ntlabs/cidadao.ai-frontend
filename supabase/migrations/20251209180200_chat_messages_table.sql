-- =====================================================
-- Migration: Chat Messages Normalization
-- Description: Separate table for chat messages
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-09
-- Purpose: Better indexing, pagination, and scalability
-- =====================================================

-- =====================================================
-- 1. Create chat_messages table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Message content
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,

    -- Agent information (for assistant messages)
    agent_id TEXT,
    agent_name TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    tokens_used INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Soft delete
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- 2. Indexes for chat_messages
-- =====================================================

-- Primary lookup: messages by session
CREATE INDEX idx_chat_messages_session
ON public.chat_messages(session_id, created_at ASC)
WHERE deleted_at IS NULL;

-- User's messages across all sessions
CREATE INDEX idx_chat_messages_user
ON public.chat_messages(user_id, created_at DESC)
WHERE deleted_at IS NULL;

-- Agent-specific queries
CREATE INDEX idx_chat_messages_agent
ON public.chat_messages(agent_id, created_at DESC)
WHERE agent_id IS NOT NULL AND deleted_at IS NULL;

-- Full-text search on content (optional, for search feature)
CREATE INDEX idx_chat_messages_content_search
ON public.chat_messages USING gin(to_tsvector('portuguese', content))
WHERE deleted_at IS NULL;

-- =====================================================
-- 3. RLS Policies
-- =====================================================

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view own messages"
ON public.chat_messages FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can insert their own messages
CREATE POLICY "Users can insert own messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can soft-delete their own messages
CREATE POLICY "Users can soft delete own messages"
ON public.chat_messages FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. Helper Functions
-- =====================================================

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

-- =====================================================
-- 5. Grant Permissions
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON public.chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_chat_message TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_chat_message_count TO authenticated;

-- =====================================================
-- 6. Comments
-- =====================================================

COMMENT ON TABLE public.chat_messages IS
'Normalized chat messages table. Allows pagination without loading full session history.';

COMMENT ON COLUMN public.chat_messages.deleted_at IS
'Soft delete timestamp. Messages are not physically deleted for audit purposes.';

COMMENT ON FUNCTION public.get_chat_messages IS
'Get paginated messages for a session. Enforces RLS through session ownership check.';

COMMENT ON FUNCTION public.add_chat_message IS
'Add a message to a session. Updates session updated_at timestamp.';

-- =====================================================
-- Verification
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Chat messages table created successfully';
    RAISE NOTICE 'Available functions:';
    RAISE NOTICE '  - get_chat_messages(session_id, limit, offset)';
    RAISE NOTICE '  - add_chat_message(session_id, role, content, agent_id, agent_name, metadata)';
    RAISE NOTICE '  - get_chat_message_count(session_id)';
END $$;
