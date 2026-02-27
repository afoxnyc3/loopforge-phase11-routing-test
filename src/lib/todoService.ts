import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import type {
  Todo,
  CreateTodoPayload,
  UpdateTodoPayload,
  TodoResult,
  RealtimeTodoCallback,
} from './types';

const TABLE = 'todos' as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toServiceError(error: unknown): { message: string; code?: string; details?: string } {
  if (error && typeof error === 'object' && 'message' in error) {
    const e = error as { message: string; code?: string; details?: string };
    return { message: e.message, code: e.code, details: e.details };
  }
  return { message: 'An unexpected error occurred' };
}

// ---------------------------------------------------------------------------
// getTodos — fetch all todos ordered by creation date (newest first)
// ---------------------------------------------------------------------------
export async function getTodos(): Promise<TodoResult<Todo[]>> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: toServiceError(error) };
  }

  return { data: data ?? [], error: null };
}

// ---------------------------------------------------------------------------
// createTodo — insert a new todo record
// ---------------------------------------------------------------------------
export async function createTodo(
  payload: CreateTodoPayload
): Promise<TodoResult<Todo>> {
  const { title, description = null } = payload;

  if (!title || title.trim().length === 0) {
    return { data: null, error: { message: 'Title is required and cannot be empty.' } };
  }

  if (title.trim().length > 500) {
    return { data: null, error: { message: 'Title must be 500 characters or fewer.' } };
  }

  if (description !== null && description !== undefined && description.length > 2000) {
    return { data: null, error: { message: 'Description must be 2000 characters or fewer.' } };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ title: title.trim(), description: description ?? null })
    .select()
    .single();

  if (error) {
    return { data: null, error: toServiceError(error) };
  }

  return { data, error: null };
}

// ---------------------------------------------------------------------------
// updateTodo — update title and/or description of an existing todo
// ---------------------------------------------------------------------------
export async function updateTodo(
  id: string,
  payload: UpdateTodoPayload
): Promise<TodoResult<Todo>> {
  if (!id) {
    return { data: null, error: { message: 'Todo ID is required.' } };
  }

  const updates: UpdateTodoPayload = {};

  if (payload.title !== undefined) {
    const trimmed = payload.title.trim();
    if (trimmed.length === 0) {
      return { data: null, error: { message: 'Title cannot be empty.' } };
    }
    if (trimmed.length > 500) {
      return { data: null, error: { message: 'Title must be 500 characters or fewer.' } };
    }
    updates.title = trimmed;
  }

  if (payload.description !== undefined) {
    if (payload.description !== null && payload.description.length > 2000) {
      return { data: null, error: { message: 'Description must be 2000 characters or fewer.' } };
    }
    updates.description = payload.description;
  }

  if (payload.is_complete !== undefined) {
    updates.is_complete = payload.is_complete;
  }

  if (Object.keys(updates).length === 0) {
    return { data: null, error: { message: 'No update fields provided.' } };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: toServiceError(error) };
  }

  return { data, error: null };
}

// ---------------------------------------------------------------------------
// deleteTodo — remove a todo by ID
// ---------------------------------------------------------------------------
export async function deleteTodo(id: string): Promise<TodoResult<true>> {
  if (!id) {
    return { data: null, error: { message: 'Todo ID is required.' } };
  }

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    return { data: null, error: toServiceError(error) };
  }

  return { data: true, error: null };
}

// ---------------------------------------------------------------------------
// toggleTodoComplete — flip the is_complete boolean for a given todo
// ---------------------------------------------------------------------------
export async function toggleTodoComplete(
  id: string,
  currentValue: boolean
): Promise<TodoResult<Todo>> {
  return updateTodo(id, { is_complete: !currentValue });
}

// ---------------------------------------------------------------------------
// subscribeToTodos — open a Supabase Realtime channel for the todos table.
// Returns an unsubscribe function. Call it on component unmount.
// ---------------------------------------------------------------------------
export function subscribeToTodos(
  callback: RealtimeTodoCallback
): () => void {
  const channel: RealtimeChannel = supabase
    .channel('todos-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: (payload.new && Object.keys(payload.new).length > 0
            ? payload.new
            : null) as Todo | null,
          old: (payload.old && Object.keys(payload.old).length > 0
            ? payload.old
            : null) as Partial<Todo> | null,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
