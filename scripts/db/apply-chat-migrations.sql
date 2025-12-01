-- =============================================================================
-- APPLY CHAT PERSISTENCE MIGRATIONS
-- =============================================================================
-- Execute this SQL in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/mvijgvhyaaoxfmhxqmxs/sql
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-01
-- =============================================================================

-- PART 1: Create investigations table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    agents_used TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investigations_user_id ON public.investigations(user_id);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON public.investigations(created_at DESC);

ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'investigations' AND policyname = 'Users can view own investigations') THEN
        CREATE POLICY "Users can view own investigations" ON public.investigations FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'investigations' AND policyname = 'Users can create investigations') THEN
        CREATE POLICY "Users can create investigations" ON public.investigations FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'investigations' AND policyname = 'Users can update own investigations') THEN
        CREATE POLICY "Users can update own investigations" ON public.investigations FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'investigations' AND policyname = 'Users can delete own investigations') THEN
        CREATE POLICY "Users can delete own investigations" ON public.investigations FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigations TO authenticated;

-- PART 2: Create chat_sessions table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    investigation_id UUID REFERENCES public.investigations(id) ON DELETE SET NULL,
    agent_id TEXT NOT NULL,
    messages JSONB DEFAULT '[]',
    session_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON public.chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_investigation_id ON public.chat_sessions(investigation_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent_id ON public.chat_sessions(agent_id);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can view own chat sessions') THEN
        CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can create chat sessions') THEN
        CREATE POLICY "Users can create chat sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can update own chat sessions') THEN
        CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can delete own chat sessions') THEN
        CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions TO authenticated;

-- PART 3: Create trigger for updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_investigations_updated_at ON public.investigations;
CREATE TRIGGER set_investigations_updated_at
    BEFORE UPDATE ON public.investigations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER set_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- PART 4: Verify tables were created
-- =============================================================================
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('investigations', 'chat_sessions', 'user_activities', 'chat_messages', 'user_badges', 'survey_responses')
ORDER BY table_name;
