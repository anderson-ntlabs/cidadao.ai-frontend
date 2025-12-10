-- User badge summary view
CREATE OR REPLACE VIEW public.user_badge_summary AS
SELECT
    user_id,
    COUNT(*) as total_badges,
    SUM(xp_bonus) as total_badge_xp,
    MAX(badge_tier) as highest_tier,
    array_agg(badge_id ORDER BY earned_at) as badge_ids,
    MIN(earned_at) as first_badge_at,
    MAX(earned_at) as last_badge_at
FROM public.agora_badge_awards
GROUP BY user_id;
