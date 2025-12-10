-- Users can soft-delete their own messages
CREATE POLICY "Users can soft delete own messages"
ON public.chat_messages FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
