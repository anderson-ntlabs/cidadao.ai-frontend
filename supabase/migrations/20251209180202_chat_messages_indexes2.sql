-- User messages index
CREATE INDEX IF NOT EXISTS idx_chat_messages_user
ON public.chat_messages(user_id, created_at DESC)
WHERE deleted_at IS NULL;
