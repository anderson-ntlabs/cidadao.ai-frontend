-- ============================================
-- Agora Learning Tracks Schema
-- ============================================
-- Migrates hardcoded track data to database
-- Supports both Agora (adults) and Agora Kids
--
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-11
-- ============================================

-- ============================================
-- AGORA TRACKS (Adults)
-- ============================================

-- Tracks table (introducao, backend, frontend, ia, devops)
CREATE TABLE IF NOT EXISTS public.agora_tracks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'BookOpen',
    color TEXT NOT NULL DEFAULT 'green',
    gradient TEXT NOT NULL DEFAULT 'from-green-500 to-emerald-500',
    duration TEXT NOT NULL DEFAULT '4-6 semanas',
    xp_total INTEGER NOT NULL DEFAULT 2000,
    certificate_hours INTEGER NOT NULL DEFAULT 12,
    is_intro BOOLEAN NOT NULL DEFAULT FALSE,
    prerequisite_id TEXT REFERENCES public.agora_tracks(id),
    mentor_id TEXT NOT NULL,
    mentor_name TEXT NOT NULL,
    mentor_role TEXT NOT NULL,
    mentor_image TEXT NOT NULL,
    mentor_greeting TEXT,
    mentor_video_intro TEXT,
    mentor_diary_encouragement TEXT,
    mentor_chat_invitation TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Modules table
CREATE TABLE IF NOT EXISTS public.agora_modules (
    id SERIAL PRIMARY KEY,
    track_id TEXT NOT NULL REFERENCES public.agora_tracks(id) ON DELETE CASCADE,
    module_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    objectives TEXT[] NOT NULL DEFAULT '{}',
    xp_reward INTEGER NOT NULL DEFAULT 100,
    diary_prompt TEXT,
    chat_prompt TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(track_id, module_number)
);

-- Module videos table (3 styles per module: academic, didactic, practical)
CREATE TABLE IF NOT EXISTS public.agora_module_videos (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES public.agora_modules(id) ON DELETE CASCADE,
    style TEXT NOT NULL CHECK (style IN ('academic', 'didactic', 'practical')),
    title TEXT NOT NULL,
    channel TEXT NOT NULL,
    channel_url TEXT,
    youtube_id TEXT NOT NULL,
    duration TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_validated_at TIMESTAMPTZ,
    validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'unavailable')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(module_id, style)
);

-- Exercises table
CREATE TABLE IF NOT EXISTS public.agora_exercises (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES public.agora_modules(id) ON DELETE CASCADE,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('quiz', 'coding', 'reflection')),
    question TEXT NOT NULL,
    options TEXT[],
    correct_answer INTEGER,
    min_words INTEGER,
    xp_reward INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User progress per module
CREATE TABLE IF NOT EXISTS public.agora_user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id INTEGER NOT NULL REFERENCES public.agora_modules(id) ON DELETE CASCADE,
    video_completed BOOLEAN NOT NULL DEFAULT FALSE,
    video_style_watched TEXT,
    exercise_completed BOOLEAN NOT NULL DEFAULT FALSE,
    exercise_score INTEGER,
    diary_completed BOOLEAN NOT NULL DEFAULT FALSE,
    diary_entry_id UUID,
    chat_completed BOOLEAN NOT NULL DEFAULT FALSE,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- User track enrollment
