-- =============================================================================
-- Migration: Create todos table
-- Description: Initial schema for the Todo List app
-- WARNING: RLS policies below use permissive anonymous access for v1/demo.
--          Before any production deployment, these policies MUST be replaced
--          with user-scoped policies (e.g., auth.uid() = user_id) and the
--          todos table should include a user_id foreign key referencing auth.users.
-- =============================================================================

-- Enable the uuid-ossp extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Table: todos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.todos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 500),
  description TEXT        NULL CHECK (description IS NULL OR char_length(description) <= 2000),
  is_complete BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
-- Speed up ordering by creation time (most common query pattern)
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON public.todos (created_at DESC);

-- Speed up filtering by completion status
CREATE INDEX IF NOT EXISTS todos_is_complete_idx ON public.todos (is_complete);

-- -----------------------------------------------------------------------------
-- Trigger: auto-update updated_at on row modification
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS todos_set_updated_at ON public.todos;
CREATE TRIGGER todos_set_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- NOTE: Permissive anonymous access — v1/demo only.
--       Replace with user-scoped policies before production use.
-- -----------------------------------------------------------------------------
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to read all todos
CREATE POLICY "todos_select_all_v1_demo"
  ON public.todos
  FOR SELECT
  USING (true);

-- Allow anonymous and authenticated users to insert todos
CREATE POLICY "todos_insert_all_v1_demo"
  ON public.todos
  FOR INSERT
  WITH CHECK (true);

-- Allow anonymous and authenticated users to update todos
CREATE POLICY "todos_update_all_v1_demo"
  ON public.todos
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anonymous and authenticated users to delete todos
CREATE POLICY "todos_delete_all_v1_demo"
  ON public.todos
  FOR DELETE
  USING (true);

-- -----------------------------------------------------------------------------
-- Realtime: enable broadcast for todos table
-- -----------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;
