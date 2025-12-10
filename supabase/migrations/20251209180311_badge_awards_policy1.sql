-- Users can view own badge awards
CREATE POLICY "Users can view own badge awards"
ON public.agora_badge_awards FOR SELECT
USING (auth.uid() = user_id);
