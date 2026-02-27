import { supabase } from './supabaseClient';
import type { Todo, CreateTodoPayload, UpdateTodoPayload } from '../types/todo';
import type { RealtimeChannel } from '@supabase/supabase-js';

const TABLE = 'todos';

/**
 * Fetch all todos ordered by creation date (newest first).
 */
export async function getTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getTodos failed: ${error.message}`);
  return (data ?? []) as Todo[];
}

/**
 * Add a new todo.
 */
export async function addTodo(payload: CreateTodoPayload): Promise<Todo> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        title: payload.title.trim(),
        description: payload.description?.trim() ?? null,
        is_complete: false,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`addTodo failed: ${error.message}`);
  return data as Todo;
}

/**
 * Update an existing todo by id.
 */
export async function updateTodo(id: string, payload: UpdateTodoPayload): Promise<Todo> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateTodo failed: ${error.message}`);
  return data as Todo;
}

/**
 * Delete a todo by id.
 */
export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteTodo failed: ${error.message}`);
}

/**
 * Toggle the is_complete status of a todo.
 */
export async function toggleTodo(id: string, currentValue: boolean): Promise<Todo> {
  return updateTodo(id, { is_complete: !currentValue });
}

/**
 * Subscribe to real-time changes on the todos table.
 * Returns the channel so the caller can unsubscribe on cleanup.
 *
 * @param onInsert - Called when a new todo is inserted
 * @param onUpdate - Called when an existing todo is updated
 * @param onDelete - Called when a todo is deleted (receives the old record id)
 */
export function subscribeTodos(
  onInsert: (todo: Todo) => void,
  onUpdate: (todo: Todo) => void,
  onDelete: (id: string) => void
): RealtimeChannel {
  const channel = supabase
    .channel('todos-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: TABLE },
      (payload) => onInsert(payload.new as Todo)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: TABLE },
      (payload) => onUpdate(payload.new as Todo)
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: TABLE },
      (payload) => onDelete((payload.old as { id: string }).id)
    )
    .subscribe();

  return channel;
}
