import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Todo, CreateTodoPayload, UpdateTodoPayload } from '../types/todo';

interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  createTodo: (payload: CreateTodoPayload) => Promise<void>;
  updateTodo: (id: string, payload: UpdateTodoPayload) => Promise<void>;
  toggleTodo: (id: string, currentState: boolean) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all todos ordered by creation date descending
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTodos((data as Todo[]) ?? []);
    }
    setLoading(false);
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    fetchTodos();

    const channel = supabase
      .channel('todos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT') {
            setTodos((prev) => [newRecord as Todo, ...prev]);
          } else if (eventType === 'UPDATE') {
            setTodos((prev) =>
              prev.map((t) => (t.id === (newRecord as Todo).id ? (newRecord as Todo) : t))
            );
          } else if (eventType === 'DELETE') {
            setTodos((prev) => prev.filter((t) => t.id !== (oldRecord as { id: string }).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTodos]);

  const createTodo = useCallback(async (payload: CreateTodoPayload) => {
    setError(null);
    const { error: insertError } = await supabase.from('todos').insert([
      {
        title: payload.title.trim(),
        description: payload.description?.trim() ?? null,
        is_complete: false,
      },
    ]);
    if (insertError) {
      setError(insertError.message);
    }
    // Real-time subscription handles optimistic state update
  }, []);

  const updateTodo = useCallback(async (id: string, payload: UpdateTodoPayload) => {
    setError(null);
    const { error: updateError } = await supabase
      .from('todos')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (updateError) {
      setError(updateError.message);
    }
  }, []);

  const toggleTodo = useCallback(
    async (id: string, currentState: boolean) => {
      await updateTodo(id, { is_complete: !currentState });
    },
    [updateTodo]
  );

  const deleteTodo = useCallback(async (id: string) => {
    setError(null);
    const { error: deleteError } = await supabase.from('todos').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
    }
  }, []);

  return { todos, loading, error, createTodo, updateTodo, toggleTodo, deleteTodo };
}
