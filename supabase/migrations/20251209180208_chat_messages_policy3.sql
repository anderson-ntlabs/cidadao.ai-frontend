-- Users can soft-delete their own messages (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'chat_messages'
        AND policyname = 'Users can soft delete own messages'
    ) THEN
        CREATE POLICY "Users can soft delete own messages"
        ON public.chat_messages FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
