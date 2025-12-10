-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_chat_messages_content_search
ON public.chat_messages USING gin(to_tsvector('portuguese', content))
WHERE deleted_at IS NULL;
