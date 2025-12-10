-- Index for user badge lookups
CREATE INDEX IF NOT EXISTS idx_badge_awards_user
ON public.agora_badge_awards(user_id, earned_at DESC);
