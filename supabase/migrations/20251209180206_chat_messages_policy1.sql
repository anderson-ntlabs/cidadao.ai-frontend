-- Users can view their own messages
CREATE POLICY "Users can view own messages"
ON public.chat_messages FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);
