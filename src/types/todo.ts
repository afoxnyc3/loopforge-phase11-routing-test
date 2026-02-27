// Core Todo domain type — mirrors the `todos` table in Supabase
export interface Todo {
  id: string;           // UUID primary key
  title: string;        // Required todo title
  description: string | null; // Optional description
  is_complete: boolean; // Completion status
  created_at: string;   // ISO 8601 timestamp
  updated_at: string;   // ISO 8601 timestamp
}

// Payload for creating a new todo
export interface CreateTodoPayload {
  title: string;
  description?: string;
}

// Payload for updating an existing todo
export interface UpdateTodoPayload {
  title?: string;
  description?: string | null;
  is_complete?: boolean;
}
