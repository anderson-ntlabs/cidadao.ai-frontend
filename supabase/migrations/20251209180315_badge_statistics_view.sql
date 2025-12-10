-- Badge statistics view
CREATE OR REPLACE VIEW public.badge_statistics AS
SELECT
    badge_id,
    badge_name,
    badge_tier,
    COUNT(*) as total_awards,
    MIN(earned_at) as first_awarded,
    MAX(earned_at) as last_awarded
FROM public.agora_badge_awards
GROUP BY badge_id, badge_name, badge_tier
ORDER BY total_awards DESC;
