-- Migration: Create agora_calendar_events table
-- Description: Stores personal calendar/agenda events for users in the Agora academy
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-08

CREATE TABLE IF NOT EXISTS "public"."agora_calendar_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "start_time" TIMESTAMPTZ NOT NULL,
  "end_time" TIMESTAMPTZ,
  "event_type" TEXT NOT NULL CHECK (event_type IN ('study', 'reading', 'video', 'chat', 'deadline')),
  "description" TEXT,
  "xp_reward" INTEGER DEFAULT 10,
  "completed" BOOLEAN DEFAULT FALSE,
  "completed_at" TIMESTAMPTZ,
  "url" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_agora_calendar_events_user_id ON agora_calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_agora_calendar_events_start_time ON agora_calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_agora_calendar_events_user_start ON agora_calendar_events(user_id, start_time);

-- Enable RLS
ALTER TABLE "public"."agora_calendar_events" ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own events
CREATE POLICY "Users can view own calendar events" ON agora_calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events" ON agora_calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events" ON agora_calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" ON agora_calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE "public"."agora_calendar_events" IS 'Personal calendar events for Agora users with XP rewards';
