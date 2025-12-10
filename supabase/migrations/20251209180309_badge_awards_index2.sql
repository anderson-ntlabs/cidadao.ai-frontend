-- Index for badge analytics
CREATE INDEX IF NOT EXISTS idx_badge_awards_badge
ON public.agora_badge_awards(badge_id, earned_at DESC);
