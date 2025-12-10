-- Users can insert their own messages
CREATE POLICY "Users can insert own messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);
