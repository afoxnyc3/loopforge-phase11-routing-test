/**
 * Core Todo interface matching the Supabase `todos` table schema.
 * This is the shared contract between frontend and backend layers.
 */
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload for creating a new todo.
 */
export interface CreateTodoPayload {
  title: string;
  description?: string | null;
}

/**
 * Payload for updating an existing todo.
 */
export interface UpdateTodoPayload {
  title?: string;
  description?: string | null;
  is_complete?: boolean;
}
