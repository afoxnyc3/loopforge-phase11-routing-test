import type { Database } from './database.types';

// Canonical Todo type derived from the database Row type
export type Todo = Database['public']['Tables']['todos']['Row'];

// Payload for creating a new todo
export type CreateTodoPayload = {
  title: string;
  description?: string | null;
};

// Payload for updating an existing todo
export type UpdateTodoPayload = {
  title?: string;
  description?: string | null;
  is_complete?: boolean;
};

// Shape of errors returned from the data access layer
export interface TodoServiceError {
  message: string;
  code?: string;
  details?: string;
}

// Result wrapper — either data or an error, never both
export type TodoResult<T> =
  | { data: T; error: null }
  | { data: null; error: TodoServiceError };

// Real-time event types
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeTodoEvent {
  eventType: RealtimeEventType;
  new: Todo | null;
  old: Partial<Todo> | null;
}

// Callback signature for real-time subscription handlers
export type RealtimeTodoCallback = (event: RealtimeTodoEvent) => void;
