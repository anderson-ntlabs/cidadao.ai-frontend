-- ============================================================================
-- CIDADÃO.AI ACADEMY - TABELAS SUPABASE
-- Parceria: Neural Thinker AI Engineering + IFSULDEMINAS/LabSoft
-- Data: Dezembro 2025
-- ============================================================================

-- ============================================================================
-- 1. PERFIL DO ESTAGIÁRIO
-- ============================================================================
CREATE TABLE IF NOT EXISTS academy_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Dados pessoais
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    github_username TEXT,

    -- Dados institucionais
    matricula TEXT, -- Número de matrícula IFSULDEMINAS
    curso TEXT DEFAULT 'Ciência da Computação',
    periodo INTEGER, -- Período do curso (1-8)

    -- Gamificação
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_rank TEXT DEFAULT 'novato',
    main_track TEXT DEFAULT 'backend',
    badges JSONB DEFAULT '[]'::jsonb,

    -- Streaks
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,

    -- Estatísticas
    total_sessions INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    total_missions_completed INTEGER DEFAULT 0,
    total_articles_read INTEGER DEFAULT 0,

    -- Datas
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    program_start_date DATE,
    program_end_date DATE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    program_status TEXT DEFAULT 'enrolled', -- enrolled, in_progress, completed, dropped

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id),
    UNIQUE(email)
);

-- ============================================================================
-- 2. TERMO DE CONSENTIMENTO LGPD
-- ============================================================================
CREATE TABLE IF NOT EXISTS academy_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Consentimento
    consent_version TEXT NOT NULL DEFAULT 'v1.0',
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,

    -- O que foi aceito
    tracking_consent BOOLEAN DEFAULT TRUE,
    data_processing_consent BOOLEAN DEFAULT TRUE,
    certificate_consent BOOLEAN DEFAULT TRUE,

    -- Metadados
    consent_text_hash TEXT, -- Hash do texto do termo aceito

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, consent_version)
);

-- ============================================================================
-- 3. SESSÕES DE ESTUDO
-- ============================================================================
CREATE TABLE IF NOT EXISTS academy_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 0,

    -- Atividades na sessão
    videos_watched JSONB DEFAULT '[]'::jsonb, -- [{video_id, title, watched_seconds}]
    conversations JSONB DEFAULT '[]'::jsonb, -- [{conversation_id, agent_name, messages_count}]
    missions_worked JSONB DEFAULT '[]'::jsonb, -- [{mission_id, status}]
    articles_read JSONB DEFAULT '[]'::jsonb, -- [{article_id, title}]

    -- XP ganho na sessão
    xp_earned INTEGER DEFAULT 0,
    badges_earned JSONB DEFAULT '[]'::jsonb,

    -- Status
    status TEXT DEFAULT 'active', -- active, completed, abandoned

    -- PostHog
    posthog_session_id TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. DIÁRIO DE APRENDIZADO
-- ============================================================================
CREATE TABLE IF NOT EXISTS academy_diary_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES academy_sessions(id) ON DELETE SET NULL,

    -- Conteúdo
    content TEXT NOT NULL,

    -- Metadados
    mood TEXT, -- great, good, neutral, struggling
    topics_learned JSONB DEFAULT '[]'::jsonb, -- Lista de tópicos
    questions JSONB DEFAULT '[]'::jsonb, -- Dúvidas que ficaram

    -- Reflexão guiada
    what_learned TEXT, -- O que aprendi
    what_struggled TEXT, -- Onde tive dificuldade
    next_steps TEXT, -- Próximos passos

    -- Timing
    session_duration_minutes INTEGER,
    entry_date DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. LEITURAS OBRIGATÓRIAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS academy_required_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Artigo
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL, -- ArXiv, Drive, etc.
    article_type TEXT DEFAULT 'paper', -- paper, tutorial, documentation

    -- Categorização
    track TEXT, -- backend, frontend, ia, devops, all
    difficulty TEXT DEFAULT 'beginner',
    estimated_time_minutes INTEGER DEFAULT 30,

    -- Período
    week_number INTEGER, -- Semana do programa (1-16)
    is_required BOOLEAN DEFAULT TRUE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. PROGRESSO DE LEITURA
-- ============================================================================
CREATE TABLE IF NOT EXISTS academy_reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reading_id UUID REFERENCES academy_required_readings(id) ON DELETE CASCADE NOT NULL,

    -- Status
    status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Confirmação
    confirmed_read BOOLEAN DEFAULT FALSE,
    confirmation_date TIMESTAMPTZ,

    -- Notas do aluno
    notes TEXT,
    rating INTEGER, -- 1-5 estrelas

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, reading_id)
);

-- ============================================================================
-- 7. CERTIFICADOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS academy_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Dados do certificado
    certificate_number TEXT NOT NULL UNIQUE,
    certificate_type TEXT DEFAULT 'completion', -- completion, distinction, participation

    -- Período
    program_start_date DATE NOT NULL,
    program_end_date DATE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),

    -- Métricas finais
    total_hours DECIMAL(10,2) NOT NULL,
    total_xp INTEGER NOT NULL,
    final_rank TEXT NOT NULL,
    final_level INTEGER NOT NULL,
    missions_completed INTEGER DEFAULT 0,
    articles_read INTEGER DEFAULT 0,
    conversations_count INTEGER DEFAULT 0,

    -- Posição no ranking
    final_position INTEGER,
    total_participants INTEGER,

    -- Badges especiais
    badges JSONB DEFAULT '[]'::jsonb,

    -- Validação
    verification_hash TEXT NOT NULL, -- Para verificar autenticidade
    verification_url TEXT,
    qr_code_url TEXT,

    -- PDF
    pdf_url TEXT,
    pdf_generated_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. TRANSAÇÕES DE XP
