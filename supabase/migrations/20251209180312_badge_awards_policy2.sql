-- System can insert badge awards
CREATE POLICY "System can insert badge awards"
ON public.agora_badge_awards FOR INSERT
WITH CHECK (auth.uid() = user_id);
