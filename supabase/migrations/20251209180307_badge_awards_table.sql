-- Badge awards table
CREATE TABLE IF NOT EXISTS public.agora_badge_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_emoji TEXT,
    badge_tier INTEGER DEFAULT 1 CHECK (badge_tier BETWEEN 1 AND 4),
    xp_bonus INTEGER DEFAULT 0,
    trigger_source TEXT,
    trigger_value INTEGER,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);
