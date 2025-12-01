-- Migration: Create missing tables for user activities and chat messages
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-01

-- ============================================================================
-- Table: user_activities
-- Description: Stores user activity logs for tracking engagement and behavior
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('chat', 'investigation', 'search', 'export', 'login', 'logout', 'settings', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user_activities
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);

-- RLS Policies for user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities"
    ON public.user_activities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
    ON public.user_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
    ON public.user_activities FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- Table: chat_messages
-- Description: Stores individual chat messages for conversation history
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    agent_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_agent_id ON public.chat_messages(agent_id);

-- RLS Policies for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
    ON public.chat_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
    ON public.chat_messages FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
    ON public.chat_messages FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- Grant permissions
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;

-- Comments
COMMENT ON TABLE public.user_activities IS 'Stores user activity logs for tracking engagement and behavior';
COMMENT ON TABLE public.chat_messages IS 'Stores individual chat messages for conversation history';
