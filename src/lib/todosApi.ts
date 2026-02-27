/**
 * Todo Data Access Layer
 *
 * Provides all CRUD operations and real-time subscription helpers
 * for the `todos` table in Supabase.
 *
 * All functions align with the shared Todo interface contract:
 *   { id, title, description, is_complete, created_at, updated_at }
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo';

// ============================================================
// Types
// ============================================================

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload {
  eventType: RealtimeEventType;
  new: Todo | null;
  old: Partial<Todo> | null;
}

export type RealtimeCallback = (payload: RealtimePayload) => void;

export interface DataAccessError {
  message: string;
  code?: string;
  details?: string;
}

export interface DataAccessResult<T> {
  data: T | null;
  error: DataAccessError | null;
}

// ============================================================
// Helper: normalise Supabase errors into a consistent shape
// ============================================================
function normaliseError(error: unknown): DataAccessError {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    return {
      message: (e['message'] as string) ?? 'An unexpected error occurred',
      code: e['code'] as string | undefined,
      details: e['details'] as string | undefined,
    };
  }
  return { message: String(error) };
}

// ============================================================
// getTodos — fetch all todos ordered by created_at DESC
// ============================================================
export async function getTodos(): Promise<DataAccessResult<Todo[]>> {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('id, title, description, is_complete, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: normaliseError(error) };
    }

    return { data: (data as Todo[]) ?? [], error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ============================================================
// addTodo — insert a new todo record
// ============================================================
export async function addTodo(
  input: CreateTodoInput
): Promise<DataAccessResult<Todo>> {
  const { title, description } = input;

  if (!title || title.trim().length === 0) {
    return {
      data: null,
      error: { message: 'Title is required and cannot be empty.' },
    };
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .insert({
        title: title.trim(),
        description: description?.trim() ?? null,
        is_complete: false,
      })
      .select('id, title, description, is_complete, created_at, updated_at')
      .single();

    if (error) {
      return { data: null, error: normaliseError(error) };
    }

    return { data: data as Todo, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ============================================================
// updateTodo — update mutable fields on an existing todo
// ============================================================
export async function updateTodo(
  id: string,
  input: UpdateTodoInput
): Promise<DataAccessResult<Todo>> {
  if (!id) {
    return { data: null, error: { message: 'Todo id is required.' } };
  }

  // Build only the fields that were provided
  const patch: Partial<Pick<Todo, 'title' | 'description' | 'is_complete'>> = {};

  if (input.title !== undefined) {
    const trimmed = input.title.trim();
    if (trimmed.length === 0) {
      return { data: null, error: { message: 'Title cannot be empty.' } };
    }
    patch.title = trimmed;
  }

  if (input.description !== undefined) {
    patch.description = input.description?.trim() ?? null;
  }

  if (input.is_complete !== undefined) {
    patch.is_complete = input.is_complete;
  }

  if (Object.keys(patch).length === 0) {
    return { data: null, error: { message: 'No fields provided to update.' } };
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .update(patch)
      .eq('id', id)
      .select('id, title, description, is_complete, created_at, updated_at')
      .single();

    if (error) {
      return { data: null, error: normaliseError(error) };
    }

    return { data: data as Todo, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ============================================================
// deleteTodo — remove a todo by id
// ============================================================
export async function deleteTodo(
  id: string
): Promise<DataAccessResult<{ id: string }>> {
  if (!id) {
    return { data: null, error: { message: 'Todo id is required.' } };
  }

  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: normaliseError(error) };
    }

    return { data: { id }, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ============================================================
// toggleTodo — flip the is_complete flag for a todo
// ============================================================
export async function toggleTodo(
  id: string,
  currentValue: boolean
): Promise<DataAccessResult<Todo>> {
  return updateTodo(id, { is_complete: !currentValue });
}

// ============================================================
// subscribeToTodos — subscribe to real-time changes on the todos table
//
// Returns the RealtimeChannel so the caller can unsubscribe when done.
// Usage:
//   const channel = subscribeToTodos((payload) => { ... });
//   // later:
//   supabase.removeChannel(channel);
// ============================================================
export function subscribeToTodos(callback: RealtimeCallback): RealtimeChannel {
  const channel = supabase
    .channel('todos-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'todos' },
      (payload) => {
        const eventType = payload.eventType as RealtimeEventType;

        // Map Supabase payload to our typed RealtimePayload
        const typedPayload: RealtimePayload = {
          eventType,
          new:
            eventType === 'DELETE'
              ? null
              : (payload.new as Todo) ?? null,
          old:
            eventType === 'INSERT'
              ? null
              : (payload.old as Partial<Todo>) ?? null,
        };

        callback(typedPayload);
      }
    )
    .subscribe();

  return channel;
}

// ============================================================
// unsubscribeFromTodos — clean up a real-time channel
// ============================================================
export async function unsubscribeFromTodos(
  channel: RealtimeChannel
): Promise<void> {
  await supabase.removeChannel(channel);
}