-- ============================================================================
CREATE TABLE IF NOT EXISTS academy_xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Transação
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,

    -- Origem
    source_type TEXT NOT NULL, -- session, conversation, mission, badge, article, bonus
    source_id UUID,
    description TEXT NOT NULL,

    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. VÍDEOS DO PROGRAMA
-- ============================================================================
CREATE TABLE IF NOT EXISTS academy_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Vídeo
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL, -- YouTube, Vimeo, etc.
    thumbnail_url TEXT,
    duration_seconds INTEGER NOT NULL,

    -- Categorização
    category TEXT NOT NULL, -- onboarding, backend, frontend, ia, devops, agents, missions
    track TEXT, -- backend, frontend, ia, devops
    difficulty TEXT DEFAULT 'beginner',
    order_index INTEGER DEFAULT 0,

    -- Agente relacionado
    agent_name TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_required BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. PROGRESSO DE VÍDEOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS academy_video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES academy_videos(id) ON DELETE CASCADE NOT NULL,

    -- Progresso
    watched_seconds INTEGER DEFAULT 0,
    total_seconds INTEGER NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
    completed_at TIMESTAMPTZ,

    -- XP
    xp_awarded INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, video_id)
);

-- ============================================================================
-- 11. CALENDÁRIO / EVENTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS academy_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Evento
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL, -- deadline, mentoring, presentation, workshop

    -- Datas
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    all_day BOOLEAN DEFAULT FALSE,

    -- Recorrência
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT, -- RRULE format

    -- Visibilidade
    is_public BOOLEAN DEFAULT TRUE,
    track TEXT, -- null = todos

    -- ICS
    ics_uid TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_academy_profiles_user_id ON academy_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_profiles_email ON academy_profiles(email);
CREATE INDEX IF NOT EXISTS idx_academy_profiles_rank ON academy_profiles(current_rank);
CREATE INDEX IF NOT EXISTS idx_academy_profiles_xp ON academy_profiles(total_xp DESC);

CREATE INDEX IF NOT EXISTS idx_academy_sessions_user_id ON academy_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_sessions_status ON academy_sessions(status);
CREATE INDEX IF NOT EXISTS idx_academy_sessions_date ON academy_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_academy_diary_user_id ON academy_diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_diary_date ON academy_diary_entries(entry_date);

CREATE INDEX IF NOT EXISTS idx_academy_xp_user_id ON academy_xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_xp_created ON academy_xp_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_academy_certificates_user ON academy_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_certificates_number ON academy_certificates(certificate_number);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE academy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_video_progress ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário só vê seus próprios dados
CREATE POLICY "Users can view own profile" ON academy_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON academy_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON academy_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own consent" ON academy_consent
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent" ON academy_consent
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON academy_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own diary" ON academy_diary_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reading progress" ON academy_reading_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own certificates" ON academy_certificates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own xp transactions" ON academy_xp_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own video progress" ON academy_video_progress
    FOR ALL USING (auth.uid() = user_id);

-- Tabelas públicas (leitura)
CREATE POLICY "Anyone can view videos" ON academy_videos
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view readings" ON academy_required_readings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view events" ON academy_events
    FOR SELECT USING (is_public = true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Função para calcular rank baseado em XP
CREATE OR REPLACE FUNCTION calculate_rank(xp INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF xp >= 5000 THEN RETURN 'arquiteto';
    ELSIF xp >= 2000 THEN RETURN 'mentor';
    ELSIF xp >= 500 THEN RETURN 'contribuidor';
    ELSIF xp >= 100 THEN RETURN 'aprendiz';
    ELSE RETURN 'novato';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular nível baseado em XP
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN GREATEST(1, (xp / 100) + 1);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar rank e level automaticamente
CREATE OR REPLACE FUNCTION update_rank_and_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.current_rank := calculate_rank(NEW.total_xp);
    NEW.current_level := calculate_level(NEW.total_xp);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rank_level
    BEFORE UPDATE OF total_xp ON academy_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_rank_and_level();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated
    BEFORE UPDATE ON academy_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_sessions_updated
    BEFORE UPDATE ON academy_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Artigos obrigatórios iniciais
INSERT INTO academy_required_readings (title, description, url, track, week_number, estimated_time_minutes) VALUES
('Cidadão.AI: Multi-Agent System for Government Transparency', 'Artigo principal do projeto', 'https://arxiv.org/abs/xxxx', 'all', 1, 60),
('FastAPI Documentation - First Steps', 'Introdução ao FastAPI', 'https://fastapi.tiangolo.com/tutorial/', 'backend', 2, 45),
('Next.js 15 - Getting Started', 'Introdução ao Next.js', 'https://nextjs.org/docs', 'frontend', 2, 45),
('Introduction to LangChain', 'Fundamentos de LangChain', 'https://python.langchain.com/docs/get_started', 'ia', 3, 60),
('Docker Getting Started', 'Introdução ao Docker', 'https://docs.docker.com/get-started/', 'devops', 3, 45)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON TABLE academy_profiles IS 'Perfis dos estagiários da Academy - dados gamificação e progresso';
COMMENT ON TABLE academy_consent IS 'Registro de aceite do termo LGPD - obrigatório para participar';
COMMENT ON TABLE academy_sessions IS 'Sessões de estudo com tracking de tempo via PostHog';
COMMENT ON TABLE academy_diary_entries IS 'Diário de aprendizado - reflexão ao fim de cada sessão';
COMMENT ON TABLE academy_certificates IS 'Certificados gerados ao fim do programa';
COMMENT ON TABLE academy_xp_transactions IS 'Histórico de todas as transações de XP';
