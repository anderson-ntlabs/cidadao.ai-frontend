-- Agent-specific queries index
CREATE INDEX IF NOT EXISTS idx_chat_messages_agent
ON public.chat_messages(agent_id, created_at DESC)
WHERE agent_id IS NOT NULL AND deleted_at IS NULL;