CREATE TABLE IF NOT EXISTS public.agora_user_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES public.agora_tracks(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    certificate_issued_at TIMESTAMPTZ,
    certificate_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

-- ============================================
-- AGORA KIDS TRACKS
-- ============================================

-- Kids tracks table
CREATE TABLE IF NOT EXISTS public.agora_kids_tracks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '*',
    color TEXT NOT NULL DEFAULT 'kids-coral',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kids videos table
CREATE TABLE IF NOT EXISTS public.agora_kids_videos (
    id TEXT PRIMARY KEY,
    track_id TEXT NOT NULL REFERENCES public.agora_kids_tracks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    duration TEXT NOT NULL,
    thumbnail TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_validated_at TIMESTAMPTZ,
    validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'unavailable')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kids video progress (linked to agora_kids_profiles)
CREATE TABLE IF NOT EXISTS public.agora_kids_video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kid_profile_id UUID NOT NULL REFERENCES public.agora_kids_profiles(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL REFERENCES public.agora_kids_videos(id) ON DELETE CASCADE,
    watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    watch_duration_seconds INTEGER,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(kid_profile_id, video_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_agora_modules_track ON public.agora_modules(track_id);
CREATE INDEX IF NOT EXISTS idx_agora_module_videos_module ON public.agora_module_videos(module_id);
CREATE INDEX IF NOT EXISTS idx_agora_module_videos_youtube ON public.agora_module_videos(youtube_id);
CREATE INDEX IF NOT EXISTS idx_agora_exercises_module ON public.agora_exercises(module_id);
CREATE INDEX IF NOT EXISTS idx_agora_user_progress_user ON public.agora_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_user_progress_module ON public.agora_user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_agora_user_tracks_user ON public.agora_user_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_user_tracks_track ON public.agora_user_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_agora_kids_videos_track ON public.agora_kids_videos(track_id);
CREATE INDEX IF NOT EXISTS idx_agora_kids_video_progress_kid ON public.agora_kids_video_progress(kid_profile_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.agora_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_module_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_user_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_kids_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_kids_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agora_kids_video_progress ENABLE ROW LEVEL SECURITY;

-- Public read access for tracks, modules, videos, exercises (content is public)
CREATE POLICY "Public read access to tracks" ON public.agora_tracks
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read access to modules" ON public.agora_modules
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read access to module videos" ON public.agora_module_videos
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read access to exercises" ON public.agora_exercises
    FOR SELECT USING (is_active = TRUE);

-- User progress - users can only see/modify their own
CREATE POLICY "Users can view own progress" ON public.agora_user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.agora_user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.agora_user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- User tracks - users can only see/modify their own
CREATE POLICY "Users can view own tracks" ON public.agora_user_tracks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in tracks" ON public.agora_user_tracks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own track enrollment" ON public.agora_user_tracks
    FOR UPDATE USING (auth.uid() = user_id);

-- Kids tracks/videos - public read
CREATE POLICY "Public read access to kids tracks" ON public.agora_kids_tracks
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read access to kids videos" ON public.agora_kids_videos
    FOR SELECT USING (is_active = TRUE);

-- Kids video progress - parents can manage their kids' progress
CREATE POLICY "Parents can view kids progress" ON public.agora_kids_video_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agora_kids_profiles kp
            WHERE kp.id = kid_profile_id AND kp.parent_user_id = auth.uid()
        )
    );

CREATE POLICY "Parents can insert kids progress" ON public.agora_kids_video_progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agora_kids_profiles kp
            WHERE kp.id = kid_profile_id AND kp.parent_user_id = auth.uid()
        )
    );

CREATE POLICY "Parents can update kids progress" ON public.agora_kids_video_progress
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.agora_kids_profiles kp
            WHERE kp.id = kid_profile_id AND kp.parent_user_id = auth.uid()
        )
    );

-- ============================================
-- GRANTS
-- ============================================

GRANT SELECT ON public.agora_tracks TO anon, authenticated;
GRANT SELECT ON public.agora_modules TO anon, authenticated;
GRANT SELECT ON public.agora_module_videos TO anon, authenticated;
GRANT SELECT ON public.agora_exercises TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.agora_user_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.agora_user_tracks TO authenticated;
GRANT SELECT ON public.agora_kids_tracks TO anon, authenticated;
GRANT SELECT ON public.agora_kids_videos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.agora_kids_video_progress TO authenticated;

-- ============================================
-- TRIGGERS for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agora_tracks_updated_at
    BEFORE UPDATE ON public.agora_tracks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agora_modules_updated_at
    BEFORE UPDATE ON public.agora_modules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agora_module_videos_updated_at
    BEFORE UPDATE ON public.agora_module_videos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agora_exercises_updated_at
    BEFORE UPDATE ON public.agora_exercises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agora_user_progress_updated_at
    BEFORE UPDATE ON public.agora_user_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agora_user_tracks_updated_at
    BEFORE UPDATE ON public.agora_user_tracks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agora_kids_tracks_updated_at
    BEFORE UPDATE ON public.agora_kids_tracks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agora_kids_videos_updated_at
    BEFORE UPDATE ON public.agora_kids_videos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
