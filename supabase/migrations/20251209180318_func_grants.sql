-- Grant execute on award_badge function (with full signature)
GRANT EXECUTE ON FUNCTION public.award_badge(UUID, TEXT, TEXT, TEXT, INTEGER, INTEGER, TEXT, INTEGER) TO authenticated;
